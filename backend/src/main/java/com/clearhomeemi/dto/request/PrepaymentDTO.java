package com.clearhomeemi.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

// ─────────────────────────────────────────────────────────────────────────────
// Prepayment DTO
// ─────────────────────────────────────────────────────────────────────────────
@Data
public class PrepaymentDTO {

    public enum PaymentMode {
        ONE_TIME, MONTHLY, BI_MONTHLY, QUARTERLY,
        HALF_YEARLY, THRICE_YEARLY, YEARLY
    }

    public enum PrepaymentEffect {
        REDUCE_TERM, REDUCE_EMI
    }

    @NotNull
    private PaymentMode paymentMode;

    @NotNull
    private PrepaymentEffect effect;

    @NotNull
    @DecimalMin("1.00")
    private BigDecimal amount;

    /**
     *  1-based month offset from loan start date (e.g. 1 = first EMI month).
     *   The frontend can send either a numeric offset or resolve a calendar date to offset.
     */
    @NotNull
    @Min(1)
    private Integer startingMonth;
}
