package com.clearhomeemi.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InterestChangeDTO {

    public enum InterestChangeEffect {
        CHANGE_LOAN_TERM, REDUCE_EMI
    }

    @NotNull
    @DecimalMin("0.01")
    @DecimalMax("100.00")
    private BigDecimal newAnnualRate;

    @NotNull
    @Min(1)
    private Integer startingMonth;

    @NotNull
    private InterestChangeEffect effect;
}
