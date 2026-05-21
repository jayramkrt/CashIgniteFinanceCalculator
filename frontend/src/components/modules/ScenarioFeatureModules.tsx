import { useState } from 'react'
import { Banknote, TrendingUp, Receipt } from 'lucide-react'
import {
  ModuleSection, Modal, EntryCardList,
  PaymentModeSelect, NumberInput, Select, MonthOrDateInput,
} from '@/components/ui'
import type { PrepaymentDTO, InterestChangeDTO, MoratoriumDTO, FeeDTO } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN')

const PAYMENT_MODE_LABELS: Record<string, string> = {
  ONE_TIME: 'One-time', MONTHLY: 'Monthly', QUARTERLY: 'Quarterly',
  HALF_YEARLY: 'Half-yearly', YEARLY: 'Yearly',
}

const newPrepayment  = (): PrepaymentDTO    => ({ paymentMode: 'ONE_TIME', effect: 'REDUCE_TERM', amount: 100000, startingMonth: 12 })
const newRateChange  = (): InterestChangeDTO => ({ newAnnualRate: 9.0, startingMonth: 13, effect: 'CHANGE_LOAN_TERM' })
const newFee         = (): FeeDTO           => ({ paymentMode: 'YEARLY', amount: 5000, startingMonth: 1 })

// ── Prepayment module ─────────────────────────────────────────────────────────

interface PrepaymentModuleProps {
  enabled: boolean
  entries: PrepaymentDTO[]
  loanStartDate: Date | null
  onToggle: () => void
  onUpdate: (entries: PrepaymentDTO[]) => void
}

export function ScenarioPrepaymentModule({ enabled, entries, loanStartDate, onToggle, onUpdate }: PrepaymentModuleProps) {
  const [open, setOpen]       = useState(false)
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [draft, setDraft]     = useState<PrepaymentDTO>(newPrepayment())

  const openAdd  = () => { setDraft(newPrepayment()); setEditIdx(null); setOpen(true) }
  const openEdit = (i: number) => { setDraft({ ...entries[i] }); setEditIdx(i); setOpen(true) }
  const save     = () => {
    onUpdate(editIdx !== null ? entries.map((e, i) => i === editIdx ? draft : e) : [...entries, draft])
    setOpen(false)
  }

  return (
    <ModuleSection title="Prepayments" description="Lump-sum or recurring extra payments" enabled={enabled} onToggle={onToggle}>
      <EntryCardList
        entries={entries} addLabel="Add prepayment" emptyMessage="No prepayments added yet"
        onAdd={openAdd} onEdit={openEdit}
        onRemove={i => onUpdate(entries.filter((_, idx) => idx !== i))}
        renderSummary={e => (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-semibold text-ink-800">{fmt(e.amount)}</span>
            <span className="text-xs text-ink-400">{PAYMENT_MODE_LABELS[e.paymentMode]}</span>
            <span className="text-xs text-ink-400">·</span>
            <span className="text-xs text-ink-400">Month {e.startingMonth}</span>
            <span className="text-xs text-ink-400">·</span>
            <span className="text-xs text-sage-600">{e.effect === 'REDUCE_TERM' ? 'Reduce term' : 'Reduce EMI'}</span>
          </div>
        )}
      />
      <Modal open={open} onClose={() => setOpen(false)}
        title={editIdx !== null ? 'Edit prepayment' : 'Add prepayment'}
        description="Add a prepayment to reduce your loan balance."
        icon={<Banknote size={18} className="text-sage-600" />}
        hint={`Applied from month ${draft.startingMonth}.`}
        onSave={save} saveLabel={editIdx !== null ? 'Save changes' : 'Save prepayment'}
      >
        <NumberInput label="Amount (₹)" prefix="₹" value={draft.amount}
          onChange={v => setDraft(d => ({ ...d, amount: v }))} min={1} max={50_000_000} />
        <PaymentModeSelect label="Frequency" value={draft.paymentMode}
          onChange={v => setDraft(d => ({ ...d, paymentMode: v }))} />
        <Select label="Effect" value={draft.effect}
          onChange={v => setDraft(d => ({ ...d, effect: v as PrepaymentDTO['effect'] }))}
          options={[
            { value: 'REDUCE_TERM', label: 'Reduce term (saves more interest)' },
            { value: 'REDUCE_EMI',  label: 'Reduce EMI (keeps same tenure)' },
          ]}
        />
        <MonthOrDateInput label="Starting month" value={draft.startingMonth}
          onChange={v => setDraft(d => ({ ...d, startingMonth: v }))}
          loanStartDate={loanStartDate} />
      </Modal>
    </ModuleSection>
  )
}

