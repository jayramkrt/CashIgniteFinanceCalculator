package com.emicalculator.engine.model;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class IsaEvent {
    public enum Type { DEPOSIT, WITHDRAW }
    private BigDecimal amount;
    private Type type;
}
