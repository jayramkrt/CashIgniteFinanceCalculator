import dayjs from 'dayjs'
import Decimal, { type Numeric } from 'decimal.js-light'
import type {
  CalculationResultDTO,
  FeeDTO,
  InterestChangeDTO,
  InterestSaverDTO,
  LoanRequestDTO,
  MonthlyRowDTO,
  PaymentMode,
  PrepaymentDTO,
  YearlyRowDTO,
} from '@/types'

// Match the former Java engine's DECIMAL128 precision and HALF_UP rounding.
Decimal.set({ precision: 34, rounding: Decimal.ROUND_HALF_UP })

type D = Decimal

interface Events {
  prepayments: Map<number, PrepaymentDTO[]>
  interestChanges: Map<number, InterestChangeDTO>
  isaEntries: Map<number, InterestSaverDTO[]>
  fees: Map<number, FeeDTO[]>
}

const ZERO = new Decimal(0)
const HUNDRED = new Decimal(100)
const TWELVE = new Decimal(12)

const money = (value: Numeric): D => new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
const rate = (value: Numeric): D => new Decimal(value).toDecimalPlaces(10, Decimal.ROUND_HALF_UP)
const asNumber = (value: D): number => value.toNumber()
const maxZero = (value: D): D => value.lessThan(0) ? ZERO : value

function assertFinite(name: string, value: number): void {
  if (!Number.isFinite(value)) throw new Error(`${name} must be a finite number`)
}

export function validateLoanRequest(request: LoanRequestDTO): void {
  assertFinite('Loan amount', request.loanAmount)
  assertFinite('Interest rate', request.annualInterestRate)
  assertFinite('Tenure', request.tenureMonths)

  if (request.loanAmount < 100_000 || request.loanAmount > 100_000_000) {
    throw new Error('Loan amount must be between ₹1 lakh and ₹10 crore')
  }
  if (request.annualInterestRate < 0 || request.annualInterestRate > 50) {
    throw new Error('Interest rate must be between 0% and 50%')
  }
  if (!Number.isInteger(request.tenureMonths) || request.tenureMonths < 1 || request.tenureMonths > 480) {
    throw new Error('Tenure must be between 1 and 480 whole months')
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(request.firstEmiDate) || !dayjs(request.firstEmiDate).isValid()) {
    throw new Error('First EMI date must be a valid date')
  }

  const validateAmountAndMonth = (name: string, entry: { amount: number; startingMonth: number }) => {
    assertFinite(`${name} amount`, entry.amount)
    if (entry.amount <= 0) throw new Error(`${name} amount must be greater than zero`)
    if (!Number.isInteger(entry.startingMonth) || entry.startingMonth < 1) {
      throw new Error(`${name} starting month must be a positive whole number`)
    }
  }

  request.prepayments?.forEach((entry) => validateAmountAndMonth('Prepayment', entry))
  request.interestSaverEntries?.forEach((entry) => validateAmountAndMonth('Interest saver entry', entry))
  request.fees?.forEach((entry) => validateAmountAndMonth('Fee', entry))
  request.interestChanges?.forEach((entry) => {
    assertFinite('Changed interest rate', entry.newAnnualRate)
    if (entry.newAnnualRate < 0 || entry.newAnnualRate > 50) {
      throw new Error('Changed interest rate must be between 0% and 50%')
    }
    if (!Number.isInteger(entry.startingMonth) || entry.startingMonth < 1) {
      throw new Error('Interest change starting month must be a positive whole number')
    }
  })
  if (request.moratorium &&
      (!Number.isInteger(request.moratorium.durationMonths) || request.moratorium.durationMonths < 1)) {
    throw new Error('Moratorium duration must be a positive whole number')
  }
}

function intervalFor(mode: PaymentMode): number {
  switch (mode) {
    case 'ONE_TIME': return 0
    case 'MONTHLY': return 1
    case 'BI_MONTHLY': return 2
    case 'QUARTERLY': return 3
    case 'THRICE_YEARLY': return 4
    case 'HALF_YEARLY': return 6
    case 'YEARLY': return 12
  }
}

function expandedMonths(mode: PaymentMode, startMonth: number, maxMonth: number): number[] {
  const interval = intervalFor(mode)
  if (interval === 0) return [startMonth]
  const months: number[] = []
  for (let month = startMonth; month <= maxMonth; month += interval) months.push(month)
  return months
}

