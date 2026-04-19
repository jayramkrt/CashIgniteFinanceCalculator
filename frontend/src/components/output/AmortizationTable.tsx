import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoanStore } from '@/stores/loanStore'
import { formatRupees, formatPct, formatDate, cn } from '@/utils'
import type { YearlyRowDTO, MonthlyRowDTO } from '@/types'

// ── Progress bar ──────────────────────────────────────────────────────────────
function PaidBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-ink-100 overflow-hidden flex-shrink-0">
        <div
          className="h-full rounded-full bg-sage-400 transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-xs font-mono tabular-nums text-ink-500">{formatPct(pct, 1)}</span>
    </div>
  )
}

// ── Month sub-rows ────────────────────────────────────────────────────────────
function MonthRows({ rows }: { rows: MonthlyRowDTO[] }) {
  return (
    <AnimatePresence>
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <td colSpan={7} className="p-0">
          <table className="w-full text-xs border-b border-ink-100">
            <thead>
              <tr className="bg-sage-50/60">
                <th className="text-left py-2 pl-10 pr-3 text-ink-400 font-medium w-32">Month</th>
                <th className="text-right py-2 px-3 text-ink-400 font-medium">Principal</th>
                <th className="text-right py-2 px-3 text-ink-400 font-medium">Interest</th>
                <th className="text-right py-2 px-3 text-ink-400 font-medium">EMI</th>
                {rows.some(r => r.prepayment > 0) && (
                  <th className="text-right py-2 px-3 text-ink-400 font-medium">Prepayment</th>
                )}
                <th className="text-right py-2 px-3 text-ink-400 font-medium">Balance</th>
                <th className="py-2 px-3 text-ink-400 font-medium w-32">Paid</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.monthNumber}
                  className={cn(
                    'border-b border-ink-50 last:border-0',
                    row.moratoriumMonth  && 'bg-amber-50/30',
                    row.rateChangedThisMonth && 'bg-sage-50/30',
                  )}
                >
                  <td className="py-2 pl-10 pr-3 font-mono text-ink-600">
                    {formatDate(row.dueDate)}
                    {row.moratoriumMonth && (
                      <span className="ml-1.5 badge badge-amber py-0 px-1.5 text-[10px]">M</span>
                    )}
                    {row.rateChangedThisMonth && (
                      <span className="ml-1.5 badge badge-green py-0 px-1.5 text-[10px]">R</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums font-mono text-ink-700">
                    {formatRupees(row.principalComponent)}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums font-mono text-amber-600">
                    {formatRupees(row.interestComponent)}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums font-mono text-ink-800 font-medium">
                    {formatRupees(row.emi)}
                  </td>
                  {rows.some(r => r.prepayment > 0) && (
                    <td className="py-2 px-3 text-right tabular-nums font-mono text-sage-600">
                      {row.prepayment > 0 ? formatRupees(row.prepayment) : '—'}
                    </td>
                  )}
                  <td className="py-2 px-3 text-right tabular-nums font-mono text-ink-600">
                    {formatRupees(row.closingBalance)}
                  </td>
                  <td className="py-2 px-3">
                    <PaidBar pct={row.loanPaidPercentage} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </td>
      </motion.tr>
    </AnimatePresence>
  )
}

// ── Year row ──────────────────────────────────────────────────────────────────
function YearRow({
  row, monthRows, isExpanded, onToggle
}: {
  row: YearlyRowDTO
  monthRows: MonthlyRowDTO[]
  isExpanded: boolean
  onToggle: () => void
}) {
  const hasPrepayment = row.totalPrepayment > 0

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-ink-50 transition-colors border-b border-ink-100"
        onClick={onToggle}
      >
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-2">
            <ChevronRight
              size={14}
              className={cn(
                'text-ink-300 transition-transform duration-200 flex-shrink-0',
                isExpanded && 'rotate-90'
              )}
            />
            <span className="font-display font-600 text-ink-800 text-sm">
              Year {row.yearNumber}
            </span>
            <span className="text-xs text-ink-400">{row.year}</span>
          </div>
        </td>
        <td className="py-3.5 px-4 text-right tabular-nums font-mono text-sm text-ink-700">
          {formatRupees(row.totalPrincipal)}
        </td>
        <td className="py-3.5 px-4 text-right tabular-nums font-mono text-sm text-amber-600">
          {formatRupees(row.totalInterest)}
        </td>
        <td className="py-3.5 px-4 text-right tabular-nums font-mono text-sm text-ink-800 font-medium">
          {formatRupees(row.totalPayment)}
        </td>
        {hasPrepayment && (
          <td className="py-3.5 px-4 text-right tabular-nums font-mono text-sm text-sage-600">
            {row.totalPrepayment > 0 ? formatRupees(row.totalPrepayment) : '—'}
          </td>
        )}
        <td className="py-3.5 px-4 text-right tabular-nums font-mono text-sm text-ink-600">
          {formatRupees(row.closingBalance)}
        </td>
        <td className="py-3.5 px-4">
          <PaidBar pct={row.loanPaidPercentage} />
        </td>
      </tr>
      {isExpanded && <MonthRows rows={monthRows} />}
    </>
  )
}

