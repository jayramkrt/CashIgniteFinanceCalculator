import { Link } from 'react-router-dom'
import {
  Calculator, TrendingUp, PiggyBank, GitCompare,
  ArrowRight, CheckCircle,
  Banknote, RefreshCw, Clock, Landmark, Receipt, BarChart2, ArrowUpRight,
} from 'lucide-react'

// ── Advanced features of the EMI calculator ────────────────────────────────
const EMI_FEATURES = [
  {
    icon: Banknote,
    title: 'Prepayments',
    desc: 'One-time or recurring lump-sum payments — choose to reduce your term or lower your EMI.',
    color: 'bg-sage-50 text-sage-600',
  },
  {
    icon: TrendingUp,
    title: 'Variable Interest Rates',
    desc: 'Schedule rate resets at any month — see exactly how a repo rate hike changes your total cost.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Clock,
    title: 'Moratorium Period',
    desc: 'Model an interest-only or fully deferred moratorium at the start of your loan.',
    color: 'bg-sage-50 text-sage-600',
  },
  {
    icon: Landmark,
    title: 'Interest Saver Account',
    desc: 'Offset your savings balance against the principal to reduce the interest you pay each month.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Receipt,
    title: 'Fees & Charges',
    desc: 'Factor in processing fees, insurance premiums, and other one-time or recurring charges.',
    color: 'bg-sage-50 text-sage-600',
  },
  {
    icon: BarChart2,
    title: 'Full Amortization Schedule',
    desc: 'Month-by-month breakdown with interactive charts — principal paid, interest, and outstanding balance.',
    color: 'bg-amber-50 text-amber-600',
  },
]

// ── Available tools (besides EMI calculator) ────────────────────────────────
const AVAILABLE_TOOLS = [
  {
    icon: Receipt,
    to: '/tax',
    title: 'Income Tax Planner',
    desc: 'Compare old vs new regime side-by-side with full tax breakdown and optimal regime recommendation.',
    color: 'bg-sage-50 text-sage-600',
  },
]

// ── Upcoming tools ──────────────────────────────────────────────────────────
const COMING_SOON = [
  {
    icon: PiggyBank,
    title: 'SIP & Investment Planner',
    desc: 'See how regular investments compound into long-term wealth.',
  },
  {
    icon: GitCompare,
    title: 'Loan Comparison Tool',
    desc: 'Compare offers side by side — EMI, total interest, effective cost.',
  },
]

// ── Why us ──────────────────────────────────────────────────────────────────
const WHY = [
  { icon: CheckCircle, text: 'Completely free — no login, no ads' },
  { icon: RefreshCw,   text: 'Live EMI preview as you move the sliders' },
  { icon: CheckCircle, text: 'Reducing-balance method — bank-accurate results' },
  { icon: CheckCircle, text: 'Works on mobile and desktop' },
  { icon: CheckCircle, text: 'No data stored — your numbers stay private' },
  { icon: CheckCircle, text: 'More tools added regularly' },
]

