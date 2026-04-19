package com.emicalculator.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MoratoriumDTO {

    @NotNull
    private Boolean payInterestDuringMoratorium;

    @NotNull
    @Min(1)
    private Integer durationMonths;
}