function addToMap<T>(map: Map<number, T[]>, month: number, value: T): void {
  const existing = map.get(month)
  if (existing) existing.push(value)
  else map.set(month, [value])
}

function sortEvents(request: LoanRequestDTO): Events {
  const events: Events = {
    prepayments: new Map(),
    interestChanges: new Map(),
    isaEntries: new Map(),
    fees: new Map(),
  }
  const maxMonth = request.tenureMonths + (request.moratorium?.durationMonths ?? 0) + 120

  request.prepayments?.forEach((entry) => {
    expandedMonths(entry.paymentMode, entry.startingMonth, maxMonth)
      .forEach((month) => addToMap(events.prepayments, month, entry))
  })
  request.interestChanges
    ?.slice()
    .sort((a, b) => a.startingMonth - b.startingMonth)
    .forEach((entry) => events.interestChanges.set(entry.startingMonth, entry))
  request.interestSaverEntries?.forEach((entry) => {
    expandedMonths(entry.paymentMode, entry.startingMonth, maxMonth)
      .forEach((month) => addToMap(events.isaEntries, month, entry))
  })
  request.fees?.forEach((entry) => {
    expandedMonths(entry.paymentMode, entry.startingMonth, maxMonth)
      .forEach((month) => addToMap(events.fees, month, entry))
  })
  return events
}

function monthlyRate(annualRate: Numeric): D {
  return rate(rate(new Decimal(annualRate).div(HUNDRED)).div(TWELVE))
}

export function calculateEmi(principalValue: number, annualRateValue: number, tenureMonths: number): number {
  const principal = new Decimal(principalValue)
  const annualRate = new Decimal(annualRateValue)
  if (!Number.isInteger(tenureMonths) || tenureMonths <= 0) throw new Error('Tenure must be positive')
  if (annualRate.isZero()) return asNumber(money(principal.div(tenureMonths)))

  const monthly = monthlyRate(annualRate)
  const power = monthly.plus(1).pow(tenureMonths)
  return asNumber(money(principal.mul(monthly).mul(power).div(power.minus(1))))
}

function calculateEmiDecimal(principal: D, annualRate: D, tenureMonths: number): D {
  return new Decimal(calculateEmi(principal.toNumber(), annualRate.toNumber(), tenureMonths))
}

function monthlyInterest(principal: D, annualRate: D): D {
  return money(rate(principal.mul(annualRate).div(HUNDRED)).div(TWELVE))
}

function paidPercentage(original: D, remaining: D): D {
  if (original.isZero()) return ZERO
  return money(original.minus(remaining).div(original).toDecimalPlaces(10).mul(HUNDRED))
}

function estimateRemainingMonths(principal: D, emi: D, annualRate: D): number {
  if (emi.isZero()) return 0
  const monthly = monthlyRate(annualRate)
  if (monthly.isZero()) return principal.div(emi).toDecimalPlaces(0, Decimal.ROUND_CEIL).toNumber()
  const value = 1 - principal.toNumber() * monthly.toNumber() / emi.toNumber()
  if (value <= 0) return 1
  return Math.ceil(-Math.log(value) / Math.log(1 + monthly.toNumber()))
}

function buildYearlySchedule(monthly: MonthlyRowDTO[]): YearlyRowDTO[] {
  const groups = new Map<number, MonthlyRowDTO[]>()
  monthly.forEach((row) => {
    const year = Number(row.dueDate.slice(0, 4))
    const rows = groups.get(year)
    if (rows) rows.push(row)
    else groups.set(year, [row])
  })

  let yearNumber = 1
  return Array.from(groups, ([year, rows]) => {
    const sum = (pick: (row: MonthlyRowDTO) => number) =>
      asNumber(rows.reduce((total, row) => total.plus(pick(row)), ZERO))
    const totalPrincipal = sum((row) => row.principalComponent)
    const totalInterest = sum((row) => row.interestComponent)
    const totalPrepayment = sum((row) => row.prepayment)
    const totalFees = sum((row) => row.fees)
    const last = rows[rows.length - 1]
    return {
      year,
      yearNumber: yearNumber++,
      totalPrincipal,
      totalInterest,
      totalPrepayment,
      totalFees,
      totalPayment: asNumber(new Decimal(totalPrincipal).plus(totalInterest).plus(totalPrepayment).plus(totalFees)),
      closingBalance: last.closingBalance,
      loanPaidPercentage: last.loanPaidPercentage,
    }
  })
}

