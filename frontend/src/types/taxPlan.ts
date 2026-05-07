export interface Earnings {
  basic: number
  hra: number
  allowances: number
  perks: number
  otherIncome: number
}

export interface Exemptions {
  hraExemption: number
  ltaExemption: number
  otherExemptions: number
  professionalTax: number
}

export interface Deductions {
  section80C: number
  section80D: number
  section80E: number
  section80G: number
  nps80CCD1B: number
  otherDeductions: number
}

export type PlanStatus = 'DRAFT' | 'FINAL'

export interface TaxPlan {
  id: string
  name: string
  financialYear: string
  earnings: Earnings
  exemptions: Exemptions
  deductions: Deductions
  status: PlanStatus
  createdAt?: string
  updatedAt?: string
}

export interface RegimeTaxResult {
  grossIncome: number
  standardDeduction: number
  totalExemptions: number
  totalDeductions: number
  taxableIncome: number
  taxBeforeRebate: number
  rebate87A: number
  taxAfterRebate: number
  cess: number
  totalTax: number
  monthlyTds: number
  effectiveRate: number
}

export interface TaxPlanWithResults extends TaxPlan {
  oldRegime: RegimeTaxResult
  newRegime: RegimeTaxResult
}

export interface TaxPlanSummary {
  id: string
  name: string
  financialYear: string
  status: PlanStatus
  grossIncome: number
  oldRegimeTax: number
  newRegimeTax: number
  createdAt: string
  updatedAt: string
}

// ── Defaults ─────────────────────────────────────────────────────────────────

export const EMPTY_EARNINGS: Earnings = {
  basic: 0, hra: 0, allowances: 0, perks: 0, otherIncome: 0,
}

export const EMPTY_EXEMPTIONS: Exemptions = {
  hraExemption: 0, ltaExemption: 0, otherExemptions: 0, professionalTax: 0,
}

export const EMPTY_DEDUCTIONS: Deductions = {
  section80C: 0, section80D: 0, section80E: 0,
  section80G: 0, nps80CCD1B: 0, otherDeductions: 0,
}
