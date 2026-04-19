package com.emicalculator.engine.model;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class CalculationResult {
    private LoanSummary      summary;
    private List<MonthlyRow> monthlySchedule;
}
