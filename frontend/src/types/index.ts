// ─── Enums ────────────────────────────────────────────────────────────────────

export type PaymentMode =
  | 'ONE_TIME' | 'MONTHLY' | 'BI_MONTHLY' | 'QUARTERLY'
  | 'HALF_YEARLY' | 'THRICE_YEARLY' | 'YEARLY'

export type PrepaymentEffect   = 'REDUCE_TERM' | 'REDUCE_EMI'
export type InterestChangeEffect = 'CHANGE_LOAN_TERM' | 'REDUCE_EMI'
export type IsaTransactionType = 'DEPOSIT' | 'WITHDRAW'

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface PrepaymentDTO {
  paymentMode: PaymentMode
  effect: PrepaymentEffect
  amount: number
  startingMonth: number
}

export interface InterestChangeDTO {
  newAnnualRate: number
  startingMonth: number
  effect: InterestChangeEffect
}

export interface InterestSaverDTO {
  paymentMode: PaymentMode
  transactionType: IsaTransactionType
  amount: number
  startingMonth: number
}

export interface MoratoriumDTO {
  payInterestDuringMoratorium: boolean
  durationMonths: number
}

export interface FeeDTO {
  paymentMode: PaymentMode
  amount: number
  startingMonth: number
}

export interface LoanRequestDTO {
  loanAmount: number
  annualInterestRate: number
  tenureMonths: number
  firstEmiDate: string           // ISO date "yyyy-MM-dd"
  moratorium?: MoratoriumDTO
  prepayments?: PrepaymentDTO[]
  interestChanges?: InterestChangeDTO[]
  interestSaverEntries?: InterestSaverDTO[]
  fees?: FeeDTO[]
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface SummaryDTO {
  emiAmount: number
  totalPayment: number
  totalInterestPayable: number
  totalPrincipal: number
  totalPrepaymentAmount: number
  totalFees: number
  originalTenureMonths: number
  actualTenureMonths: number
  tenureReducedByMonths?: number
  loanStartDate: string
  loanEndDate: string
  effectiveAnnualRate: number
  interestSaverFinalBalance?: number
  interestSavedByInterestSaver?: number
  interestSavedByPrepayment?: number
}

export interface MonthlyRowDTO {
  monthNumber: number
  dueDate: string
  openingBalance: number
  emi: number
  principalComponent: number
  interestComponent: number
  prepayment: number
  fees: number
  closingBalance: number
  interestSaverBalance: number
  loanPaidPercentage: number
  moratoriumMonth: boolean
  rateChangedThisMonth: boolean
  appliedAnnualRate: number
}

export interface YearlyRowDTO {
  year: number
  yearNumber: number
  totalPrincipal: number
  totalInterest: number
  totalPrepayment: number
  totalFees: number
  totalPayment: number
  closingBalance: number
  loanPaidPercentage: number
}

export interface CalculationResultDTO {
  summary: SummaryDTO
  amortizationSchedule: MonthlyRowDTO[]
  yearlySchedule: YearlyRowDTO[]
}

export interface ScenarioSummaryDTO {
  id: number
  scenarioName: string
  loanAmount: number
  annualInterestRate: number
  tenureMonths: number
  createdAt: string
  summary: SummaryDTO
}

// ─── Form state (matches form fields, not raw DTOs) ───────────────────────────

export interface LoanFormValues {
  loanAmount: number
  annualInterestRate: number
  tenureMonths: number
  firstEmiDate: Date | null
}
