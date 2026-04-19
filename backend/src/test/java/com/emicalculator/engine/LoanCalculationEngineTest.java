package com.clearhomeemi.engine;

import com.clearhomeemi.dto.request.*;
import com.clearhomeemi.dto.response.CalculationResultDTO;
import com.clearhomeemi.service.LoanCalculationService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@DisplayName("Loan Calculation Engine Tests")
class LoanCalculationEngineTest {

    @Autowired
    private LoanCalculationService service;

    @Autowired
    private MonthlyScheduleBuilder scheduleBuilder;

    // ── Shared fixture ────────────────────────────────────────────────────────

    private LoanRequestDTO baseRequest() {
        LoanRequestDTO req = new LoanRequestDTO();
        req.setLoanAmount(new BigDecimal("5000000"));       // ₹50L
        req.setAnnualInterestRate(new BigDecimal("8.5"));   // 8.5% p.a.
        req.setTenureMonths(240);                           // 20 years
        req.setFirstEmiDate(LocalDate.of(2024, 2, 1));
        return req;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Basic EMI calculation
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("EMI formula produces correct value for standard home loan")
    void testEmiCalculation() {
        // Known EMI for ₹50L @ 8.5% for 20 years = ₹43,391 (approx)
        BigDecimal emi = scheduleBuilder.calculateEmi(
                new BigDecimal("5000000"),
                new BigDecimal("8.5"),
                240);

        assertThat(emi).isBetween(new BigDecimal("43000"), new BigDecimal("44000"));
    }

    @Test
    @DisplayName("Schedule has exactly tenure months of rows for base loan")
    void testScheduleLength() {
        CalculationResultDTO result = service.calculate(baseRequest());
        assertThat(result.getAmortizationSchedule()).hasSize(240);
    }

    @Test
    @DisplayName("Closing balance of last row is zero (loan fully repaid)")
    void testLoanFullyRepaid() {
        CalculationResultDTO result = service.calculate(baseRequest());
        BigDecimal lastBalance = result.getAmortizationSchedule()
                .get(result.getAmortizationSchedule().size() - 1)
                .getClosingBalance();
        assertThat(lastBalance).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Sum of principal components equals original loan amount")
    void testPrincipalSumMatchesLoan() {
        CalculationResultDTO result = service.calculate(baseRequest());
        BigDecimal totalPrincipal = result.getAmortizationSchedule().stream()
                .map(r -> r.getPrincipalComponent())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertThat(totalPrincipal)
                .isBetween(new BigDecimal("4999990"), new BigDecimal("5000010"));
    }

    @Test
    @DisplayName("Zero-interest loan splits EMI equally")
    void testZeroInterestLoan() {
        LoanRequestDTO req = baseRequest();
        req.setAnnualInterestRate(BigDecimal.ZERO);
        req.setTenureMonths(10);
        req.setLoanAmount(new BigDecimal("100000"));

        BigDecimal emi = scheduleBuilder.calculateEmi(
                new BigDecimal("100000"), BigDecimal.ZERO, 10);

        assertThat(emi).isEqualByComparingTo(new BigDecimal("10000"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Prepayment – reduce term
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("One-time prepayment with REDUCE_TERM shortens loan tenure")
    void testPrepaymentReducesTerm() {
        LoanRequestDTO req = baseRequest();
        PrepaymentDTO prepayment = new PrepaymentDTO();
        prepayment.setPaymentMode(PrepaymentDTO.PaymentMode.ONE_TIME);
        prepayment.setEffect(PrepaymentDTO.PrepaymentEffect.REDUCE_TERM);
        prepayment.setAmount(new BigDecimal("500000")); // ₹5L lump sum at month 12
        prepayment.setStartingMonth(12);
        req.setPrepayments(List.of(prepayment));

        CalculationResultDTO base   = service.calculate(baseRequest());
        CalculationResultDTO withPP = service.calculate(req);

        assertThat(withPP.getSummary().getActualTenureMonths())
                .isLessThan(base.getSummary().getActualTenureMonths());
        assertThat(withPP.getSummary().getTotalInterestPayable())
                .isLessThan(base.getSummary().getTotalInterestPayable());
    }

    @Test
    @DisplayName("Monthly prepayment with REDUCE_EMI lowers EMI after first payment")
    void testMonthlyPrepaymentReducesEmi() {
        LoanRequestDTO req = baseRequest();
        PrepaymentDTO prepayment = new PrepaymentDTO();
        prepayment.setPaymentMode(PrepaymentDTO.PaymentMode.MONTHLY);
        prepayment.setEffect(PrepaymentDTO.PrepaymentEffect.REDUCE_EMI);
        prepayment.setAmount(new BigDecimal("5000"));
        prepayment.setStartingMonth(6);
        req.setPrepayments(List.of(prepayment));

        CalculationResultDTO result = service.calculate(req);

        // EMI in month 7 should be less than month 1 (after reduce-EMI prepayment at month 6)
        BigDecimal emiMonth1 = result.getAmortizationSchedule().get(0).getEmi();
        BigDecimal emiMonth7 = result.getAmortizationSchedule().get(6).getEmi();
        assertThat(emiMonth7).isLessThan(emiMonth1);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Variable interest rate
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Rate increase with CHANGE_LOAN_TERM extends tenure beyond original")
    void testRateIncreaseExtendsTenure() {
        LoanRequestDTO req = baseRequest();
        InterestChangeDTO change = new InterestChangeDTO();
        change.setNewAnnualRate(new BigDecimal("10.5"));
        change.setStartingMonth(13);
        change.setEffect(InterestChangeDTO.InterestChangeEffect.CHANGE_LOAN_TERM);
        req.setInterestChanges(List.of(change));

        CalculationResultDTO result = service.calculate(req);
        assertThat(result.getSummary().getActualTenureMonths()).isGreaterThan(240);
    }

    @Test
    @DisplayName("Rate change is reflected in monthly row applied rate")
    void testRateChangeAppliedCorrectly() {
        LoanRequestDTO req = baseRequest();
        InterestChangeDTO change = new InterestChangeDTO();
        change.setNewAnnualRate(new BigDecimal("9.0"));
        change.setStartingMonth(25);
        change.setEffect(InterestChangeDTO.InterestChangeEffect.REDUCE_EMI);
        req.setInterestChanges(List.of(change));

        CalculationResultDTO result = service.calculate(req);

        // Month 24: old rate
        assertThat(result.getAmortizationSchedule().get(23).getAppliedAnnualRate())
                .isEqualByComparingTo(new BigDecimal("8.5"));
        // Month 25: new rate
        assertThat(result.getAmortizationSchedule().get(24).getAppliedAnnualRate())
                .isEqualByComparingTo(new BigDecimal("9.0"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Moratorium
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Moratorium months are marked correctly in schedule")
    void testMoratoriumMonthsMarked() {
        LoanRequestDTO req = baseRequest();
        MoratoriumDTO moratorium = new MoratoriumDTO();
        moratorium.setDurationMonths(6);
        moratorium.setPayInterestDuringMoratorium(true);
        req.setMoratorium(moratorium);

        CalculationResultDTO result = service.calculate(req);

        // First 6 rows should be moratorium rows
        for (int i = 0; i < 6; i++) {
            assertThat(result.getAmortizationSchedule().get(i).isMoratoriumMonth()).isTrue();
        }
        assertThat(result.getAmortizationSchedule().get(6).isMoratoriumMonth()).isFalse();
    }

    @Test
    @DisplayName("Capitalised moratorium increases principal for remaining schedule")
    void testMoratoriumCapitalisesInterest() {
        LoanRequestDTO baseReq = baseRequest();
        LoanRequestDTO moratoriumReq = baseRequest();

        MoratoriumDTO moratorium = new MoratoriumDTO();
        moratorium.setDurationMonths(3);
        moratorium.setPayInterestDuringMoratorium(false); // capitalise
        moratoriumReq.setMoratorium(moratorium);

        CalculationResultDTO base   = service.calculate(baseReq);
        CalculationResultDTO withM  = service.calculate(moratoriumReq);

        // Total interest should be higher when interest is capitalised
        assertThat(withM.getSummary().getTotalInterestPayable())
                .isGreaterThan(base.getSummary().getTotalInterestPayable());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Interest saver account
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("ISA deposit reduces interest paid vs baseline")
    void testIsaReducesInterest() {
        LoanRequestDTO req = baseRequest();
        InterestSaverDTO isa = new InterestSaverDTO();
        isa.setPaymentMode(InterestSaverDTO.PaymentMode.MONTHLY);
        isa.setTransactionType(InterestSaverDTO.TransactionType.DEPOSIT);
        isa.setAmount(new BigDecimal("10000"));
        isa.setStartingMonth(1);
        req.setInterestSaverEntries(List.of(isa));

        CalculationResultDTO base   = service.calculate(baseRequest());
        CalculationResultDTO withISA = service.calculate(req);

        assertThat(withISA.getSummary().getTotalInterestPayable())
                .isLessThan(base.getSummary().getTotalInterestPayable());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Fees
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Yearly fee is added to total payment")
    void testYearlyFeeAddsToTotal() {
        LoanRequestDTO req = baseRequest();
        FeeDTO fee = new FeeDTO();
        fee.setPaymentMode(FeeDTO.PaymentMode.YEARLY);
        fee.setAmount(new BigDecimal("5000"));
        fee.setStartingMonth(12);
        req.setFees(List.of(fee));

        CalculationResultDTO base    = service.calculate(baseRequest());
        CalculationResultDTO withFee = service.calculate(req);

        assertThat(withFee.getSummary().getTotalFees())
                .isGreaterThan(BigDecimal.ZERO);
        assertThat(withFee.getSummary().getTotalPayment())
                .isGreaterThan(base.getSummary().getTotalPayment());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. Overlapping events (same month)
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Prepayment and rate change in same month are both applied")
    void testOverlappingEventsHandled() {
        LoanRequestDTO req = baseRequest();

        PrepaymentDTO prepayment = new PrepaymentDTO();
        prepayment.setPaymentMode(PrepaymentDTO.PaymentMode.ONE_TIME);
        prepayment.setEffect(PrepaymentDTO.PrepaymentEffect.REDUCE_TERM);
        prepayment.setAmount(new BigDecimal("200000"));
        prepayment.setStartingMonth(24);

        InterestChangeDTO change = new InterestChangeDTO();
        change.setNewAnnualRate(new BigDecimal("9.25"));
        change.setStartingMonth(24);
        change.setEffect(InterestChangeDTO.InterestChangeEffect.CHANGE_LOAN_TERM);

        req.setPrepayments(List.of(prepayment));
        req.setInterestChanges(List.of(change));

        // Should not throw — both events processed deterministically
        assertThatCode(() -> service.calculate(req)).doesNotThrowAnyException();

        CalculationResultDTO result = service.calculate(req);
        // Month 24 should show rate change flag
        assertThat(result.getAmortizationSchedule().get(23).isRateChangedThisMonth()).isTrue();
        // Prepayment should appear in month 24
        assertThat(result.getAmortizationSchedule().get(23).getPrepayment())
                .isEqualByComparingTo(new BigDecimal("200000"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 8. Year-level rollup
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Yearly rollup totals match sum of monthly rows for each year")
    void testYearlyRollupConsistency() {
        CalculationResultDTO result = service.calculate(baseRequest());

        BigDecimal monthlyTotal = result.getAmortizationSchedule().stream()
                .map(r -> r.getPrincipalComponent().add(r.getInterestComponent()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal yearlyTotal = result.getYearlySchedule().stream()
                .map(y -> y.getTotalPrincipal().add(y.getTotalInterest()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertThat(monthlyTotal).isEqualByComparingTo(yearlyTotal);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 9. Performance guard
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Calculation with 50 prepayment events completes under 200ms")
    void testPerformanceWithManyEvents() {
        LoanRequestDTO req = baseRequest();
        req.setTenureMonths(360); // 30 years

        // 50 yearly prepayments starting month 1
        List<PrepaymentDTO> prepayments = new java.util.ArrayList<>();
        for (int i = 0; i < 50; i++) {
            PrepaymentDTO p = new PrepaymentDTO();
            p.setPaymentMode(PrepaymentDTO.PaymentMode.ONE_TIME);
            p.setEffect(PrepaymentDTO.PrepaymentEffect.REDUCE_TERM);
            p.setAmount(new BigDecimal("10000"));
            p.setStartingMonth(i * 6 + 1);
            prepayments.add(p);
        }
        req.setPrepayments(prepayments);

        long start = System.currentTimeMillis();
        service.calculate(req);
        long elapsed = System.currentTimeMillis() - start;

        assertThat(elapsed).isLessThan(200L);
    }
}
