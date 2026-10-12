import { calculateOldRegime, calculateNewRegime } from '@/utils/taxCalc'
import type { TaxPlan, TaxPlanSummary, TaxPlanWithResults, Earnings, Exemptions, Deductions } from '@/types/taxPlan'

export interface CreatePlanRequest {
  name: string
  financialYear: string
  earnings: Earnings
  exemptions: Exemptions
  deductions: Deductions
  status?: string
}

const DB_NAME = 'clearhomeemi'
const DB_VERSION = 1
const STORE_NAME = 'taxPlans'
const LEGACY_STORAGE_KEY = 'clearhomeemi_tax_plans'

let databasePromise: Promise<IDBDatabase> | undefined
let legacyMigrationPromise: Promise<void> | undefined

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'))
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'))
  })
}

function openDatabase(): Promise<IDBDatabase> {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      request.onupgradeneeded = () => {
        const database = request.result
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('financialYear', 'financialYear', { unique: false })
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('Unable to open browser storage'))
    })
  }
  return databasePromise
}

async function migrateLegacyLocalStorage(database: IDBDatabase): Promise<void> {
  if (!legacyMigrationPromise) {
    legacyMigrationPromise = (async () => {
      const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
      if (!raw) return
      try {
        const plans = JSON.parse(raw) as TaxPlan[]
        const transaction = database.transaction(STORE_NAME, 'readwrite')
        plans.forEach((plan) => transaction.objectStore(STORE_NAME).put(plan))
        await transactionDone(transaction)
        localStorage.removeItem(LEGACY_STORAGE_KEY)
      } catch {
        // Leave malformed legacy data untouched; IndexedDB remains usable.
      }
    })()
  }
  await legacyMigrationPromise
}

async function db(): Promise<IDBDatabase> {
  const database = await openDatabase()
  await migrateLegacyLocalStorage(database)
  return database
}

async function loadAll(): Promise<TaxPlan[]> {
  const database = await db()
  const transaction = database.transaction(STORE_NAME, 'readonly')
  return requestResult(transaction.objectStore(STORE_NAME).getAll()) as Promise<TaxPlan[]>
}

async function loadById(id: string): Promise<TaxPlan | undefined> {
  const database = await db()
  const transaction = database.transaction(STORE_NAME, 'readonly')
  return requestResult(transaction.objectStore(STORE_NAME).get(id)) as Promise<TaxPlan | undefined>
}

async function put(plan: TaxPlan): Promise<void> {
  const database = await db()
  const transaction = database.transaction(STORE_NAME, 'readwrite')
  transaction.objectStore(STORE_NAME).put(plan)
  await transactionDone(transaction)
}

function withResults(plan: TaxPlan): TaxPlanWithResults {
  return {
    ...plan,
    oldRegime: calculateOldRegime(plan.earnings, plan.exemptions, plan.deductions, plan.financialYear),
    newRegime: calculateNewRegime(plan.earnings, plan.financialYear),
  }
}

function toSummary(plan: TaxPlan): TaxPlanSummary {
  const old = calculateOldRegime(plan.earnings, plan.exemptions, plan.deductions, plan.financialYear)
  const newRegime = calculateNewRegime(plan.earnings, plan.financialYear)
  return {
    id: plan.id,
    name: plan.name,
    financialYear: plan.financialYear,
    status: plan.status ?? 'DRAFT',
    grossIncome: old.grossIncome,
    oldRegimeTax: old.totalTax,
    newRegimeTax: newRegime.totalTax,
    createdAt: plan.createdAt ?? new Date().toISOString(),
    updatedAt: plan.updatedAt ?? new Date().toISOString(),
  }
}

export const taxPlanApi = {
  list: async (financialYear?: string): Promise<TaxPlanSummary[]> => {
    const plans = await loadAll()
    return plans
      .filter((plan) => !financialYear || plan.financialYear === financialYear)
      .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
      .map(toSummary)
  },

  getById: async (id: string): Promise<TaxPlanWithResults> => {
    const plan = await loadById(id)
    if (!plan) throw new Error('Plan not found')
    return withResults(plan)
  },

  create: async (request: CreatePlanRequest): Promise<TaxPlanWithResults> => {
    const now = new Date().toISOString()
    const plan: TaxPlan = {
      id: crypto.randomUUID(),
      name: request.name,
      financialYear: request.financialYear,
      earnings: request.earnings,
      exemptions: request.exemptions,
      deductions: request.deductions,
      status: (request.status as TaxPlan['status']) ?? 'DRAFT',
      createdAt: now,
      updatedAt: now,
    }
    await put(plan)
    return withResults(plan)
  },

  update: async (id: string, request: CreatePlanRequest): Promise<TaxPlanWithResults> => {
    const existing = await loadById(id)
    if (!existing) throw new Error('Plan not found')
    const updated: TaxPlan = {
      ...existing,
      name: request.name,
      financialYear: request.financialYear,
      earnings: request.earnings,
      exemptions: request.exemptions,
      deductions: request.deductions,
      status: (request.status as TaxPlan['status']) ?? existing.status,
      updatedAt: new Date().toISOString(),
    }
    await put(updated)
    return withResults(updated)
  },

  delete: async (id: string): Promise<void> => {
    const database = await db()
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).delete(id)
    await transactionDone(transaction)
  },
}
