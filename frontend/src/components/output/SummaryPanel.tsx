import dayjs from 'dayjs'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, Calendar, Percent, Wallet, PiggyBank, CalendarClock, ArrowRight, Download } from 'lucide-react'
import { toPng } from 'html-to-image'
import { useLoanStore } from '@/stores/loanStore'
import { formatRupees, formatTenure, formatDate, formatPct, cn } from '@/utils'
import ShareCard from '@/components/ShareCard'

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
  // Prepayments are principal repayment — total is principal + interest, not +prepayment
  const emiPrincipal = principal - prepayment
  const total = principal + interest
  const r = 52
  const circ = 2 * Math.PI * r
  const pPct  = emiPrincipal / total   // regular EMI principal portion
  const iPct  = interest     / total
  const ppPct = prepayment   / total

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
          stroke="#4F6EE8" strokeWidth="14"
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
            stroke="#4F6EE8" strokeWidth="14" strokeOpacity="0.35"
            strokeDasharray={`${ppLen} ${circ - ppLen}`}
            strokeDashoffset={ppOff}
            strokeLinecap="butt"
          />
        )}
      </svg>
      <div className="absolute text-center">
        <p className="text-xs text-ink-400">interest</p>
        <p className="text-base font-display font-700 text-ink-900 leading-tight">
          {Math.round(iPct * 100)}%
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
  const result             = useLoanStore(s => s.result)
  const { loanAmount, annualInterestRate, tenureMonths } = useLoanStore(s => s.loan)
  const shareRef   = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!shareRef.current || !result) return
    setDownloading(true)
    try {
      const el = shareRef.current
      const dataUrl = await toPng(el, {
        width: el.offsetWidth,
        height: el.offsetHeight,
        pixelRatio: 2,
        cacheBust: true,
      })
      const link = document.createElement('a')
      link.download = `cashignite-emi-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } finally {
      setDownloading(false)
    }
  }

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
      {/* Invisible share card — opacity:0 keeps it in the render tree so html-to-image can capture it */}
      <div aria-hidden style={{ position: 'fixed', top: 0, left: 0, opacity: 0, pointerEvents: 'none', zIndex: -999 }}>
        <ShareCard
          ref={shareRef}
          result={result}
          loanAmount={loanAmount}
          annualRate={annualInterestRate}
          tenureMonths={tenureMonths}
        />
      </div>

      {/* ── EMI headline ───────────────────────────────────────────────── */}
      <div className="card-lg p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-ink-400 uppercase tracking-widest mb-1">Monthly EMI</p>
            <p className="text-4xl font-display font-800 text-ink-900 tabular-nums tracking-tight leading-none">
              {formatRupees(summary.emiAmount)}
            </p>
            <p className="text-sm text-ink-400 mt-1.5">
              {formatTenure(summary.actualTenureMonths)} ·{' '}
              {formatDate(summary.loanStartDate)} → {formatDate(summary.loanEndDate)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            title="Download as image"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all shrink-0"
            style={{
              background: downloading ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.08)',
              color: '#7C3AED',
              border: '1px solid rgba(124,58,237,0.18)',
            }}
          >
            {downloading ? (
              <span className="w-3.5 h-3.5 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin"/>
            ) : (
              <Download size={13}/>
            )}
            {downloading ? 'Saving…' : 'Save as PNG'}
          </button>
        </div>
      </div>

      {/* ── Donut + breakdown ──────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex flex-col xs:flex-row items-center gap-5">
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
                label="Prepayments (of principal)"
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

      {/* ── Prepayment interest comparison ─────────────────────────────── */}
      {hasPrepSaving && (
        <div className="card p-4 border-sage-100 bg-sage-50">
          <div className="flex items-center gap-2 mb-3">
            <PiggyBank size={15} className="text-sage-600" />
            <p className="text-xs font-medium text-sage-700 uppercase tracking-widest">Prepayment impact</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-sage-700">Interest without prepayments</span>
              <span className="text-sm font-mono font-600 text-ink-500 line-through tabular-nums">
                {formatRupees(summary.totalInterestPayable + summary.interestSavedByPrepayment!, true)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-sage-700">Interest you actually paid</span>
              <span className="text-sm font-mono font-700 text-sage-800 tabular-nums">
                {formatRupees(summary.totalInterestPayable, true)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-sage-200">
              <span className="text-sm font-medium text-sage-800">You saved</span>
              <span className="text-sm font-mono font-700 text-sage-700 tabular-nums">
                {formatRupees(summary.interestSavedByPrepayment!, true)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── ISA savings block (conditional) ───────────────────────────────── */}
      {hasISASaving && (
        <div className="card p-4 border-sage-100 bg-sage-50">
          <div className="flex items-center gap-2 mb-3">
            <PiggyBank size={15} className="text-sage-600" />
            <p className="text-xs font-medium text-sage-700 uppercase tracking-widest">Interest saver impact</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-sage-700">Interest saved via ISA</span>
              <span className="text-sm font-mono font-600 text-sage-800">
                {formatRupees(summary.interestSavedByInterestSaver!, true)}
              </span>
            </div>
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

      {/* ── Loan closure timeline (if early closure) ───────────────────── */}
      {hasReduction && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock size={15} className="text-ink-400" />
            <p className="text-xs font-medium text-ink-500 uppercase tracking-widest">Loan closure</p>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-400 mb-0.5">Scheduled end</p>
                <p className="text-sm font-mono font-600 text-ink-500 tabular-nums">
                  {dayjs(summary.loanStartDate).add(summary.originalTenureMonths - 1, 'month').format('MMM YYYY')}
                </p>
                <p className="text-xs text-ink-300">{formatTenure(summary.originalTenureMonths)} tenure</p>
              </div>
              <ArrowRight size={14} className="text-sage-400 flex-shrink-0" />
              <div className="text-right">
                <p className="text-xs text-sage-600 mb-0.5">Early closure</p>
                <p className="text-sm font-mono font-700 text-sage-700 tabular-nums">
                  {dayjs(summary.loanEndDate).format('MMM YYYY')}
                </p>
                <p className="text-xs text-sage-500">
                  saves {formatTenure(summary.tenureReducedByMonths!)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
