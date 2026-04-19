// import { useState } from 'react'  // DB disabled (was used for save dialog state)
import { useNavigate } from 'react-router-dom'
import { Calculator, RotateCcw, BarChart3 /*, Save*/ } from 'lucide-react'  // Save disabled (DB disabled)
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useLoanStore } from '@/stores/loanStore'
import { loanApi /*, scenarioApi*/ } from '@/api'  // scenarioApi disabled (DB disabled)
import { buildRequest } from '@/utils/buildRequest'
import BaseLoanForm from '@/components/modules/BaseLoanForm'
import {
  PrepaymentModule,
  VariableRateModule,
  InterestSaverModule,
  MoratoriumModule,
  FeesModule,
} from '@/components/modules/FeatureModules'
import SummaryPanel from '@/components/output/SummaryPanel'

export default function CalculatorPage() {
  const navigate  = useNavigate()
  const store     = useLoanStore()
  // const [saveLabel, setSaveLabel] = useState('')  // DB disabled
  // const [showSave, setShowSave]   = useState(false)

  // ── Calculate mutation ──────────────────────────────────────────────────
  const calcMutation = useMutation({
    mutationFn: () => loanApi.calculate(buildRequest(useLoanStore.getState())),
    onSuccess:  (data) => store.setResult(data),
    onError:    (e: Error) => store.setError(e.message),
    onMutate:   () => store.setLoading(true),
    onSettled:  () => store.setLoading(false),
  })

  // ── Save mutation (DB disabled) ─────────────────────────────────────────
  // const saveMutation = useMutation({
  //   mutationFn: () => scenarioApi.save(buildRequest(useLoanStore.getState()), saveLabel || 'My Loan'),
  //   onSuccess:  () => { setShowSave(false); setSaveLabel('') },
  // })

  const handleCalculate = () => calcMutation.mutate()
  const handleReset     = () => { store.resetAll() }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 items-start">

      {/* ── Left column: inputs ──────────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Base loan form card */}
        <div className="card-lg p-6">
          <h2 className="font-display font-700 text-ink-900 text-lg tracking-tight mb-5">
            Loan details
          </h2>
          <BaseLoanForm />
        </div>

        {/* Advanced features */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-widest px-1">
            Advanced features
          </p>
          <PrepaymentModule />
          <VariableRateModule />
          <InterestSaverModule />
          <MoratoriumModule />
          <FeesModule />
        </div>

        {/* Error message */}
        <AnimatePresence>
          {store.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700"
            >
              {store.error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleCalculate}
            disabled={store.isLoading}
            className="btn-accent flex-1 justify-center"
          >
            {store.isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Calculating…
              </span>
            ) : (
              <>
                <Calculator size={15} />
                Calculate
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary px-4"
            title="Reset all"
          >
            <RotateCcw size={14} />
          </button>
          {store.result && (
            <>
              <button
                type="button"
                onClick={() => navigate('/statistics')}
                className="btn-secondary px-4"
                title="View statistics"
              >
                <BarChart3 size={14} />
              </button>
              {/* Save button disabled (DB disabled)
              <button
                type="button"
                onClick={() => setShowSave(true)}
                className="btn-secondary px-4"
                title="Save scenario"
              >
                <Save size={14} />
              </button>
              */}
            </>
          )}
        </div>

        {/* Save dialog disabled (DB disabled) */}
      </div>

      {/* ── Right column: summary result ─────────────────────────────────── */}
      <div className="xl:sticky xl:top-20">
        {store.result ? (
          <SummaryPanel />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center mb-4">
              <Calculator size={22} className="text-ink-400" />
            </div>
            <p className="font-display font-600 text-ink-700 text-lg">Configure your loan</p>
            <p className="text-sm text-ink-400 mt-1 max-w-xs">
              Fill in the loan details above and click Calculate to see your EMI breakdown.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
