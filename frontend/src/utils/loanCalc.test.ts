import { describe, expect, it } from 'vitest'
import type { LoanRequestDTO } from '@/types'
import { calculateEmi, calculateLoan } from './loanCalc'

const baseRequest = (): LoanRequestDTO => ({
  loanAmount: 5_000_000,
  annualInterestRate: 8.5,
  tenureMonths: 240,
  firstEmiDate: '2024-02-01',
})

describe('client-side loan calculation engine', () => {
  it('calculates the standard EMI using half-up decimal rounding', () => {
    expect(calculateEmi(5_000_000, 8.5, 240)).toBe(43_391.16)
    expect(calculateEmi(100_000, 0, 10)).toBe(10_000)
  })

  it('fully repays a basic loan over its requested tenure', () => {
    const result = calculateLoan(baseRequest())
    expect(result.amortizationSchedule).toHaveLength(240)
    expect(result.amortizationSchedule[239].closingBalance).toBe(0)
    expect(result.amortizationSchedule.reduce((sum, row) => sum + row.principalComponent, 0))
      .toBeCloseTo(5_000_000, 2)
  })

  it('reduces tenure and interest after a lump-sum prepayment', () => {
    const baseline = calculateLoan(baseRequest())
    const result = calculateLoan({
      ...baseRequest(),
      prepayments: [{
        paymentMode: 'ONE_TIME', effect: 'REDUCE_TERM', amount: 500_000, startingMonth: 12,
      }],
    })
    expect(result.summary.actualTenureMonths).toBeLessThan(baseline.summary.actualTenureMonths)
    expect(result.summary.totalInterestPayable).toBeLessThan(baseline.summary.totalInterestPayable)
    expect(result.amortizationSchedule[11].prepayment).toBe(500_000)
  })

  it('recalculates EMI after a reduce-EMI prepayment', () => {
    const result = calculateLoan({
      ...baseRequest(),
      prepayments: [{
        paymentMode: 'MONTHLY', effect: 'REDUCE_EMI', amount: 5_000, startingMonth: 6,
      }],
    })
    expect(result.amortizationSchedule[6].emi).toBeLessThan(result.amortizationSchedule[0].emi)
  })

  it('applies variable rates in the configured month', () => {
    const result = calculateLoan({
      ...baseRequest(),
      interestChanges: [{ newAnnualRate: 9, startingMonth: 25, effect: 'REDUCE_EMI' }],
    })
    expect(result.amortizationSchedule[23].appliedAnnualRate).toBe(8.5)
    expect(result.amortizationSchedule[24].appliedAnnualRate).toBe(9)
    expect(result.amortizationSchedule[24].rateChangedThisMonth).toBe(true)
  })

  it('supports paid-interest and capitalised moratoriums', () => {
    const paid = calculateLoan({
      ...baseRequest(), moratorium: { durationMonths: 3, payInterestDuringMoratorium: true },
    })
    const capitalised = calculateLoan({
      ...baseRequest(), moratorium: { durationMonths: 3, payInterestDuringMoratorium: false },
    })
    expect(paid.amortizationSchedule.slice(0, 3).every((row) => row.moratoriumMonth)).toBe(true)
    expect(capitalised.summary.totalInterestPayable).toBeGreaterThan(paid.summary.totalInterestPayable)
  })

  it('reduces interest with an interest-saver balance', () => {
    const baseline = calculateLoan(baseRequest())
    const result = calculateLoan({
      ...baseRequest(),
      interestSaverEntries: [{
        paymentMode: 'MONTHLY', transactionType: 'DEPOSIT', amount: 10_000, startingMonth: 1,
      }],
    })
    expect(result.summary.totalInterestPayable).toBeLessThan(baseline.summary.totalInterestPayable)
    expect(result.summary.interestSavedByInterestSaver).toBeGreaterThan(0)
  })

  it('includes recurring fees and produces consistent yearly rollups', () => {
    const result = calculateLoan({
      ...baseRequest(), fees: [{ paymentMode: 'YEARLY', amount: 5_000, startingMonth: 12 }],
    })
    expect(result.summary.totalFees).toBeGreaterThan(0)
    const monthly = result.amortizationSchedule.reduce(
      (sum, row) => sum + row.principalComponent + row.interestComponent + row.prepayment + row.fees, 0,
    )
    const yearly = result.yearlySchedule.reduce((sum, row) => sum + row.totalPayment, 0)
    expect(yearly).toBeCloseTo(monthly, 2)
  })

  it('rejects invalid client-side inputs', () => {
    expect(() => calculateLoan({ ...baseRequest(), tenureMonths: 0 })).toThrow(/Tenure/)
    expect(() => calculateLoan({ ...baseRequest(), annualInterestRate: Number.NaN })).toThrow(/finite/)
  })
})
