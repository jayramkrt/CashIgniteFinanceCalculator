import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { History, RefreshCw, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { scenarioApi } from '@/api'
import { useLoanStore } from '@/stores/loanStore'
import { formatRupees, formatTenure, formatDate } from '@/utils'
import type { ScenarioSummaryDTO } from '@/types'

function ScenarioCard({
  scenario, onRecalculate, isLoading
}: {
  scenario: ScenarioSummaryDTO
  onRecalculate: (id: number) => void
  isLoading: boolean
}) {
  const { summary } = scenario

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 hover:shadow-card-lg transition-shadow"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-display font-600 text-ink-900">
            {scenario.scenarioName || 'Unnamed scenario'}
          </h3>
          <p className="text-xs text-ink-400 mt-0.5">
            Saved {formatDate(scenario.createdAt.split('T')[0])}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRecalculate(scenario.id)}
          disabled={isLoading}
          className="btn-secondary text-xs px-3 py-2 flex-shrink-0"
          title="Load this scenario"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          Load
        </button>
      </div>

      {/* Core params */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="metric-card py-3">
          <span className="metric-label">Amount</span>
          <span className="text-base font-display font-700 text-ink-900 tabular-nums">
            {formatRupees(scenario.loanAmount, true)}
          </span>
        </div>
        <div className="metric-card py-3">
          <span className="metric-label">Rate</span>
          <span className="text-base font-display font-700 text-ink-900 tabular-nums">
            {scenario.annualInterestRate}%
          </span>
        </div>
        <div className="metric-card py-3">
          <span className="metric-label">Tenure</span>
          <span className="text-base font-display font-700 text-ink-900 tabular-nums">
            {formatTenure(scenario.tenureMonths)}
          </span>
        </div>
      </div>

      {/* Summary results */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-ink-100">
          <div>
            <p className="text-xs text-ink-400 mb-0.5">EMI</p>
            <p className="text-sm font-mono font-600 text-ink-800 tabular-nums">
              {formatRupees(summary.emiAmount, true)}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-400 mb-0.5">Total interest</p>
            <p className="text-sm font-mono font-600 text-amber-600 tabular-nums">
              {formatRupees(summary.totalInterestPayable, true)}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-400 mb-0.5">Total payment</p>
            <p className="text-sm font-mono font-600 text-ink-800 tabular-nums">
              {formatRupees(summary.totalPayment, true)}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-400 mb-0.5">Actual tenure</p>
            <p className="text-sm font-mono font-600 text-ink-800 tabular-nums">
              {formatTenure(summary.actualTenureMonths)}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function HistoryPage() {
  const navigate   = useNavigate()
  const store      = useLoanStore()
  const [page, setPage] = useState(0)
  const PAGE_SIZE  = 8

  const { data, isLoading, error } = useQuery({
    queryKey:  ['scenarios', page],
    queryFn:   () => scenarioApi.list(page, PAGE_SIZE),
  })

  const recalcMutation = useMutation({
    mutationFn: (id: number) => scenarioApi.recalculate(id),
    onSuccess: (result) => {
      store.setResult(result)
      navigate('/statistics')
    },
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-800 text-2xl text-ink-900 tracking-tight">History</h1>
          <p className="text-sm text-ink-400 mt-0.5">
            {data ? `${data.totalElements} saved scenario${data.totalElements !== 1 ? 's' : ''}` : 'Saved loan scenarios'}
          </p>
        </div>
        <button type="button" onClick={() => navigate('/')} className="btn-ghost">
          <ArrowLeft size={14} />
          Calculator
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-ink-200 border-t-ink-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card p-5 border-rose-100 bg-rose-50 text-rose-700 text-sm">
          Could not load history. Make sure the backend is running.
        </div>
      )}

      {/* Empty */}
      {data && data.content.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center mb-4">
            <History size={22} className="text-ink-400" />
          </div>
          <p className="font-display font-600 text-ink-700 text-lg">No saved scenarios</p>
          <p className="text-sm text-ink-400 mt-1 mb-5">
            Calculate a loan and click Save to store it here.
          </p>
          <button type="button" onClick={() => navigate('/')} className="btn-primary">
            <ArrowLeft size={14} />
            Go to calculator
          </button>
        </div>
      )}

      {/* Scenario grid */}
      {data && data.content.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.content.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onRecalculate={(id) => recalcMutation.mutate(id)}
                isLoading={recalcMutation.isPending && recalcMutation.variables === scenario.id}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-secondary px-3 py-2 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-sm text-ink-500 px-3">
                Page {page + 1} of {data.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                disabled={page >= data.totalPages - 1}
                className="btn-secondary px-3 py-2 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
