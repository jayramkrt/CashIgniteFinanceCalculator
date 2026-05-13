package com.clearhomeemi.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxPlanRequestDTO {

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "Financial year must be in YYYY-YY format (e.g. 2025-26)")
    private String financialYear;

    @Valid
    @NotNull
    private EarningsDTO earnings;

    private ExemptionsDTO exemptions;

    private DeductionsDTO deductions;

    /** DRAFT | FINAL */
    private String status;

    // ── Nested DTOs ───────────────────────────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class EarningsDTO {
        @Min(0) private double basic;
        @Min(0) private double hra;
        @Min(0) private double allowances;
        @Min(0) private double perks;
        @Min(0) private double otherIncome;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ExemptionsDTO {
        @Min(0) private double hraExemption;
        @Min(0) private double ltaExemption;
        @Min(0) private double otherExemptions;
        @Min(0) private double professionalTax;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DeductionsDTO {
        @Min(0) private double section80C;
        @Min(0) private double section80D;
        @Min(0) private double section80E;
        @Min(0) private double section80G;
        @Min(0) private double nps80CCD1B;
        @Min(0) private double otherDeductions;
    }
}
