package com.emicalculator.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Root request DTO for the loan calculation endpoint.
 * All advanced feature lists are optional — null or empty means feature is disabled.
 */
@Data
public class LoanRequestDTO {

    // ── Core loan fields ──────────────────────────────────────────────────────

    @NotNull(message = "Loan amount is required")
    @DecimalMin(value = "1000.00", message = "Loan amount must be at least ₹1,000")
    @DecimalMax(value = "999999999.00", message = "Loan amount must be under ₹99.99 Cr")
    private BigDecimal loanAmount;

    @NotNull(message = "Annual interest rate is required")
    @DecimalMin(value = "0.01", message = "Interest rate must be greater than 0")
    @DecimalMax(value = "100.00", message = "Interest rate must be ≤ 100%")
    private BigDecimal annualInterestRate;

    @NotNull(message = "Tenure is required")
    @Min(value = 1, message = "Tenure must be at least 1 month")
    @Max(value = 600, message = "Tenure must be ≤ 600 months (50 years)")
    private Integer tenureMonths;

    @NotNull(message = "First EMI date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate firstEmiDate;

    // ── Advanced feature modules (all optional) ───────────────────────────────

    @Valid
    private MoratoriumDTO moratorium;

    @Valid
    private List<PrepaymentDTO> prepayments;

    @Valid
    private List<InterestChangeDTO> interestChanges;

    @Valid
    private List<InterestSaverDTO> interestSaverEntries;

    @Valid
    private List<FeeDTO> fees;
}
