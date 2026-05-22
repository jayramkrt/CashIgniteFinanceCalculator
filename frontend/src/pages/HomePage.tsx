import { Link } from 'react-router-dom'
import {
  Calculator, TrendingUp, PiggyBank, GitCompare,
  ArrowRight, CheckCircle, Shield, Zap,
  Banknote, RefreshCw, Clock, Landmark, Receipt, BarChart2,
  Home, BarChart3, Globe, Star,
} from 'lucide-react'
import SeoHead from '@/components/SeoHead'

// ── All tools ─────────────────────────────────────────────────────────────────
const ALL_TOOLS = [
  {
    to: '/emi-calculator',
    icon: Calculator,
    title: 'Home Loan EMI',
    desc: 'Calculate your monthly home loan EMI instantly',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    arrowColor: '#7C3AED',
    arrowBg: 'rgba(124,58,237,0.08)',
  },
  {
    to: '/loan-comparison',
    icon: GitCompare,
    title: 'Loan Comparison',
    desc: 'Compare loans and find the best interest rates',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    arrowColor: '#059669',
    arrowBg: 'rgba(5,150,105,0.08)',
  },
  {
    to: '/rent-vs-buy',
    icon: Home,
    title: 'Rent vs Buy',
    desc: "Find out what's smarter for your future",
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    arrowColor: '#D97706',
    arrowBg: 'rgba(217,119,6,0.08)',
  },
  {
    to: '/tax',
    icon: Receipt,
    title: 'Income Tax Planner',
    desc: 'Plan your taxes and save more legally',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    arrowColor: '#2563EB',
    arrowBg: 'rgba(37,99,235,0.08)',
  },
  {
    to: '/statistics',
    icon: BarChart3,
    title: 'Statistics',
    desc: 'Explore financial insights and key trends',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    arrowColor: '#9333EA',
    arrowBg: 'rgba(147,51,234,0.08)',
  },
]

// ── EMI features ──────────────────────────────────────────────────────────────
const EMI_FEATURES = [
  { icon: Banknote,   title: 'Prepayments',            desc: 'One-time or recurring lump-sum payments — reduce term or lower your EMI.',        color: 'bg-violet-50 text-violet-600' },
  { icon: TrendingUp, title: 'Variable Interest Rates', desc: 'Schedule rate resets at any month — see how a repo hike changes your total cost.', color: 'bg-amber-50 text-amber-600' },
  { icon: Clock,      title: 'Moratorium Period',       desc: 'Model an interest-only or fully deferred moratorium at the start of your loan.',   color: 'bg-violet-50 text-violet-600' },
  { icon: Landmark,   title: 'Interest Saver Account',  desc: 'Offset savings balance against principal to reduce the interest each month.',      color: 'bg-amber-50 text-amber-600' },
  { icon: Receipt,    title: 'Fees & Charges',          desc: 'Factor in processing fees, insurance, and other recurring charges.',               color: 'bg-violet-50 text-violet-600' },
  { icon: BarChart2,  title: 'Full Amortization',       desc: 'Month-by-month breakdown with interactive charts — principal, interest, balance.',  color: 'bg-amber-50 text-amber-600' },
]

// ── Coming soon ───────────────────────────────────────────────────────────────
const COMING_SOON = [
  { icon: PiggyBank, title: 'SIP & Investment Planner', desc: 'See how regular investments compound into long-term wealth.' },
]

// ── Trust items ───────────────────────────────────────────────────────────────
const TRUST = [
  { icon: CheckCircle, text: 'Completely free — no login, no ads' },
  { icon: RefreshCw,   text: 'Live EMI preview as you move the sliders' },
  { icon: Shield,      text: 'Reducing-balance method — bank-accurate results' },
  { icon: CheckCircle, text: 'Works on mobile and desktop' },
  { icon: Zap,         text: 'No data stored — your numbers stay private' },
  { icon: CheckCircle, text: 'More tools added regularly' },
]