// ── Variable rate module ──────────────────────────────────────────────────────

interface VariableRateModuleProps {
  enabled: boolean
  entries: InterestChangeDTO[]
  loanStartDate: Date | null
  onToggle: () => void
  onUpdate: (entries: InterestChangeDTO[]) => void
}

export function ScenarioVariableRateModule({ enabled, entries, loanStartDate, onToggle, onUpdate }: VariableRateModuleProps) {
  const [open, setOpen]       = useState(false)
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [draft, setDraft]     = useState<InterestChangeDTO>(newRateChange())

  const openAdd  = () => { setDraft(newRateChange()); setEditIdx(null); setOpen(true) }
  const openEdit = (i: number) => { setDraft({ ...entries[i] }); setEditIdx(i); setOpen(true) }
  const save     = () => {
    onUpdate(editIdx !== null ? entries.map((e, i) => i === editIdx ? draft : e) : [...entries, draft])
    setOpen(false)
  }

  return (
    <ModuleSection title="Variable interest rate" description="Schedule future rate changes" enabled={enabled} onToggle={onToggle}>
      <EntryCardList
        entries={entries} addLabel="Add rate change" emptyMessage="No rate changes scheduled"
        onAdd={openAdd} onEdit={openEdit}
        onRemove={i => onUpdate(entries.filter((_, idx) => idx !== i))}
        renderSummary={e => (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-semibold text-ink-800">{e.newAnnualRate}%</span>
            <span className="text-xs text-ink-400">from month {e.startingMonth}</span>
            <span className="text-xs text-ink-400">·</span>
            <span className="text-xs text-sage-600">{e.effect === 'CHANGE_LOAN_TERM' ? 'Adjust term' : 'Adjust EMI'}</span>
          </div>
        )}
      />
      <Modal open={open} onClose={() => setOpen(false)}
        title={editIdx !== null ? 'Edit rate change' : 'Add rate change'}
        description="Schedule a future interest rate change."
        icon={<TrendingUp size={18} className="text-sage-600" />}
        hint={`Rate changes to ${draft.newAnnualRate}% from month ${draft.startingMonth}.`}
        onSave={save} saveLabel={editIdx !== null ? 'Save changes' : 'Save rate change'}
      >
        <NumberInput label="New annual rate" suffix="%" value={draft.newAnnualRate}
          onChange={v => setDraft(d => ({ ...d, newAnnualRate: v }))} min={0.1} max={50} step={0.05} />
        <MonthOrDateInput label="Starting from month" value={draft.startingMonth}
          onChange={v => setDraft(d => ({ ...d, startingMonth: v }))}
          loanStartDate={loanStartDate} />
        <Select label="Effect" value={draft.effect}
          onChange={v => setDraft(d => ({ ...d, effect: v as InterestChangeDTO['effect'] }))}
          options={[
            { value: 'CHANGE_LOAN_TERM', label: 'Adjust term (keep same EMI)' },
            { value: 'REDUCE_EMI',        label: 'Adjust EMI (keep same tenure)' },
          ]}
        />
      </Modal>
    </ModuleSection>
  )
}

// ── Moratorium module ─────────────────────────────────────────────────────────

interface MoratoriumModuleProps {
  enabled: boolean
  config: MoratoriumDTO
  onToggle: () => void
  onUpdate: (config: MoratoriumDTO) => void
}

