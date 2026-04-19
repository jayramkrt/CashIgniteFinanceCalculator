package com.clearhomeemi.controller;

import com.clearhomeemi.dto.request.LoanRequestDTO;
import com.clearhomeemi.dto.response.*;
import com.clearhomeemi.service.ScenarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

// @RestController  // DB disabled — uncomment when persistence is re-enabled
// @RequestMapping("/api/scenarios")
// @CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
@RequiredArgsConstructor
@Tag(name = "Scenarios", description = "Save and retrieve named loan scenarios for history and comparison")
public class ScenarioController {

    private final ScenarioService scenarioService;

    @PostMapping
    @Operation(summary = "Save a loan scenario", description = "Calculates and persists the scenario. Returns the ID.")
    public ResponseEntity<Void> save(
            @Valid @RequestBody LoanRequestDTO request,
            @RequestParam(defaultValue = "My Loan") String name) {

        Long id = scenarioService.saveScenario(request, name);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(location).build();
    }

    @GetMapping
    @Operation(summary = "List saved scenarios (paginated)")
    public ResponseEntity<Page<ScenarioSummaryDTO>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(scenarioService.getHistory(page, size));
    }

    @GetMapping("/{id}/calculate")
    @Operation(summary = "Re-run calculation for a saved scenario")
    public ResponseEntity<CalculationResultDTO> recalculate(@PathVariable Long id) {
        return ResponseEntity.ok(scenarioService.recalculate(id));
    }
}
