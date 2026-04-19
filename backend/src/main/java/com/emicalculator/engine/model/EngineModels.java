package com.emicalculator.engine.model;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

// ─────────────────────────────────────────────────────────────────────────────
// Event models (internal to engine — not serialised)
// ─────────────────────────────────────────────────────────────────────────────

@Data @Builder
class PrepaymentEvent {
    public enum Effect { REDUCE_TERM, REDUCE_EMI }
    private BigDecimal amount;
    private Effect effect;
}

@Data @Builder
class InterestChangeEvent {
    public enum Effect { CHANGE_LOAN_TERM, REDUCE_EMI }
    private BigDecimal newAnnualRate;
    private Effect effect;
}

@Data @Builder
class IsaEvent {
    public enum Type { DEPOSIT, WITHDRAW }
    private BigDecimal amount;
    private Type type;
}

@Data @Builder
class FeeEvent {
    private BigDecimal amount;
}

// ─────────────────────────────────────────────────────────────────────────────
// Month-indexed event lookup structure
// ─────────────────────────────────────────────────────────────────────────────

class SortedEventMap {

    private final Map<Integer, List<PrepaymentEvent>> prepayments = new HashMap<>();
    private final Map<Integer, InterestChangeEvent>   rateChanges  = new HashMap<>();
    private final Map<Integer, List<IsaEvent>>        isaEvents    = new HashMap<>();
    private final Map<Integer, List<FeeEvent>>        fees         = new HashMap<>();

    // Prepayments
    public void addPrepayment(int month, PrepaymentEvent e) {
        prepayments.computeIfAbsent(month, k -> new ArrayList<>()).add(e);
    }
    public boolean hasPrepayment(int month)        { return prepayments.containsKey(month); }
    public List<PrepaymentEvent> getPrepayments(int month) { return prepayments.getOrDefault(month, List.of()); }

    // Rate changes
    public void setRateChange(int month, InterestChangeEvent e) { rateChanges.put(month, e); }
    public boolean hasRateChange(int month)        { return rateChanges.containsKey(month); }
    public InterestChangeEvent getRateChange(int month)        { return rateChanges.get(month); }

    // ISA events
    public void addIsaEvent(int month, IsaEvent e) {
        isaEvents.computeIfAbsent(month, k -> new ArrayList<>()).add(e);
    }
    public boolean hasIsaEvent(int month)          { return isaEvents.containsKey(month); }
    public List<IsaEvent> getIsaEvents(int month)  { return isaEvents.getOrDefault(month, List.of()); }

    // Fees
    public void addFee(int month, FeeEvent e) {
        fees.computeIfAbsent(month, k -> new ArrayList<>()).add(e);
    }
    public boolean hasFee(int month)               { return fees.containsKey(month); }
    public List<FeeEvent> getFees(int month)       { return fees.getOrDefault(month, List.of()); }
}

// ─────────────────────────────────────────────────────────────────────────────
// MonthlyRow — one entry in the amortization schedule (engine internal)
// ─────────────────────────────────────────────────────────────────────────────

@Data @Builder
class MonthlyRow {
    private int       monthNumber;
    private LocalDate dueDate;
    private BigDecimal openingBalance;
    private BigDecimal emi;
    private BigDecimal principalComponent;
    private BigDecimal interestComponent;
    private BigDecimal prepayment;
    private BigDecimal fees;
    private BigDecimal closingBalance;
    private BigDecimal interestSaverBalance;
    private BigDecimal loanPaidPercentage;
    private boolean   moratoriumMonth;
    private boolean   rateChangedThisMonth;
    private BigDecimal appliedAnnualRate;
}

// ─────────────────────────────────────────────────────────────────────────────
// LoanSummary — headline numbers returned alongside the schedule
// ─────────────────────────────────────────────────────────────────────────────

@Data @Builder
class LoanSummary {
    private BigDecimal emiAmount;
    private BigDecimal totalPayment;
    private BigDecimal totalInterestPayable;
    private BigDecimal totalPrincipal;
    private BigDecimal totalPrepaymentAmount;
    private BigDecimal totalFees;
    private Integer    originalTenureMonths;
    private Integer    actualTenureMonths;
    private Integer    tenureReducedByMonths;       // null if none
    private LocalDate  loanStartDate;
    private LocalDate  loanEndDate;
    private BigDecimal effectiveAnnualRate;          // populated by service layer
    private BigDecimal interestSaverFinalBalance;    // null if not used
    private BigDecimal interestSavedByInterestSaver; // null if not used
    private BigDecimal interestSavedByPrepayment;    // null if no prepayment
}

// ─────────────────────────────────────────────────────────────────────────────
// CalculationResult — full output of the engine
// ─────────────────────────────────────────────────────────────────────────────

@Data @Builder
class CalculationResult {
    private LoanSummary        summary;
    private List<MonthlyRow>   monthlySchedule;
}
