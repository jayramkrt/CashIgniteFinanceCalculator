import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit2, BadgeCheck, Trash2 } from 'lucide-react'
import { taxPlanApi } from '@/api/taxPlanApi'
import { useTaxPlanStore } from '@/stores/taxPlanStore'
import { formatRupees, formatPct, cn } from '@/utils'
import type { TaxPlanWithResults, RegimeTaxResult } from '@/types/taxPlan'

// ── Breakdown row ─────────────────────────────────────────────────────────────

function BRow({
  label, old: o, new: n, accent, separator, indent,
}: {
  label: string
  old: string
  new: string
  accent?: boolean
  separator?: boolean
  indent?: boolean
}) {
  return (
    <>
      {separator && <tr><td colSpan={3} className="py-1.5"><div className="border-t border-dashed border-ink-200" /></td></tr>}
      <tr className={cn('border-b border-ink-50 last:border-0', accent && 'bg-sage-50/40')}>
        <td className={cn('py-2.5 px-4 text-sm', indent ? 'text-ink-500 pl-7' : accent ? 'font-medium text-ink-900' : 'text-ink-600')}>
          {label}
        </td>
        <td className={cn('py-2.5 px-4 text-right font-mono text-sm tabular-nums', accent ? 'font-700 text-ink-900' : 'text-ink-700')}>
          {o}
        </td>
        <td className={cn('py-2.5 px-4 text-right font-mono text-sm tabular-nums', accent ? 'font-700 text-ink-900' : 'text-ink-700')}>
          {n}
        </td>
      </tr>
    </>
  )
}

// ── Regime comparison table ───────────────────────────────────────────────────

function ComparisonTable({ old: o, new: n, oldWins }: { old: RegimeTaxResult; new: RegimeTaxResult; oldWins: boolean }) {
  const r = formatRupees
  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ink-100 bg-ink-50">
            <th className="text-left py-3 px-4 text-xs font-medium text-ink-400 uppercase tracking-wide w-1/2">
              Breakdown
            </th>
            <th className={cn('text-right py-3 px-4 text-xs font-medium uppercase tracking-wide', oldWins ? 'text-sage-600' : 'text-ink-400')}>
              Old Regime {oldWins && '★'}
            </th>
            <th className={cn('text-right py-3 px-4 text-xs font-medium uppercase tracking-wide', !oldWins ? 'text-sage-600' : 'text-ink-400')}>
              New Regime {!oldWins && '★'}
            </th>
          </tr>
        </thead>
        <tbody>
          <BRow label="Gross Income"          old={r(o.grossIncome)}         new={r(n.grossIncome)} />
          <BRow label="Standard Deduction"    old={`− ${r(o.standardDeduction)}`} new={`− ${r(n.standardDeduction)}`} indent />
          <BRow label="Exemptions (Sec 10/16)" old={`− ${r(o.totalExemptions)}`} new="—"           indent />
          <BRow label="Other Deductions"      old={`− ${r(o.totalDeductions)}`} new="—"            indent />
          <BRow label="Taxable Income"        old={r(o.taxableIncome)}        new={r(n.taxableIncome)} accent separator />
          <BRow label="Income Tax"            old={r(o.taxBeforeRebate)}      new={r(n.taxBeforeRebate)} />
          <BRow label="Section 87A Rebate"    old={`− ${r(o.rebate87A)}`}    new={`− ${r(n.rebate87A)}`} indent />
          <BRow label="Tax after Rebate"      old={r(o.taxAfterRebate)}       new={r(n.taxAfterRebate)} />
          <BRow label="4% Cess"               old={r(o.cess)}                 new={r(n.cess)} indent />
          <BRow label="Total Tax Payable"     old={r(o.totalTax)}             new={r(n.totalTax)} accent separator />
          <BRow label="Effective Rate"        old={formatPct(o.effectiveRate, 2)} new={formatPct(n.effectiveRate, 2)} />
          <BRow label="Monthly TDS"           old={r(o.monthlyTds)}           new={r(n.monthlyTds)} />
        </tbody>
      </table>
    </div>
  )
}

// ── Earnings / exemptions / deductions read-only card ─────────────────────────

