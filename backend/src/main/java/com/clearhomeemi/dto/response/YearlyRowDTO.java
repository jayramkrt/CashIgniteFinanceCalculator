package com.clearhomeemi.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class YearlyRowDTO {

    private Integer year;           // calendar year e.g. 2025
    private Integer yearNumber;     // 1-based loan year

    private BigDecimal totalPrincipal;
    private BigDecimal totalInterest;
    private BigDecimal totalPrepayment;
    private BigDecimal totalFees;
    private BigDecimal totalPayment;
    private BigDecimal closingBalance;
    private BigDecimal loanPaidPercentage;
}
