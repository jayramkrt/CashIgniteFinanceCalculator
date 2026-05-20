import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import dayjs from 'dayjs'
import { ChevronDown, X, Info, Hash, CalendarDays } from 'lucide-react'
import { cn, sliderPct, PAYMENT_MODE_OPTIONS } from '@/utils'
import type { PaymentMode } from '@/types'

// ── Toggle Switch ─────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean
  onChange: () => void
  label: string
  description?: string
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center justify-between w-full text-left group"
    >
      <div>
        <p className="text-sm font-medium text-ink-800 group-hover:text-ink-900">{label}</p>
        {description && (
          <p className="text-xs text-ink-400 mt-0.5">{description}</p>
        )}
      </div>
      <div
        className={cn(
          'switch-track ml-4 flex-shrink-0',
          checked ? 'bg-sage-500' : 'bg-ink-200'
        )}
      >
        <span
          className={cn(
            'switch-thumb',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </div>
    </button>
  )
}

// ── Slider with label and value display ──────────────────────────────────────

interface SliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: (v: number) => string
  hint?: string
}

export function SliderField({
  label, value, min, max, step = 1, onChange, format, hint
}: SliderFieldProps) {
  const sliderVal = Math.min(Math.max(value, min), max)
  const pct = sliderPct(sliderVal, min, max)
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="label mb-0">{label}</label>
        <span className="text-sm font-mono font-medium text-ink-800 tabular-nums">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={sliderVal}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider w-full"
        style={{ '--pct': pct } as React.CSSProperties}
      />
      {hint && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-ink-300">{format ? format(min) : min}</span>
          <span className="text-xs text-ink-300">{hint}</span>
          <span className="text-xs text-ink-300">{format ? format(max) : max}</span>
        </div>
      )}
    </div>
  )
}

// ── Number input ──────────────────────────────────────────────────────────────

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur'> {
  label?: string
  prefix?: string
  suffix?: string
  error?: string
  onChange?: (v: number) => void
  onBlur?: React.FocusEventHandler<HTMLInputElement>
}

export function NumberInput({ label, prefix, suffix, error, onChange, onBlur, className, ...rest }: NumberInputProps) {
  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    if (onChange) {
      const v = Number(e.target.value)
      if (!isNaN(v) && isFinite(v)) {
        const lo = rest.min !== undefined ? Number(rest.min) : -Infinity
        const hi = rest.max !== undefined ? Number(rest.max) : Infinity
        const clamped = Math.min(Math.max(v, lo), hi)
        if (clamped !== v) onChange(clamped)
      }
    }
    onBlur?.(e)
  }

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400 font-mono pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          className={cn(
            'input-field',
            prefix && 'pl-8',
            suffix && 'pr-8',
            error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100',
            className
          )}
          onChange={(e) => onChange?.(Number(e.target.value))}
          onBlur={handleBlur}
          {...rest}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-400 font-mono pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  )
}

// ── Select / Dropdown ─────────────────────────────────────────────────────────

interface SelectProps {
  label?: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
}

export function Select({ label, value, onChange, options, className }: SelectProps) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn('select-field', className)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
        />
      </div>
    </div>
  )
}

// ── Date Picker input ─────────────────────────────────────────────────────────

interface DateInputProps {
  label?: string
  value: Date | null
  onChange: (d: Date | null) => void
  minDate?: Date
  maxDate?: Date
}

export function DateInput({ label, value, onChange, minDate, maxDate }: DateInputProps) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <DatePicker
        selected={value}
        onChange={onChange}
        dateFormat="d MMM yyyy"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        className="input-field w-full"
        wrapperClassName="w-full"
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  )
}

// ── Month or date picker input ────────────────────────────────────────────────

interface MonthOrDateInputProps {
  label: string
  value: number
  onChange: (v: number) => void
  loanStartDate: Date | null
  min?: number
  max?: number
}

