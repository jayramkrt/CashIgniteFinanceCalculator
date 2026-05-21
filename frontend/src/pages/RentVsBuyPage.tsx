import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, RotateCcw, CheckCircle, ChevronDown, ChevronUp, TrendingUp, Calculator, Building2 } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useRentVsBuyStore } from '@/stores/rentVsBuyStore'
import { NumberInput } from '@/components/ui'
import SeoHead from '@/components/SeoHead'
import { formatRupees, formatPct, cn } from '@/utils'

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Is it better to buy or rent a home in India?',
    a: 'It depends on the city, your income, and how long you plan to stay. In high-cost cities like Mumbai and Bangalore, renting is often cheaper in the short term. Buying wins over longer horizons (10+ years) due to property appreciation and forced savings. Use this calculator to find your personal break-even point.',
  },
  {
    q: 'What is the break-even point for buying vs renting?',
    a: 'The break-even year is when your net worth from buying (property value minus outstanding loan) first exceeds your net worth from renting (invested down payment + invested savings). Before that year, renting and investing beats buying. After it, buying is ahead.',
  },
  {
    q: 'How does property appreciation affect the rent vs buy decision?',
    a: 'Property appreciation is the single biggest factor in making buying worthwhile. At 6% p.a. appreciation, your home doubles in value in ~12 years. At 3% p.a., it takes 24 years and buying often never beats renting. Adjust the appreciation rate to match your city\'s historical average.',
  },
  {
    q: 'What is the opportunity cost of the down payment?',
    a: 'If you invest your down payment in index funds (historically 10–12% p.a. in India) instead of buying, that money compounds significantly over time. This calculator models that opportunity cost — your down payment earns investment returns in the rent scenario, which competes with property appreciation in the buy scenario.',
  },
  {
    q: 'At what rent-to-EMI ratio does buying make more sense?',
    a: 'As a rule of thumb, if monthly rent is less than 40–50% of your EMI, renting and investing may be better in the short to medium term. If rent is close to or higher than EMI, buying starts making financial sense sooner. The actual break-even depends on appreciation, investment returns, and your time horizon.',
  },
  {
    q: 'How does rent inflation change the rent vs buy comparison?',
    a: 'High rent inflation (5–8% p.a.) significantly favours buying. As rent rises each year, the relative cost of renting grows, while your EMI stays fixed (on a fixed-rate loan). Over 15–20 years, rent inflation is a major factor that makes owning more attractive in India.',
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

// ── Input section ─────────────────────────────────────────────────────────────

function InputSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-lg p-5 sm:p-6 space-y-4">
      <h3 className="font-semibold text-ink-900 text-sm uppercase tracking-wide text-ink-400">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

// ── Result card ───────────────────────────────────────────────────────────────

function ResultCard({ label, value, sub, accent, icon: Icon, winner }: {
  label: string; value: string; sub?: string; accent: 'buy' | 'rent'; icon: React.ElementType; winner: boolean
}) {
  const styles = {
    buy:  { card: winner ? 'border-sage-300 bg-sage-50' : 'border-ink-100', text: winner ? 'text-sage-700' : 'text-ink-800' },
    rent: { card: winner ? 'border-sage-300 bg-sage-50' : 'border-ink-100', text: winner ? 'text-sage-700' : 'text-ink-800' },
  }
  return (
    <div className={cn('card border-2 p-5 space-y-3 relative', styles[accent].card)}>
      {winner && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-semibold text-sage-600 bg-white border border-sage-200 px-2 py-0.5 rounded-full">
          <CheckCircle size={9} /> Better choice
        </span>
      )}
      <div className="flex items-center gap-2.5">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', winner ? 'bg-sage-100' : 'bg-ink-100')}>
          <Icon size={17} className={winner ? 'text-sage-600' : 'text-ink-400'} />
        </div>
        <span className="text-xs font-semibold text-ink-400 uppercase tracking-widest">{label}</span>
      </div>
      <div>
        <p className={cn('text-2xl font-semibold tabular-nums tracking-tight', styles[accent].text)}>{value}</p>
        {sub && <p className="text-xs text-ink-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── HOW IT HELPS ──────────────────────────────────────────────────────────────

const HOW_IT_HELPS = [
  { icon: TrendingUp,   title: 'Accounts for property appreciation and rent inflation', body: 'Both assets grow over time. This tool models both to find the true financial winner.' },
  { icon: Calculator,   title: 'Shows the opportunity cost of your down payment',       body: 'Your down payment could earn 10% p.a. in index funds. That competes with property appreciation.' },
  { icon: CheckCircle,  title: 'Finds the exact year buying becomes better',            body: 'Stop guessing. See the precise year when buying surpasses renting on a net worth basis.' },
  { icon: Building2,    title: 'Considers all hidden costs of ownership',               body: 'Maintenance, registration, and loan interest are included — not just the EMI.' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RentVsBuyPage() {
  const { inputs, result, setInput, calculate, reset } = useRentVsBuyStore()

  const downPaymentAmt = inputs.homePrice * (inputs.downPaymentPct / 100)
  const loanAmt = inputs.homePrice - downPaymentAmt

  return (
    <>
      <SeoHead
        title="Rent vs Buy Calculator India — Should You Rent or Buy a Home? | CashIgnite"
        description="Compare renting vs buying a home in India. See break-even year, net worth comparison, and total cost over 20 years. Free calculator, no login required."
        canonical="https://cashignite.in/rent-vs-buy"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-ink-900 flex items-center justify-center">
                <Home size={17} className="text-white" />
              </div>
              <h1 className="font-semibold text-2xl text-ink-900 tracking-tight">Rent vs Buy</h1>
            </div>
            <p className="text-sm text-ink-400">Compare the financial outcome of renting vs buying over time</p>
          </div>
          <button type="button" onClick={reset} className="btn-secondary gap-1.5">
            <RotateCcw size={13} /> Reset
          </button>
        </div>

        {/* Input grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InputSection title="Buying">
            <NumberInput label="Home price (₹)" prefix="₹"
              tooltip="The total market price of the property you're considering buying."
              value={inputs.homePrice} onChange={v => setInput({ homePrice: v })}
              min={500000} max={200000000} step={100000}
            />
            <NumberInput label="Down payment" suffix="%"
              tooltip="Percentage of home price you pay upfront from your own savings. RBI mandates a minimum of 10–20% depending on loan size."
              value={inputs.downPaymentPct} onChange={v => setInput({ downPaymentPct: v })}
              min={5} max={90} step={5}
            />
            <NumberInput label="Loan interest rate" suffix="%"
              tooltip="Annual interest rate on the home loan. Check your bank's current floating rate. Most Indian home loans range from 8–10% p.a."
              value={inputs.loanRate} onChange={v => setInput({ loanRate: v })}
              min={0.1} max={50} step={0.05}
            />
            <NumberInput label="Loan tenure" suffix="yr"
              tooltip="Number of years to repay the loan. Longer tenure = lower EMI but higher total interest paid."
              value={inputs.loanTenureYears} onChange={v => setInput({ loanTenureYears: v })}
              min={1} max={30}
            />
            <NumberInput label="Property appreciation" suffix="% p.a."
              tooltip="Expected annual growth in your property's market value. Indian real estate has historically appreciated 5–8% p.a. in metro cities."
              value={inputs.propertyAppreciation} onChange={v => setInput({ propertyAppreciation: v })}
              min={0} max={20} step={0.5}
            />
            <NumberInput label="Maintenance cost" suffix="% p.a."
              tooltip="Annual cost to maintain the property (repairs, society charges, property tax) as a % of home value. Typically 0.5–2% p.a."
              value={inputs.maintenanceCostPct} onChange={v => setInput({ maintenanceCostPct: v })}
              min={0} max={5} step={0.25}
            />
          </InputSection>

          <InputSection title="Renting">
            <NumberInput label="Monthly rent (₹)" prefix="₹"
              tooltip="Your current monthly rent payment for a comparable property."
              value={inputs.monthlyRent} onChange={v => setInput({ monthlyRent: v })}
              min={1000} max={1000000} step={1000}
            />
            <NumberInput label="Security deposit" suffix="months"
              tooltip="Refundable deposit paid to the landlord upfront, typically 2–3 months rent in most Indian cities (up to 10 months in Bangalore). This money earns nothing while locked — its opportunity cost is modelled here."
              value={inputs.securityDepositMonths} onChange={v => setInput({ securityDepositMonths: v })}
              min={0} max={12} step={1}
            />
            <NumberInput label="Annual rent increase" suffix="% p.a."
              tooltip="How much rent rises each year. Typical Indian leases increase rent by 5–10% annually at renewal."
              value={inputs.rentIncreaseRate} onChange={v => setInput({ rentIncreaseRate: v })}
              min={0} max={20} step={0.5}
            />
            <NumberInput label="Investment return on savings" suffix="% p.a."
              tooltip="The annual return you'd earn by investing your down payment and monthly savings difference in mutual funds or index funds instead of buying. India's Nifty 50 has delivered ~12% p.a. historically. This is the key 'opportunity cost' of buying — the returns you give up by locking money in real estate."
              value={inputs.investmentReturn} onChange={v => setInput({ investmentReturn: v })}
              min={0} max={30} step={0.5}
            />
            <NumberInput label="Analysis period" suffix="yr"
              tooltip="How many years to compare. The longer you plan to stay, the more likely buying wins due to compounding appreciation and a paid-off loan."
              value={inputs.analysisYears} onChange={v => setInput({ analysisYears: v })}
              min={5} max={30}
            />
          </InputSection>
        </div>

        {/* Summary bar */}
        <div className="card p-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <div><span className="text-ink-400">Down payment: </span><span className="font-semibold">{formatRupees(downPaymentAmt, true)}</span></div>
          <div><span className="text-ink-400">Loan amount: </span><span className="font-semibold">{formatRupees(loanAmt, true)}</span></div>
          <div><span className="text-ink-400">Security deposit: </span><span className="font-semibold">{formatRupees(inputs.monthlyRent * inputs.securityDepositMonths, true)}</span></div>
        </div>

        {/* Calculate button */}
        <button type="button" onClick={calculate} className="btn-accent w-full sm:w-auto justify-center px-10">
          <Calculator size={15} />
          Calculate
        </button>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="space-y-6">

              {/* Winner cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ResultCard
                  label="Buy — net worth"
                  value={formatRupees(result.finalBuyNetWorth, true)}
                  sub={`Property ${formatRupees(result.finalPropertyValue, true)} after ${inputs.analysisYears} yrs`}
                  accent="buy" icon={Home}
                  winner={result.winner === 'buy'}
                />
                <ResultCard
                  label="Rent — net worth"
                  value={formatRupees(result.finalRentNetWorth, true)}
                  sub={`Invested savings after ${inputs.analysisYears} yrs`}
                  accent="rent" icon={Building2}
                  winner={result.winner === 'rent'}
                />
              </div>

              {/* Break-even banner */}
              <div className={cn('rounded-2xl px-5 py-4 border', result.breakEvenYear
                ? 'bg-sage-50 border-sage-200'
                : 'bg-amber-50 border-amber-200'
              )}>
                {result.breakEvenYear ? (
                  <p className="text-sm text-sage-800">
                    <span className="font-semibold">Break-even: Year {result.breakEvenYear}</span>
                    {' '}— buying becomes financially better than renting after {result.breakEvenYear} years.
                  </p>
                ) : (
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">No break-even</span> within {inputs.analysisYears} years — renting + investing stays ahead throughout the analysis period.
                  </p>
                )}
              </div>

              {/* Net worth chart */}
              <div className="card p-5 sm:p-6">
                <h3 className="font-semibold text-ink-900 mb-4">Net worth over time</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={result.yearlyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DDE6F4" />
                    <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fontSize: 11, fill: '#6B8DBF' }} />
                    <YAxis tickFormatter={v => formatRupees(v, true)} tick={{ fontSize: 11, fill: '#6B8DBF' }} width={72} />
                    <Tooltip formatter={(v: number) => formatRupees(v, true)} labelFormatter={l => `Year ${l}`} />
                    <Legend />
                    <Line type="monotone" dataKey="buyNetWorth"  name="Buy net worth"  stroke="#4F6EE8" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="rentNetWorth" name="Rent net worth" stroke="#E09B12" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Cost breakdown */}
              <div className="card p-5 sm:p-6">
                <h3 className="font-semibold text-ink-900 mb-4">Cost breakdown after {inputs.analysisYears} years</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Total rent paid',       value: result.totalRentPaid,        color: 'text-amber-600' },
                    { label: 'Security deposit',       value: result.securityDeposit,      color: 'text-ink-500'  },
                    { label: 'Total EMI paid',         value: result.totalEmiPaid,         color: 'text-sage-700' },
                    { label: 'Interest component',     value: result.totalInterestPaid,    color: 'text-rose-600' },
                    { label: 'Maintenance paid',       value: result.totalMaintenancePaid, color: 'text-ink-600'  },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="space-y-1">
                      <p className="text-xs text-ink-400 uppercase tracking-widest">{label}</p>
                      <p className={cn('text-lg font-semibold tabular-nums', color)}>{formatRupees(value, true)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEO content */}
        <div className="space-y-10 border-t border-ink-100 pt-10 max-w-3xl">

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-ink-900 tracking-tight">
              Rent vs Buy Calculator — Should You Rent or Buy a Home in India?
            </h2>
            <p className="text-sm text-ink-500 leading-relaxed">
              The rent vs buy decision is one of the most consequential financial choices an Indian household makes.
              It involves comparing the appreciation potential of real estate against the compounding power of financial
              investments — both of which are significant in India's growing economy.
            </p>
            <p className="text-sm text-ink-500 leading-relaxed">
              Unlike simple EMI calculators, this tool models the complete financial picture: property appreciation,
              rent inflation, opportunity cost of the down payment, and maintenance costs — giving you a realistic
              year-by-year net worth comparison for both paths.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-ink-900 tracking-tight">Why this calculator is different</h2>
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
