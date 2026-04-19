package com.clearhomeemi.service;

import com.clearhomeemi.dto.request.LoanRequestDTO;
import com.clearhomeemi.dto.response.*;
import com.clearhomeemi.engine.MonthlyScheduleBuilder;
import com.clearhomeemi.engine.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * LoanCalculationService
 *
 * Orchestration layer between the REST controller and the calculation engine.
 * Responsibilities:
 *   - Invoke MonthlyScheduleBuilder
 *   - Map engine-internal models to response DTOs
 *   - Build year-level rollups from the monthly schedule
 *   - Calculate effective annual rate (simple approximation)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LoanCalculationService {

    private final MonthlyScheduleBuilder scheduleBuilder;

    public CalculationResultDTO calculate(LoanRequestDTO request) {
        long start = System.currentTimeMillis();
        log.info("Calculating loan: amount={} rate={} tenure={}",
                request.getLoanAmount(), request.getAnnualInterestRate(), request.getTenureMonths());

        CalculationResult result = scheduleBuilder.build(request);

        List<MonthlyRowDTO> monthlyRows = toMonthlyDTOs(result.getMonthlySchedule());
        List<YearlyRowDTO> yearlyRows = buildYearlyRollup(monthlyRows);
        SummaryDTO summary = toSummaryDTO(result.getSummary(), request.getLoanAmount());

        long elapsed = System.currentTimeMillis() - start;
        log.info("Calculation completed in {}ms, {} monthly rows generated", elapsed, monthlyRows.size());

        return CalculationResultDTO.builder()
                .summary(summary)
                .amortizationSchedule(monthlyRows)
                .yearlySchedule(yearlyRows)
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Mapping helpers
    // ─────────────────────────────────────────────────────────────────────────

    private SummaryDTO toSummaryDTO(LoanSummary s, BigDecimal originalPrincipal) {
        BigDecimal effectiveRate = approximateEffectiveRate(
                s.getTotalInterestPayable(), originalPrincipal, s.getActualTenureMonths());

        return SummaryDTO.builder()
                .emiAmount(s.getEmiAmount())
                .totalPayment(s.getTotalPayment())
                .totalInterestPayable(s.getTotalInterestPayable())
                .totalPrincipal(s.getTotalPrincipal())
                .totalPrepaymentAmount(s.getTotalPrepaymentAmount())
                .totalFees(s.getTotalFees())
                .originalTenureMonths(s.getOriginalTenureMonths())
                .actualTenureMonths(s.getActualTenureMonths())
                .tenureReducedByMonths(s.getTenureReducedByMonths())
                .loanStartDate(s.getLoanStartDate())
                .loanEndDate(s.getLoanEndDate())
                .effectiveAnnualRate(effectiveRate)
                .interestSaverFinalBalance(s.getInterestSaverFinalBalance())
                .interestSavedByInterestSaver(s.getInterestSavedByInterestSaver())
                .interestSavedByPrepayment(s.getInterestSavedByPrepayment())
                .build();
    }

    private List<MonthlyRowDTO> toMonthlyDTOs(List<MonthlyRow> rows) {
        return rows.stream().map(r -> MonthlyRowDTO.builder()
                .monthNumber(r.getMonthNumber())
                .dueDate(r.getDueDate())
                .openingBalance(r.getOpeningBalance())
                .emi(r.getEmi())
                .principalComponent(r.getPrincipalComponent())
                .interestComponent(r.getInterestComponent())
                .prepayment(r.getPrepayment())
                .fees(r.getFees())
                .closingBalance(r.getClosingBalance())
                .interestSaverBalance(r.getInterestSaverBalance())
                .loanPaidPercentage(r.getLoanPaidPercentage())
                .moratoriumMonth(r.isMoratoriumMonth())
                .rateChangedThisMonth(r.isRateChangedThisMonth())
                .appliedAnnualRate(r.getAppliedAnnualRate())
                .build()
        ).collect(Collectors.toList());
    }

    /**
     * Groups monthly rows by calendar year and aggregates totals.
     * The amortization table in the UI shows year rows that expand to month rows.
     */
    private List<YearlyRowDTO> buildYearlyRollup(List<MonthlyRowDTO> monthly) {
        // Group by calendar year of due date
        Map<Integer, List<MonthlyRowDTO>> byYear = monthly.stream()
                .collect(Collectors.groupingBy(r -> r.getDueDate().getYear(),
                        LinkedHashMap::new, Collectors.toList()));

        List<YearlyRowDTO> result = new ArrayList<>();
        int yearNumber = 1;

        for (Map.Entry<Integer, List<MonthlyRowDTO>> entry : byYear.entrySet()) {
            List<MonthlyRowDTO> rows = entry.getValue();

            BigDecimal totalPrincipal  = sum(rows, MonthlyRowDTO::getPrincipalComponent);
            BigDecimal totalInterest   = sum(rows, MonthlyRowDTO::getInterestComponent);
            BigDecimal totalPrepayment = sum(rows, MonthlyRowDTO::getPrepayment);
            BigDecimal totalFees       = sum(rows, MonthlyRowDTO::getFees);
            BigDecimal totalPayment    = totalPrincipal.add(totalInterest).add(totalPrepayment).add(totalFees);

            MonthlyRowDTO lastRow = rows.get(rows.size() - 1);

            result.add(YearlyRowDTO.builder()
                    .year(entry.getKey())
                    .yearNumber(yearNumber++)
                    .totalPrincipal(totalPrincipal)
                    .totalInterest(totalInterest)
                    .totalPrepayment(totalPrepayment)
                    .totalFees(totalFees)
                    .totalPayment(totalPayment)
                    .closingBalance(lastRow.getClosingBalance())
                    .loanPaidPercentage(lastRow.getLoanPaidPercentage())
                    .build());
        }
        return result;
    }

    private BigDecimal sum(List<MonthlyRowDTO> rows,
                           java.util.function.Function<MonthlyRowDTO, BigDecimal> extractor) {
        return rows.stream()
                .map(extractor)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Lightweight EMI-only calculation — used by the live slider preview
     * endpoint (GET /api/loan/emi). No schedule is built.
     */
    public BigDecimal getEmiOnly(BigDecimal amount, BigDecimal annualRate, int tenureMonths) {
        return scheduleBuilder.calculateEmi(amount, annualRate, tenureMonths);
    }

    /**
     * Approximate effective annual rate:
     * EAR = (1 + totalInterest / principal / actualTenureMonths * 12) − 1
     * This is a simplified metric; a full XIRR would require Newton–Raphson.
     */
    private BigDecimal approximateEffectiveRate(BigDecimal totalInterest,
                                                 BigDecimal principal,
                                                 int actualTenureMonths) {
        if (principal.compareTo(BigDecimal.ZERO) == 0 || actualTenureMonths == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal annualInterestRatio = totalInterest
                .divide(principal, 10, RoundingMode.HALF_UP)
                .divide(BigDecimal.valueOf(actualTenureMonths), 10, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(12));
        return annualInterestRatio.multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }
}
