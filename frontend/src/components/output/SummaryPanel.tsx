import { motion } from 'framer-motion'
import { TrendingDown, Calendar, Percent, Wallet, PiggyBank, AlertCircle } from 'lucide-react'
import { useLoanStore } from '@/stores/loanStore'
import { formatRupees, formatTenure, formatDate, formatPct, cn } from '@/utils'

// ── Animated metric card ──────────────────────────────────────────────────────

function MetricCard({
  label, value, sub, accent, icon: Icon, delay = 0
}: {
  label: string
  value: string
  sub?: string
  accent?: 'green' | 'amber' | 'rose' | 'default'
  icon?: React.ElementType
  delay?: number
}) {
  const accentMap = {
    green:   'bg-sage-50  border-sage-100',
    amber:   'bg-amber-50 border-amber-100',
    rose:    'bg-rose-50  border-rose-100',
    default: 'bg-ink-50   border-ink-100',
  }
  const valueColor = {
    green:   'text-sage-700',
    amber:   'text-amber-600',
    rose:    'text-rose-600',
    default: 'text-ink-900',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex flex-col gap-1.5 p-4 rounded-2xl border', accentMap[accent ?? 'default'])}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-400 uppercase tracking-widest">{label}</span>
        {Icon && <Icon size={14} className="text-ink-300" />}
      </div>
      <span className={cn('text-xl font-display font-700 tabular-nums leading-none', valueColor[accent ?? 'default'])}>
        {value}
      </span>
      {sub && <span className="text-xs text-ink-400">{sub}</span>}
    </motion.div>
  )
}

// ── Donut progress ring ───────────────────────────────────────────────────────

function DonutRing({ principal, interest, prepayment }: {
  principal: number; interest: number; prepayment: number
}) {
  const total = principal + interest + prepayment
  const r = 52
  const circ = 2 * Math.PI * r
  const pPct  = principal / total
  const iPct  = interest  / total
  const ppPct = prepayment / total

  const pLen  = circ * pPct
  const iLen  = circ * iPct
  const ppLen = circ * ppPct

  const pOff  = 0
  const iOff  = -(pLen)
  const ppOff = -(pLen + iLen)

  return (
    <div className="relative flex items-center justify-center">
      <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#E8E6DF" strokeWidth="14" />
        {/* Principal */}
        <circle cx="64" cy="64" r={r} fill="none"
          stroke="#4D7547" strokeWidth="14"
          strokeDasharray={`${pLen} ${circ - pLen}`}
          strokeDashoffset={pOff}
          strokeLinecap="butt"
        />
        {/* Interest */}
        <circle cx="64" cy="64" r={r} fill="none"
          stroke="#E09B12" strokeWidth="14"
          strokeDasharray={`${iLen} ${circ - iLen}`}
          strokeDashoffset={iOff}
          strokeLinecap="butt"
        />
        {/* Prepayment */}
        {ppLen > 0 && (
          <circle cx="64" cy="64" r={r} fill="none"
            stroke="#4D7547" strokeWidth="14" strokeOpacity="0.35"
            strokeDasharray={`${ppLen} ${circ - ppLen}`}
            strokeDashoffset={ppOff}
            strokeLinecap="butt"
          />
        )}
      </svg>
      <div className="absolute text-center">
        <p className="text-xs text-ink-400">interest</p>
        <p className="text-base font-display font-700 text-ink-900 leading-tight">
          {Math.round((interest / total) * 100)}%
        </p>
      </div>
    </div>
  )
}

// ── Legend item ───────────────────────────────────────────────────────────────

function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className={cn('w-2.5 h-2.5 rounded-sm flex-shrink-0', color)} />
        <span className="text-xs text-ink-500">{label}</span>
      </div>
      <span className="text-xs font-mono font-medium text-ink-700 tabular-nums">{value}</span>
    </div>
  )
}

// ── Main SummaryPanel ─────────────────────────────────────────────────────────

