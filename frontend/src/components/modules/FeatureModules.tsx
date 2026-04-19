import { useLoanStore } from '@/stores/loanStore'
import {
  ModuleSection, TableGrid, PaymentModeSelect,
  NumberInput, Select,
} from '@/components/ui'
import type { PrepaymentDTO, InterestChangeDTO, InterestSaverDTO, FeeDTO } from '@/types'

// ── helpers ───────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// 1. Prepayment Module
// ─────────────────────────────────────────────────────────────────────────────

export function PrepaymentModule() {
  const { prepayment, togglePrepayment, setPrepaymentEntries } = useLoanStore()
  const { enabled, entries } = prepayment

  const update = (i: number, partial: Partial<PrepaymentDTO>) => {
    const next = entries.map((e, idx) => idx === i ? { ...e, ...partial } : e)
    setPrepaymentEntries(next)
  }

  return (
    <ModuleSection
      title="Prepayments"
      description="Lump-sum or recurring extra payments"
      enabled={enabled}
      onToggle={togglePrepayment}
    >
      <TableGrid<PrepaymentDTO>
        rows={entries}
        addLabel="Add prepayment"
        emptyMessage="No prepayments added yet"
        onAdd={() => setPrepaymentEntries([...entries, newPrepayment()])}
        onRemove={(i) => setPrepaymentEntries(entries.filter((_, idx) => idx !== i))}
        onChange={update}
        columns={[
          {
            key: 'paymentMode', header: 'Frequency', width: '140px',
            render: (row, _, onChange) => (
              <PaymentModeSelect
                value={row.paymentMode}
                onChange={(v) => onChange({ paymentMode: v })}
              />
            ),
          },
          {
            key: 'effect', header: 'Effect', width: '140px',
            render: (row, _, onChange) => (
              <Select
                value={row.effect}
                onChange={(v) => onChange({ effect: v as PrepaymentDTO['effect'] })}
                options={[
                  { value: 'REDUCE_TERM', label: 'Reduce term' },
                  { value: 'REDUCE_EMI',  label: 'Reduce EMI' },
                ]}
              />
            ),
          },
          {
            key: 'amount', header: 'Amount (₹)',
            render: (row, _, onChange) => (
              <NumberInput
                value={row.amount}
                onChange={(v) => onChange({ amount: v })}
                prefix="₹" min={1} placeholder="1,00,000"
              />
            ),
          },
          {
            key: 'startingMonth', header: 'Starting month', width: '120px',
            render: (row, _, onChange) => (
              <NumberInput
                value={row.startingMonth}
                onChange={(v) => onChange({ startingMonth: v })}
                min={1} placeholder="12"
              />
            ),
          },
        ]}
      />
    </ModuleSection>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Variable Interest Rate Module
// ─────────────────────────────────────────────────────────────────────────────

export function VariableRateModule() {
  const { variableRate, toggleVariableRate, setVariableRateEntries } = useLoanStore()
  const { enabled, entries } = variableRate

  const update = (i: number, partial: Partial<InterestChangeDTO>) => {
    setVariableRateEntries(entries.map((e, idx) => idx === i ? { ...e, ...partial } : e))
  }

  return (
    <ModuleSection
      title="Variable interest rate"
      description="Schedule future rate changes"
      enabled={enabled}
      onToggle={toggleVariableRate}
    >
      <TableGrid<InterestChangeDTO>
        rows={entries}
        addLabel="Add rate change"
        emptyMessage="No rate changes scheduled"
        onAdd={() => setVariableRateEntries([...entries, newRateChange()])}
        onRemove={(i) => setVariableRateEntries(entries.filter((_, idx) => idx !== i))}
        onChange={update}
        columns={[
          {
            key: 'newAnnualRate', header: 'New rate (%)', width: '120px',
            render: (row, _, onChange) => (
              <NumberInput
                value={row.newAnnualRate}
                onChange={(v) => onChange({ newAnnualRate: v })}
                suffix="%" min={0.01} max={100} step={0.05} placeholder="9.00"
              />
            ),
          },
          {
            key: 'startingMonth', header: 'From month', width: '110px',
            render: (row, _, onChange) => (
              <NumberInput
                value={row.startingMonth}
                onChange={(v) => onChange({ startingMonth: v })}
                min={1} placeholder="13"
              />
            ),
          },
          {
            key: 'effect', header: 'Effect',
            render: (row, _, onChange) => (
              <Select
                value={row.effect}
                onChange={(v) => onChange({ effect: v as InterestChangeDTO['effect'] })}
                options={[
                  { value: 'CHANGE_LOAN_TERM', label: 'Adjust term' },
                  { value: 'REDUCE_EMI',        label: 'Adjust EMI' },
                ]}
              />
            ),
          },
        ]}
      />
    </ModuleSection>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Interest Saver Account Module
// ─────────────────────────────────────────────────────────────────────────────

export function InterestSaverModule() {
  const { isa, toggleIsa, setIsaEntries } = useLoanStore()
  const { enabled, entries } = isa

  const update = (i: number, partial: Partial<InterestSaverDTO>) => {
    setIsaEntries(entries.map((e, idx) => idx === i ? { ...e, ...partial } : e))
  }

  return (
    <ModuleSection
      title="Interest saver account"
      description="Offset account reduces interest on principal"
      enabled={enabled}
      onToggle={toggleIsa}
    >
      <TableGrid<InterestSaverDTO>
        rows={entries}
        addLabel="Add transaction"
        emptyMessage="No ISA transactions"
        onAdd={() => setIsaEntries([...entries, newIsaEntry()])}
        onRemove={(i) => setIsaEntries(entries.filter((_, idx) => idx !== i))}
        onChange={update}
        columns={[
          {
            key: 'paymentMode', header: 'Frequency', width: '140px',
            render: (row, _, onChange) => (
              <PaymentModeSelect
                value={row.paymentMode}
                onChange={(v) => onChange({ paymentMode: v })}
              />
            ),
          },
          {
            key: 'transactionType', header: 'Type', width: '120px',
            render: (row, _, onChange) => (
              <Select
                value={row.transactionType}
                onChange={(v) => onChange({ transactionType: v as 'DEPOSIT' | 'WITHDRAW' })}
                options={[
                  { value: 'DEPOSIT',  label: 'Deposit' },
                  { value: 'WITHDRAW', label: 'Withdraw' },
                ]}
              />
            ),
          },
          {
            key: 'amount', header: 'Amount (₹)',
            render: (row, _, onChange) => (
              <NumberInput
                value={row.amount}
                onChange={(v) => onChange({ amount: v })}
                prefix="₹" min={1} placeholder="10,000"
              />
            ),
          },
          {
            key: 'startingMonth', header: 'From month', width: '110px',
            render: (row, _, onChange) => (
              <NumberInput
                value={row.startingMonth}
                onChange={(v) => onChange({ startingMonth: v })}
                min={1} placeholder="1"
              />
            ),
          },
        ]}
      />
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
  const { fees, toggleFees, setFeeEntries } = useLoanStore()
  const { enabled, entries } = fees

  const update = (i: number, partial: Partial<FeeDTO>) => {
    setFeeEntries(entries.map((e, idx) => idx === i ? { ...e, ...partial } : e))
  }

  return (
    <ModuleSection
      title="Fees & charges"
      description="Processing fees, insurance premiums, etc."
      enabled={enabled}
      onToggle={toggleFees}
    >
      <TableGrid<FeeDTO>
        rows={entries}
        addLabel="Add fee"
        emptyMessage="No fees added"
        onAdd={() => setFeeEntries([...entries, newFee()])}
        onRemove={(i) => setFeeEntries(entries.filter((_, idx) => idx !== i))}
        onChange={update}
        columns={[
          {
            key: 'paymentMode', header: 'Frequency', width: '140px',
            render: (row, _, onChange) => (
              <PaymentModeSelect
                value={row.paymentMode}
                onChange={(v) => onChange({ paymentMode: v })}
              />
            ),
          },
          {
            key: 'amount', header: 'Amount (₹)',
            render: (row, _, onChange) => (
              <NumberInput
                value={row.amount}
                onChange={(v) => onChange({ amount: v })}
                prefix="₹" min={1} placeholder="5,000"
              />
            ),
          },
          {
            key: 'startingMonth', header: 'Starting month', width: '120px',
            render: (row, _, onChange) => (
              <NumberInput
                value={row.startingMonth}
                onChange={(v) => onChange({ startingMonth: v })}
                min={1} placeholder="12"
              />
            ),
          },
        ]}
      />
    </ModuleSection>
  )
}
