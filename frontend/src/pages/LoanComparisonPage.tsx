import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitCompare, Plus, X, RotateCcw, CheckCircle, ChevronDown, ChevronUp, TrendingDown, Settings2 } from 'lucide-react'
import { useComparisonStore, type ScenarioInput } from '@/stores/comparisonStore'
import { NumberInput } from '@/components/ui'
import {
  ScenarioPrepaymentModule,
  ScenarioVariableRateModule,
  ScenarioMoratoriumModule,
  ScenarioFeesModule,
} from '@/components/modules/ScenarioFeatureModules'
import SeoHead from '@/components/SeoHead'
import { formatRupees, formatTenure, formatPct, cn } from '@/utils'
import type { CalculationResultDTO } from '@/types'

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'How do I compare home loans from different banks?',
    a: 'Enter the loan amount, interest rate, and tenure for each bank into the scenario cards above and click Compare. The tool calculates the full amortization for each and shows you a side-by-side breakdown of EMI, total interest, and total payment.',
  },
  {
    q: 'What is the impact of a 0.5% difference in interest rate on a ₹50 lakh loan?',
    a: 'On a ₹50 lakh loan over 20 years, a 0.5% rate difference (e.g., 8.5% vs 9.0%) changes the EMI by about ₹1,700 and the total interest by over ₹4 lakh. Use this tool to see the exact impact for your loan amount and tenure.',
  },
  {
    q: 'Should I choose a lower EMI or a shorter tenure?',
    a: 'A shorter tenure means higher EMI but significantly lower total interest paid. A lower EMI (longer tenure) gives you cash flow flexibility but costs more over time. Compare both scenarios here to see the exact trade-off in rupees.',
  },
  {
    q: 'How does loan tenure affect total interest paid?',
    a: 'Total interest grows non-linearly with tenure. Extending a 20-year loan to 25 years might reduce EMI by ₹3,000 but add ₹10–15 lakh in total interest. Always compare the total payment column, not just the EMI.',
  },
  {
    q: 'What is the difference between fixed and floating interest rates?',
    a: 'A fixed rate stays constant for the entire tenure — your EMI never changes. A floating rate (linked to repo rate) changes with RBI policy. Most Indian home loans are floating. Use the Variable Interest Rate module in the EMI Calculator to model future rate changes.',
  },
  {
    q: 'Which bank offers the best home loan rate in India 2025?',
    a: 'Rates change frequently. As of 2025, leading banks like SBI, HDFC, and ICICI offer rates starting around 8.35–9.0% p.a. for salaried borrowers. Always compare the effective cost (total payment), not just the headline rate, since processing fees vary.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-ink-100 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-ink-50 transition-colors">
        <span className="text-sm font-semibold text-ink-800">{q}</span>
        {open ? <ChevronUp size={15} className="text-ink-400 flex-shrink-0" /> : <ChevronDown size={15} className="text-ink-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pt-3 pb-4 text-sm text-ink-500 leading-relaxed border-t border-ink-100">{a}</div>
      )}
    </div>
  )
}

// ── Scenario input card ───────────────────────────────────────────────────────

