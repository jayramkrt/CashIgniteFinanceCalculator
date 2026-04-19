package com.emicalculator.controller;

import com.emicalculator.dto.request.LoanRequestDTO;
import com.emicalculator.dto.response.CalculationResultDTO;
import com.emicalculator.service.LoanCalculationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/loan")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
@RequiredArgsConstructor
@Tag(name = "Loan Calculator", description = "EMI calculation and amortization schedule generation")
public class LoanController {

    private final LoanCalculationService calculationService;

    /**
     * Primary calculation endpoint.
     * Accepts the full loan configuration (base + all advanced features)
     * and returns a complete amortization schedule with summary metrics.
     */
    @PostMapping("/calculate")
    @Operation(
        summary = "Calculate EMI and amortization schedule",
        description = """
            Processes a loan scenario including optional advanced features:
            prepayments, variable interest rates, interest saver account,
            moratorium period, and fees & charges.
            Returns a full month-by-month schedule plus year-level rollups.
            """
    )
    public ResponseEntity<CalculationResultDTO> calculate(@Valid @RequestBody LoanRequestDTO request) {
        return ResponseEntity.ok(calculationService.calculate(request));
    }

    /**
     * Quick EMI-only calculation — no full schedule needed.
     * Used by the frontend to show live EMI as the user adjusts sliders.
     */
    @GetMapping("/emi")
    @Operation(summary = "Get EMI amount only (for live slider preview)")
    public ResponseEntity<BigDecimalResponse> getEmi(
            @RequestParam java.math.BigDecimal amount,
            @RequestParam java.math.BigDecimal rate,
            @RequestParam int tenureMonths) {
        java.math.BigDecimal emi = calculationService.getEmiOnly(amount, rate, tenureMonths);
        return ResponseEntity.ok(new BigDecimalResponse(emi));
    }

    record BigDecimalResponse(java.math.BigDecimal value) {}
}
