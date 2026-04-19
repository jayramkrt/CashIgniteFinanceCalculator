package com.clearhomeemi.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class SummaryDTO {

    private BigDecimal emiAmount;
    private BigDecimal totalPayment;
    private BigDecimal totalInterestPayable;
    private BigDecimal totalPrincipal;
    private BigDecimal totalPrepaymentAmount;
    private BigDecimal totalFees;

    private Integer originalTenureMonths;
    private Integer actualTenureMonths;
    private Integer tenureReducedByMonths;       // null if no reduction

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate loanStartDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate loanEndDate;

    private BigDecimal effectiveAnnualRate;

    // Interest saver stats (null when feature not used)
    private BigDecimal interestSaverFinalBalance;
    private BigDecimal interestSavedByInterestSaver;
    private BigDecimal interestSavedByPrepayment;
}
