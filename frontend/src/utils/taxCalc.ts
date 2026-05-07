import type { Earnings, Exemptions, Deductions, RegimeTaxResult } from '@/types/taxPlan'
import { TAX_DATA, type FYKey } from '@/data/taxData'

// ── Internal helpers ──────────────────────────────────────────────────────────

function fyKey(fy: string): FYKey {
  const map: Record<string, FYKey> = {
    '2025-26': 'FY_2025_26',
    '2024-25': 'FY_2024_25',
    '2023-24': 'FY_2023_24',
  }
  return map[fy] ?? 'FY_2025_26'
}

function slabTax(income: number, slabs: { min: number; max: number | null; rate: number }[]): number {
  let tax = 0
  for (const slab of slabs) {
    if (income <= slab.min) break
    const upper = slab.max ?? Infinity
    const slice = Math.min(income, upper) - slab.min
    tax += slice * slab.rate
  }
  return tax
}

function afterRebate(tax: number, taxable: number, limit: number, maxRebate: number): number {
  if (taxable > limit) return tax
  if (maxRebate === 0) return 0 // full rebate (new regime FY 2025-26)
  return Math.max(0, tax - Math.min(tax, maxRebate))
}

function gross(e: Earnings): number {
  return e.basic + e.hra + e.allowances + e.perks + e.otherIncome
}

// ── Public calculation functions ──────────────────────────────────────────────

export function calculateOldRegime(
  earnings: Earnings,
  exemptions: Exemptions,
  deductions: Deductions,
  fy: string,
): RegimeTaxResult {
  const cfg = TAX_DATA[fyKey(fy)].oldRegime
  const grossIncome = gross(earnings)
  const stdDed = cfg.standardDeduction

  const totalExemptions = Math.max(0,
    exemptions.hraExemption + exemptions.ltaExemption + exemptions.otherExemptions
  )
  const profTax = Math.min(exemptions.professionalTax, 2500)
  const totalDeductions = Math.max(0,
    deductions.section80C + deductions.section80D + deductions.section80E +
    deductions.section80G + deductions.nps80CCD1B + deductions.otherDeductions + profTax
  )
  const taxableIncome = Math.max(0, grossIncome - stdDed - totalExemptions - totalDeductions)

  const taxBeforeRebate = Math.round(slabTax(taxableIncome, cfg.slabs))
  const taxAfterRebate  = Math.round(afterRebate(taxBeforeRebate, taxableIncome, cfg.section87ALimit, cfg.section87AMaxRebate))
  const rebate87A       = taxBeforeRebate - taxAfterRebate
  const cess            = Math.round(taxAfterRebate * 0.04)
  const totalTax        = taxAfterRebate + cess
  const monthlyTds      = Math.round(totalTax / 12)

  return {
    grossIncome,
    standardDeduction: stdDed,
    totalExemptions,
    totalDeductions,
    taxableIncome,
    taxBeforeRebate,
    rebate87A,
    taxAfterRebate,
    cess,
    totalTax,
    monthlyTds,
    effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
  }
}

export function calculateNewRegime(
  earnings: Earnings,
  fy: string,
): RegimeTaxResult {
  const cfg = TAX_DATA[fyKey(fy)].newRegime
  const grossIncome = gross(earnings)
  const stdDed = cfg.standardDeduction
  const taxableIncome = Math.max(0, grossIncome - stdDed)

  const taxBeforeRebate = Math.round(slabTax(taxableIncome, cfg.slabs))
  const taxAfterRebate  = Math.round(afterRebate(taxBeforeRebate, taxableIncome, cfg.section87ALimit, cfg.section87AMaxRebate))
  const rebate87A       = taxBeforeRebate - taxAfterRebate
  const cess            = Math.round(taxAfterRebate * 0.04)
  const totalTax        = taxAfterRebate + cess
  const monthlyTds      = Math.round(totalTax / 12)

  return {
    grossIncome,
    standardDeduction: stdDed,
    totalExemptions: 0,
    totalDeductions: 0,
    taxableIncome,
    taxBeforeRebate,
    rebate87A,
    taxAfterRebate,
    cess,
    totalTax,
    monthlyTds,
    effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
  }
}
