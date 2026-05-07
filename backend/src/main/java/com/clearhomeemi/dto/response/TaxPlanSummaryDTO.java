package com.clearhomeemi.dto.response;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TaxPlanSummaryDTO {
    private UUID id;
    private String name;
    private String financialYear;
    private String status;
    private double grossIncome;
    private double oldRegimeTax;
    private double newRegimeTax;
    private Instant createdAt;
    private Instant updatedAt;
}
