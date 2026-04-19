package com.clearhomeemi.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InterestSaverDTO {

    public enum PaymentMode {
        ONE_TIME, MONTHLY, BI_MONTHLY, QUARTERLY,
        HALF_YEARLY, THRICE_YEARLY, YEARLY
    }

    public enum TransactionType {
        DEPOSIT, WITHDRAW
    }

    @NotNull
    private PaymentMode paymentMode;

    @NotNull
    private TransactionType transactionType;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    @NotNull
    @Min(1)
    private Integer startingMonth;
}
