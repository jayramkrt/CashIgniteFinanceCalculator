package com.emicalculator.engine;

import com.emicalculator.dto.request.*;
import com.emicalculator.dto.response.*;
import com.emicalculator.engine.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

/**
 * MonthlyScheduleBuilder
 *
 * Core calculation engine. Processes a loan month-by-month applying all
 * advanced features in a fixed deterministic order per month:
 *
 *   1. Apply rate change (if any this month)
 *   2. Apply moratorium logic
 *   3. Calculate interest on (principal – ISA balance)
 *   4. Apply ISA deposits/withdrawals
 *   5. Deduct EMI (principal + interest split)
 *   6. Apply prepayment (adjust remaining balance / recalc EMI)
 *   7. Add fees to total payment tracking
 *   8. Guard: prevent negative principal (loan fully paid)
 *
 * All monetary arithmetic uses BigDecimal with HALF_UP rounding.
 * Scale is kept at 2dp for money, 10dp for intermediate rate calculations.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MonthlyScheduleBuilder {

    private static final int MONEY_SCALE = 2;
    private static final int RATE_SCALE = 10;
    private static final MathContext MC = MathContext.DECIMAL128;
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final BigDecimal TWELVE = BigDecimal.valueOf(12);

    private final EventSorter eventSorter;

    // ─────────────────────────────────────────────────────────────────────────
    // Public entry point
    // ─────────────────────────────────────────────────────────────────────────

    public CalculationResult build(LoanRequestDTO request) {
        log.debug("Building schedule for loan amount={}, rate={}, tenure={}",
                request.getLoanAmount(), request.getAnnualInterestRate(), request.getTenureMonths());

        // Resolve all events into a sorted month-indexed map
        SortedEventMap events = eventSorter.sortEvents(request);

        BigDecimal principal = request.getLoanAmount().setScale(MONEY_SCALE, RoundingMode.HALF_UP);
        BigDecimal annualRate = request.getAnnualInterestRate();
        int tenureMonths = request.getTenureMonths();
        LocalDate emiDate = request.getFirstEmiDate();

        // Calculate initial EMI
        BigDecimal emi = calculateEmi(principal, annualRate, tenureMonths);

        // Handle moratorium: defer EMI start
        int moratoriumMonths = 0;
        boolean payInterestDuringMoratorium = false;
        if (request.getMoratorium() != null) {
            moratoriumMonths = request.getMoratorium().getDurationMonths();
            payInterestDuringMoratorium = request.getMoratorium().getPayInterestDuringMoratorium();
        }

        List<MonthlyRow> schedule = new ArrayList<>();
        BigDecimal remainingPrincipal = principal;
        BigDecimal isaBalance = BigDecimal.ZERO;
        BigDecimal currentAnnualRate = annualRate;

        // Tracking totals for summary
        BigDecimal totalInterestPaid = BigDecimal.ZERO;
        BigDecimal totalPrepaymentPaid = BigDecimal.ZERO;
        BigDecimal totalFeesPaid = BigDecimal.ZERO;
        BigDecimal interestSavedByPrepayment = BigDecimal.ZERO;

        int actualTenure = 0;
        int month = 1;
        int maxMonths = tenureMonths + moratoriumMonths + 120; // safety ceiling

        while (remainingPrincipal.compareTo(BigDecimal.ZERO) > 0 && month <= maxMonths) {
            LocalDate dueDate = emiDate.plusMonths(month - 1L);
            boolean isMoratoriumMonth = month <= moratoriumMonths;

            // ── Step 1: Apply rate change ─────────────────────────────────
            if (events.hasRateChange(month)) {
                InterestChangeEvent rateEvent = events.getRateChange(month);
                currentAnnualRate = rateEvent.getNewAnnualRate();
                if (rateEvent.getEffect() == InterestChangeEvent.Effect.REDUCE_EMI) {
                    // Recalculate EMI based on new rate and remaining months
                    int remainingMonths = (tenureMonths + moratoriumMonths) - month + 1;
                    if (remainingMonths > 0) {
                        emi = calculateEmi(remainingPrincipal, currentAnnualRate, remainingMonths);
                    }
                }
                // CHANGE_LOAN_TERM: keep EMI, tenure adjusts naturally by loop
            }

            // ── Step 2: Moratorium ────────────────────────────────────────
            if (isMoratoriumMonth) {
                BigDecimal moratoriumInterest = calculateMonthlyInterest(remainingPrincipal, currentAnnualRate);
                BigDecimal moratoriumPayment = BigDecimal.ZERO;

                if (payInterestDuringMoratorium) {
                    moratoriumPayment = moratoriumInterest;
                    totalInterestPaid = totalInterestPaid.add(moratoriumInterest);
                } else {
                    // Capitalise interest — add to principal
                    remainingPrincipal = remainingPrincipal.add(moratoriumInterest)
                            .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
                    // Recalculate EMI after moratorium ends on last moratorium month
                    if (month == moratoriumMonths) {
                        emi = calculateEmi(remainingPrincipal, currentAnnualRate, tenureMonths);
                    }
                }

                schedule.add(MonthlyRow.builder()
                        .monthNumber(month)
                        .dueDate(dueDate)
                        .openingBalance(remainingPrincipal)
                        .emi(moratoriumPayment)
                        .principalComponent(BigDecimal.ZERO)
                        .interestComponent(moratoriumInterest)
                        .prepayment(BigDecimal.ZERO)
                        .fees(BigDecimal.ZERO)
                        .closingBalance(remainingPrincipal)
                        .interestSaverBalance(isaBalance)
                        .loanPaidPercentage(calculatePaidPct(principal, remainingPrincipal))
                        .moratoriumMonth(true)
                        .rateChangedThisMonth(events.hasRateChange(month))
                        .appliedAnnualRate(currentAnnualRate)
                        .build());

                month++;
                actualTenure++;
                continue;
            }

            BigDecimal openingBalance = remainingPrincipal;

            // ── Step 3: Calculate interest (offset by ISA balance) ────────
            BigDecimal effectivePrincipal = remainingPrincipal.subtract(isaBalance).max(BigDecimal.ZERO);
            BigDecimal interestThisMonth = calculateMonthlyInterest(effectivePrincipal, currentAnnualRate);
            BigDecimal interestSaverOffset = remainingPrincipal.compareTo(effectivePrincipal) > 0
                    ? calculateMonthlyInterest(remainingPrincipal.subtract(effectivePrincipal), currentAnnualRate)
                    : BigDecimal.ZERO;

            // ── Step 4: ISA deposits / withdrawals ────────────────────────
            if (events.hasIsaEvent(month)) {
                for (IsaEvent isaEvent : events.getIsaEvents(month)) {
                    if (isaEvent.getType() == IsaEvent.Type.DEPOSIT) {
                        isaBalance = isaBalance.add(isaEvent.getAmount());
                    } else {
                        isaBalance = isaBalance.subtract(isaEvent.getAmount()).max(BigDecimal.ZERO);
                    }
                }
            }

            // ── Step 5: Deduct EMI ────────────────────────────────────────
            // Guard: final month — emi might exceed remaining principal + interest
            BigDecimal principalComponent;
            BigDecimal interestComponent = interestThisMonth;
            BigDecimal effectiveEmi = emi;

            if (remainingPrincipal.add(interestThisMonth).compareTo(emi) <= 0) {
                // Final (or near-final) payment
                effectiveEmi = remainingPrincipal.add(interestThisMonth)
                        .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
                principalComponent = remainingPrincipal;
            } else {
                principalComponent = effectiveEmi.subtract(interestThisMonth)
                        .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
            }

            remainingPrincipal = remainingPrincipal.subtract(principalComponent)
                    .max(BigDecimal.ZERO)
                    .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
            totalInterestPaid = totalInterestPaid.add(interestComponent);

            // ── Step 6: Prepayment ────────────────────────────────────────
            BigDecimal prepaymentThisMonth = BigDecimal.ZERO;
            if (events.hasPrepayment(month) && remainingPrincipal.compareTo(BigDecimal.ZERO) > 0) {
                for (PrepaymentEvent prepayEvent : events.getPrepayments(month)) {
                    BigDecimal prepAmt = prepayEvent.getAmount().min(remainingPrincipal);
                    remainingPrincipal = remainingPrincipal.subtract(prepAmt)
                            .max(BigDecimal.ZERO)
                            .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
                    prepaymentThisMonth = prepaymentThisMonth.add(prepAmt);
                    totalPrepaymentPaid = totalPrepaymentPaid.add(prepAmt);

                    // Track interest saving from prepayment (interest on prepaid amount × remaining months)
                    int approxRemainingMonths = estimateRemainingMonths(remainingPrincipal, emi, currentAnnualRate);
                    BigDecimal saving = calculateMonthlyInterest(prepAmt, currentAnnualRate)
                            .multiply(BigDecimal.valueOf(approxRemainingMonths), MC)
                            .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
                    interestSavedByPrepayment = interestSavedByPrepayment.add(saving);

                    if (prepayEvent.getEffect() == PrepaymentEvent.Effect.REDUCE_EMI
                            && remainingPrincipal.compareTo(BigDecimal.ZERO) > 0) {
                        // Recalculate EMI over remaining tenure
                        int remainingMonths = (tenureMonths + moratoriumMonths) - month;
                        if (remainingMonths > 0) {
                            emi = calculateEmi(remainingPrincipal, currentAnnualRate, remainingMonths);
                        }
                    }
                    // REDUCE_TERM: keep EMI — loan ends earlier naturally
                }
            }

            // ── Step 7: Fees ──────────────────────────────────────────────
            BigDecimal feesThisMonth = BigDecimal.ZERO;
            if (events.hasFee(month)) {
                for (FeeEvent feeEvent : events.getFees(month)) {
                    feesThisMonth = feesThisMonth.add(feeEvent.getAmount());
                    totalFeesPaid = totalFeesPaid.add(feeEvent.getAmount());
                }
            }

            // ── Build row ─────────────────────────────────────────────────
            schedule.add(MonthlyRow.builder()
                    .monthNumber(month)
                    .dueDate(dueDate)
                    .openingBalance(openingBalance)
                    .emi(effectiveEmi)
                    .principalComponent(principalComponent)
                    .interestComponent(interestComponent)
                    .prepayment(prepaymentThisMonth)
                    .fees(feesThisMonth)
                    .closingBalance(remainingPrincipal)
                    .interestSaverBalance(isaBalance)
                    .loanPaidPercentage(calculatePaidPct(principal, remainingPrincipal))
                    .moratoriumMonth(false)
                    .rateChangedThisMonth(events.hasRateChange(month))
                    .appliedAnnualRate(currentAnnualRate)
                    .build());

            actualTenure++;
            month++;
        }

        // ── Build summary ─────────────────────────────────────────────────
        BigDecimal totalPrincipalPaid = principal; // fully repaid
        BigDecimal totalPayment = totalPrincipalPaid
                .add(totalInterestPaid)
                .add(totalPrepaymentPaid)
                .add(totalFeesPaid);

        int tenureReduced = tenureMonths - (actualTenure - moratoriumMonths);

        LoanSummary summary = LoanSummary.builder()
                .emiAmount(schedule.stream()
                        .filter(r -> !r.isMoratoriumMonth())
                        .findFirst()
                        .map(MonthlyRow::getEmi)
                        .orElse(emi))
                .totalPayment(totalPayment)
                .totalInterestPayable(totalInterestPaid)
                .totalPrincipal(totalPrincipalPaid)
                .totalPrepaymentAmount(totalPrepaymentPaid)
                .totalFees(totalFeesPaid)
                .originalTenureMonths(tenureMonths)
                .actualTenureMonths(actualTenure - moratoriumMonths)
                .tenureReducedByMonths(tenureReduced > 0 ? tenureReduced : null)
                .loanStartDate(request.getFirstEmiDate())
                .loanEndDate(schedule.isEmpty() ? null : schedule.get(schedule.size() - 1).getDueDate())
                .interestSaverFinalBalance(isaBalance.compareTo(BigDecimal.ZERO) > 0 ? isaBalance : null)
                .interestSavedByInterestSaver(schedule.stream()
                        .map(MonthlyRow::getInterestSaverBalance)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .compareTo(BigDecimal.ZERO) > 0
                        ? calculateIsaSaving(schedule, annualRate) : null)
                .interestSavedByPrepayment(
                        totalPrepaymentPaid.compareTo(BigDecimal.ZERO) > 0 ? interestSavedByPrepayment : null)
                .build();

        return CalculationResult.builder()
                .summary(summary)
                .monthlySchedule(schedule)
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EMI formula: P × r × (1+r)^n / ((1+r)^n − 1)
    // where r = monthly rate, n = tenure in months
    // ─────────────────────────────────────────────────────────────────────────

    public BigDecimal calculateEmi(BigDecimal principal, BigDecimal annualRate, int tenureMonths) {
        if (annualRate.compareTo(BigDecimal.ZERO) == 0) {
            // Zero-interest loan: flat division
            return principal.divide(BigDecimal.valueOf(tenureMonths), MONEY_SCALE, RoundingMode.HALF_UP);
        }

        BigDecimal monthlyRate = annualRate
                .divide(HUNDRED, RATE_SCALE, RoundingMode.HALF_UP)
                .divide(TWELVE, RATE_SCALE, RoundingMode.HALF_UP);

        // (1 + r)^n
        BigDecimal onePlusR = BigDecimal.ONE.add(monthlyRate);
        BigDecimal power = onePlusR.pow(tenureMonths, MC);

        // P × r × (1+r)^n
        BigDecimal numerator = principal.multiply(monthlyRate, MC).multiply(power, MC);

        // (1+r)^n − 1
        BigDecimal denominator = power.subtract(BigDecimal.ONE);

        return numerator.divide(denominator, MONEY_SCALE, RoundingMode.HALF_UP);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Monthly interest: principal × (annualRate / 12 / 100)
    // ─────────────────────────────────────────────────────────────────────────

    private BigDecimal calculateMonthlyInterest(BigDecimal principal, BigDecimal annualRate) {
        return principal
                .multiply(annualRate, MC)
                .divide(HUNDRED, RATE_SCALE, RoundingMode.HALF_UP)
                .divide(TWELVE, MONEY_SCALE, RoundingMode.HALF_UP);
    }

    private BigDecimal calculatePaidPct(BigDecimal original, BigDecimal remaining) {
        if (original.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return original.subtract(remaining)
                .divide(original, RATE_SCALE, RoundingMode.HALF_UP)
                .multiply(HUNDRED)
                .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }

    private int estimateRemainingMonths(BigDecimal principal, BigDecimal emi, BigDecimal annualRate) {
        if (emi.compareTo(BigDecimal.ZERO) == 0) return 0;
        BigDecimal monthlyRate = annualRate
                .divide(HUNDRED, RATE_SCALE, RoundingMode.HALF_UP)
                .divide(TWELVE, RATE_SCALE, RoundingMode.HALF_UP);
        if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            return principal.divide(emi, 0, RoundingMode.CEILING).intValue();
        }
        // n = -log(1 - P*r/EMI) / log(1+r)
        double p = principal.doubleValue();
        double r = monthlyRate.doubleValue();
        double e = emi.doubleValue();
        double val = 1.0 - (p * r / e);
        if (val <= 0) return 1;
        return (int) Math.ceil(-Math.log(val) / Math.log(1 + r));
    }

    private BigDecimal calculateIsaSaving(List<MonthlyRow> schedule, BigDecimal annualRate) {
        return schedule.stream()
                .map(row -> calculateMonthlyInterest(row.getInterestSaverBalance(), annualRate))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }
}