// ── Hero EMI card ─────────────────────────────────────────────────────────────
function HeroEmiCard() {
  // Gauge params
  const r = 64, cx = 84, cy = 82
  const arcLen = Math.PI * r
  const filled = arcLen * 0.73

  return (
    <div className="relative w-full">
      <div className="bg-white rounded-3xl p-7 border border-ink-100 space-y-5"
        style={{ boxShadow: '0 8px 40px rgba(124,58,237,0.14), 0 2px 8px rgba(0,0,0,0.06)' }}>

        {/* ── Top row: EMI info (left) + gauge (right) ── */}
        <div className="flex items-start justify-between gap-4">
          {/* Left: title + amount + badge */}
          <div>
            <p className="text-xs text-ink-400 mb-1">Home Loan EMI</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-[34px] font-bold text-ink-900 tracking-tight leading-none">₹ 48,219</p>
            </div>
            <p className="text-xs text-ink-400 mt-0.5">/ month</p>
            <div className="inline-flex items-center gap-1 mt-2.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
              <svg width="9" height="9" viewBox="0 0 10 10">
                <polyline points="2,7 5,3 8,7" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[10px] font-medium text-emerald-700">12.5% vs last year</span>
            </div>
          </div>

          {/* Right: gauge */}
          <div className="flex-shrink-0">
            <svg viewBox="0 0 168 92" width="160" height="92">
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7C3AED"/>
                  <stop offset="100%" stopColor="#EC4899"/>
                </linearGradient>
              </defs>
              {/* Track */}
              <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none" stroke="#EDE9FE" strokeWidth="12" strokeLinecap="round"/>
              {/* Fill */}
              <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${filled} ${arcLen}`}/>
              {/* Center circle */}
              <circle cx={cx} cy={cy} r="27" fill="white" stroke="#F5F3FF" strokeWidth="1.5"/>
              {/* House icon */}
              <g transform={`translate(${cx - 11}, ${cy - 12})`}>
                <path d="M11,0 L22,10 L20,10 L20,22 L14,22 L14,15 L8,15 L8,22 L2,22 L2,10 L0,10 Z"
                  fill="url(#gaugeGrad)"/>
              </g>
            </svg>
          </div>
        </div>

        {/* ── Bottom row: two sub-cards ── */}
        <div className="grid grid-cols-2 gap-3">

          {/* Break-up sub-card */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: '#F8F7FF' }}>
            <p className="text-xs font-semibold text-ink-500">Break-up</p>
            <div className="space-y-2">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-500"/>
                  <span className="text-[11px] text-ink-500">Principal</span>
                </div>
                <p className="text-xs font-semibold text-ink-800 pl-4">₹ 34,21,345</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-400"/>
                  <span className="text-[11px] text-ink-500">Interest</span>
                </div>
                <p className="text-xs font-semibold text-ink-800 pl-4">₹ 15,78,655</p>
              </div>
            </div>
          </div>

          {/* Tenure Progress sub-card */}
          <div className="rounded-2xl p-4 space-y-2" style={{ background: '#F8F7FF' }}>
            <p className="text-[11px] font-semibold text-ink-500">Tenure Progress</p>
            <p className="text-2xl font-bold text-ink-900 leading-none">35%</p>
            <div className="h-1.5 bg-violet-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '35%', background: 'linear-gradient(90deg, #7C3AED, #EC4899)' }}/>
            </div>
            <p className="text-[10px] text-ink-400">8 yrs / 22 yrs</p>
          </div>
        </div>
      </div>

      {/* Accuracy badge */}
      <div className="absolute -bottom-4 -right-4 rounded-2xl px-4 py-2.5 text-center"
        style={{ background: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)', boxShadow: '0 4px 20px rgba(67,56,202,0.35)' }}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <Shield size={11} className="text-white opacity-80"/>
          <span className="text-[10px] font-medium text-white opacity-80">Bank-Accurate</span>
        </div>
        <p className="text-sm font-bold text-white leading-none">RBI Standard</p>
        <p className="text-[10px] text-white opacity-75 mt-0.5">Formula</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <SeoHead
        title="CashIgnite — Free Financial Calculators for Indians"
        description="Free financial calculators for Indians — home loan EMI, loan comparison, rent vs buy, income tax. Accurate, instant, no login required."
        canonical="https://cashignite.in/"
      />

      <div className="space-y-10 pb-8">

        {/* Top-right badge row — sits above the hero grid, no overlap */}
        <div className="hidden lg:flex justify-end -mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(124,58,237,0.07)', color: '#6D28D9', border: '1px solid rgba(124,58,237,0.15)' }}>
            <Shield size={11}/>
            100% Free • Private • Accurate
          </div>
        </div>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center pt-0 overflow-visible">

          {/* Gradient blob */}
          <div className="absolute -top-24 -right-16 w-[580px] h-[480px] pointer-events-none hidden lg:block"
            style={{
              background: 'radial-gradient(ellipse at 60% 30%, rgba(167,139,250,0.3) 0%, rgba(236,72,153,0.18) 40%, rgba(251,146,60,0.1) 65%, transparent 80%)',
              filter: 'blur(48px)',
            }}
          />

          {/* Left */}
          <div className="space-y-6 relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-ink-100 shadow-card text-xs font-medium text-ink-600">
              <span>🇮🇳</span>
              Made for India
              <span className="text-rose-500">♥</span>
            </div>

            <h1 className="text-5xl font-bold text-ink-900 tracking-tight leading-[1.1]">
              Smart Financial Tools<br />
              for{' '}
              <span style={{
                background: 'linear-gradient(90deg, #7C3AED 0%, #EC4899 55%, #F97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Every Indian
              </span>
            </h1>

            <p className="text-lg text-ink-500 leading-relaxed max-w-md">
              Calculate EMIs, plan taxes, compare loans, and make smarter
              financial decisions — all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/emi-calculator"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)', boxShadow: '0 4px 15px rgba(124,58,237,0.35)' }}
              >
                <Calculator size={15}/>
                Try EMI Calculator
                <ArrowRight size={13}/>
              </Link>
              <a
                href="#tools"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{
                  border: '1.5px solid transparent',
                  background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #7C3AED, #EC4899) border-box',
                  color: '#7C3AED',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="0.5" y="0.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                  <rect x="8.5" y="0.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                  <rect x="0.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                  <rect x="8.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                Explore All Tools
              </a>
            </div>

            {/* Trust chips — 2×2 grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-2">
              {[
                { icon: BarChart2, label: 'Always Accurate',   sub: 'Up-to-date calculations' },
                { icon: Zap,       label: 'Instant Results',   sub: 'In seconds' },
                { icon: Shield,    label: 'No Login Required', sub: '100% Private' },
                { icon: Globe,     label: 'Made for India',    sub: 'Indian scenarios' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-violet-600"/>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-800 leading-none">{label}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: EMI card */}
          <div className="hidden lg:flex items-center justify-end relative">
            <HeroEmiCard />
          </div>
        </section>

        {/* ── Popular Tools ─────────────────────────────────────────────── */}
        <section id="tools" className="space-y-5">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-amber-500"/>
            <h2 className="text-base font-bold text-ink-900 tracking-tight">Popular Tools</h2>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {ALL_TOOLS.map(({ to, icon: Icon, title, desc, iconBg, iconColor, arrowColor, arrowBg }) => (
              <Link key={to} to={to}
                className="card p-5 flex flex-col gap-4 hover:shadow-card-lg transition-all duration-200 group cursor-pointer">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg}`}>
                  <Icon size={22} className={iconColor}/>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-sm font-bold text-ink-900 leading-snug">{title}</h3>
                  <p className="text-xs text-ink-400 leading-relaxed">{desc}</p>
                </div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center self-end transition-all"
                  style={{ background: arrowBg, color: arrowColor }}>
                  <ArrowRight size={14}/>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured: EMI Calculator deep dive ────────────────────────── */}
        <section className="space-y-4">
          <div className="card p-5 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                    <Calculator size={17} className="text-white"/>
                  </div>
                  <span className="badge badge-green text-xs">Available now</span>
                </div>
                <h2 className="text-xl font-bold text-ink-900 tracking-tight">Home Loan EMI Calculator</h2>
                <p className="text-sm text-ink-500 max-w-lg leading-relaxed">
                  India's most complete home loan calculator. Model prepayments, rate hikes, and
                  hidden fees to know your loan's true cost before you sign.
                </p>
              </div>
              <Link to="/emi-calculator"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold shrink-0 self-start transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                Open Calculator <ArrowRight size={14}/>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {EMI_FEATURES.map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="flex gap-3 p-4 rounded-xl bg-[var(--surface-2)] border border-ink-100">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon size={15}/>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-semibold text-ink-800">{title}</p>
                    <p className="text-xs text-ink-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Coming soon ───────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-ink-900 tracking-tight">Coming soon</h2>
            <div className="flex-1 h-px bg-ink-100"/>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMING_SOON.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-5 space-y-3 opacity-50">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-ink-50 flex items-center justify-center">
                    <Icon size={17} className="text-ink-400"/>
                  </div>
                  <span className="text-[10px] font-medium bg-ink-100 text-ink-400 px-2 py-0.5 rounded-full">Soon</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-ink-700">{title}</h3>
                  <p className="text-xs text-ink-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom trust bar ──────────────────────────────────────────── */}
        <section className="rounded-2xl bg-ink-900 px-6 sm:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { icon: Globe,       label: 'Built for India', sub: 'Indian scenarios & laws', iconBg: 'rgba(59,130,246,0.25)',  iconColor: '#60A5FA' },
              { icon: CheckCircle, label: '100% Accurate',   sub: 'Verified formulas',       iconBg: 'rgba(16,185,129,0.25)', iconColor: '#34D399' },
              { icon: Shield,      label: 'Privacy First',   sub: 'No data collection',      iconBg: 'rgba(251,146,60,0.25)', iconColor: '#FB923C' },
              { icon: Star,        label: 'Always Free',     sub: 'No hidden charges',       iconBg: 'rgba(236,72,153,0.25)', iconColor: '#F472B6' },
            ].map(({ icon: Icon, label, sub, iconBg, iconColor }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: iconBg }}>
                  <Icon size={16} style={{ color: iconColor }}/>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-none">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why CashIgnite ────────────────────────────────────────────── */}
        <section className="card p-6 sm:p-8 space-y-5">
          <div className="rounded-xl border px-4 py-3.5 flex gap-3 items-start"
            style={{ background: 'rgba(124,58,237,0.04)', borderColor: 'rgba(124,58,237,0.15)' }}>
            <Shield size={15} className="text-violet-600 flex-shrink-0 mt-0.5"/>
            <p className="text-sm leading-relaxed" style={{ color: '#4C1D95' }}>
              <span className="font-semibold">Bank-accurate calculations.</span>{' '}
              All results use the RBI-standard reducing balance method — the same formula your bank uses. Results match to the rupee.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-ink-900 tracking-tight">Why CashIgnite?</h2>
              <p className="text-sm text-ink-500 leading-relaxed">
                Financial clarity shouldn't cost anything. CashIgnite gives you professional-grade
                calculators that are fast, accurate, and completely free.
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-2">
              {TRUST.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-sm text-ink-700">
                  <Icon size={13} className="text-violet-500 flex-shrink-0"/>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── SEO ───────────────────────────────────────────────────────── */}
        <section className="space-y-3 border-t border-ink-100 pt-8 text-ink-500 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-ink-800">About CashIgnite</h2>
          <p>
            CashIgnite is a free online financial calculator suite built for Indian users. Whether
            you're planning a home loan, comparing lenders, deciding between renting and buying,
            or estimating income tax under old vs new regime — CashIgnite provides instant,
            accurate results with no sign-up required.
          </p>
          <p>
            Our{' '}
            <Link to="/emi-calculator" className="text-violet-600 hover:text-violet-700 underline underline-offset-2">Home Loan EMI Calculator</Link>
            {' '}supports prepayments, variable rates, moratorium, and fee modelling. The{' '}
            <Link to="/loan-comparison" className="text-violet-600 hover:text-violet-700 underline underline-offset-2">Loan Comparison tool</Link>
            {' '}compares up to 3 offers side by side, and the{' '}
            <Link to="/rent-vs-buy" className="text-violet-600 hover:text-violet-700 underline underline-offset-2">Rent vs Buy Calculator</Link>
            {' '}models net worth trajectories for both paths.
          </p>
        </section>

      </div>
    </>
  )
}
