package com.emicalculator.engine.model;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class LoanSummary {
    private BigDecimal emiAmount;
    private BigDecimal totalPayment;
    private BigDecimal totalInterestPayable;
    private BigDecimal totalPrincipal;
    private BigDecimal totalPrepaymentAmount;
    private BigDecimal totalFees;
    private Integer    originalTenureMonths;
    private Integer    actualTenureMonths;
    private Integer    tenureReducedByMonths;
    private LocalDate  loanStartDate;
    private LocalDate  loanEndDate;
    private BigDecimal effectiveAnnualRate;
    private BigDecimal interestSaverFinalBalance;
    private BigDecimal interestSavedByInterestSaver;
    private BigDecimal interestSavedByPrepayment;
}
