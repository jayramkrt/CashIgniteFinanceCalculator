import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
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

const defaultFeatures = {
  prepayment:   { enabled: false, entries: [] },
  variableRate: { enabled: false, entries: [] },
  isa:          { enabled: false, entries: [] },
  moratorium:   { enabled: false, config: { durationMonths: 3, payInterestDuringMoratorium: true } },
  fees:         { enabled: false, entries: [] },
}

export const useLoanStore = create<LoanStore>()(
  devtools(
    persist(
      (set) => ({
        // ── Base loan ───────────────────────────────────────────────────────
        loan: defaultLoan,
        setLoan: (partial) => set((s) => ({ loan: { ...s.loan, ...partial } })),

        // ── Features ────────────────────────────────────────────────────────
        ...defaultFeatures,

        // ── Toggles ─────────────────────────────────────────────────────────
        togglePrepayment:   () => set((s) => ({ prepayment:   { ...s.prepayment,   enabled: !s.prepayment.enabled   } })),
        toggleVariableRate: () => set((s) => ({ variableRate: { ...s.variableRate, enabled: !s.variableRate.enabled } })),
        toggleIsa:          () => set((s) => ({ isa:          { ...s.isa,          enabled: !s.isa.enabled          } })),
        toggleMoratorium:   () => set((s) => ({ moratorium:   { ...s.moratorium,   enabled: !s.moratorium.enabled   } })),
        toggleFees:         () => set((s) => ({ fees:         { ...s.fees,         enabled: !s.fees.enabled         } })),

        // ── Entry mutations ──────────────────────────────────────────────────
        setPrepaymentEntries:   (entries) => set((s) => ({ prepayment:   { ...s.prepayment,   entries } })),
        setVariableRateEntries: (entries) => set((s) => ({ variableRate: { ...s.variableRate, entries } })),
        setIsaEntries:          (entries) => set((s) => ({ isa:          { ...s.isa,          entries } })),
        setMoratoriumConfig:    (config)  => set((s) => ({ moratorium:   { ...s.moratorium,   config  } })),
        setFeeEntries:          (entries) => set((s) => ({ fees:         { ...s.fees,         entries } })),

        // ── Result ───────────────────────────────────────────────────────────
        result: null, isLoading: false, error: null,
        setResult:  (result)  => set({ result, error: null }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError:   (error)   => set({ error, isLoading: false }),

        // ── Reset ────────────────────────────────────────────────────────────
        resetAll: () => set({
          loan: defaultLoan,
          ...defaultFeatures,
          result: null,
          error:  null,
        }),
      }),
      {
        name: 'clearhomeemi-loan',
        // Only persist data — not functions or transient UI state
        partialize: (s) => ({
          loan:        s.loan,
          prepayment:  s.prepayment,
          variableRate: s.variableRate,
          isa:         s.isa,
          moratorium:  s.moratorium,
          fees:        s.fees,
          result:      s.result,
        }),
        // Revive and validate persisted values — clamp any corrupted/out-of-range data
        merge: (persisted, current) => {
          const p = persisted as Partial<LoanStore> | null
          if (!p) return current

          const clamp = (v: unknown, lo: number, hi: number, fallback: number): number => {
            const n = Number(v)
            return isNaN(n) || !isFinite(n) ? fallback : Math.min(Math.max(n, lo), hi)
          }

          const reviveDate = (raw: unknown, fallback: Date): Date => {
            const d = new Date(raw as string)
            const y = d.getFullYear()
            const now = new Date().getFullYear()
            return isNaN(d.getTime()) || y < now - 20 || y > now + 3 ? fallback : d
          }

          const pl = p.loan as (BaseLoanState & { firstEmiDate: unknown }) | undefined
          return {
            ...current,
            ...p,
            loan: {
              ...current.loan,
              ...pl,
              loanAmount:         clamp(pl?.loanAmount,         100_000, 100_000_000, current.loan.loanAmount),
              annualInterestRate: clamp(pl?.annualInterestRate, 0.1,     50,          current.loan.annualInterestRate),
              tenureMonths:       clamp(pl?.tenureMonths,       1,       480,         current.loan.tenureMonths),
              firstEmiDate:       reviveDate(pl?.firstEmiDate,  current.loan.firstEmiDate),
            },
          }
        },
      }
    ),
    { name: 'loan-store' }
  )
)
