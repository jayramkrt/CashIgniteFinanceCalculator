package com.clearhomeemi.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

// ─────────────────────────────────────────────────────────────────────────────
// Prepayment DTO
// ─────────────────────────────────────────────────────────────────────────────
@Data
class PrepaymentDTO {

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
     * 1-based month offset from loan start date (e.g. 1 = first EMI month).
     * The frontend can send either a numeric offset or resolve a calendar date to offset.
     */
    @NotNull
    @Min(1)
    private Integer startingMonth;
}

// ─────────────────────────────────────────────────────────────────────────────
// Variable interest rate entry
// ─────────────────────────────────────────────────────────────────────────────
@Data
class InterestChangeDTO {

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

// ─────────────────────────────────────────────────────────────────────────────
// Interest saver account entry (deposit or withdrawal)
// ─────────────────────────────────────────────────────────────────────────────
@Data
class InterestSaverDTO {

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

// ─────────────────────────────────────────────────────────────────────────────
// Moratorium period
// ─────────────────────────────────────────────────────────────────────────────
@Data
class MoratoriumDTO {

    /** If true, borrower pays interest during moratorium; principal deferred. */
    @NotNull
    private Boolean payInterestDuringMoratorium;

    @NotNull
    @Min(1)
    private Integer durationMonths;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fees & charges entry
// ─────────────────────────────────────────────────────────────────────────────
@Data
class FeeDTO {

    public enum PaymentMode {
        ONE_TIME, MONTHLY, BI_MONTHLY, QUARTERLY,
        HALF_YEARLY, THRICE_YEARLY, YEARLY
    }

    @NotNull
    private PaymentMode paymentMode;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    @NotNull
    @Min(1)
    private Integer startingMonth;
}