export function MonthOrDateInput({
  label, value, onChange, loanStartDate, min = 1, max = 480
}: MonthOrDateInputProps) {
  const [mode, setMode] = useState<'month' | 'date'>('month')

  const selectedDate = loanStartDate
    ? dayjs(loanStartDate).add(value - 1, 'month').toDate()
    : null

  const handleDateChange = (date: Date | null) => {
    if (!date || !loanStartDate) return
    const months = dayjs(date).diff(dayjs(loanStartDate), 'month') + 1
    onChange(Math.max(min, Math.min(max, months)))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="label mb-0">{label}</label>
        <div className="flex rounded-lg overflow-hidden border border-ink-100 text-[10px]">
          <button
            type="button"
            onClick={() => setMode('month')}
            className={cn(
              'flex items-center gap-1 px-2 py-1 font-medium transition-colors',
              mode === 'month' ? 'bg-ink-900 text-white' : 'text-ink-400 hover:text-ink-700'
            )}
          >
            <Hash size={9} />
            Month
          </button>
          <button
            type="button"
            onClick={() => setMode('date')}
            className={cn(
              'flex items-center gap-1 px-2 py-1 font-medium transition-colors border-l border-ink-100',
              mode === 'date' ? 'bg-ink-900 text-white' : 'text-ink-400 hover:text-ink-700'
            )}
          >
            <CalendarDays size={9} />
            Date
          </button>
        </div>
      </div>

      {mode === 'month' ? (
        <NumberInput
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          suffix="mo"
          placeholder="12"
        />
      ) : (
        <>
          <DateInput
            value={selectedDate}
            onChange={handleDateChange}
            minDate={loanStartDate ?? undefined}
          />
          {loanStartDate && (
            <p className="mt-1 text-xs text-ink-400">= Month {value} of your loan</p>
          )}
        </>
      )}
    </div>
  )
}

// ── Payment mode select ───────────────────────────────────────────────────────

export function PaymentModeSelect({
  value, onChange, label
}: {
  value: PaymentMode
  onChange: (v: PaymentMode) => void
  label?: string
}) {
  return (
    <Select
      label={label}
      value={value}
      onChange={(v) => onChange(v as PaymentMode)}
      options={PAYMENT_MODE_OPTIONS as unknown as { value: string; label: string }[]}
    />
  )
}

// ── Modal (bottom sheet on mobile, centered dialog on desktop) ────────────────

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  icon?: React.ReactNode
  hint?: string
  children: React.ReactNode
  onSave: () => void
  saveLabel?: string
}

