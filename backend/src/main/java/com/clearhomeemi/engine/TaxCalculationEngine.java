package com.clearhomeemi.engine;

import com.clearhomeemi.dto.request.TaxPlanRequestDTO;
import com.clearhomeemi.dto.response.TaxPlanResponseDTO;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Server-side tax calculation engine.
 * Mirrors the TypeScript taxCalc.ts logic so both produce identical results.
 */
@Component
public class TaxCalculationEngine {

    // ── Slab tables ───────────────────────────────────────────────────────────
    // Each row: [min, max (exclusive), rate]   max = Double.MAX_VALUE means unlimited

    private static final Map<String, double[][]> OLD_SLABS = Map.of(
        "2025-26", new double[][]{{0, 250_000, 0}, {250_000, 500_000, 0.05}, {500_000, 1_000_000, 0.20}, {1_000_000, Double.MAX_VALUE, 0.30}},
        "2024-25", new double[][]{{0, 250_000, 0}, {250_000, 500_000, 0.05}, {500_000, 1_000_000, 0.20}, {1_000_000, Double.MAX_VALUE, 0.30}},
        "2023-24", new double[][]{{0, 250_000, 0}, {250_000, 500_000, 0.05}, {500_000, 1_000_000, 0.20}, {1_000_000, Double.MAX_VALUE, 0.30}}
    );

    private static final Map<String, double[][]> NEW_SLABS = Map.of(
        "2025-26", new double[][]{{0, 400_000, 0}, {400_000, 800_000, 0.05}, {800_000, 1_200_000, 0.10}, {1_200_000, 1_600_000, 0.15}, {1_600_000, 2_000_000, 0.20}, {2_000_000, 2_400_000, 0.25}, {2_400_000, Double.MAX_VALUE, 0.30}},
        "2024-25", new double[][]{{0, 300_000, 0}, {300_000, 700_000, 0.05}, {700_000, 1_000_000, 0.10}, {1_000_000, 1_200_000, 0.15}, {1_200_000, 1_500_000, 0.20}, {1_500_000, Double.MAX_VALUE, 0.30}},
        "2023-24", new double[][]{{0, 300_000, 0}, {300_000, 600_000, 0.05}, {600_000, 900_000, 0.10}, {900_000, 1_200_000, 0.15}, {1_200_000, 1_500_000, 0.20}, {1_500_000, Double.MAX_VALUE, 0.30}}
    );

    // ── Standard deductions ───────────────────────────────────────────────────

    private static final Map<String, Double> OLD_STD_DED = Map.of("2025-26", 50_000.0, "2024-25", 50_000.0, "2023-24", 50_000.0);
    private static final Map<String, Double> NEW_STD_DED = Map.of("2025-26", 75_000.0, "2024-25", 75_000.0, "2023-24", 50_000.0);

    // ── Section 87A rebate config: [taxable-income-limit, max-rebate (0 = full)] ──

    private static final Map<String, double[]> OLD_87A = Map.of("2025-26", new double[]{500_000, 12_500}, "2024-25", new double[]{500_000, 12_500}, "2023-24", new double[]{500_000, 12_500});
    private static final Map<String, double[]> NEW_87A = Map.of("2025-26", new double[]{1_200_000, 0}, "2024-25", new double[]{700_000, 25_000}, "2023-24", new double[]{700_000, 25_000});

    // ── Public API ────────────────────────────────────────────────────────────

    public TaxPlanResponseDTO.RegimeResultDTO calculateOldRegime(
        TaxPlanRequestDTO.EarningsDTO e,
        TaxPlanRequestDTO.ExemptionsDTO x,
        TaxPlanRequestDTO.DeductionsDTO d,
        String fy
    ) {
        double gross = earnings(e);
        double stdDed = OLD_STD_DED.getOrDefault(fy, 50_000.0);

        double totalExemptions = x == null ? 0 : Math.max(0, x.getHraExemption() + x.getLtaExemption() + x.getOtherExemptions());
        double profTax = x == null ? 0 : Math.min(x.getProfessionalTax(), 2_500);
        double totalDeductions = d == null ? 0 : Math.max(0,
            d.getSection80C() + d.getSection80D() + d.getSection80E() +
            d.getSection80G() + d.getNps80CCD1B() + d.getOtherDeductions() + profTax
        );

        double taxable = Math.max(0, gross - stdDed - totalExemptions - totalDeductions);
        double[][] slabs = OLD_SLABS.getOrDefault(fy, OLD_SLABS.get("2025-26"));
        double[] rebateCfg = OLD_87A.getOrDefault(fy, OLD_87A.get("2025-26"));

        return compute(gross, stdDed, totalExemptions, totalDeductions, taxable, slabs, rebateCfg);
    }

    public TaxPlanResponseDTO.RegimeResultDTO calculateNewRegime(
        TaxPlanRequestDTO.EarningsDTO e,
        String fy
    ) {
        double gross = earnings(e);
        double stdDed = NEW_STD_DED.getOrDefault(fy, 75_000.0);
        double taxable = Math.max(0, gross - stdDed);
        double[][] slabs = NEW_SLABS.getOrDefault(fy, NEW_SLABS.get("2025-26"));
        double[] rebateCfg = NEW_87A.getOrDefault(fy, NEW_87A.get("2025-26"));

        return compute(gross, stdDed, 0, 0, taxable, slabs, rebateCfg);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private double earnings(TaxPlanRequestDTO.EarningsDTO e) {
        if (e == null) return 0;
        return e.getBasic() + e.getHra() + e.getAllowances() + e.getPerks() + e.getOtherIncome();
    }

    private double slabTax(double income, double[][] slabs) {
        double tax = 0;
        for (double[] slab : slabs) {
            if (income <= slab[0]) break;
            double slice = Math.min(income, slab[1]) - slab[0];
            tax += slice * slab[2];
        }
        return tax;
    }

    private double afterRebate(double tax, double taxable, double[] cfg) {
        if (taxable > cfg[0]) return tax;
        double maxRebate = cfg[1];
        if (maxRebate == 0) return 0; // full rebate (new regime FY 2025-26)
        return Math.max(0, tax - Math.min(tax, maxRebate));
    }

    private TaxPlanResponseDTO.RegimeResultDTO compute(
        double gross, double stdDed, double totalExemptions, double totalDeductions,
        double taxable, double[][] slabs, double[] rebateCfg
    ) {
        long taxBefore = Math.round(slabTax(taxable, slabs));
        long taxAfter  = Math.round(afterRebate(taxBefore, taxable, rebateCfg));
        long rebate    = taxBefore - taxAfter;
        long cess      = Math.round(taxAfter * 0.04);
        long total     = taxAfter + cess;

        return TaxPlanResponseDTO.RegimeResultDTO.builder()
            .grossIncome(gross)
            .standardDeduction(stdDed)
            .totalExemptions(totalExemptions)
            .totalDeductions(totalDeductions)
            .taxableIncome(taxable)
            .taxBeforeRebate(taxBefore)
            .rebate87A(rebate)
            .taxAfterRebate(taxAfter)
            .cess(cess)
            .totalTax(total)
            .monthlyTds(Math.round((double) total / 12))
            .effectiveRate(gross > 0 ? (double) total / gross * 100 : 0)
            .build();
    }
}
