import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, BadgeCheck, ChevronDown, ChevronUp } from 'lucide-react'
import SeoHead from '@/components/SeoHead'
import { useTaxPlanStore } from '@/stores/taxPlanStore'
import { taxPlanApi } from '@/api/taxPlanApi'
import { calculateOldRegime, calculateNewRegime } from '@/utils/taxCalc'
import { NumberInput, Select } from '@/components/ui'
import { FY_OPTIONS } from '@/data/taxData'
import { formatRupees, formatPct, cn } from '@/utils'
import type { Earnings, Exemptions, Deductions, RegimeTaxResult } from '@/types/taxPlan'
import { EMPTY_EARNINGS, EMPTY_EXEMPTIONS, EMPTY_DEDUCTIONS } from '@/types/taxPlan'

const FY_SELECT_OPTIONS = FY_OPTIONS.map((o) => ({
  value: o.value.replace('FY_', '').replace(/_/g, '-').replace(/-(\d)/, '-$1'),
  label: o.label,
}))

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title, badge, children, defaultOpen = true,
}: {
  title: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-ink-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-display font-700 text-ink-900">{title}</span>
          {badge && <span className="badge badge-amber text-xs">{badge}</span>}
        </div>
        {open ? <ChevronUp size={14} className="text-ink-400" /> : <ChevronDown size={14} className="text-ink-400" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-ink-100 pt-4 space-y-4 animate-slide-up">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Labelled input row ────────────────────────────────────────────────────────

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-2 items-start">
      <div className="pt-2">
        <p className="text-sm font-medium text-ink-800">{label}</p>
        {hint && <p className="text-xs text-ink-400 mt-0.5">{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  )
}

// ── Mini regime result strip ──────────────────────────────────────────────────

function RegimeStrip({ old: o, new: n }: { old: RegimeTaxResult; new: RegimeTaxResult }) {
  const oldWins = o.totalTax < n.totalTax
  const saving  = Math.abs(o.totalTax - n.totalTax)

  return (
    <div className="card-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-ink-500 uppercase tracking-widest">Live Tax Preview</p>
        {saving > 0 && (
          <span className="badge badge-green text-xs gap-1">
            <BadgeCheck size={10} />
            {oldWins ? 'Old' : 'New'} saves {formatRupees(saving, true)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Old Regime', result: o, winner: oldWins },
          { label: 'New Regime', result: n, winner: !oldWins },
        ].map(({ label, result, winner }) => (
          <div
            key={label}
            className={cn(
              'rounded-xl p-3 border transition-all',
              winner ? 'bg-sage-50 border-sage-200' : 'bg-ink-50 border-ink-100',
            )}
          >
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs text-ink-500 uppercase tracking-widest">{label}</span>
              {winner && <BadgeCheck size={10} className="text-sage-500" />}
            </div>
            <p className={cn('font-mono font-700 text-base tabular-nums', winner ? 'text-sage-700' : 'text-ink-800')}>
              {formatRupees(result.totalTax)}
            </p>
            <p className="text-xs text-ink-400 mt-0.5">
              {formatRupees(result.taxableIncome, true)} taxable ·{' '}
              {formatPct(result.effectiveRate, 1)} rate
            </p>
            <p className="text-xs text-ink-400">
              ₹{result.monthlyTds.toLocaleString('en-IN')}/mo TDS
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Edit form ─────────────────────────────────────────────────────────────────

export default function TaxPlanEditPage() {
  const { planId } = useParams<{ planId: string }>()
  const isNew = planId === undefined || planId === 'new'
  const navigate = useNavigate()
  const { createPlan, updatePlan, selectedFY } = useTaxPlanStore()

  const [name, setName]         = useState('')
  const [fy, setFY]             = useState(selectedFY)
  const [earnings, setEarnings] = useState<Earnings>({ ...EMPTY_EARNINGS })
  const [exemptions, setEx]     = useState<Exemptions>({ ...EMPTY_EXEMPTIONS })
  const [deductions, setDed]    = useState<Deductions>({ ...EMPTY_DEDUCTIONS })
  const [saving, setSaving]     = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Load existing plan for edit mode
  useEffect(() => {
    if (!isNew && planId) {
      taxPlanApi.getById(planId).then((p) => {
        setName(p.name)
        setFY(p.financialYear)
        setEarnings(p.earnings ?? { ...EMPTY_EARNINGS })
        setEx(p.exemptions ?? { ...EMPTY_EXEMPTIONS })
        setDed(p.deductions ?? { ...EMPTY_DEDUCTIONS })
      }).catch(() => setLoadError('Failed to load plan'))
    } else {
      setName('')
    }
  }, [planId, isNew])

  // Real-time calculation
  const { oldResult, newResult } = useMemo(() => ({
    oldResult: calculateOldRegime(earnings, exemptions, deductions, fy),
    newResult: calculateNewRegime(earnings, fy),
  }), [earnings, exemptions, deductions, fy])

  const setE = <K extends keyof Earnings>(k: K) => (v: number) =>
    setEarnings((prev) => ({ ...prev, [k]: v }))
  const setX = <K extends keyof Exemptions>(k: K) => (v: number) =>
    setEx((prev) => ({ ...prev, [k]: v }))
  const setD = <K extends keyof Deductions>(k: K) => (v: number) =>
    setDed((prev) => ({ ...prev, [k]: v }))

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const req = { name: name.trim(), financialYear: fy, earnings, exemptions, deductions }
      const plan = isNew
        ? await createPlan(req)
        : await updatePlan(planId!, req)
      navigate(`/tax/${plan.id}`)
    } finally {
      setSaving(false)
    }
  }

  document.title = isNew ? 'New Tax Plan | ClearHomeEMI' : `Edit ${name} | ClearHomeEMI`

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <p className="text-sm text-rose-600">{loadError}</p>
        <button type="button" onClick={() => navigate('/tax')} className="btn-ghost">
          <ArrowLeft size={14} /> Back to planner
        </button>
      </div>
    )
  }

  return (
    <>
    <SeoHead
      title="Tax Plan Editor | CashIgnite"
      description="Edit your income tax plan on CashIgnite."
      canonical="https://cashignite.in/tax"
      noIndex
    />
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="pb-24 sm:pb-8"
    >
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/tax')} className="btn-ghost">
            <ArrowLeft size={14} />
          </button>
          <div>
            <h1 className="font-display font-800 text-xl text-ink-900">
              {isNew ? 'New Tax Plan' : 'Edit Plan'}
            </h1>
            <p className="text-xs text-ink-400 mt-0.5">FY {fy} · All changes reflect instantly</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="btn-primary"
        >
          <Save size={14} />
          {saving ? 'Saving…' : 'Save Plan'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
        {/* ── Left: form sections ──────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Plan meta */}
          <div className="card p-5 space-y-4">
            <h2 className="font-display font-700 text-ink-900 text-sm uppercase tracking-widest">Plan Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Plan Name</label>
                <input
                  className="input-field"
                  placeholder="e.g. Plan A — Max Deductions"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <Select
                label="Financial Year"
                value={fy}
                onChange={setFY}
                options={FY_SELECT_OPTIONS}
              />
            </div>
          </div>

          {/* Earnings */}
          <Section title="Earnings" defaultOpen>
            <Row label="Basic Salary" hint="Core salary component">
              <NumberInput prefix="₹" value={earnings.basic || ''} placeholder="0" min={0} onChange={setE('basic')} />
            </Row>
            <Row label="HRA Received" hint="House Rent Allowance from employer">
              <NumberInput prefix="₹" value={earnings.hra || ''} placeholder="0" min={0} onChange={setE('hra')} />
            </Row>
            <Row label="Allowances" hint="Special allowance, conveyance, food, etc.">
              <NumberInput prefix="₹" value={earnings.allowances || ''} placeholder="0" min={0} onChange={setE('allowances')} />
            </Row>
            <Row label="Perks & Benefits" hint="Medical, LTA, telephone, other perks">
              <NumberInput prefix="₹" value={earnings.perks || ''} placeholder="0" min={0} onChange={setE('perks')} />
            </Row>
            <Row label="Other Income" hint="Freelance, interest, rent, capital gains, etc.">
              <NumberInput prefix="₹" value={earnings.otherIncome || ''} placeholder="0" min={0} onChange={setE('otherIncome')} />
            </Row>
            <div className="pt-2 border-t border-ink-100 flex justify-between items-center">
              <span className="text-xs text-ink-500">Gross Income</span>
              <span className="font-mono font-700 text-ink-900 text-sm tabular-nums">
                {formatRupees(oldResult.grossIncome)}
              </span>
            </div>
          </Section>

          {/* Exemptions */}
          <Section title="Exemptions" badge="Old Regime" defaultOpen={false}>
            <p className="text-xs text-ink-400 -mt-1 pb-1">
              Standard deduction of{' '}
              <span className="font-mono font-600 text-ink-600">₹50,000</span>{' '}
              is applied automatically under old regime.
            </p>
            <Row label="HRA Exemption" hint="Min of: actual HRA, 50% basic (metro), actual rent − 10% basic">
              <NumberInput prefix="₹" value={exemptions.hraExemption || ''} placeholder="0" min={0} onChange={setX('hraExemption')} />
            </Row>
            <Row label="LTA Exemption" hint="Leave Travel Allowance — eligible amount">
              <NumberInput prefix="₹" value={exemptions.ltaExemption || ''} placeholder="0" min={0} onChange={setX('ltaExemption')} />
            </Row>
            <Row label="Other Allowance Exemptions" hint="Children education, hostel, uniform, etc.">
              <NumberInput prefix="₹" value={exemptions.otherExemptions || ''} placeholder="0" min={0} onChange={setX('otherExemptions')} />
            </Row>
            <Row label="Professional Tax (Sec 16)" hint="Max ₹2,500 p.a. — deducted by employer">
              <NumberInput prefix="₹" value={exemptions.professionalTax || ''} placeholder="0" min={0} max={2500} onChange={setX('professionalTax')} />
            </Row>
          </Section>

          {/* Deductions */}
          <Section title="Deductions" badge="Old Regime" defaultOpen={false}>
            <Row label="Section 80C" hint="PPF, ELSS, LIC, EPF, home loan principal · max ₹1,50,000">
              <NumberInput prefix="₹" value={deductions.section80C || ''} placeholder="0" min={0} max={150000} onChange={setD('section80C')} />
            </Row>
            <Row label="Section 80D" hint="Health insurance premium — self + family">
              <NumberInput prefix="₹" value={deductions.section80D || ''} placeholder="0" min={0} onChange={setD('section80D')} />
            </Row>
            <Row label="Section 80E" hint="Education loan interest — no upper limit">
              <NumberInput prefix="₹" value={deductions.section80E || ''} placeholder="0" min={0} onChange={setD('section80E')} />
            </Row>
            <Row label="Section 80G" hint="Donations to approved funds">
              <NumberInput prefix="₹" value={deductions.section80G || ''} placeholder="0" min={0} onChange={setD('section80G')} />
            </Row>
            <Row label="NPS 80CCD(1B)" hint="Additional NPS contribution · max ₹50,000">
              <NumberInput prefix="₹" value={deductions.nps80CCD1B || ''} placeholder="0" min={0} max={50000} onChange={setD('nps80CCD1B')} />
            </Row>
            <Row label="Other Deductions" hint="80TTA, 80TTB, 80GG, 80U, etc.">
              <NumberInput prefix="₹" value={deductions.otherDeductions || ''} placeholder="0" min={0} onChange={setD('otherDeductions')} />
            </Row>
          </Section>
        </div>

        {/* ── Right: live comparison ───────────────────────────────────────── */}
        <div className="lg:sticky lg:top-20 space-y-4">
          <RegimeStrip old={oldResult} new={newResult} />
          <p className="text-xs text-ink-300 text-center">Updates as you type · No save needed to preview</p>
        </div>
      </div>
    </motion.div>
    </>
  )
}
