import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'

// ── Tailwind class merge ──────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Number formatting ─────────────────────────────────────────────────────────

/** Format as Indian Rupees — ₹12,34,567 */
export function formatRupees(value: number, compact = false): string {
  if (compact) {
    if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)} Cr`
    if (value >= 100_000)    return `₹${(value / 100_000).toFixed(2)} L`
    if (value >= 1_000)      return `₹${(value / 1_000).toFixed(1)} K`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/** Format percentage with given decimal places */
export function formatPct(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`
}

/** Format months as "X yrs Y mos" */
export function formatTenure(months: number): string {
  const yrs = Math.floor(months / 12)
  const mos = months % 12
  if (mos === 0) return `${yrs} yr${yrs !== 1 ? 's' : ''}`
  if (yrs === 0) return `${mos} mo${mos !== 1 ? 's' : ''}`
  return `${yrs} yr${yrs !== 1 ? 's' : ''} ${mos} mo`
}

// ── Date helpers ──────────────────────────────────────────────────────────────

export function toIsoDate(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD')
}

export function formatDate(iso: string): string {
  return dayjs(iso).format('D MMM YYYY')
}

// ── Slider CSS custom property for gradient fill ──────────────────────────────
export function sliderPct(value: number, min: number, max: number): string {
  return `${((value - min) / (max - min)) * 100}%`
}

// ── Payment mode options ──────────────────────────────────────────────────────
export const PAYMENT_MODE_OPTIONS = [
  { value: 'ONE_TIME',      label: 'One-time' },
  { value: 'MONTHLY',       label: 'Monthly' },
  { value: 'BI_MONTHLY',    label: 'Bi-monthly' },
  { value: 'QUARTERLY',     label: 'Quarterly' },
  { value: 'HALF_YEARLY',   label: 'Half-yearly' },
  { value: 'THRICE_YEARLY', label: 'Thrice yearly' },
  { value: 'YEARLY',        label: 'Yearly' },
] as const
