import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import dayjs from 'dayjs'
import type {
  CalculationResultDTO,
  PrepaymentDTO,
  InterestChangeDTO,
  InterestSaverDTO,
  MoratoriumDTO,
  FeeDTO,
} from '@/types'

// ── Core loan state ───────────────────────────────────────────────────────────

interface BaseLoanState {
  loanAmount: number
  annualInterestRate: number
  tenureMonths: number
  firstEmiDate: Date
}

// ── Feature module states ─────────────────────────────────────────────────────

interface PrepaymentState {
  enabled: boolean
  entries: PrepaymentDTO[]
}

interface VariableRateState {
  enabled: boolean
  entries: InterestChangeDTO[]
}

interface IsaState {
  enabled: boolean
  entries: InterestSaverDTO[]
}

interface MoratoriumState {
  enabled: boolean
  config: MoratoriumDTO
}

interface FeesState {
  enabled: boolean
  entries: FeeDTO[]
}

// ── Full store shape ──────────────────────────────────────────────────────────

interface LoanStore {
  // Base loan
  loan: BaseLoanState
  setLoan: (partial: Partial<BaseLoanState>) => void

  // Features
  prepayment:   PrepaymentState
  variableRate: VariableRateState
  isa:          IsaState
  moratorium:   MoratoriumState
  fees:         FeesState

  // Feature toggles
  togglePrepayment:   () => void
  toggleVariableRate: () => void
  toggleIsa:          () => void
  toggleMoratorium:   () => void
  toggleFees:         () => void

  // Feature entry mutations
  setPrepaymentEntries:   (entries: PrepaymentDTO[])     => void
  setVariableRateEntries: (entries: InterestChangeDTO[]) => void
  setIsaEntries:          (entries: InterestSaverDTO[])  => void
  setMoratoriumConfig:    (config: MoratoriumDTO)        => void
  setFeeEntries:          (entries: FeeDTO[])            => void

  // Calculation result
  result:    CalculationResultDTO | null
  isLoading: boolean
  error:     string | null
  setResult:    (result: CalculationResultDTO) => void
  setLoading:   (loading: boolean) => void
  setError:     (error: string | null) => void

  // Reset
  resetAll: () => void
}

const defaultLoan: BaseLoanState = {
  loanAmount: 5000000,
  annualInterestRate: 8.5,
  tenureMonths: 240,
  firstEmiDate: dayjs().add(1, 'month').startOf('month').toDate(),
}

export const useLoanStore = create<LoanStore>()(
  devtools((set) => ({
    // ── Base loan ─────────────────────────────────────────────────────────
    loan: defaultLoan,
    setLoan: (partial) => set((s) => ({ loan: { ...s.loan, ...partial } })),

    // ── Features ──────────────────────────────────────────────────────────
    prepayment:   { enabled: false, entries: [] },
    variableRate: { enabled: false, entries: [] },
    isa:          { enabled: false, entries: [] },
    moratorium:   { enabled: false, config: { durationMonths: 3, payInterestDuringMoratorium: true } },
    fees:         { enabled: false, entries: [] },

    // ── Toggles ───────────────────────────────────────────────────────────
    togglePrepayment:   () => set((s) => ({ prepayment:   { ...s.prepayment,   enabled: !s.prepayment.enabled   } })),
    toggleVariableRate: () => set((s) => ({ variableRate: { ...s.variableRate, enabled: !s.variableRate.enabled } })),
    toggleIsa:          () => set((s) => ({ isa:          { ...s.isa,          enabled: !s.isa.enabled          } })),
    toggleMoratorium:   () => set((s) => ({ moratorium:   { ...s.moratorium,   enabled: !s.moratorium.enabled   } })),
    toggleFees:         () => set((s) => ({ fees:         { ...s.fees,         enabled: !s.fees.enabled         } })),

    // ── Entry mutations ───────────────────────────────────────────────────
    setPrepaymentEntries:   (entries) => set((s) => ({ prepayment:   { ...s.prepayment,   entries } })),
    setVariableRateEntries: (entries) => set((s) => ({ variableRate: { ...s.variableRate, entries } })),
    setIsaEntries:          (entries) => set((s) => ({ isa:          { ...s.isa,          entries } })),
    setMoratoriumConfig:    (config)  => set((s) => ({ moratorium:   { ...s.moratorium,   config  } })),
    setFeeEntries:          (entries) => set((s) => ({ fees:         { ...s.fees,         entries } })),

    // ── Result ────────────────────────────────────────────────────────────
    result: null, isLoading: false, error: null,
    setResult:  (result)  => set({ result, error: null }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError:   (error)   => set({ error, isLoading: false }),

    // ── Reset ─────────────────────────────────────────────────────────────
    resetAll: () => set({
      loan:         defaultLoan,
      prepayment:   { enabled: false, entries: [] },
      variableRate: { enabled: false, entries: [] },
      isa:          { enabled: false, entries: [] },
      moratorium:   { enabled: false, config: { durationMonths: 3, payInterestDuringMoratorium: true } },
      fees:         { enabled: false, entries: [] },
      result:       null,
      error:        null,
    }),
  }), { name: 'loan-store' })
)
