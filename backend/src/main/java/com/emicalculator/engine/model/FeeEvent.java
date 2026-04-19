package com.emicalculator.engine.model;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class FeeEvent {
    private BigDecimal amount;
}