function DeclarationCard({ plan }: { plan: TaxPlanWithResults }) {
  const r = formatRupees
  const e = plan.earnings
  const x = plan.exemptions
  const d = plan.deductions

  const rows: { label: string; value: number; section?: boolean }[] = [
    { label: 'Earnings', section: true, value: 0 },
    { label: 'Basic Salary', value: e.basic },
    { label: 'HRA', value: e.hra },
    { label: 'Allowances', value: e.allowances },
    { label: 'Perks & Benefits', value: e.perks },
    { label: 'Other Income', value: e.otherIncome },
    { label: 'Exemptions (Old Regime)', section: true, value: 0 },
    { label: 'HRA Exemption', value: x?.hraExemption ?? 0 },
    { label: 'LTA Exemption', value: x?.ltaExemption ?? 0 },
    { label: 'Other Allowance Exemptions', value: x?.otherExemptions ?? 0 },
    { label: 'Professional Tax (Sec 16)', value: x?.professionalTax ?? 0 },
    { label: 'Deductions (Old Regime)', section: true, value: 0 },
    { label: 'Section 80C', value: d?.section80C ?? 0 },
    { label: 'Section 80D', value: d?.section80D ?? 0 },
    { label: 'Section 80E', value: d?.section80E ?? 0 },
    { label: 'Section 80G', value: d?.section80G ?? 0 },
    { label: 'NPS 80CCD(1B)', value: d?.nps80CCD1B ?? 0 },
    { label: 'Other Deductions', value: d?.otherDeductions ?? 0 },
  ]

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3 border-b border-ink-100 bg-ink-50">
        <p className="text-xs font-medium text-ink-500 uppercase tracking-widest">Declaration Details</p>
      </div>
      <div className="divide-y divide-ink-50">
        {rows.map((row) =>
          row.section ? (
            <div key={row.label} className="px-5 py-2 bg-ink-50 border-y border-ink-100">
              <p className="text-xs font-medium text-ink-500 uppercase tracking-widest">{row.label}</p>
            </div>
          ) : (
            <div key={row.label} className={cn('flex items-center justify-between px-5 py-2.5', row.value === 0 && 'opacity-40')}>
              <span className="text-sm text-ink-600">{row.label}</span>
              <span className="font-mono text-sm font-medium text-ink-800 tabular-nums">{r(row.value)}</span>
            </div>
          )
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TaxPlanDetailsPage() {
  const { planId } = useParams<{ planId: string }>()
  const navigate = useNavigate()
  const { deletePlan } = useTaxPlanStore()

  const [plan, setPlan] = useState<TaxPlanWithResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!planId) return
    taxPlanApi.getById(planId)
      .then(setPlan)
      .catch(() => setError('Plan not found'))
      .finally(() => setLoading(false))
  }, [planId])

  if (loading) {
    return <div className="card p-10 text-center animate-pulse text-ink-400 text-sm">Loading plan…</div>
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <p className="text-sm text-rose-600">{error ?? 'Plan not found'}</p>
        <button type="button" onClick={() => navigate('/tax')} className="btn-ghost">
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    )
  }

  document.title = `${plan.name} | Tax Plan | ClearHomeEMI`

  const oldWins = plan.oldRegime.totalTax < plan.newRegime.totalTax
  const saving  = Math.abs(plan.oldRegime.totalTax - plan.newRegime.totalTax)

  const handleDelete = async () => {
    await deletePlan(plan.id)
    navigate('/tax')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5 pb-24 sm:pb-8"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/tax')} className="btn-ghost">
            <ArrowLeft size={14} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-800 text-xl text-ink-900">{plan.name}</h1>
              <span className={cn('badge text-xs', plan.status === 'FINAL' ? 'badge-green' : 'badge-amber')}>
                {plan.status}
              </span>
            </div>
            <p className="text-xs text-ink-400 mt-0.5">FY {plan.financialYear} · Gross {formatRupees(plan.oldRegime.grossIncome, true)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={handleDelete} className="btn-secondary text-rose-600 border-rose-200 hover:bg-rose-50">
            <Trash2 size={13} />
            Delete
          </button>
          <button type="button" onClick={() => navigate(`/tax/${plan.id}/edit`)} className="btn-primary">
            <Edit2 size={13} />
            Edit Plan
          </button>
        </div>
      </div>

      {/* ── Recommendation banner ────────────────────────────────────────────── */}
      {saving > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4 bg-sage-50 border-sage-200 flex items-center gap-4"
        >
          <div className="w-9 h-9 rounded-xl bg-sage-500 flex items-center justify-center flex-shrink-0">
            <BadgeCheck size={18} className="text-white" />
          </div>
          <div>
            <p className="font-display font-700 text-sage-900 text-sm">
              {oldWins ? 'Old Regime' : 'New Regime'} recommended — save{' '}
              <span className="text-sage-600">{formatRupees(saving)}</span> this year
            </p>
            <p className="text-xs text-sage-700 mt-0.5">
              Old: {formatRupees(plan.oldRegime.totalTax)} · New: {formatRupees(plan.newRegime.totalTax)}
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="space-y-5">
          {/* Summary metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Gross Income', value: formatRupees(plan.oldRegime.grossIncome, true) },
              { label: 'Monthly TDS (Best)', value: `₹${Math.min(plan.oldRegime.monthlyTds, plan.newRegime.monthlyTds).toLocaleString('en-IN')}` },
              { label: 'Old Regime Tax', value: formatRupees(plan.oldRegime.totalTax, true) },
              { label: 'New Regime Tax', value: formatRupees(plan.newRegime.totalTax, true) },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="metric-card"
              >
                <span className="metric-label">{m.label}</span>
                <span className="metric-value text-base">{m.value}</span>
              </motion.div>
            ))}
          </div>

          {/* Full comparison table */}
          <ComparisonTable old={plan.oldRegime} new={plan.newRegime} oldWins={oldWins} />
        </div>

        {/* Declaration sidebar */}
        <DeclarationCard plan={plan} />
      </div>
    </motion.div>
  )
}
