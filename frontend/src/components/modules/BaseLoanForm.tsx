import { useLoanStore } from '@/stores/loanStore'
import { SliderField, NumberInput, DateInput } from '@/components/ui'
import { formatRupees, formatTenure } from '@/utils'

export default function BaseLoanForm() {
  const { loan, setLoan } = useLoanStore()

  return (
    <div className="space-y-7">
      {/* Loan Amount */}
      <div className="space-y-3">
        <SliderField
          label="Loan amount"
          value={loan.loanAmount}
          min={100000}
          max={50000000}
          step={50000}
          onChange={(v) => setLoan({ loanAmount: v })}
          format={(v) => formatRupees(v, true)}
        />
        <NumberInput
          prefix="₹"
          value={loan.loanAmount}
          onChange={(v) => setLoan({ loanAmount: v })}
          min={100000}
          max={50000000}
          step={50000}
          placeholder="50,00,000"
        />
      </div>

      {/* Interest Rate */}
      <div className="space-y-3">
        <SliderField
          label="Annual interest rate"
          value={loan.annualInterestRate}
          min={1}
          max={20}
          step={0.05}
          onChange={(v) => setLoan({ annualInterestRate: v })}
          format={(v) => `${v.toFixed(2)}%`}
        />
        <NumberInput
          suffix="%"
          value={loan.annualInterestRate}
          onChange={(v) => setLoan({ annualInterestRate: v })}
          min={0.01}
          max={100}
          step={0.05}
          placeholder="8.50"
        />
      </div>

      {/* Tenure */}
      <div className="space-y-3">
        <SliderField
          label="Loan tenure"
          value={loan.tenureMonths}
          min={12}
          max={360}
          step={12}
          onChange={(v) => setLoan({ tenureMonths: v })}
          format={(v) => formatTenure(v)}
          hint="in months"
        />
        <div className="flex gap-2 items-center">
          <NumberInput
            suffix="mo"
            value={loan.tenureMonths}
            onChange={(v) => setLoan({ tenureMonths: v })}
            min={1}
            max={600}
            className="flex-1"
            placeholder="240"
          />
          <span className="text-ink-300 text-sm">or</span>
          <NumberInput
            suffix="yr"
            value={Math.round(loan.tenureMonths / 12)}
            onChange={(v) => setLoan({ tenureMonths: v * 12 })}
            min={1}
            max={50}
            className="flex-1"
            placeholder="20"
          />
        </div>
      </div>

      {/* First EMI Date */}
      <DateInput
        label="First EMI date"
        value={loan.firstEmiDate}
        onChange={(d) => d && setLoan({ firstEmiDate: d })}
      />
    </div>
  )
}
