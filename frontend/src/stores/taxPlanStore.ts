import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { taxPlanApi, type CreatePlanRequest } from '@/api/taxPlanApi'
import type { TaxPlanSummary, TaxPlanWithResults } from '@/types/taxPlan'

interface TaxPlanStore {
  plans: TaxPlanSummary[]
  isLoading: boolean
  error: string | null
  selectedFY: string

  setSelectedFY: (fy: string) => void
  fetchPlans: (fy?: string) => Promise<void>
  createPlan: (req: CreatePlanRequest) => Promise<TaxPlanWithResults>
  updatePlan: (id: string, req: CreatePlanRequest) => Promise<TaxPlanWithResults>
  deletePlan: (id: string) => Promise<void>
}

export const useTaxPlanStore = create<TaxPlanStore>()(
  devtools((set, get) => ({
    plans: [],
    isLoading: false,
    error: null,
    selectedFY: '2025-26',

    setSelectedFY: (fy) => {
      set({ selectedFY: fy })
      get().fetchPlans(fy)
    },

    fetchPlans: async (fy) => {
      set({ isLoading: true, error: null })
      try {
        const plans = await taxPlanApi.list(fy)
        set({ plans, isLoading: false })
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load plans'
        set({ error: msg, isLoading: false })
      }
    },

    createPlan: async (req) => {
      const result = await taxPlanApi.create(req)
      // Refresh list after creation
      get().fetchPlans(get().selectedFY)
      return result
    },

    updatePlan: async (id, req) => {
      const result = await taxPlanApi.update(id, req)
      get().fetchPlans(get().selectedFY)
      return result
    },

    deletePlan: async (id) => {
      await taxPlanApi.delete(id)
      set((s) => ({ plans: s.plans.filter((p) => p.id !== id) }))
    },
  }), { name: 'tax-plan-store' })
)
