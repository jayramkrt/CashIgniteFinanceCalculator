export interface RentVsBuyInputs {
  homePrice: number
  downPaymentPct: number       // % of home price
  loanRate: number             // % p.a.
  loanTenureYears: number
  monthlyRent: number
  securityDepositMonths: number // months of rent as deposit (typically 2–10)
  rentIncreaseRate: number     // % p.a.
  propertyAppreciation: number // % p.a.
  investmentReturn: number     // % p.a. — what liquid capital earns if invested
  maintenanceCostPct: number   // % of home value p.a.
  analysisYears: number
}

export interface YearlyDataPoint {
  year: number
  buyNetWorth: number
  rentNetWorth: number
  propertyValue: number
  outstandingLoan: number
  investmentValue: number
  cumulativeRentPaid: number
  cumulativeEmiPaid: number
}

export interface RentVsBuyResult {
  emi: number
  downPayment: number
  loanAmount: number
  securityDeposit: number
  breakEvenYear: number | null
  finalBuyNetWorth: number
  finalRentNetWorth: number
  winner: 'buy' | 'rent' | 'tie'
  yearlyData: YearlyDataPoint[]
  totalRentPaid: number
  totalEmiPaid: number
  totalInterestPaid: number
  totalMaintenancePaid: number
  finalPropertyValue: number
  finalInvestmentValue: number
}

function calcEmi(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return principal / months
  const r = annualRate / 12 / 100
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

function remainingPrincipal(principal: number, annualRate: number, totalMonths: number, monthsPaid: number): number {
  if (annualRate === 0) return principal * (1 - monthsPaid / totalMonths)
  const r = annualRate / 12 / 100
  const emi = calcEmi(principal, annualRate, totalMonths)
  return emi * (1 - Math.pow(1 + r, -(totalMonths - monthsPaid))) / r
}

export function calculate(inputs: RentVsBuyInputs): RentVsBuyResult {
  const {
    homePrice, downPaymentPct, loanRate, loanTenureYears,
    monthlyRent, securityDepositMonths, rentIncreaseRate,
    propertyAppreciation, investmentReturn, maintenanceCostPct, analysisYears,
  } = inputs

  const downPayment      = homePrice * (downPaymentPct / 100)
  const loanAmount       = homePrice - downPayment
  const loanMonths       = loanTenureYears * 12
  const emi              = calcEmi(loanAmount, loanRate, loanMonths)
  const securityDeposit  = monthlyRent * securityDepositMonths

  const monthlyRentIncrease = rentIncreaseRate / 100 / 12
  const monthlyAppreciation = propertyAppreciation / 100 / 12
  const monthlyInvestReturn = investmentReturn / 100 / 12
  const monthlyMaintenance  = (maintenanceCostPct / 100) / 12

  let totalRentPaid        = 0
  let totalEmiPaid         = 0
  let totalMaintenancePaid = 0

  // Rent scenario: renter invests (downPayment - securityDeposit) — deposit earns nothing while locked
  let investmentValue = Math.max(0, downPayment - securityDeposit)
  let rentSavingsPool = 0

  let currentRent   = monthlyRent
  let propertyValue = homePrice

  const yearlyData: YearlyDataPoint[] = []
  let breakEvenYear: number | null = null

  for (let month = 1; month <= analysisYears * 12; month++) {
    // BUY path
    propertyValue *= (1 + monthlyAppreciation)
    const maintenance = propertyValue * monthlyMaintenance
    totalMaintenancePaid += maintenance
    totalEmiPaid += month <= loanMonths ? emi : 0

    // RENT path
    totalRentPaid += currentRent
    investmentValue *= (1 + monthlyInvestReturn)

    // Monthly savings: if buying costs more than renting, invest the difference in rent scenario
    const buyCost       = (month <= loanMonths ? emi : 0) + maintenance
    const monthlySaving = buyCost - currentRent
    if (monthlySaving > 0) {
      rentSavingsPool = (rentSavingsPool + monthlySaving) * (1 + monthlyInvestReturn)
    } else {
      rentSavingsPool *= (1 + monthlyInvestReturn)
    }

    currentRent *= (1 + monthlyRentIncrease)

    if (month % 12 === 0) {
      const year        = month / 12
      const outstanding = month <= loanMonths ? remainingPrincipal(loanAmount, loanRate, loanMonths, month) : 0
      const buyNetWorth = propertyValue - outstanding

      if (breakEvenYear === null && buyNetWorth > (investmentValue + rentSavingsPool)) {
        breakEvenYear = year
      }

      yearlyData.push({
        year,
        buyNetWorth,
        rentNetWorth: investmentValue + rentSavingsPool,
        propertyValue,
        outstandingLoan: outstanding,
        investmentValue: investmentValue + rentSavingsPool,
        cumulativeRentPaid: totalRentPaid,
        cumulativeEmiPaid: totalEmiPaid,
      })
    }
  }

  const finalBuyNetWorth  = yearlyData[yearlyData.length - 1]?.buyNetWorth  ?? 0
  // Include security deposit returned at end of analysis period
  const finalRentNetWorth = (yearlyData[yearlyData.length - 1]?.rentNetWorth ?? 0) + securityDeposit
  const totalInterestPaid = Math.max(0, totalEmiPaid - loanAmount)

  return {
    emi,
    downPayment,
    loanAmount,
    securityDeposit,
    breakEvenYear,
    finalBuyNetWorth,
    finalRentNetWorth,
    winner: finalBuyNetWorth > finalRentNetWorth + 10000 ? 'buy'
          : finalRentNetWorth > finalBuyNetWorth + 10000 ? 'rent'
          : 'tie',
    yearlyData,
    totalRentPaid,
    totalEmiPaid,
    totalInterestPaid,
    totalMaintenancePaid,
    finalPropertyValue: yearlyData[yearlyData.length - 1]?.propertyValue ?? homePrice,
    finalInvestmentValue: finalRentNetWorth,
  }
}
