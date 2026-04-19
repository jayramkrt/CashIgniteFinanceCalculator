import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ChevronDown, Trash2, Plus } from 'lucide-react'
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
  const pct = sliderPct(value, min, max)
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
        value={value}
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

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  prefix?: string
  suffix?: string
  error?: string
  onChange?: (v: number) => void
}

export function NumberInput({ label, prefix, suffix, error, onChange, className, ...rest }: NumberInputProps) {
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
  label: string
  value: Date | null
  onChange: (d: Date | null) => void
}

export function DateInput({ label, value, onChange }: DateInputProps) {
  return (
    <div>
      <label className="label">{label}</label>
      <DatePicker
        selected={value}
        onChange={onChange}
        dateFormat="d MMM yyyy"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        className="input-field w-full"
        wrapperClassName="w-full"
      />
    </div>
  )
}

// ── Payment mode select (reused across feature modules) ───────────────────────

export function PaymentModeSelect({
  value, onChange, label = 'Payment mode'
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

// ── Dynamic table grid (add/remove rows) ──────────────────────────────────────

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
        <div className="rounded-xl border border-ink-100 overflow-hidden mb-3">
          <table className="w-full text-sm">
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
                    <td key={String(col.key)} className="py-2 px-3">
                      {col.render(row, i, (partial) => onChange(i, partial))}
                    </td>
                  ))}
                  <td className="py-2 px-2 text-right">
                    <button
                      type="button"
                      onClick={() => onRemove(i)}
                      className="p-1.5 rounded-lg text-ink-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={13} />
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
        <Plus size={14} />
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
