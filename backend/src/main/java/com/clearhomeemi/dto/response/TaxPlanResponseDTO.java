package com.clearhomeemi.dto.response;

import com.clearhomeemi.dto.request.TaxPlanRequestDTO;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TaxPlanResponseDTO {

    private UUID id;
    private String name;
    private String financialYear;
    private String status;

    private TaxPlanRequestDTO.EarningsDTO earnings;
    private TaxPlanRequestDTO.ExemptionsDTO exemptions;
    private TaxPlanRequestDTO.DeductionsDTO deductions;

    private RegimeResultDTO oldRegime;
    private RegimeResultDTO newRegime;

    private Instant createdAt;
    private Instant updatedAt;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RegimeResultDTO {
        private double grossIncome;
        private double standardDeduction;
        private double totalExemptions;
        private double totalDeductions;
        private double taxableIncome;
        private double taxBeforeRebate;
        private double rebate87A;
        private double taxAfterRebate;
        private double cess;
        private double totalTax;
        private double monthlyTds;
        private double effectiveRate;
    }
}