// ── Main amortization table ───────────────────────────────────────────────────

export default function AmortizationTable() {
  const { result } = useLoanStore()
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set())

  if (!result) return null

  const { yearlySchedule, amortizationSchedule } = result
  const hasPrepayment = yearlySchedule.some(r => r.totalPrepayment > 0)

  const toggleYear = (yearNumber: number) => {
    setExpandedYears((prev) => {
      const next = new Set(prev)
      next.has(yearNumber) ? next.delete(yearNumber) : next.add(yearNumber)
      return next
    })
  }

  const expandAll  = () => setExpandedYears(new Set(yearlySchedule.map(r => r.yearNumber)))
  const collapseAll = () => setExpandedYears(new Set())

  const getMonthsForYear = (calendarYear: number): MonthlyRowDTO[] =>
    amortizationSchedule.filter(m => new Date(m.dueDate).getFullYear() === calendarYear)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-600 text-ink-800">
          Amortization schedule
          <span className="ml-2 text-xs font-body font-400 text-ink-400">
            ({amortizationSchedule.length} months)
          </span>
        </h3>
        <div className="flex gap-2">
          <button type="button" onClick={expandAll}  className="btn-ghost text-xs">Expand all</button>
          <button type="button" onClick={collapseAll} className="btn-ghost text-xs">Collapse</button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-ink-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-ink-50 border-b border-ink-100">
                <th className="text-left py-3 px-4 text-xs font-medium text-ink-400 uppercase tracking-wide">Year</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-ink-400 uppercase tracking-wide">Principal</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-ink-400 uppercase tracking-wide">Interest</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-ink-400 uppercase tracking-wide">Total paid</th>
                {hasPrepayment && (
                  <th className="text-right py-3 px-4 text-xs font-medium text-ink-400 uppercase tracking-wide">Prepayment</th>
                )}
                <th className="text-right py-3 px-4 text-xs font-medium text-ink-400 uppercase tracking-wide">Balance</th>
                <th className="py-3 px-4 text-xs font-medium text-ink-400 uppercase tracking-wide w-36">Paid %</th>
              </tr>
            </thead>
            <tbody>
              {yearlySchedule.map((row) => (
                <YearRow
                  key={row.yearNumber}
                  row={row}
                  monthRows={getMonthsForYear(row.year)}
                  isExpanded={expandedYears.has(row.yearNumber)}
                  onToggle={() => toggleYear(row.yearNumber)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-ink-400">
        <div className="flex items-center gap-1.5">
          <span className="badge badge-amber py-0 px-1.5 text-[10px]">M</span>
          <span>Moratorium month</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="badge badge-green py-0 px-1.5 text-[10px]">R</span>
          <span>Rate changed</span>
        </div>
      </div>
    </div>
  )
}
