package com.emicalculator.service;

import com.emicalculator.dto.request.LoanRequestDTO;
import com.emicalculator.dto.response.*;
import com.emicalculator.entity.LoanScenario;
import com.emicalculator.repository.LoanScenarioRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ScenarioService
 *
 * Handles persistence of loan scenarios (optional — only called when
 * the user chooses to save a calculation for later reference).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ScenarioService {

    private final LoanScenarioRepository repo;
    private final LoanCalculationService calculationService;
    private final ObjectMapper objectMapper;

    // ── Save a scenario after calculation ─────────────────────────────────────

    @Transactional
    public Long saveScenario(LoanRequestDTO request, String scenarioName) {
        CalculationResultDTO result = calculationService.calculate(request);

        LoanScenario scenario = LoanScenario.builder()
                .loanAmount(request.getLoanAmount())
                .annualInterestRate(request.getAnnualInterestRate())
                .tenureMonths(request.getTenureMonths())
                .firstEmiDate(request.getFirstEmiDate())
                .prepaymentsJson(toJson(request.getPrepayments()))
                .interestChangesJson(toJson(request.getInterestChanges()))
                .interestSaverJson(toJson(request.getInterestSaverEntries()))
                .moratoriumJson(toJson(request.getMoratorium()))
                .feesJson(toJson(request.getFees()))
                .resultSummaryJson(toJson(result.getSummary()))
                .scenarioName(scenarioName)
                .build();

        LoanScenario saved = repo.save(scenario);
        log.info("Saved loan scenario id={} name={}", saved.getId(), scenarioName);
        return saved.getId();
    }

    // ── Retrieve paginated history ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ScenarioSummaryDTO> getHistory(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return repo.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toSummaryDTO);
    }

    // ── Retrieve full scenario and recalculate ────────────────────────────────

    @Transactional(readOnly = true)
    public CalculationResultDTO recalculate(Long scenarioId) {
        LoanScenario scenario = repo.findById(scenarioId)
                .orElseThrow(() -> new IllegalArgumentException("Scenario not found: " + scenarioId));

        LoanRequestDTO request = toRequest(scenario);
        return calculationService.calculate(request);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private ScenarioSummaryDTO toSummaryDTO(LoanScenario s) {
        SummaryDTO cachedSummary = fromJson(s.getResultSummaryJson(), SummaryDTO.class);
        return ScenarioSummaryDTO.builder()
                .id(s.getId())
                .scenarioName(s.getScenarioName())
                .loanAmount(s.getLoanAmount())
                .annualInterestRate(s.getAnnualInterestRate())
                .tenureMonths(s.getTenureMonths())
                .createdAt(s.getCreatedAt())
                .summary(cachedSummary)
                .build();
    }

    private LoanRequestDTO toRequest(LoanScenario s) {
        LoanRequestDTO req = new LoanRequestDTO();
        req.setLoanAmount(s.getLoanAmount());
        req.setAnnualInterestRate(s.getAnnualInterestRate());
        req.setTenureMonths(s.getTenureMonths());
        req.setFirstEmiDate(s.getFirstEmiDate());
        req.setPrepayments(fromJsonList(s.getPrepaymentsJson(),
                com.emicalculator.dto.request.PrepaymentDTO.class));
        req.setInterestChanges(fromJsonList(s.getInterestChangesJson(),
                com.emicalculator.dto.request.InterestChangeDTO.class));
        req.setInterestSaverEntries(fromJsonList(s.getInterestSaverJson(),
                com.emicalculator.dto.request.InterestSaverDTO.class));
        req.setMoratorium(fromJson(s.getMoratoriumJson(),
                com.emicalculator.dto.request.MoratoriumDTO.class));
        req.setFees(fromJsonList(s.getFeesJson(),
                com.emicalculator.dto.request.FeeDTO.class));
        return req;
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialise object to JSON", e);
            return null;
        }
    }

    private <T> T fromJson(String json, Class<T> type) {
        if (json == null) return null;
        try {
            return objectMapper.readValue(json, type);
        } catch (JsonProcessingException e) {
            log.warn("Failed to deserialise JSON to {}", type.getSimpleName(), e);
            return null;
        }
    }

    private <T> List<T> fromJsonList(String json, Class<T> elementType) {
        if (json == null) return null;
        try {
            return objectMapper.readValue(json,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, elementType));
        } catch (JsonProcessingException e) {
            log.warn("Failed to deserialise JSON list of {}", elementType.getSimpleName(), e);
            return null;
        }
    }
}
