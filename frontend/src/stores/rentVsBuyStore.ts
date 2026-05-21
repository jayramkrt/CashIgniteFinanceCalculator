import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { calculate, type RentVsBuyInputs, type RentVsBuyResult } from '@/utils/rentVsBuyCalc'

interface RentVsBuyStore {
  inputs: RentVsBuyInputs
  result: RentVsBuyResult | null
  setInput: (partial: Partial<RentVsBuyInputs>) => void
  calculate: () => void
  reset: () => void
}

const defaultInputs: RentVsBuyInputs = {
  homePrice: 8000000,
  downPaymentPct: 20,
  loanRate: 8.5,
  loanTenureYears: 20,
  monthlyRent: 25000,
  securityDepositMonths: 2,
  rentIncreaseRate: 5,
  propertyAppreciation: 6,
  investmentReturn: 10,
  maintenanceCostPct: 1,
  analysisYears: 20,
}

export const useRentVsBuyStore = create<RentVsBuyStore>()(
  devtools(
    (set, get) => ({
      inputs: defaultInputs,
      result: null,

      setInput: (partial) => set(s => ({ inputs: { ...s.inputs, ...partial }, result: null })),

      calculate: () => {
        const result = calculate(get().inputs)
        set({ result })
      },

      reset: () => set({ inputs: defaultInputs, result: null }),
    }),
    { name: 'rent-vs-buy-store' }
  )
)
