import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calculator, RotateCcw, BarChart3, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
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

// ── Static info content ────────────────────────────────────────────────────

const HOW_IT_HELPS = [
  {
    title: 'Saves time & eliminates errors',
    body: 'Manual EMI calculations involve complex exponent arithmetic. The calculator delivers the precise number instantly — no spreadsheet required.',
  },
  {
    title: 'Critical for financial planning',
    body: 'Knowing your exact EMI before you apply lets you check affordability, compare lenders, and plan your monthly budget without surprises.',
  },
  {
    title: 'Models the full cost of your loan',
    body: 'Beyond the basic EMI, CashIgnite shows total interest payable, the impact of prepayments, and how a rate hike changes your outgo — all in one place.',
  },
  {
    title: 'Free and unlimited',
    body: 'Run as many scenarios as you like — different loan amounts, tenures, or interest rates — to find the combination that works best for you.',
  },
]

const FAQS = [
  {
    q: 'What is EMI?',
    a: 'EMI stands for Equated Monthly Instalment. It is a fixed amount you pay to your lender every month on a set date until the loan is fully repaid. Each EMI has two components — a principal portion and an interest portion.',
  },
  {
    q: 'How is home loan EMI calculated?',
    a: 'EMI is calculated using the reducing-balance formula: E = [P × R × (1+R)^N] / [(1+R)^N − 1], where P is the loan amount, R is the monthly interest rate (annual rate ÷ 12 ÷ 100), and N is the tenure in months.',
  },
  {
    q: 'Does making a prepayment reduce my EMI or my tenure?',
    a: 'It depends on what you choose. A prepayment can either reduce your remaining tenure (keeping the same EMI) or reduce your EMI (keeping the same tenure). Reducing tenure saves more total interest. Use the Prepayments module above to compare both options.',
  },
  {
    q: 'What happens if the interest rate changes during my loan?',
    a: 'On a floating-rate home loan, your bank can revise the rate periodically. You can model future rate changes using the Variable Interest Rate module — set the new rate and the month it kicks in, and the calculator will show the revised EMI and total cost.',
  },
  {
    q: 'What is a moratorium period?',
    a: 'A moratorium is a period at the start of a loan during which you either pay only interest (no principal repayment) or defer all payments (interest gets added to the principal). It is common for under-construction properties. Use the Moratorium module to see how it affects your total interest.',
  },
  {
    q: 'What is an interest saver account?',
    a: 'An interest saver (or offset) account is a savings account linked to your home loan. The balance in the account is offset against your outstanding principal when calculating interest — so higher savings = lower interest each month. Enable the Interest Saver module to model this.',
  },
  {
    q: 'Is the EMI amount fixed throughout the loan?',
    a: 'On a fixed-rate loan, yes. On a floating-rate loan, the EMI changes whenever the lender revises the rate. You can also voluntarily change your EMI by making a prepayment and choosing the reduce-EMI option.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-ink-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-ink-50 transition-colors"
      >
        <span className="text-sm font-display font-600 text-ink-800">{q}</span>
        {open
          ? <ChevronUp size={15} className="text-ink-400 flex-shrink-0" />
          : <ChevronDown size={15} className="text-ink-400 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-ink-500 leading-relaxed border-t border-ink-100 pt-3">
          {a}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
export default function CalculatorPage() {
  document.title = 'Home Loan EMI Calculator — CashIgnite'

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
    <div className="space-y-14">
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
    </div>{/* end calculator grid */}

    {/* ── Informational content (SEO) ─────────────────────────────────── */}
    <div className="space-y-12 border-t border-ink-100 pt-10 max-w-3xl">

      {/* Intro */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-700 text-ink-900 tracking-tight">
          Home Loan EMI Calculator — Know Your EMI Before You Apply
        </h2>
        <p className="text-sm text-ink-500 leading-relaxed">
          With property prices across Indian metros continuing to rise, most home buyers rely on
          a housing loan to fund their purchase. Before approaching a lender, the single most
          important number to know is your Equated Monthly Instalment (EMI) — the fixed amount
          you will pay every month for the full tenure of the loan.
        </p>
        <p className="text-sm text-ink-500 leading-relaxed">
          CashIgnite's home loan EMI calculator goes beyond the basic number. It lets you model
          prepayments, future interest rate changes, moratorium periods, interest saver accounts,
          and processing fees — so you get a complete picture of what your loan will actually cost.
        </p>
      </section>

      {/* How it helps */}
      <section className="space-y-5">
        <h2 className="text-xl font-display font-700 text-ink-900 tracking-tight">
          How does the EMI calculator help you?
        </h2>
        <p className="text-sm text-ink-500 leading-relaxed">
          An EMI has two components — a principal component and an interest component. At the
          start of your tenure the interest portion dominates; as months pass, the principal
          portion grows. Understanding this split is key to planning prepayments effectively.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {HOW_IT_HELPS.map(({ title, body }) => (
            <div key={title} className="flex gap-3 p-4 rounded-xl bg-[var(--surface-2)] border border-ink-100">
              <CheckCircle size={15} className="text-sage-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-display font-600 text-ink-800">{title}</p>
                <p className="text-xs text-ink-500 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Formula */}
      <section className="space-y-5">
        <h2 className="text-xl font-display font-700 text-ink-900 tracking-tight">
          The EMI formula
        </h2>
        <p className="text-sm text-ink-500 leading-relaxed">
          All EMI calculators use the standard reducing-balance formula:
        </p>

        {/* Formula display */}
        <div className="rounded-xl bg-ink-900 text-white px-6 py-5 font-mono text-base sm:text-lg text-center tracking-wide">
          E = [P × R × (1+R)<sup className="text-xs">N</sup>] / [(1+R)<sup className="text-xs">N</sup> − 1]
        </div>

        {/* Variable table */}
        <div className="rounded-xl border border-ink-100 overflow-hidden text-sm">
          {[
            ['E', 'EMI amount', 'The fixed monthly payment you make to the lender'],
            ['P', 'Principal amount', 'The loan amount sanctioned by the bank'],
            ['R', 'Monthly interest rate', 'Annual interest rate ÷ 12 ÷ 100'],
            ['N', 'Loan tenure', 'Total number of monthly instalments'],
          ].map(([sym, name, desc], i) => (
            <div key={sym} className={`grid grid-cols-[2rem_1fr_2fr] gap-4 px-5 py-3 ${i % 2 === 0 ? 'bg-[var(--surface-2)]' : 'bg-white'}`}>
              <span className="font-mono font-700 text-ink-900">{sym}</span>
              <span className="font-600 text-ink-800">{name}</span>
              <span className="text-ink-500">{desc}</span>
            </div>
          ))}
        </div>

        {/* Worked example */}
        <div className="rounded-xl border border-sage-200 bg-sage-50 px-5 py-4 space-y-2">
          <p className="text-sm font-display font-600 text-ink-800">Worked example</p>
          <p className="text-sm text-ink-600 leading-relaxed">
            Loan amount <strong>₹50 lakh</strong> · Interest rate <strong>8.5% p.a.</strong> ·
            Tenure <strong>20 years (240 months)</strong>
          </p>
          <p className="text-sm text-ink-600 leading-relaxed">
            Monthly rate R = 8.5 ÷ 12 ÷ 100 = <strong>0.007083</strong>
          </p>
          <p className="text-sm text-ink-600 leading-relaxed">
            EMI = [50,00,000 × 0.007083 × (1.007083)²⁴⁰] / [(1.007083)²⁴⁰ − 1]
            = <strong className="text-sage-700">≈ ₹43,391 / month</strong>
          </p>
          <p className="text-xs text-ink-400 mt-1">
            Total interest paid over 20 years ≈ ₹54.14 lakh — more than the principal itself.
            This is why prepayments in early years make such a large difference.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-700 text-ink-900 tracking-tight">
          Frequently asked questions
        </h2>
        <div className="space-y-2">
          {FAQS.map(faq => <FaqItem key={faq.q} {...faq} />)}
        </div>
      </section>

    </div>
    </div>
  )
}