function ScenarioCard({ scenario, index, canRemove }: {
  scenario: ScenarioInput
  index: number
  canRemove: boolean
}) {
  const { updateScenario, removeScenario } = useComparisonStore()
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const colors = ['border-sage-300 bg-sage-50/30', 'border-amber-300 bg-amber-50/30', 'border-rose-300 bg-rose-50/30']

  const hasAdvanced = scenario.prepaymentEnabled || scenario.variableRateEnabled
    || scenario.moratoriumEnabled || scenario.feesEnabled

  const u = (partial: Partial<ScenarioInput>) => updateScenario(scenario.id, partial)

  return (
    <div className={cn('card border-2 overflow-hidden relative', colors[index])}>
      {/* Basic inputs */}
      <div className="p-5 space-y-4">
        {canRemove && (
          <button type="button" onClick={() => removeScenario(scenario.id)}
            className="absolute top-3 right-3 p-1 rounded-lg text-ink-300 hover:text-rose-500 hover:bg-rose-50 transition-colors">
            <X size={14} />
          </button>
        )}

        <div>
          <label className="label">Label</label>
          <input type="text" value={scenario.label}
            onChange={e => u({ label: e.target.value })}
            className="input-field text-sm font-semibold" maxLength={20} />
        </div>

        <NumberInput label="Loan amount (₹)" prefix="₹"
          value={scenario.loanAmount} onChange={v => u({ loanAmount: v })}
          min={100000} max={100000000} step={50000} />
        <NumberInput label="Annual interest rate" suffix="%"
          value={scenario.annualInterestRate} onChange={v => u({ annualInterestRate: v })}
          min={0.1} max={50} step={0.05} />
        <div className="flex gap-2">
          <NumberInput label="Tenure (months)" suffix="mo"
            value={scenario.tenureMonths} onChange={v => u({ tenureMonths: v })}
            min={1} max={480} className="flex-1" />
          <NumberInput label="Or (years)" suffix="yr"
            value={Math.round(scenario.tenureMonths / 12)}
            onChange={v => u({ tenureMonths: Math.round(v) * 12 })}
            min={1} max={40} className="flex-1" />
        </div>

        {/* Advanced toggle button */}
        <button type="button" onClick={() => setAdvancedOpen(o => !o)}
          className={cn(
            'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border',
            hasAdvanced
              ? 'border-sage-200 bg-sage-50 text-sage-700'
              : 'border-ink-100 text-ink-400 hover:text-ink-700 hover:bg-ink-50'
          )}>
          <span className="flex items-center gap-1.5">
            <Settings2 size={12} />
            Advanced features
            {hasAdvanced && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-sage-100 text-sage-700 text-[10px] font-semibold">
                {[scenario.prepaymentEnabled, scenario.variableRateEnabled, scenario.moratoriumEnabled, scenario.feesEnabled].filter(Boolean).length} on
              </span>
            )}
          </span>
          {advancedOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Advanced features section */}
      <AnimatePresence>
        {advancedOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-ink-100"
          >
            <div className="p-3 space-y-2 bg-ink-50/40">
              <p className="text-[10px] font-medium text-ink-400 uppercase tracking-widest px-1 pt-1">Advanced features</p>
              <ScenarioPrepaymentModule
                enabled={scenario.prepaymentEnabled}
                entries={scenario.prepayments}
                loanStartDate={scenario.firstEmiDate}
                onToggle={() => u({ prepaymentEnabled: !scenario.prepaymentEnabled })}
                onUpdate={prepayments => u({ prepayments })}
              />
              <ScenarioVariableRateModule
                enabled={scenario.variableRateEnabled}
                entries={scenario.variableRates}
                loanStartDate={scenario.firstEmiDate}
                onToggle={() => u({ variableRateEnabled: !scenario.variableRateEnabled })}
                onUpdate={variableRates => u({ variableRates })}
              />
              <ScenarioMoratoriumModule
                enabled={scenario.moratoriumEnabled}
                config={scenario.moratorium}
                onToggle={() => u({ moratoriumEnabled: !scenario.moratoriumEnabled })}
                onUpdate={moratorium => u({ moratorium })}
              />
              <ScenarioFeesModule
                enabled={scenario.feesEnabled}
                entries={scenario.fees}
                loanStartDate={scenario.firstEmiDate}
                onToggle={() => u({ feesEnabled: !scenario.feesEnabled })}
                onUpdate={fees => u({ fees })}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Comparison result table ───────────────────────────────────────────────────

function ComparisonTable({ scenarios, results }: {
  scenarios: ScenarioInput[]
  results: (CalculationResultDTO | null)[]
}) {
  const summaries = results.map(r => r?.summary ?? null)

  type NumGetter = (s: NonNullable<typeof summaries[0]>) => number
  const best = (getter: NumGetter, lower = true): number => {
    const vals = summaries.map(s => s ? getter(s) : Infinity)
    return lower ? Math.min(...vals) : Math.max(...vals)
  }

  const colors = ['text-sage-600 bg-sage-50 border-sage-200', 'text-amber-600 bg-amber-50 border-amber-200', 'text-rose-600 bg-rose-50 border-rose-200']

  const rows: { label: string; getter: NumGetter; format: (v: number) => string; lowerIsBetter: boolean }[] = [
    { label: 'Monthly EMI',      getter: s => s.emiAmount,             format: v => formatRupees(v, true), lowerIsBetter: true },
    { label: 'Total interest',   getter: s => s.totalInterestPayable,  format: v => formatRupees(v, true), lowerIsBetter: true },
    { label: 'Total payment',    getter: s => s.totalPayment,          format: v => formatRupees(v, true), lowerIsBetter: true },
    { label: 'Effective rate',   getter: s => s.effectiveAnnualRate,   format: v => formatPct(v),          lowerIsBetter: true },
    { label: 'Actual tenure',    getter: s => s.actualTenureMonths,    format: v => formatTenure(v),       lowerIsBetter: true },
  ]

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink-50 border-b border-ink-100">
              <th className="text-left py-3 px-4 text-xs font-medium text-ink-400 uppercase tracking-wide w-36">Metric</th>
              {scenarios.map((s, i) => (
                <th key={s.id} className="py-3 px-4 text-center">
                  <span className={cn('inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border', colors[i])}>
                    {s.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const bestVal = best(row.getter, row.lowerIsBetter)
              return (
                <tr key={row.label} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                  <td className="py-3 px-4 text-xs text-ink-400 font-medium uppercase tracking-wide">{row.label}</td>
                  {summaries.map((s, i) => {
                    const val = s ? row.getter(s) : null
                    const isBest = val !== null && val === bestVal
                    return (
                      <td key={i} className="py-3 px-4 text-center">
                        {val !== null ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={cn('font-semibold tabular-nums', isBest ? 'text-sage-700' : 'text-ink-800')}>
                              {row.format(val)}
                            </span>
                            {isBest && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-sage-600 bg-sage-50 border border-sage-100 px-1.5 py-0.5 rounded-md">
                                <CheckCircle size={9} />best
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-ink-300">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const HOW_IT_HELPS = [
  { icon: TrendingDown, title: 'Compare total cost, not just EMI', body: 'A lower EMI often hides a much higher total interest. This tool shows you the complete picture.' },
  { icon: CheckCircle,  title: 'See the impact of small rate differences', body: 'Even 0.25% difference in rate can mean lakhs in extra interest over a 20-year loan.' },
  { icon: GitCompare,   title: 'Negotiate better with banks using data', body: 'Walk into any bank knowing exactly what competing offers cost. Use numbers to negotiate.' },
  { icon: TrendingDown, title: 'Plan prepayments to reduce interest', body: 'After comparing, use the EMI Calculator to model how prepayments can further cut your costs.' },
]

export default function LoanComparisonPage() {
  const { scenarios, results, isLoading, error, addScenario, compare, reset } = useComparisonStore()
  const hasResults = results.some(r => r !== null)

  return (
    <>
      <SeoHead
        title="Loan Comparison Calculator — Compare Home Loans Side by Side | CashIgnite"
        description="Compare up to 3 home loan offers side by side. See EMI, total interest, and total payment for different banks and rates. Free, instant, no login required."
        canonical="https://cashignite.in/loan-comparison"
        faqs={FAQS.map(f => ({ q: f.q, a: f.a }))}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-ink-900 flex items-center justify-center">
                <GitCompare size={17} className="text-white" />
              </div>
              <h1 className="font-semibold text-2xl text-ink-900 tracking-tight">Loan Comparison</h1>
            </div>
            <p className="text-sm text-ink-400">Compare up to 3 loan scenarios side by side</p>
          </div>
          <button type="button" onClick={reset} className="btn-secondary gap-1.5">
            <RotateCcw size={13} /> Reset
          </button>
        </div>

        {/* Scenario cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((s, i) => (
            <ScenarioCard key={s.id} scenario={s} index={i} canRemove={scenarios.length > 2} />
          ))}
          {scenarios.length < 3 && (
            <button type="button" onClick={addScenario}
              className="card border-dashed border-ink-200 flex flex-col items-center justify-center gap-3 py-12 text-ink-400 hover:text-ink-700 hover:border-ink-300 hover:bg-ink-50 transition-all cursor-pointer min-h-[200px]">
              <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center">
                <Plus size={18} />
              </div>
              <span className="text-sm font-medium">Add scenario</span>
            </button>
          )}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compare button */}
        <button type="button" onClick={compare} disabled={isLoading}
          className="btn-accent w-full sm:w-auto justify-center px-10">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Comparing…
            </span>
          ) : (
            <><GitCompare size={15} />Compare loans</>
          )}
        </button>

        {/* Results table */}
        <AnimatePresence>
          {hasResults && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <ComparisonTable scenarios={scenarios} results={results} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEO content */}
        <div className="space-y-10 border-t border-ink-100 pt-10 max-w-3xl">

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-ink-900 tracking-tight">
              Loan Comparison Calculator — Find the Best Home Loan for You
            </h2>
            <p className="text-sm text-ink-500 leading-relaxed">
              With dozens of banks and NBFCs offering home loans in India, even a 0.25% difference in interest rate
              can translate to lakhs of rupees over the tenure of a loan. Most borrowers compare only the EMI — but
              the true cost of a loan is the total interest paid over its lifetime.
            </p>
            <p className="text-sm text-ink-500 leading-relaxed">
              CashIgnite's loan comparison tool lets you enter up to three loan offers side by side and instantly
              see the full financial impact of each — EMI, total interest, total payment, and effective rate.
              Use it before signing any loan agreement to ensure you're getting the best deal.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-ink-900 tracking-tight">How does this help you?</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {HOW_IT_HELPS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-3 p-4 rounded-xl bg-[var(--surface-2)] border border-ink-100">
                  <Icon size={15} className="text-sage-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-ink-800">{title}</p>
                    <p className="text-xs text-ink-500 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-ink-900 tracking-tight">Frequently asked questions</h2>
            <div className="space-y-2">
              {FAQS.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
            </div>
          </section>

        </div>
      </motion.div>
    </>
  )
}