// ───────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  document.title = 'CashIgnite — Free Financial Calculators for Indians'

  return (
    <div className="space-y-10 sm:space-y-20 pb-8 sm:pb-16">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="text-center pt-6 sm:pt-12 pb-4 space-y-5 sm:space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-50 border border-sage-100 text-sage-600 text-xs font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-500 animate-pulse" />
          Free · No login required · Always accurate
        </div>

        <h1 className="text-4xl sm:text-5xl font-display font-700 text-ink-900 tracking-tight leading-tight max-w-2xl mx-auto">
          Smart Financial Tools<br className="hidden sm:block" />
          for Every Indian
        </h1>

        <p className="text-lg text-ink-500 max-w-xl mx-auto leading-relaxed">
          Calculate EMIs, plan your taxes, and make informed financial decisions —
          all in one place. Free, private, and always accurate.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/emi-calculator" className="btn-primary inline-flex items-center gap-2">
            <Calculator size={15} />
            Try EMI Calculator
            <ArrowRight size={13} />
          </Link>
          <a href="#tools" className="btn-secondary inline-flex items-center gap-2">
            Explore All Tools
          </a>
        </div>
      </section>

      {/* ── Featured: EMI Calculator ──────────────────────────────────────── */}
      <section id="tools" className="space-y-4">
        <div className="card p-4 sm:p-7 lg:p-9 space-y-5 sm:space-y-7">

          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-ink-900 flex items-center justify-center flex-shrink-0">
                  <Calculator size={17} className="text-white" />
                </div>
                <span className="badge-green text-xs px-2.5 py-0.5 rounded-full font-medium">Available now</span>
              </div>
              <h2 className="text-xl font-display font-700 text-ink-900 tracking-tight">
                Home Loan EMI Calculator
              </h2>
              <p className="text-sm text-ink-500 max-w-lg leading-relaxed">
                India's most complete home loan calculator. Go beyond the basic EMI — model
                prepayments, rate hikes, and hidden fees to know your loan's true cost before you sign.
              </p>
            </div>
            <Link
              to="/emi-calculator"
              className="btn-primary inline-flex items-center gap-1.5 shrink-0 self-start"
            >
              Open Calculator
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {EMI_FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex gap-3 p-4 rounded-xl bg-[var(--surface-2)] border border-ink-100">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon size={15} />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-sm font-display font-600 text-ink-800">{title}</p>
                  <p className="text-xs text-ink-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Other available tools ─────────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-display font-700 text-ink-900 tracking-tight">More tools</h2>
          <div className="flex-1 h-px bg-ink-100" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AVAILABLE_TOOLS.map(({ icon: Icon, to, title, desc, color }) => (
            <Link key={title} to={to} className="card p-5 space-y-3 hover:shadow-card-lg transition-shadow duration-200 group">
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={17} />
                </div>
                <span className="badge badge-green text-[10px]">Available now</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-display font-600 text-ink-800 group-hover:text-ink-900 flex items-center gap-1">
                  {title}
                  <ArrowUpRight size={12} className="text-ink-300 group-hover:text-sage-500 transition-colors" />
                </h3>
                <p className="text-xs text-ink-500 leading-relaxed">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Coming soon tools ─────────────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-display font-700 text-ink-900 tracking-tight">Coming soon</h2>
          <div className="flex-1 h-px bg-ink-100" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {COMING_SOON.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5 space-y-3 opacity-50">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-ink-50 flex items-center justify-center">
                  <Icon size={17} className="text-ink-400" />
                </div>
                <span className="text-[10px] font-medium bg-ink-100 text-ink-400 px-2 py-0.5 rounded-full">
                  Coming soon
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-display font-600 text-ink-700">{title}</h3>
                <p className="text-xs text-ink-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why CashIgnite ────────────────────────────────────────────────── */}
      <section className="card p-7 sm:p-9">
        <div className="grid sm:grid-cols-2 gap-8 items-start">
          <div className="space-y-3">
            <h2 className="text-xl font-display font-700 text-ink-900 tracking-tight">
              Why CashIgnite?
            </h2>
            <p className="text-sm text-ink-500 leading-relaxed">
              Financial clarity shouldn't cost anything. CashIgnite gives you professional-grade
              calculators that are fast, accurate, and completely free — with no hidden catches.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-2.5">
            {WHY.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm text-ink-700">
                <Icon size={14} className="text-sage-500 flex-shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── SEO content ───────────────────────────────────────────────────── */}
      <section className="space-y-4 border-t border-ink-100 pt-10 text-ink-500 text-sm leading-relaxed">
        <h2 className="text-base font-display font-600 text-ink-800">About CashIgnite</h2>
        <p>
          CashIgnite is a free online financial calculator suite built for Indian users. Whether
          you're planning to take a home loan, comparing EMI options across lenders, or estimating
          your income tax liability under the old or new regime, CashIgnite provides instant,
          accurate results — no sign-up required.
        </p>
        <p>
          Our{' '}
          <Link to="/emi-calculator" className="text-sage-600 hover:text-sage-700 underline underline-offset-2">
            Home Loan EMI Calculator
          </Link>{' '}
          supports advanced features like prepayment impact analysis, variable interest rate
          simulation, moratorium periods, interest saver account offsets, and processing fee
          inclusion — giving you a complete picture of your loan's true cost. An interactive
          amortization schedule shows exactly how each payment is split between principal and
          interest across the full loan tenure.
        </p>
        <p>
          More tools — including an Income Tax Calculator, SIP planner, and loan comparison tool
          — are in active development. All calculators on CashIgnite are free to use, run entirely
          in your browser, and never store your financial data on our servers.
        </p>
      </section>

    </div>
  )
}
