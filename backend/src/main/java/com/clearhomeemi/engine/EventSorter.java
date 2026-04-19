package com.clearhomeemi.engine;

import com.clearhomeemi.dto.request.*;
import com.clearhomeemi.engine.model.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

/**
 * EventSorter
 *
 * Translates all feature DTOs (prepayments, interest changes, ISA entries, fees)
 * into a SortedEventMap keyed by month number. This gives the MonthlyScheduleBuilder
 * O(1) lookup per month regardless of how many events are configured.
 *
 * Recurring events (MONTHLY, QUARTERLY, etc.) are expanded here so the engine
 * doesn't need to repeat that logic each iteration.
 */
@Slf4j
@Component
public class EventSorter {

    public SortedEventMap sortEvents(LoanRequestDTO request) {
        SortedEventMap map = new SortedEventMap();
        int maxTenure = request.getTenureMonths() + 
                (request.getMoratorium() != null ? request.getMoratorium().getDurationMonths() : 0) + 120;

        expandPrepayments(request, map, maxTenure);
        expandInterestChanges(request, map);
        expandIsaEntries(request, map, maxTenure);
        expandFees(request, map, maxTenure);

        return map;
    }

    // ─────────────────────────────────────────────────────────────────────────

    private void expandPrepayments(LoanRequestDTO request, SortedEventMap map, int maxMonth) {
        if (request.getPrepayments() == null) return;

        for (PrepaymentDTO dto : request.getPrepayments()) {
            PrepaymentEvent.Effect effect = dto.getEffect() == PrepaymentDTO.PrepaymentEffect.REDUCE_TERM
                    ? PrepaymentEvent.Effect.REDUCE_TERM
                    : PrepaymentEvent.Effect.REDUCE_EMI;

            List<Integer> months = expandMonths(dto.getPaymentMode().name(), dto.getStartingMonth(), maxMonth);
            for (int m : months) {
                map.addPrepayment(m, PrepaymentEvent.builder()
                        .amount(dto.getAmount())
                        .effect(effect)
                        .build());
            }
        }
    }

    private void expandInterestChanges(LoanRequestDTO request, SortedEventMap map) {
        if (request.getInterestChanges() == null) return;

        // Sort by month so later entries override earlier ones if same month
        request.getInterestChanges().stream()
                .sorted(Comparator.comparingInt(InterestChangeDTO::getStartingMonth))
                .forEach(dto -> {
                    InterestChangeEvent.Effect effect =
                            dto.getEffect() == InterestChangeDTO.InterestChangeEffect.REDUCE_EMI
                                    ? InterestChangeEvent.Effect.REDUCE_EMI
                                    : InterestChangeEvent.Effect.CHANGE_LOAN_TERM;

                    map.setRateChange(dto.getStartingMonth(), InterestChangeEvent.builder()
                            .newAnnualRate(dto.getNewAnnualRate())
                            .effect(effect)
                            .build());
                });
    }

    private void expandIsaEntries(LoanRequestDTO request, SortedEventMap map, int maxMonth) {
        if (request.getInterestSaverEntries() == null) return;

        for (InterestSaverDTO dto : request.getInterestSaverEntries()) {
            IsaEvent.Type type = dto.getTransactionType() == InterestSaverDTO.TransactionType.DEPOSIT
                    ? IsaEvent.Type.DEPOSIT
                    : IsaEvent.Type.WITHDRAW;

            List<Integer> months = expandMonths(dto.getPaymentMode().name(), dto.getStartingMonth(), maxMonth);
            for (int m : months) {
                map.addIsaEvent(m, IsaEvent.builder()
                        .amount(dto.getAmount())
                        .type(type)
                        .build());
            }
        }
    }

    private void expandFees(LoanRequestDTO request, SortedEventMap map, int maxMonth) {
        if (request.getFees() == null) return;

        for (FeeDTO dto : request.getFees()) {
            List<Integer> months = expandMonths(dto.getPaymentMode().name(), dto.getStartingMonth(), maxMonth);
            for (int m : months) {
                map.addFee(m, FeeEvent.builder()
                        .amount(dto.getAmount())
                        .build());
            }
        }
    }

    /**
     * Expands a payment mode + starting month into a list of all applicable month numbers.
     *
     * @param mode         payment frequency name (matches PaymentMode enum name)
     * @param startMonth   1-based month offset from loan start
     * @param maxMonth     upper bound (loan length + safety margin)
     */
    private List<Integer> expandMonths(String mode, int startMonth, int maxMonth) {
        List<Integer> months = new ArrayList<>();
        int interval = switch (mode) {
            case "ONE_TIME"     -> 0;       // only the start month
            case "MONTHLY"      -> 1;
            case "BI_MONTHLY"   -> 2;
            case "QUARTERLY"    -> 3;
            case "HALF_YEARLY"  -> 6;
            case "THRICE_YEARLY"-> 4;
            case "YEARLY"       -> 12;
            default             -> 0;
        };

        if (interval == 0) {
            months.add(startMonth);
        } else {
            for (int m = startMonth; m <= maxMonth; m += interval) {
                months.add(m);
            }
        }
        return months;
    }
}
