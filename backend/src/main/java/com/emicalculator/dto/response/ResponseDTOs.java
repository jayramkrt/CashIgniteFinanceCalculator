package com.emicalculator.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

// ─────────────────────────────────────────────────────────────────────────────
// Root response returned by POST /api/loan/calculate
// ─────────────────────────────────────────────────────────────────────────────
@Data
@Builder
public class CalculationResultDTO {

    private SummaryDTO summary;

    /** Full month-by-month schedule (use for chart data and table rows). */
    private List<MonthlyRowDTO> amortizationSchedule;

    /** Year-level rollups derived from the monthly schedule. */
    private List<YearlyRowDTO> yearlySchedule;
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary / headline metrics
// ─────────────────────────────────────────────────────────────────────────────
@Data
@Builder
public class SummaryDTO {

    private BigDecimal emiAmount;
    private BigDecimal totalPayment;           // principal + interest + fees
    private BigDecimal totalInterestPayable;
    private BigDecimal totalPrincipal;
    private BigDecimal totalPrepaymentAmount;
    private BigDecimal totalFees;

    private Integer originalTenureMonths;
    private Integer actualTenureMonths;
    private Integer tenureReducedByMonths;     // null if no reduction

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate loanStartDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate loanEndDate;

    private BigDecimal effectiveAnnualRate;    // XIRR-equivalent

    // Interest saver stats (null when feature not used)
    private BigDecimal interestSaverFinalBalance;
    private BigDecimal interestSavedByInterestSaver;
    private BigDecimal interestSavedByPrepayment;
}

// ─────────────────────────────────────────────────────────────────────────────
// One row per calendar month in the amortization schedule
// ─────────────────────────────────────────────────────────────────────────────
@Data
@Builder
public class MonthlyRowDTO {

    private Integer monthNumber;              // 1-based

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    private BigDecimal openingBalance;
    private BigDecimal emi;
    private BigDecimal principalComponent;
    private BigDecimal interestComponent;
    private BigDecimal prepayment;
    private BigDecimal fees;
    private BigDecimal closingBalance;
    private BigDecimal interestSaverBalance;  // running balance of ISA
    private BigDecimal loanPaidPercentage;    // 0–100

    private boolean moratoriumMonth;
    private boolean rateChangedThisMonth;
    private BigDecimal appliedAnnualRate;     // rate in effect this month
}

// ─────────────────────────────────────────────────────────────────────────────
// Year-level rollup (aggregated from MonthlyRowDTO)
// ─────────────────────────────────────────────────────────────────────────────
@Data
@Builder
public class YearlyRowDTO {

    private Integer year;                     // calendar year (e.g. 2025)
    private Integer yearNumber;               // 1-based loan year

    private BigDecimal totalPrincipal;
    private BigDecimal totalInterest;
    private BigDecimal totalPrepayment;
    private BigDecimal totalFees;
    private BigDecimal totalPayment;
    private BigDecimal closingBalance;
    private BigDecimal loanPaidPercentage;    // at year end
}
