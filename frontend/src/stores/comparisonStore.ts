import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import dayjs from 'dayjs'
import type {
  CalculationResultDTO,
  LoanRequestDTO,
  PrepaymentDTO,
  InterestChangeDTO,
  MoratoriumDTO,
  FeeDTO,
} from '@/types'
import { loanApi } from '@/api'

// ── Scenario shape ────────────────────────────────────────────────────────────

export interface ScenarioInput {
  id: string
  label: string
  // Basic
  loanAmount: number
  annualInterestRate: number
  tenureMonths: number
  firstEmiDate: Date
  // Advanced features
  prepaymentEnabled: boolean
  prepayments: PrepaymentDTO[]
  variableRateEnabled: boolean
  variableRates: InterestChangeDTO[]
  moratoriumEnabled: boolean
  moratorium: MoratoriumDTO
  feesEnabled: boolean
  fees: FeeDTO[]
}

// ── Store ─────────────────────────────────────────────────────────────────────

interface ComparisonStore {
  scenarios: ScenarioInput[]
  results: (CalculationResultDTO | null)[]
  isLoading: boolean
  error: string | null
  addScenario: () => void
  removeScenario: (id: string) => void
  updateScenario: (id: string, partial: Partial<ScenarioInput>) => void
  compare: () => Promise<void>
  reset: () => void
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const defaultDate = dayjs().add(1, 'month').startOf('month').toDate()

const defaultFeatures = {
  prepaymentEnabled: false,
  prepayments: [],
  variableRateEnabled: false,
  variableRates: [],
  moratoriumEnabled: false,
  moratorium: { durationMonths: 3, payInterestDuringMoratorium: true },
  feesEnabled: false,
  fees: [],
}

const defaultScenarios: ScenarioInput[] = [
  { id: '1', label: 'Loan A', loanAmount: 5000000, annualInterestRate: 8.5,  tenureMonths: 240, firstEmiDate: defaultDate, ...defaultFeatures },
  { id: '2', label: 'Loan B', loanAmount: 5000000, annualInterestRate: 8.75, tenureMonths: 240, firstEmiDate: defaultDate, ...defaultFeatures },
]

// ── Request builder ───────────────────────────────────────────────────────────

function toRequest(s: ScenarioInput): LoanRequestDTO {
  return {
    loanAmount: s.loanAmount,
    annualInterestRate: s.annualInterestRate,
    tenureMonths: s.tenureMonths,
    firstEmiDate: dayjs(s.firstEmiDate).format('YYYY-MM-DD') as unknown as string,
    moratorium:           s.moratoriumEnabled   ? s.moratorium   : undefined,
    prepayments:          s.prepaymentEnabled   ? s.prepayments  : [],
    interestChanges:      s.variableRateEnabled ? s.variableRates : [],
    interestSaverEntries: [],
    fees:                 s.feesEnabled         ? s.fees         : [],
  }
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useComparisonStore = create<ComparisonStore>()(
  devtools(
    (set, get) => ({
      scenarios: defaultScenarios,
      results: [null, null],
      isLoading: false,
      error: null,

      addScenario: () => {
        const { scenarios } = get()
        if (scenarios.length >= 3) return
        const last = scenarios[scenarios.length - 1]
        const next: ScenarioInput = {
          ...last,
          id: Date.now().toString(),
          label: `Loan ${String.fromCharCode(65 + scenarios.length)}`,
        }
        set({ scenarios: [...scenarios, next], results: [...get().results, null] })
      },

      removeScenario: (id) => {
        const { scenarios, results } = get()
        if (scenarios.length <= 2) return
        const idx = scenarios.findIndex(s => s.id === id)
        set({
          scenarios: scenarios.filter(s => s.id !== id),
          results: results.filter((_, i) => i !== idx),
        })
      },

      updateScenario: (id, partial) => {
        set(s => ({
          scenarios: s.scenarios.map(sc => sc.id === id ? { ...sc, ...partial } : sc),
          results: s.results.map(() => null),
        }))
      },

      compare: async () => {
        const { scenarios } = get()
        set({ isLoading: true, error: null, results: scenarios.map(() => null) })
        try {
          const results = await Promise.all(scenarios.map(s => loanApi.calculate(toRequest(s))))
          set({ results, isLoading: false })
        } catch (e: unknown) {
          set({ error: (e as Error).message ?? 'Comparison failed', isLoading: false })
        }
      },

      reset: () => set({ scenarios: defaultScenarios, results: [null, null], isLoading: false, error: null }),
    }),
    { name: 'comparison-store' }
  )
)
