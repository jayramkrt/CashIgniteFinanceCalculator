export interface TaxSlab {
  min: number
  max: number | null // null = unlimited
  rate: number       // 0.05 = 5%
}

export interface RegimeConfig {
  slabs: TaxSlab[]
  standardDeduction: number
  section87ALimit: number  // taxable income threshold (after std deduction) for full rebate
  section87AMaxRebate: number // max rebate amount (0 = no limit / full rebate)
}

export interface FYConfig {
  label: string
  oldRegime: RegimeConfig
  newRegime: RegimeConfig
}

export type FYKey = 'FY_2025_26' | 'FY_2024_25' | 'FY_2023_24'

export const TAX_DATA: Record<FYKey, FYConfig> = {
  FY_2025_26: {
    label: 'FY 2025–26',
    oldRegime: {
      slabs: [
        { min: 0,         max: 250000,  rate: 0 },
        { min: 250000,    max: 500000,  rate: 0.05 },
        { min: 500000,    max: 1000000, rate: 0.20 },
        { min: 1000000,   max: null,    rate: 0.30 },
      ],
      standardDeduction: 50000,
      section87ALimit: 500000,
      section87AMaxRebate: 12500,
    },
    newRegime: {
      slabs: [
        { min: 0,         max: 400000,  rate: 0 },
        { min: 400000,    max: 800000,  rate: 0.05 },
        { min: 800000,    max: 1200000, rate: 0.10 },
        { min: 1200000,   max: 1600000, rate: 0.15 },
        { min: 1600000,   max: 2000000, rate: 0.20 },
        { min: 2000000,   max: 2400000, rate: 0.25 },
        { min: 2400000,   max: null,    rate: 0.30 },
      ],
      standardDeduction: 75000,
      section87ALimit: 1200000,  // full rebate if taxable income ≤ ₹12L
      section87AMaxRebate: 0,    // 0 = full tax is waived (no cap)
    },
  },

  FY_2024_25: {
    label: 'FY 2024–25',
    oldRegime: {
      slabs: [
        { min: 0,         max: 250000,  rate: 0 },
        { min: 250000,    max: 500000,  rate: 0.05 },
        { min: 500000,    max: 1000000, rate: 0.20 },
        { min: 1000000,   max: null,    rate: 0.30 },
      ],
      standardDeduction: 50000,
      section87ALimit: 500000,
      section87AMaxRebate: 12500,
    },
    newRegime: {
      slabs: [
        { min: 0,         max: 300000,  rate: 0 },
        { min: 300000,    max: 700000,  rate: 0.05 },
        { min: 700000,    max: 1000000, rate: 0.10 },
        { min: 1000000,   max: 1200000, rate: 0.15 },
        { min: 1200000,   max: 1500000, rate: 0.20 },
        { min: 1500000,   max: null,    rate: 0.30 },
      ],
      standardDeduction: 75000,
      section87ALimit: 700000,
      section87AMaxRebate: 25000,
    },
  },

  FY_2023_24: {
    label: 'FY 2023–24',
    oldRegime: {
      slabs: [
        { min: 0,         max: 250000,  rate: 0 },
        { min: 250000,    max: 500000,  rate: 0.05 },
        { min: 500000,    max: 1000000, rate: 0.20 },
        { min: 1000000,   max: null,    rate: 0.30 },
      ],
      standardDeduction: 50000,
      section87ALimit: 500000,
      section87AMaxRebate: 12500,
    },
    newRegime: {
      slabs: [
        { min: 0,         max: 300000,  rate: 0 },
        { min: 300000,    max: 600000,  rate: 0.05 },
        { min: 600000,    max: 900000,  rate: 0.10 },
        { min: 900000,    max: 1200000, rate: 0.15 },
        { min: 1200000,   max: 1500000, rate: 0.20 },
        { min: 1500000,   max: null,    rate: 0.30 },
      ],
      standardDeduction: 50000,
      section87ALimit: 700000,
      section87AMaxRebate: 25000,
    },
  },
}

export const FY_OPTIONS: { value: FYKey; label: string }[] = [
  { value: 'FY_2025_26', label: 'FY 2025–26' },
  { value: 'FY_2024_25', label: 'FY 2024–25' },
  { value: 'FY_2023_24', label: 'FY 2023–24' },
]