export function Modal({ open, onClose, title, description, icon, hint, children, onSave, saveLabel = 'Save' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className={cn(
        'relative w-full sm:max-w-lg bg-white shadow-card-lg animate-slide-up',
        'rounded-t-3xl sm:rounded-2xl',
        'max-h-[82vh] sm:max-h-[90vh] flex flex-col'
      )}>
        {/* Handle bar — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-9 h-1 rounded-full bg-ink-200" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-4 sm:pt-5 pb-4 border-b border-ink-100 flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {icon && (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-sage-50 flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-ink-900 text-[15px] sm:text-base leading-snug">{title}</h3>
              {description && (
                <p className="text-xs sm:text-sm text-ink-400 mt-0.5 leading-snug">{description}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-300 hover:text-ink-600 hover:bg-ink-50 transition-colors flex-shrink-0 mt-0.5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-compact flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {children}
          </div>
          {hint && (
            <div className="mt-3 sm:mt-4 flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-sage-50 border border-sage-100">
              <Info size={13} className="text-sage-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-sage-700 leading-relaxed">{hint}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 sm:gap-3 px-5 sm:px-6 py-3 sm:py-4 border-t border-ink-100 flex-shrink-0">
          <button type="button" onClick={onClose}
            className="btn-secondary flex-1 justify-center py-2.5 text-sm">
            Cancel
          </button>
          <button type="button" onClick={onSave}
            className="btn-accent flex-1 justify-center py-2.5 text-sm font-semibold">
            {saveLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Entry card list (replaces TableGrid) ──────────────────────────────────────

interface EntryCardListProps<T> {
  entries: T[]
  addLabel: string
  emptyMessage: string
  onAdd: () => void
  onEdit: (index: number) => void
  onRemove: (index: number) => void
  renderSummary: (entry: T) => React.ReactNode
}

export function EntryCardList<T>({
  entries, addLabel, emptyMessage, onAdd, onEdit, onRemove, renderSummary
}: EntryCardListProps<T>) {
  return (
    <div className="space-y-2">
      {entries.length === 0 ? (
        <p className="text-sm text-ink-400 italic py-1">{emptyMessage}</p>
      ) : (
        entries.map((entry, i) => (
          <div
            key={i}
            onClick={() => onEdit(i)}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-ink-50 border border-ink-100 cursor-pointer hover:border-sage-300 hover:bg-sage-50/40 transition-all group"
          >
            <div className="flex-1 min-w-0">
              {renderSummary(entry)}
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(i) }}
              className="p-1.5 rounded-lg text-ink-300 hover:text-rose-500 hover:bg-rose-50 transition-colors flex-shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        ))
      )}
      <button
        type="button"
        onClick={onAdd}
        className="btn-ghost text-sage-600 hover:bg-sage-50 mt-1"
      >
        <span className="text-lg leading-none">+</span>
        {addLabel}
      </button>
    </div>
  )
}

// ── Collapsible module section wrapper ────────────────────────────────────────

interface ModuleSectionProps {
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
  children: React.ReactNode
}

export function ModuleSection({ title, description, enabled, onToggle, children }: ModuleSectionProps) {
  return (
    <div className="module-section">
      <div className="module-header">
        <Toggle
          checked={enabled}
          onChange={onToggle}
          label={title}
          description={description}
        />
      </div>
      {enabled && (
        <div className="px-5 pb-5 border-t border-ink-100 pt-4 animate-slide-up">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Legacy TableGrid (kept for any other uses) ────────────────────────────────

interface Column<T> {
  key: keyof T | string
  header: string
  render: (row: T, rowIndex: number, onChange: (partial: Partial<T>) => void) => React.ReactNode
  width?: string
}

interface TableGridProps<T extends object> {
  rows: T[]
  columns: Column<T>[]
  onAdd: () => void
  onRemove: (index: number) => void
  onChange: (index: number, partial: Partial<T>) => void
  addLabel?: string
  emptyMessage?: string
}

export function TableGrid<T extends object>({
  rows, columns, onAdd, onRemove, onChange, addLabel = 'Add row', emptyMessage = 'No entries yet'
}: TableGridProps<T>) {
  return (
    <div>
      {rows.length === 0 ? (
        <p className="text-sm text-ink-400 italic py-2">{emptyMessage}</p>
      ) : (
        <div className="rounded-xl border border-ink-100 overflow-x-auto mb-3">
          <table className="w-full min-w-max text-sm">
            <thead>
              <tr className="bg-ink-50">
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className="text-left py-2.5 px-3 text-xs font-medium text-ink-400 uppercase tracking-wide border-b border-ink-100"
                    style={{ width: col.width }}
                  >
                    {col.header}
                  </th>
                ))}
                <th className="w-10 border-b border-ink-100" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-ink-50 last:border-0 hover:bg-sage-50/40">
                  {columns.map((col) => (
                    <td key={String(col.key)} className="py-2 px-2 align-middle">
                      {col.render(row, i, (partial) => onChange(i, partial))}
                    </td>
                  ))}
                  <td className="py-2 px-2 text-right">
                    <button
                      type="button"
                      onClick={() => onRemove(i)}
                      className="p-1.5 rounded-lg text-ink-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        type="button"
        onClick={onAdd}
        className="btn-ghost text-sage-600 hover:bg-sage-50"
      >
        <span className="text-lg leading-none">+</span>
        {addLabel}
      </button>
    </div>
  )
}
