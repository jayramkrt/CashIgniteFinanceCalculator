import dayjs from 'dayjs'
import type { LoanRequestDTO } from '@/types'

// We import the store type lazily via parameter rather than at module level
// to avoid the circular dependency: utils → loanStore → utils
type StoreSnapshot = {
  loan: {
    loanAmount: number
    annualInterestRate: number
    tenureMonths: number
    firstEmiDate: Date
  }
  prepayment:   { enabled: boolean; entries: LoanRequestDTO['prepayments'] }
  variableRate: { enabled: boolean; entries: LoanRequestDTO['interestChanges'] }
  isa:          { enabled: boolean; entries: LoanRequestDTO['interestSaverEntries'] }
  moratorium:   { enabled: boolean; config:  LoanRequestDTO['moratorium'] }
  fees:         { enabled: boolean; entries: LoanRequestDTO['fees'] }
}

function toIsoDate(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD')
}

export function buildRequest(state: StoreSnapshot): LoanRequestDTO {
  const { loan, prepayment, variableRate, isa, moratorium, fees } = state
  return {
    loanAmount:          loan.loanAmount,
    annualInterestRate:  loan.annualInterestRate,
    tenureMonths:        loan.tenureMonths,
    firstEmiDate:        toIsoDate(loan.firstEmiDate),
    ...(moratorium.enabled   && moratorium.config   ? { moratorium: moratorium.config }           : {}),
    ...(prepayment.enabled   && prepayment.entries?.length   ? { prepayments: prepayment.entries }        : {}),
    ...(variableRate.enabled && variableRate.entries?.length ? { interestChanges: variableRate.entries }  : {}),
    ...(isa.enabled          && isa.entries?.length          ? { interestSaverEntries: isa.entries }      : {}),
    ...(fees.enabled         && fees.entries?.length         ? { fees: fees.entries }                     : {}),
  }
}
