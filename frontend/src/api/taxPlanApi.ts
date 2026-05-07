import { calculateOldRegime, calculateNewRegime } from '@/utils/taxCalc'
import type { TaxPlan, TaxPlanSummary, TaxPlanWithResults, Earnings, Exemptions, Deductions } from '@/types/taxPlan'

export interface CreatePlanRequest {
  name: string
  financialYear: string
  earnings: Earnings
  exemptions: Exemptions
  deductions: Deductions
  status?: string
}

const STORAGE_KEY = 'clearhomeemi_tax_plans'

function load(): TaxPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TaxPlan[]) : []
  } catch {
    return []
  }
}

function persist(plans: TaxPlan[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
}

function withResults(plan: TaxPlan): TaxPlanWithResults {
  return {
    ...plan,
    oldRegime: calculateOldRegime(plan.earnings, plan.exemptions, plan.deductions, plan.financialYear),
    newRegime: calculateNewRegime(plan.earnings, plan.financialYear),
  }
}

function toSummary(plan: TaxPlan): TaxPlanSummary {
  const old  = calculateOldRegime(plan.earnings, plan.exemptions, plan.deductions, plan.financialYear)
  const newR = calculateNewRegime(plan.earnings, plan.financialYear)
  return {
    id: plan.id,
    name: plan.name,
    financialYear: plan.financialYear,
    status: plan.status ?? 'DRAFT',
    grossIncome: old.grossIncome,
    oldRegimeTax: old.totalTax,
    newRegimeTax: newR.totalTax,
    createdAt: plan.createdAt ?? new Date().toISOString(),
    updatedAt: plan.updatedAt ?? new Date().toISOString(),
  }
}

export const taxPlanApi = {
  list: (fy?: string): Promise<TaxPlanSummary[]> => {
    const plans = load()
    const filtered = fy ? plans.filter((p) => p.financialYear === fy) : plans
    return Promise.resolve(filtered.map(toSummary))
  },

  getById: (id: string): Promise<TaxPlanWithResults> => {
    const plan = load().find((p) => p.id === id)
    if (!plan) return Promise.reject(new Error('Plan not found'))
    return Promise.resolve(withResults(plan))
  },

  create: (req: CreatePlanRequest): Promise<TaxPlanWithResults> => {
    const now  = new Date().toISOString()
    const plan: TaxPlan = {
      id: crypto.randomUUID(),
      name: req.name,
      financialYear: req.financialYear,
      earnings: req.earnings,
      exemptions: req.exemptions,
      deductions: req.deductions,
      status: (req.status as TaxPlan['status']) ?? 'DRAFT',
      createdAt: now,
      updatedAt: now,
    }
    const plans = load()
    plans.push(plan)
    persist(plans)
    return Promise.resolve(withResults(plan))
  },

  update: (id: string, req: CreatePlanRequest): Promise<TaxPlanWithResults> => {
    const plans = load()
    const idx   = plans.findIndex((p) => p.id === id)
    if (idx === -1) return Promise.reject(new Error('Plan not found'))
    const updated: TaxPlan = {
      ...plans[idx],
      name: req.name,
      financialYear: req.financialYear,
      earnings: req.earnings,
      exemptions: req.exemptions,
      deductions: req.deductions,
      status: (req.status as TaxPlan['status']) ?? plans[idx].status,
      updatedAt: new Date().toISOString(),
    }
    plans[idx] = updated
    persist(plans)
    return Promise.resolve(withResults(updated))
  },

  delete: (id: string): Promise<void> => {
    persist(load().filter((p) => p.id !== id))
    return Promise.resolve()
  },
}
