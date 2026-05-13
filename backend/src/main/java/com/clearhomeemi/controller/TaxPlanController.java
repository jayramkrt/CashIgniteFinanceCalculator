package com.clearhomeemi.controller;

import com.clearhomeemi.dto.request.TaxPlanRequestDTO;
import com.clearhomeemi.dto.response.TaxPlanResponseDTO;
import com.clearhomeemi.dto.response.TaxPlanSummaryDTO;
import com.clearhomeemi.service.TaxPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tax-plans")
@RequiredArgsConstructor
@Tag(name = "Tax Plans", description = "Tax planning & declaration management")
public class TaxPlanController {

    private final TaxPlanService service;

    @PostMapping
    @Operation(summary = "Create a new tax plan")
    public ResponseEntity<TaxPlanResponseDTO> create(@Valid @RequestBody TaxPlanRequestDTO req) {
        TaxPlanResponseDTO created = service.create(req);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(created.getId()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping
    @Operation(summary = "List all tax plans (optionally filtered by FY)")
    public ResponseEntity<List<TaxPlanSummaryDTO>> list(@RequestParam(required = false) String fy) {
        return ResponseEntity.ok(fy != null ? service.listByFY(fy) : service.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get full plan details with calculated results")
    public ResponseEntity<TaxPlanResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a tax plan")
    public ResponseEntity<TaxPlanResponseDTO> update(
        @PathVariable UUID id,
        @Valid @RequestBody TaxPlanRequestDTO req
    ) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a tax plan")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
