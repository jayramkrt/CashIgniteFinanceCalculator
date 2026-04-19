package com.clearhomeemi.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CalculationResultDTO {

    private SummaryDTO summary;

    /** Full month-by-month schedule (used for charts and table rows). */
    private List<MonthlyRowDTO> amortizationSchedule;

    /** Year-level rollups derived from the monthly schedule. */
    private List<YearlyRowDTO> yearlySchedule;
}
