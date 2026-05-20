import { useState } from 'react'
import { Banknote, TrendingUp, PiggyBank, Receipt } from 'lucide-react'
import { useLoanStore } from '@/stores/loanStore'
import {
  ModuleSection, Modal, EntryCardList,
  PaymentModeSelect, NumberInput, Select, MonthOrDateInput,
} from '@/components/ui'
import type { PrepaymentDTO, InterestChangeDTO, InterestSaverDTO, FeeDTO } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

function newPrepayment(): PrepaymentDTO {
  return { paymentMode: 'ONE_TIME', effect: 'REDUCE_TERM', amount: 100000, startingMonth: 12 }
}
function newRateChange(): InterestChangeDTO {
  return { newAnnualRate: 9.0, startingMonth: 13, effect: 'CHANGE_LOAN_TERM' }
}
function newIsaEntry(): InterestSaverDTO {
  return { paymentMode: 'MONTHLY', transactionType: 'DEPOSIT', amount: 10000, startingMonth: 1 }
}
function newFee(): FeeDTO {
  return { paymentMode: 'YEARLY', amount: 5000, startingMonth: 12 }
}

const PAYMENT_MODE_LABELS: Record<string, string> = {
  ONE_TIME: 'One-time', MONTHLY: 'Monthly', QUARTERLY: 'Quarterly',
  HALF_YEARLY: 'Half-yearly', YEARLY: 'Yearly',
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Prepayment Module
// ─────────────────────────────────────────────────────────────────────────────

export function PrepaymentModule() {
  const { prepayment, togglePrepayment, setPrepaymentEntries, loan } = useLoanStore()
  const { enabled, entries } = prepayment

  const [open, setOpen]     = useState(false)
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [draft, setDraft]   = useState<PrepaymentDTO>(newPrepayment())

  const openAdd = () => {
    setDraft(newPrepayment())
    setEditIdx(null)
    setOpen(true)
  }

  const openEdit = (i: number) => {
    setDraft({ ...entries[i] })
    setEditIdx(i)
    setOpen(true)
  }

  const handleSave = () => {
    if (editIdx !== null) {
      setPrepaymentEntries(entries.map((e, i) => i === editIdx ? draft : e))
    } else {
      setPrepaymentEntries([...entries, draft])
    }
    setOpen(false)
  }

  return (
    <ModuleSection
      title="Prepayments"
      description="Lump-sum or recurring extra payments"
      enabled={enabled}
      onToggle={togglePrepayment}
    >
      <EntryCardList
        entries={entries}
        addLabel="Add prepayment"
        emptyMessage="No prepayments added yet"
        onAdd={openAdd}
        onEdit={openEdit}
        onRemove={(i) => setPrepaymentEntries(entries.filter((_, idx) => idx !== i))}
        renderSummary={(e) => (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-display font-600 text-ink-800">{fmt(e.amount)}</span>
            <span className="text-xs text-ink-400">{PAYMENT_MODE_LABELS[e.paymentMode]}</span>
            <span className="text-xs text-ink-400">·</span>
            <span className="text-xs text-ink-400">Month {e.startingMonth}</span>
            <span className="text-xs text-ink-400">·</span>
            <span className="text-xs text-sage-600">{e.effect === 'REDUCE_TERM' ? 'Reduce term' : 'Reduce EMI'}</span>
          </div>
        )}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editIdx !== null ? 'Edit prepayment' : 'Add prepayment'}
        description="Add a prepayment to reduce your loan balance and save on interest."
        icon={<Banknote size={18} className="text-sage-600" />}
        hint={`This prepayment will be applied starting from month ${draft.startingMonth} of your loan.`}
        onSave={handleSave}
        saveLabel={editIdx !== null ? 'Save changes' : 'Save prepayment'}
      >
        <NumberInput
          label="Amount (₹)"
          prefix="₹"
          value={draft.amount}
          onChange={(v) => setDraft(d => ({ ...d, amount: v }))}
          min={1} max={50_000_000} placeholder="1,00,000"
        />
        <PaymentModeSelect
          label="Frequency"
          value={draft.paymentMode}
          onChange={(v) => setDraft(d => ({ ...d, paymentMode: v }))}
        />
        <Select
          label="Effect"
          value={draft.effect}
          onChange={(v) => setDraft(d => ({ ...d, effect: v as PrepaymentDTO['effect'] }))}
          options={[
            { value: 'REDUCE_TERM', label: 'Reduce term (saves more interest)' },
            { value: 'REDUCE_EMI',  label: 'Reduce EMI (keeps same tenure)' },
          ]}
        />
        <MonthOrDateInput
          label="Starting month"
          value={draft.startingMonth}
          onChange={(v) => setDraft(d => ({ ...d, startingMonth: v }))}
          loanStartDate={loan.firstEmiDate}
        />
      </Modal>
    </ModuleSection>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Variable Interest Rate Module
// ─────────────────────────────────────────────────────────────────────────────

export function VariableRateModule() {
  const { variableRate, toggleVariableRate, setVariableRateEntries, loan } = useLoanStore()
  const { enabled, entries } = variableRate

  const [open, setOpen]       = useState(false)
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [draft, setDraft]     = useState<InterestChangeDTO>(newRateChange())

  const openAdd = () => {
    setDraft(newRateChange())
    setEditIdx(null)
    setOpen(true)
  }

  const openEdit = (i: number) => {
    setDraft({ ...entries[i] })
    setEditIdx(i)
    setOpen(true)
  }

  const handleSave = () => {
    if (editIdx !== null) {
      setVariableRateEntries(entries.map((e, i) => i === editIdx ? draft : e))
    } else {
      setVariableRateEntries([...entries, draft])
    }
    setOpen(false)
  }

  return (
    <ModuleSection
      title="Variable interest rate"
      description="Schedule future rate changes"
      enabled={enabled}
      onToggle={toggleVariableRate}
    >
      <EntryCardList
        entries={entries}
        addLabel="Add rate change"
        emptyMessage="No rate changes scheduled"
        onAdd={openAdd}
        onEdit={openEdit}
        onRemove={(i) => setVariableRateEntries(entries.filter((_, idx) => idx !== i))}
        renderSummary={(e) => (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-display font-600 text-ink-800">{e.newAnnualRate}%</span>
            <span className="text-xs text-ink-400">from month {e.startingMonth}</span>
            <span className="text-xs text-ink-400">·</span>
            <span className="text-xs text-sage-600">{e.effect === 'CHANGE_LOAN_TERM' ? 'Adjust term' : 'Adjust EMI'}</span>
          </div>
        )}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editIdx !== null ? 'Edit rate change' : 'Add rate change'}
        description="Schedule a future interest rate change on your loan."
        icon={<TrendingUp size={18} className="text-sage-600" />}
        hint={`Rate will change to ${draft.newAnnualRate}% from month ${draft.startingMonth} of your loan.`}
        onSave={handleSave}
        saveLabel={editIdx !== null ? 'Save changes' : 'Save rate change'}
      >
        <NumberInput
          label="New annual rate"
          value={draft.newAnnualRate}
          onChange={(v) => setDraft(d => ({ ...d, newAnnualRate: v }))}
          suffix="%" min={0.1} max={50} step={0.05} placeholder="9.00"
        />
        <MonthOrDateInput
          label="Starting from month"
          value={draft.startingMonth}
          onChange={(v) => setDraft(d => ({ ...d, startingMonth: v }))}
          loanStartDate={loan.firstEmiDate}
        />
        <Select
          label="Effect"
          value={draft.effect}
          onChange={(v) => setDraft(d => ({ ...d, effect: v as InterestChangeDTO['effect'] }))}
          options={[
            { value: 'CHANGE_LOAN_TERM', label: 'Adjust term (keep same EMI)' },
            { value: 'REDUCE_EMI',        label: 'Adjust EMI (keep same tenure)' },
          ]}
        />
      </Modal>
    </ModuleSection>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Interest Saver Account Module
// ─────────────────────────────────────────────────────────────────────────────

export function InterestSaverModule() {
  const { isa, toggleIsa, setIsaEntries, loan } = useLoanStore()
  const { enabled, entries } = isa

  const [open, setOpen]       = useState(false)
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [draft, setDraft]     = useState<InterestSaverDTO>(newIsaEntry())

  const openAdd = () => {
    setDraft(newIsaEntry())
    setEditIdx(null)
    setOpen(true)
  }

  const openEdit = (i: number) => {
    setDraft({ ...entries[i] })
    setEditIdx(i)
    setOpen(true)
  }

  const handleSave = () => {
    if (editIdx !== null) {
      setIsaEntries(entries.map((e, i) => i === editIdx ? draft : e))
    } else {
      setIsaEntries([...entries, draft])
    }
    setOpen(false)
  }

  return (
    <ModuleSection
      title="Interest saver account"
      description="Offset account reduces interest on principal"
      enabled={enabled}
      onToggle={toggleIsa}
    >
      <EntryCardList
        entries={entries}
        addLabel="Add transaction"
        emptyMessage="No ISA transactions"
        onAdd={openAdd}
        onEdit={openEdit}
        onRemove={(i) => setIsaEntries(entries.filter((_, idx) => idx !== i))}
        renderSummary={(e) => (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-display font-600 text-ink-800">{fmt(e.amount)}</span>
            <span className="text-xs text-ink-400">{PAYMENT_MODE_LABELS[e.paymentMode]}</span>
            <span className="text-xs text-ink-400">·</span>
            <span className={`text-xs font-medium ${e.transactionType === 'DEPOSIT' ? 'text-sage-600' : 'text-rose-500'}`}>
              {e.transactionType === 'DEPOSIT' ? 'Deposit' : 'Withdraw'}
            </span>
            <span className="text-xs text-ink-400">·</span>
            <span className="text-xs text-ink-400">Month {e.startingMonth}</span>
          </div>
        )}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editIdx !== null ? 'Edit ISA transaction' : 'Add ISA transaction'}
        description="Offset your savings balance against principal to reduce interest."
        icon={<PiggyBank size={18} className="text-sage-600" />}
        hint={`₹${draft.amount.toLocaleString('en-IN')} will be ${draft.transactionType === 'DEPOSIT' ? 'deposited' : 'withdrawn'} ${PAYMENT_MODE_LABELS[draft.paymentMode].toLowerCase()} from month ${draft.startingMonth}.`}
        onSave={handleSave}
        saveLabel={editIdx !== null ? 'Save changes' : 'Save transaction'}
      >
        <NumberInput
          label="Amount (₹)"
          prefix="₹"
          value={draft.amount}
          onChange={(v) => setDraft(d => ({ ...d, amount: v }))}
          min={1} max={10_000_000} placeholder="10,000"
        />
        <PaymentModeSelect
          label="Frequency"
          value={draft.paymentMode}
          onChange={(v) => setDraft(d => ({ ...d, paymentMode: v }))}
        />
        <Select
          label="Transaction type"
          value={draft.transactionType}
          onChange={(v) => setDraft(d => ({ ...d, transactionType: v as 'DEPOSIT' | 'WITHDRAW' }))}
          options={[
            { value: 'DEPOSIT',  label: 'Deposit' },
            { value: 'WITHDRAW', label: 'Withdraw' },
          ]}
        />
        <MonthOrDateInput
          label="Starting from month"
          value={draft.startingMonth}
          onChange={(v) => setDraft(d => ({ ...d, startingMonth: v }))}
          loanStartDate={loan.firstEmiDate}
        />
      </Modal>
    </ModuleSection>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Moratorium Module
// ─────────────────────────────────────────────────────────────────────────────

export function MoratoriumModule() {
  const { moratorium, toggleMoratorium, setMoratoriumConfig } = useLoanStore()
  const { enabled, config } = moratorium

  return (
    <ModuleSection
      title="Moratorium period"
      description="Defer EMI payments for initial months"
      enabled={enabled}
      onToggle={toggleMoratorium}
    >
      <div className="grid grid-cols-2 gap-4">
        <NumberInput
          label="Duration (months)"
          value={config.durationMonths}
          onChange={(v) => setMoratoriumConfig({ ...config, durationMonths: v })}
          suffix="mo" min={1} max={24} placeholder="3"
        />
        <div>
          <label className="label">Interest during moratorium</label>
          <div className="flex gap-2 mt-1">
            {[
              { value: true,  label: 'Pay interest' },
              { value: false, label: 'Capitalise' },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setMoratoriumConfig({ ...config, payInterestDuringMoratorium: opt.value })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  config.payInterestDuringMoratorium === opt.value
                    ? 'bg-ink-900 text-white border-ink-900'
                    : 'bg-white text-ink-500 border-ink-200 hover:border-ink-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ModuleSection>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Fees & Charges Module
// ─────────────────────────────────────────────────────────────────────────────

export function FeesModule() {
  const { fees, toggleFees, setFeeEntries, loan } = useLoanStore()
  const { enabled, entries } = fees

  const [open, setOpen]       = useState(false)
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [draft, setDraft]     = useState<FeeDTO>(newFee())

  const openAdd = () => {
    setDraft(newFee())
    setEditIdx(null)
    setOpen(true)
  }

  const openEdit = (i: number) => {
    setDraft({ ...entries[i] })
    setEditIdx(i)
    setOpen(true)
  }

  const handleSave = () => {
    if (editIdx !== null) {
      setFeeEntries(entries.map((e, i) => i === editIdx ? draft : e))
    } else {
      setFeeEntries([...entries, draft])
    }
    setOpen(false)
  }

  return (
    <ModuleSection
      title="Fees & charges"
      description="Processing fees, insurance premiums, etc."
      enabled={enabled}
      onToggle={toggleFees}
    >
      <EntryCardList
        entries={entries}
        addLabel="Add fee"
        emptyMessage="No fees added"
        onAdd={openAdd}
        onEdit={openEdit}
        onRemove={(i) => setFeeEntries(entries.filter((_, idx) => idx !== i))}
        renderSummary={(e) => (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-display font-600 text-ink-800">{fmt(e.amount)}</span>
            <span className="text-xs text-ink-400">{PAYMENT_MODE_LABELS[e.paymentMode]}</span>
            <span className="text-xs text-ink-400">·</span>
            <span className="text-xs text-ink-400">Month {e.startingMonth}</span>
          </div>
        )}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editIdx !== null ? 'Edit fee' : 'Add fee'}
        description="Include processing fees, insurance or other charges in your loan cost."
        icon={<Receipt size={18} className="text-sage-600" />}
        hint={`₹${draft.amount.toLocaleString('en-IN')} ${PAYMENT_MODE_LABELS[draft.paymentMode].toLowerCase()} fee applied from month ${draft.startingMonth}.`}
        onSave={handleSave}
        saveLabel={editIdx !== null ? 'Save changes' : 'Save fee'}
      >
        <NumberInput
          label="Amount (₹)"
          prefix="₹"
          value={draft.amount}
          onChange={(v) => setDraft(d => ({ ...d, amount: v }))}
          min={1} max={5_000_000} placeholder="5,000"
        />
        <PaymentModeSelect
          label="Frequency"
          value={draft.paymentMode}
          onChange={(v) => setDraft(d => ({ ...d, paymentMode: v }))}
        />
        <MonthOrDateInput
          label="Starting month"
          value={draft.startingMonth}
          onChange={(v) => setDraft(d => ({ ...d, startingMonth: v }))}
          loanStartDate={loan.firstEmiDate}
        />
      </Modal>
    </ModuleSection>
  )
}