export function ScenarioMoratoriumModule({ enabled, config, onToggle, onUpdate }: MoratoriumModuleProps) {
  return (
    <ModuleSection title="Moratorium period" description="Defer EMI payments for initial months" enabled={enabled} onToggle={onToggle}>
      <div className="grid grid-cols-2 gap-4">
        <NumberInput label="Duration (months)" suffix="mo"
          value={config.durationMonths}
          onChange={v => onUpdate({ ...config, durationMonths: v })}
          min={1} max={24} />
        <div>
          <label className="label">Interest during moratorium</label>
          <div className="flex gap-2 mt-1">
            {[
              { value: true,  label: 'Pay interest' },
              { value: false, label: 'Capitalise' },
            ].map(opt => (
              <button key={String(opt.value)} type="button"
                onClick={() => onUpdate({ ...config, payInterestDuringMoratorium: opt.value })}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${
                  config.payInterestDuringMoratorium === opt.value
                    ? 'bg-ink-900 text-white border-ink-900'
                    : 'bg-white text-ink-500 border-ink-200 hover:border-ink-300'
                }`}
              >{opt.label}</button>
            ))}
          </div>
        </div>
      </div>
    </ModuleSection>
  )
}

// ── Fees module ───────────────────────────────────────────────────────────────

interface FeesModuleProps {
  enabled: boolean
  entries: FeeDTO[]
  loanStartDate: Date | null
  onToggle: () => void
  onUpdate: (entries: FeeDTO[]) => void
}

export function ScenarioFeesModule({ enabled, entries, loanStartDate, onToggle, onUpdate }: FeesModuleProps) {
  const [open, setOpen]       = useState(false)
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [draft, setDraft]     = useState<FeeDTO>(newFee())

  const openAdd  = () => { setDraft(newFee()); setEditIdx(null); setOpen(true) }
  const openEdit = (i: number) => { setDraft({ ...entries[i] }); setEditIdx(i); setOpen(true) }
  const save     = () => {
    onUpdate(editIdx !== null ? entries.map((e, i) => i === editIdx ? draft : e) : [...entries, draft])
    setOpen(false)
  }

  return (
    <ModuleSection title="Fees & charges" description="Processing fees, insurance premiums, etc." enabled={enabled} onToggle={onToggle}>
      <EntryCardList
        entries={entries} addLabel="Add fee" emptyMessage="No fees added"
        onAdd={openAdd} onEdit={openEdit}
        onRemove={i => onUpdate(entries.filter((_, idx) => idx !== i))}
        renderSummary={e => (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-semibold text-ink-800">{fmt(e.amount)}</span>
            <span className="text-xs text-ink-400">{PAYMENT_MODE_LABELS[e.paymentMode]}</span>
            <span className="text-xs text-ink-400">·</span>
            <span className="text-xs text-ink-400">Month {e.startingMonth}</span>
          </div>
        )}
      />
      <Modal open={open} onClose={() => setOpen(false)}
        title={editIdx !== null ? 'Edit fee' : 'Add fee'}
        description="Include processing fees or insurance in loan cost."
        icon={<Receipt size={18} className="text-sage-600" />}
        hint={`${fmt(draft.amount)} ${PAYMENT_MODE_LABELS[draft.paymentMode]?.toLowerCase()} fee from month ${draft.startingMonth}.`}
        onSave={save} saveLabel={editIdx !== null ? 'Save changes' : 'Save fee'}
      >
        <NumberInput label="Amount (₹)" prefix="₹" value={draft.amount}
          onChange={v => setDraft(d => ({ ...d, amount: v }))} min={1} max={5_000_000} />
        <PaymentModeSelect label="Frequency" value={draft.paymentMode}
          onChange={v => setDraft(d => ({ ...d, paymentMode: v }))} />
        <MonthOrDateInput label="Starting month" value={draft.startingMonth}
          onChange={v => setDraft(d => ({ ...d, startingMonth: v }))}
          loanStartDate={loanStartDate} />
      </Modal>
    </ModuleSection>
  )
}
