import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SeoHead from '@/components/SeoHead'
import { motion } from 'framer-motion'
import { Plus, Receipt, Trash2, ArrowRight, BadgeCheck, ChevronRight } from 'lucide-react'
import { useTaxPlanStore } from '@/stores/taxPlanStore'
import { Select } from '@/components/ui'
import { FY_OPTIONS } from '@/data/taxData'
import { formatRupees, cn } from '@/utils'
import type { TaxPlanSummary } from '@/types/taxPlan'

// ── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({ plan, onDelete }: { plan: TaxPlanSummary; onDelete: () => void }) {
  const navigate = useNavigate()
  const oldWins = plan.oldRegimeTax < plan.newRegimeTax
  const saving  = Math.abs(plan.oldRegimeTax - plan.newRegimeTax)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card flex flex-col gap-0 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-ink-100 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-700 text-ink-900">{plan.name}</h3>
            <span className={cn(
              'badge text-[10px]',
              plan.status === 'FINAL' ? 'badge-green' : 'badge-amber',
            )}>
              {plan.status}
            </span>
          </div>
          <p className="text-xs text-ink-400">FY {plan.financialYear}</p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="p-1.5 rounded-lg text-ink-300 hover:text-rose-500 hover:bg-rose-50 transition-colors mt-0.5 flex-shrink-0"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Gross income */}
      <div className="px-5 py-3 bg-ink-50 border-b border-ink-100">
        <p className="text-xs text-ink-400 uppercase tracking-widest mb-0.5">Gross Income</p>
        <p className="font-mono font-700 text-ink-900 text-base tabular-nums">
          {formatRupees(plan.grossIncome)}
        </p>
      </div>

      {/* Tax summary grid */}
      <div className="grid grid-cols-2 divide-x divide-ink-100">
        <div className={cn('px-4 py-3', oldWins && 'bg-sage-50')}>
          <div className="flex items-center gap-1 mb-1">
            <p className="text-xs text-ink-400 uppercase tracking-widest">Old Regime</p>
            {oldWins && <BadgeCheck size={11} className="text-sage-500" />}
          </div>
          <p className={cn('font-mono font-700 text-sm tabular-nums', oldWins ? 'text-sage-700' : 'text-ink-700')}>
            {formatRupees(plan.oldRegimeTax)}
          </p>
        </div>
        <div className={cn('px-4 py-3', !oldWins && 'bg-sage-50')}>
          <div className="flex items-center gap-1 mb-1">
            <p className="text-xs text-ink-400 uppercase tracking-widest">New Regime</p>
            {!oldWins && <BadgeCheck size={11} className="text-sage-500" />}
          </div>
          <p className={cn('font-mono font-700 text-sm tabular-nums', !oldWins ? 'text-sage-700' : 'text-ink-700')}>
            {formatRupees(plan.newRegimeTax)}
          </p>
        </div>
      </div>

      {/* Savings */}
      {saving > 0 && (
        <div className="px-5 py-2.5 border-t border-ink-100 bg-sage-50">
          <p className="text-xs text-sage-700">
            Save <span className="font-mono font-700">{formatRupees(saving)}</span>{' '}
            with {oldWins ? 'Old' : 'New'} Regime
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 py-3 border-t border-ink-100 flex gap-2">
        <button
          type="button"
          onClick={() => navigate(`/tax/${plan.id}/edit`)}
          className="btn-secondary text-xs py-1.5 px-3 flex-1"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => navigate(`/tax/${plan.id}`)}
          className="btn-primary text-xs py-1.5 px-3 flex-1"
        >
          View Details
          <ChevronRight size={12} />
        </button>
      </div>
    </motion.div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center mb-4">
        <Receipt size={22} className="text-ink-400" />
      </div>
      <p className="font-display font-700 text-ink-800 text-lg">No tax plans yet</p>
      <p className="text-sm text-ink-400 mt-1 mb-5 max-w-xs">
        Create a plan to compare Old vs New regime and find your optimal tax strategy.
      </p>
      <button type="button" onClick={onCreate} className="btn-primary">
        <Plus size={14} />
        Create Your First Plan
      </button>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function TaxPlannerDashboard() {
  const navigate = useNavigate()
  const { plans, isLoading, error, selectedFY, setSelectedFY, fetchPlans, deletePlan } = useTaxPlanStore()

  useEffect(() => { fetchPlans(selectedFY) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = () => navigate('/tax/new')

  return (
    <>
    <SeoHead
      title="Income Tax Planner — Old vs New Regime | CashIgnite"
      description="Compare old vs new tax regime side-by-side. Get personalised tax savings recommendations for FY 2025-26. Free, instant, no login required."
      canonical="https://cashignite.in/tax"
    />
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 pb-24 sm:pb-8"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-800 text-2xl text-ink-900 tracking-tight">Tax Planner</h1>
          <p className="text-sm text-ink-400 mt-0.5">
            Create and compare multiple tax-saving scenarios
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-36">
            <Select
              value={selectedFY}
              onChange={setSelectedFY}
              options={FY_OPTIONS.map((o) => ({ value: o.value.replace('FY_', '').replace('_', '-').replace('_', '-'), label: o.label }))}
            />
          </div>
          <button type="button" onClick={handleCreate} className="btn-primary">
            <Plus size={14} />
            New Plan
          </button>
        </div>
      </div>

      {/* ── Plans grid / states ──────────────────────────────────────────────── */}
      {error ? (
        <div className="card p-6 text-center">
          <p className="text-sm text-rose-600">{error}</p>
          <button type="button" onClick={() => fetchPlans(selectedFY)} className="btn-ghost mt-3">
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-64 animate-pulse bg-ink-50" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="card">
          <EmptyState onCreate={handleCreate} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PlanCard
                  plan={plan}
                  onDelete={() => deletePlan(plan.id)}
                />
              </motion.div>
            ))}

            {/* Add plan card */}
            <motion.button
              type="button"
              onClick={handleCreate}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: plans.length * 0.05 }}
              className="card border-dashed border-ink-200 flex flex-col items-center justify-center gap-3 py-12 text-ink-400 hover:text-ink-700 hover:border-ink-300 hover:bg-ink-50 transition-all duration-150 cursor-pointer min-h-[200px]"
            >
              <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center">
                <Plus size={18} />
              </div>
              <span className="text-sm font-medium">Add Plan</span>
            </motion.button>
          </div>

          {/* Cross-link soft nudge */}
          <div className="card p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-ink-500">
              Planning a home loan alongside taxes?
            </p>
            <button type="button" onClick={() => navigate('/')} className="btn-ghost text-sage-600 text-xs">
              Explore loan planning
              <ArrowRight size={12} />
            </button>
          </div>
        </>
      )}
    </motion.div>
    </>
  )
}
