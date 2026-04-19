package com.emicalculator.engine.model;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class PrepaymentEvent {
    public enum Effect { REDUCE_TERM, REDUCE_EMI }
    private BigDecimal amount;
    private Effect effect;
}
