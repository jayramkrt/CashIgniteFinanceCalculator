package com.emicalculator.engine.model;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class MonthlyRow {
    private int        monthNumber;
    private LocalDate  dueDate;
    private BigDecimal openingBalance;
    private BigDecimal emi;
    private BigDecimal principalComponent;
    private BigDecimal interestComponent;
    private BigDecimal prepayment;
    private BigDecimal fees;
    private BigDecimal closingBalance;
    private BigDecimal interestSaverBalance;
    private BigDecimal loanPaidPercentage;
    private boolean    moratoriumMonth;
    private boolean    rateChangedThisMonth;
    private BigDecimal appliedAnnualRate;
}
