package com.clearhomeemi.engine.model;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class InterestChangeEvent {
    public enum Effect { CHANGE_LOAN_TERM, REDUCE_EMI }
    private BigDecimal newAnnualRate;
    private Effect effect;
}
