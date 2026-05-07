package com.clearhomeemi.service;

import com.clearhomeemi.dto.request.TaxPlanRequestDTO;
import com.clearhomeemi.dto.response.TaxPlanResponseDTO;
import com.clearhomeemi.dto.response.TaxPlanSummaryDTO;
import com.clearhomeemi.engine.TaxCalculationEngine;
import com.clearhomeemi.entity.TaxPlan;
import com.clearhomeemi.repository.TaxPlanRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaxPlanService {

    private final TaxPlanRepository repo;
    private final TaxCalculationEngine engine;
    private final ObjectMapper objectMapper;

    @Transactional
    public TaxPlanResponseDTO create(TaxPlanRequestDTO req) {
        TaxPlan plan = TaxPlan.builder()
            .name(req.getName())
            .financialYear(req.getFinancialYear())
            .earningsJson(toJson(req.getEarnings()))
            .exemptionsJson(toJson(req.getExemptions()))
            .deductionsJson(toJson(req.getDeductions()))
            .status(req.getStatus() != null ? req.getStatus() : "DRAFT")
            .build();
        return toResponse(repo.save(plan));
    }

    @Transactional(readOnly = true)
    public List<TaxPlanSummaryDTO> listAll() {
        return repo.findAllByOrderByCreatedAtDesc().stream()
            .map(this::toSummary)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaxPlanSummaryDTO> listByFY(String fy) {
        return repo.findByFinancialYearOrderByCreatedAtDesc(fy).stream()
            .map(this::toSummary)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaxPlanResponseDTO getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public TaxPlanResponseDTO update(UUID id, TaxPlanRequestDTO req) {
        TaxPlan plan = findOrThrow(id);
        plan.setName(req.getName());
        plan.setFinancialYear(req.getFinancialYear());
        plan.setEarningsJson(toJson(req.getEarnings()));
        plan.setExemptionsJson(toJson(req.getExemptions()));
        plan.setDeductionsJson(toJson(req.getDeductions()));
        if (req.getStatus() != null) plan.setStatus(req.getStatus());
        return toResponse(repo.save(plan));
    }

    @Transactional
    public void delete(UUID id) {
        findOrThrow(id);
        repo.deleteById(id);
    }

    // ── Mapping helpers ───────────────────────────────────────────────────────

    private TaxPlan findOrThrow(UUID id) {
        return repo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Tax plan not found: " + id));
    }

    private TaxPlanResponseDTO toResponse(TaxPlan p) {
        var earnings   = fromJson(p.getEarningsJson(),   TaxPlanRequestDTO.EarningsDTO.class);
        var exemptions = fromJson(p.getExemptionsJson(), TaxPlanRequestDTO.ExemptionsDTO.class);
        var deductions = fromJson(p.getDeductionsJson(), TaxPlanRequestDTO.DeductionsDTO.class);
        String fy      = p.getFinancialYear();

        return TaxPlanResponseDTO.builder()
            .id(p.getId())
            .name(p.getName())
            .financialYear(fy)
            .status(p.getStatus())
            .earnings(earnings)
            .exemptions(exemptions)
            .deductions(deductions)
            .oldRegime(engine.calculateOldRegime(earnings, exemptions, deductions, fy))
            .newRegime(engine.calculateNewRegime(earnings, fy))
            .createdAt(p.getCreatedAt())
            .updatedAt(p.getUpdatedAt())
            .build();
    }

    private TaxPlanSummaryDTO toSummary(TaxPlan p) {
        var earnings   = fromJson(p.getEarningsJson(),   TaxPlanRequestDTO.EarningsDTO.class);
        var exemptions = fromJson(p.getExemptionsJson(), TaxPlanRequestDTO.ExemptionsDTO.class);
        var deductions = fromJson(p.getDeductionsJson(), TaxPlanRequestDTO.DeductionsDTO.class);
        String fy      = p.getFinancialYear();

        var old = engine.calculateOldRegime(earnings, exemptions, deductions, fy);
        var nw  = engine.calculateNewRegime(earnings, fy);

        return TaxPlanSummaryDTO.builder()
            .id(p.getId())
            .name(p.getName())
            .financialYear(fy)
            .status(p.getStatus())
            .grossIncome(old.getGrossIncome())
            .oldRegimeTax(old.getTotalTax())
            .newRegimeTax(nw.getTotalTax())
            .createdAt(p.getCreatedAt())
            .updatedAt(p.getUpdatedAt())
            .build();
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.warn("JSON serialisation failed", e);
            return null;
        }
    }

    private <T> T fromJson(String json, Class<T> type) {
        if (json == null) return null;
        try {
            return objectMapper.readValue(json, type);
        } catch (JsonProcessingException e) {
            log.warn("JSON deserialisation failed for {}", type.getSimpleName(), e);
            return null;
        }
    }
}
