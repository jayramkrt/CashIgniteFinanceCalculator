package com.clearhomeemi.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Lightweight scenario row returned in the history/list endpoint.
 * Includes the cached SummaryDTO so the frontend can display key
 * metrics without triggering a full recalculation.
 */
@Data
@Builder
public class ScenarioSummaryDTO {
    private Long       id;
    private String     scenarioName;
    private BigDecimal loanAmount;
    private BigDecimal annualInterestRate;
    private Integer    tenureMonths;
    private Instant    createdAt;
    private SummaryDTO summary;           // cached at save time
}
