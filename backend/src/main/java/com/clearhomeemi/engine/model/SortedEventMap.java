package com.clearhomeemi.engine.model;

import java.util.*;

public class SortedEventMap {

    private final Map<Integer, List<PrepaymentEvent>>   prepayments = new HashMap<>();
    private final Map<Integer, InterestChangeEvent>     rateChanges  = new HashMap<>();
    private final Map<Integer, List<IsaEvent>>          isaEvents    = new HashMap<>();
    private final Map<Integer, List<FeeEvent>>          fees         = new HashMap<>();

    // Prepayments
    public void addPrepayment(int month, PrepaymentEvent e) {
        prepayments.computeIfAbsent(month, k -> new ArrayList<>()).add(e);
    }
    public boolean hasPrepayment(int month)                    { return prepayments.containsKey(month); }
    public List<PrepaymentEvent> getPrepayments(int month)     { return prepayments.getOrDefault(month, List.of()); }

    // Rate changes
    public void setRateChange(int month, InterestChangeEvent e){ rateChanges.put(month, e); }
    public boolean hasRateChange(int month)                    { return rateChanges.containsKey(month); }
    public InterestChangeEvent getRateChange(int month)        { return rateChanges.get(month); }

    // ISA events
    public void addIsaEvent(int month, IsaEvent e) {
        isaEvents.computeIfAbsent(month, k -> new ArrayList<>()).add(e);
    }
    public boolean hasIsaEvent(int month)                      { return isaEvents.containsKey(month); }
    public List<IsaEvent> getIsaEvents(int month)              { return isaEvents.getOrDefault(month, List.of()); }

    // Fees
    public void addFee(int month, FeeEvent e) {
        fees.computeIfAbsent(month, k -> new ArrayList<>()).add(e);
    }
    public boolean hasFee(int month)                           { return fees.containsKey(month); }
    public List<FeeEvent> getFees(int month)                   { return fees.getOrDefault(month, List.of()); }
}