export default function SummaryPanel() {
  const { result } = useLoanStore()

  if (!result) return null

  const { summary } = result
  const hasReduction    = summary.tenureReducedByMonths && summary.tenureReducedByMonths > 0
  const hasPrepayment   = summary.totalPrepaymentAmount > 0
  const hasISASaving    = summary.interestSavedByInterestSaver != null
  const hasPrepSaving   = summary.interestSavedByPrepayment != null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      {/* ── EMI headline ───────────────────────────────────────────────── */}
      <div className="card-lg p-6">
        <p className="text-xs font-medium text-ink-400 uppercase tracking-widest mb-1">Monthly EMI</p>
        <p className="text-4xl font-display font-800 text-ink-900 tabular-nums tracking-tight leading-none">
          {formatRupees(summary.emiAmount)}
        </p>
        <p className="text-sm text-ink-400 mt-1.5">
          {formatTenure(summary.actualTenureMonths)} ·{' '}
          {formatDate(summary.loanStartDate)} → {formatDate(summary.loanEndDate)}
        </p>
      </div>

      {/* ── Donut + breakdown ──────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center gap-5">
          <DonutRing
            principal={summary.totalPrincipal}
            interest={summary.totalInterestPayable}
            prepayment={summary.totalPrepaymentAmount}
          />
          <div className="flex-1 space-y-2.5">
            <LegendItem
              color="bg-sage-500"
              label="Principal"
              value={formatRupees(summary.totalPrincipal, true)}
            />
            <LegendItem
              color="bg-amber-400"
              label="Interest"
              value={formatRupees(summary.totalInterestPayable, true)}
            />
            {hasPrepayment && (
              <LegendItem
                color="bg-sage-300"
                label="Prepayments"
                value={formatRupees(summary.totalPrepaymentAmount, true)}
              />
            )}
            {summary.totalFees > 0 && (
              <LegendItem
                color="bg-ink-300"
                label="Fees"
                value={formatRupees(summary.totalFees, true)}
              />
            )}
            <div className="pt-2 border-t border-ink-100">
              <LegendItem
                color="bg-ink-700"
                label="Total payment"
                value={formatRupees(summary.totalPayment, true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Key metrics grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Interest payable"
          value={formatRupees(summary.totalInterestPayable, true)}
          sub={`${formatPct((summary.totalInterestPayable / summary.totalPrincipal) * 100, 1)} of principal`}
          accent="amber"
          icon={Percent}
          delay={0.05}
        />
        <MetricCard
          label="Effective rate"
          value={formatPct(summary.effectiveAnnualRate)}
          sub="per annum"
          icon={TrendingDown}
          delay={0.10}
        />
        <MetricCard
          label="Loan tenure"
          value={formatTenure(summary.actualTenureMonths)}
          sub={hasReduction ? `↓ ${formatTenure(summary.tenureReducedByMonths!)} saved` : `${summary.actualTenureMonths} months`}
          accent={hasReduction ? 'green' : 'default'}
          icon={Calendar}
          delay={0.15}
        />
        <MetricCard
          label="Total payment"
          value={formatRupees(summary.totalPayment, true)}
          sub="principal + interest + fees"
          icon={Wallet}
          delay={0.20}
        />
      </div>

      {/* ── Savings block (conditional) ────────────────────────────────── */}
      {(hasISASaving || hasPrepSaving) && (
        <div className="card p-4 border-sage-100 bg-sage-50">
          <div className="flex items-center gap-2 mb-3">
            <PiggyBank size={15} className="text-sage-600" />
            <p className="text-xs font-medium text-sage-700 uppercase tracking-widest">Interest saved</p>
          </div>
          <div className="space-y-2">
            {hasPrepSaving && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-sage-700">Via prepayments</span>
                <span className="text-sm font-mono font-600 text-sage-800">
                  {formatRupees(summary.interestSavedByPrepayment!, true)}
                </span>
              </div>
            )}
            {hasISASaving && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-sage-700">Via interest saver</span>
                <span className="text-sm font-mono font-600 text-sage-800">
                  {formatRupees(summary.interestSavedByInterestSaver!, true)}
                </span>
              </div>
            )}
            {summary.interestSaverFinalBalance != null && (
              <div className="flex justify-between items-center pt-2 border-t border-sage-200">
                <span className="text-sm text-sage-700">ISA closing balance</span>
                <span className="text-sm font-mono font-600 text-sage-800">
                  {formatRupees(summary.interestSaverFinalBalance, true)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Original vs actual tenure (if different) ───────────────────── */}
      {hasReduction && (
        <div className="card p-4 flex items-start gap-3">
          <AlertCircle size={15} className="text-sage-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-ink-800">Loan closes early</p>
            <p className="text-xs text-ink-500 mt-0.5">
              Original tenure {formatTenure(summary.originalTenureMonths)} →{' '}
              actual {formatTenure(summary.actualTenureMonths)} (saves{' '}
              {formatTenure(summary.tenureReducedByMonths!)} and{' '}
              {formatRupees(summary.interestSavedByPrepayment ?? 0, true)} in interest)
            </p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
