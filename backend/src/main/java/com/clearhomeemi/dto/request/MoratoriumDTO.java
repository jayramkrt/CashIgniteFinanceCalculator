package com.clearhomeemi.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MoratoriumDTO {

    /** If true, borrower pays interest during moratorium; principal deferred. */
    @NotNull
    private Boolean payInterestDuringMoratorium;

    @NotNull
    @Min(1)
    private Integer durationMonths;
}