function approximateEffectiveRate(totalInterest: D, principal: D, actualTenureMonths: number): number {
  if (principal.isZero() || actualTenureMonths === 0) return 0
  return asNumber(money(
    rate(rate(totalInterest.div(principal)).div(actualTenureMonths)).mul(12).mul(HUNDRED),
  ))
}

export function calculateLoan(request: LoanRequestDTO): CalculationResultDTO {
  validateLoanRequest(request)
  const events = sortEvents(request)
  const principal = money(request.loanAmount)
  const annualRate = new Decimal(request.annualInterestRate)
  const tenureMonths = request.tenureMonths
  const moratoriumMonths = request.moratorium?.durationMonths ?? 0
  const payInterestDuringMoratorium = request.moratorium?.payInterestDuringMoratorium ?? false
  const termCanChange = request.interestChanges?.some((entry) => entry.effect === 'CHANGE_LOAN_TERM') ?? false

  let emi = calculateEmiDecimal(principal, annualRate, tenureMonths)
  let remainingPrincipal = principal
  let isaBalance = ZERO
  let currentAnnualRate = annualRate
  let totalInterestPaid = ZERO
  let totalPrepaymentPaid = ZERO
  let totalFeesPaid = ZERO
  let interestSavedByPrepayment = ZERO
  let actualTenure = 0
  let month = 1
  const maxMonths = tenureMonths + moratoriumMonths + 120
  const schedule: MonthlyRowDTO[] = []

  while (remainingPrincipal.greaterThan(0) && month <= maxMonths) {
    const dueDate = dayjs(request.firstEmiDate).add(month - 1, 'month').format('YYYY-MM-DD')
    const rateChange = events.interestChanges.get(month)
    if (rateChange) {
      currentAnnualRate = new Decimal(rateChange.newAnnualRate)
      if (rateChange.effect === 'REDUCE_EMI') {
        const remainingMonths = tenureMonths + moratoriumMonths - month + 1
        if (remainingMonths > 0) emi = calculateEmiDecimal(remainingPrincipal, currentAnnualRate, remainingMonths)
      }
    }

    if (month <= moratoriumMonths) {
      const interest = monthlyInterest(remainingPrincipal, currentAnnualRate)
      let payment = ZERO
      if (payInterestDuringMoratorium) {
        payment = interest
        totalInterestPaid = totalInterestPaid.plus(interest)
      } else {
        remainingPrincipal = money(remainingPrincipal.plus(interest))
        if (month === moratoriumMonths) {
          emi = calculateEmiDecimal(remainingPrincipal, currentAnnualRate, tenureMonths)
        }
      }
      schedule.push({
        monthNumber: month,
        dueDate,
        openingBalance: asNumber(remainingPrincipal),
        emi: asNumber(payment),
        principalComponent: 0,
        interestComponent: asNumber(interest),
        prepayment: 0,
        fees: 0,
        closingBalance: asNumber(remainingPrincipal),
        interestSaverBalance: asNumber(isaBalance),
        loanPaidPercentage: asNumber(paidPercentage(principal, remainingPrincipal)),
        moratoriumMonth: true,
        rateChangedThisMonth: Boolean(rateChange),
        appliedAnnualRate: asNumber(currentAnnualRate),
      })
      month++
      actualTenure++
      continue
    }

    const openingBalance = remainingPrincipal
    const effectivePrincipal = maxZero(remainingPrincipal.minus(isaBalance))
    const interestThisMonth = monthlyInterest(effectivePrincipal, currentAnnualRate)

    events.isaEntries.get(month)?.forEach((entry) => {
      isaBalance = entry.transactionType === 'DEPOSIT'
        ? isaBalance.plus(entry.amount)
        : maxZero(isaBalance.minus(entry.amount))
    })

    let effectiveEmi = emi
    let principalComponent: D
    const isFinalScheduledPayment = !termCanChange && month === tenureMonths + moratoriumMonths
    if (isFinalScheduledPayment || remainingPrincipal.plus(interestThisMonth).lessThanOrEqualTo(emi)) {
      effectiveEmi = money(remainingPrincipal.plus(interestThisMonth))
      principalComponent = remainingPrincipal
    } else {
      principalComponent = money(effectiveEmi.minus(interestThisMonth))
    }
    remainingPrincipal = money(maxZero(remainingPrincipal.minus(principalComponent)))
    totalInterestPaid = totalInterestPaid.plus(interestThisMonth)

    let prepaymentThisMonth = ZERO
    if (remainingPrincipal.greaterThan(0)) {
      events.prepayments.get(month)?.forEach((entry) => {
        const requestedAmount = new Decimal(entry.amount)
        const amount = requestedAmount.lessThan(remainingPrincipal) ? requestedAmount : remainingPrincipal
        remainingPrincipal = money(maxZero(remainingPrincipal.minus(amount)))
        prepaymentThisMonth = prepaymentThisMonth.plus(amount)
        totalPrepaymentPaid = totalPrepaymentPaid.plus(amount)
        const remainingMonths = estimateRemainingMonths(remainingPrincipal, emi, currentAnnualRate)
        interestSavedByPrepayment = interestSavedByPrepayment.plus(
          money(monthlyInterest(amount, currentAnnualRate).mul(remainingMonths)),
        )
        if (entry.effect === 'REDUCE_EMI' && remainingPrincipal.greaterThan(0)) {
          const remainingTerm = tenureMonths + moratoriumMonths - month
          if (remainingTerm > 0) emi = calculateEmiDecimal(remainingPrincipal, currentAnnualRate, remainingTerm)
        }
      })
    }

    let feesThisMonth = ZERO
    events.fees.get(month)?.forEach((entry) => {
      feesThisMonth = feesThisMonth.plus(entry.amount)
      totalFeesPaid = totalFeesPaid.plus(entry.amount)
    })

    schedule.push({
      monthNumber: month,
      dueDate,
      openingBalance: asNumber(openingBalance),
      emi: asNumber(effectiveEmi),
      principalComponent: asNumber(principalComponent),
      interestComponent: asNumber(interestThisMonth),
      prepayment: asNumber(prepaymentThisMonth),
      fees: asNumber(feesThisMonth),
      closingBalance: asNumber(remainingPrincipal),
      interestSaverBalance: asNumber(isaBalance),
      loanPaidPercentage: asNumber(paidPercentage(principal, remainingPrincipal)),
      moratoriumMonth: false,
      rateChangedThisMonth: Boolean(rateChange),
      appliedAnnualRate: asNumber(currentAnnualRate),
    })
    actualTenure++
    month++
  }

  const repaymentMonths = actualTenure - moratoriumMonths
  const tenureReduced = tenureMonths - repaymentMonths
  const firstRepayment = schedule.find((row) => !row.moratoriumMonth)
  const isaSaving = schedule.reduce(
    (saving, row) => saving.plus(monthlyInterest(new Decimal(row.interestSaverBalance), annualRate)),
    ZERO,
  )
  const totalPayment = principal.plus(totalInterestPaid).plus(totalFeesPaid)

  return {
    summary: {
      emiAmount: firstRepayment?.emi ?? asNumber(emi),
      totalPayment: asNumber(totalPayment),
      totalInterestPayable: asNumber(totalInterestPaid),
      totalPrincipal: asNumber(principal),
      totalPrepaymentAmount: asNumber(totalPrepaymentPaid),
      totalFees: asNumber(totalFeesPaid),
      originalTenureMonths: tenureMonths,
      actualTenureMonths: repaymentMonths,
      tenureReducedByMonths: tenureReduced > 0 ? tenureReduced : undefined,
      loanStartDate: request.firstEmiDate,
      loanEndDate: schedule.length > 0 ? schedule[schedule.length - 1].dueDate : request.firstEmiDate,
      effectiveAnnualRate: approximateEffectiveRate(totalInterestPaid, principal, repaymentMonths),
      interestSaverFinalBalance: isaBalance.greaterThan(0) ? asNumber(isaBalance) : undefined,
      interestSavedByInterestSaver: isaSaving.greaterThan(0) ? asNumber(money(isaSaving)) : undefined,
      interestSavedByPrepayment: totalPrepaymentPaid.greaterThan(0)
        ? asNumber(interestSavedByPrepayment)
        : undefined,
    },
    amortizationSchedule: schedule,
    yearlySchedule: buildYearlySchedule(schedule),
  }
}
