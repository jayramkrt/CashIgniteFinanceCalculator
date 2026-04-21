import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLoanStore } from '@/stores/loanStore'
import { PaymentBreakdownPie, PrincipalInterestLine, BalanceLine } from '@/components/output/Charts'
import AmortizationTable from '@/components/output/AmortizationTable'
import { formatRupees, formatTenure, formatDate } from '@/utils'

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-ink-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-mono font-600 text-ink-800 tabular-nums">{value}</span>
    </div>
  )
}

export default function StatisticsPage() {
  document.title = 'Loan Statistics & Amortization Schedule | ClearHomeEMI'

  const navigate = useNavigate()
  const { result } = useLoanStore()

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center mb-4">
          <BarChart3 size={22} className="text-ink-400" />
        </div>
        <p className="font-display font-600 text-ink-700 text-lg">No calculation yet</p>
        <p className="text-sm text-ink-400 mt-1 mb-5">
          Run a calculation first to see your loan statistics.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          <ArrowLeft size={14} />
          Go to calculator
        </button>
      </div>
    )
  }

  const { summary } = result

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-800 text-2xl text-ink-900 tracking-tight">Statistics</h1>
          <p className="text-sm text-ink-400 mt-0.5">
            Loan started {formatDate(summary.loanStartDate)} · ends {formatDate(summary.loanEndDate)}
          </p>
        </div>
        <button type="button" onClick={() => navigate('/')} className="btn-ghost">
          <ArrowLeft size={14} />
          Back
        </button>
      </div>

      {/* ── Key stats strip ─────────────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-5 divide-x divide-ink-100">
          <StatChip label="Monthly EMI"     value={formatRupees(summary.emiAmount, true)} />
          <StatChip label="Total interest"  value={formatRupees(summary.totalInterestPayable, true)} />
          <StatChip label="Total payment"   value={formatRupees(summary.totalPayment, true)} />
          <StatChip label="Actual tenure"   value={formatTenure(summary.actualTenureMonths)} />
          <StatChip label="Effective rate"  value={`${summary.effectiveAnnualRate.toFixed(2)}%`} />
          {summary.tenureReducedByMonths != null && summary.tenureReducedByMonths > 0 && (
            <StatChip label="Tenure saved" value={formatTenure(summary.tenureReducedByMonths)} />
          )}
        </div>
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <PaymentBreakdownPie />
        </div>
        <div className="card p-6">
          <PrincipalInterestLine />
        </div>
      </div>

      {/* ── Balance chart ────────────────────────────────────────────────────── */}
      <div className="card p-6">
        <BalanceLine />
      </div>

      {/* ── Amortization table ──────────────────────────────────────────────── */}
      <div className="card p-6">
        <AmortizationTable />
      </div>
    </motion.div>
  )
}
