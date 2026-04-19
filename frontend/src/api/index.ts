import axios from 'axios'
import type {
  LoanRequestDTO,
  CalculationResultDTO,
  ScenarioSummaryDTO,
} from '@/types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Response interceptor — normalise BigDecimal strings to numbers ────────────
api.interceptors.response.use((res) => {
  res.data = parseBigDecimals(res.data)
  return res
})

function parseBigDecimals(obj: unknown): unknown {
  if (typeof obj === 'string' && /^-?\d+(\.\d+)?$/.test(obj)) return parseFloat(obj)
  if (Array.isArray(obj)) return obj.map(parseBigDecimals)
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, parseBigDecimals(v)])
    )
  }
  return obj
}

// ── Loan API ──────────────────────────────────────────────────────────────────

export const loanApi = {
  calculate: async (request: LoanRequestDTO): Promise<CalculationResultDTO> => {
    const { data } = await api.post<CalculationResultDTO>('/loan/calculate', request)
    return data
  },

  getEmi: async (amount: number, rate: number, tenureMonths: number): Promise<number> => {
    const { data } = await api.get<{ value: number }>('/loan/emi', {
      params: { amount, rate, tenureMonths },
    })
    return data.value
  },
}

// ── Scenario API ──────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export const scenarioApi = {
  save: async (request: LoanRequestDTO, name: string): Promise<void> => {
    await api.post('/scenarios', request, { params: { name } })
  },

  list: async (page = 0, size = 10): Promise<PageResponse<ScenarioSummaryDTO>> => {
    const { data } = await api.get<PageResponse<ScenarioSummaryDTO>>('/scenarios', {
      params: { page, size },
    })
    return data
  },

  recalculate: async (id: number): Promise<CalculationResultDTO> => {
    const { data } = await api.get<CalculationResultDTO>(`/scenarios/${id}/calculate`)
    return data
  },
}
