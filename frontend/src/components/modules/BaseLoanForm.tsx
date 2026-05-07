import dayjs from 'dayjs'
import { useLoanStore } from '@/stores/loanStore'
import { SliderField, NumberInput, DateInput } from '@/components/ui'
import { formatRupees, formatTenure } from '@/utils'

// Practical limits
const LOAN   = { min: 100_000,  max: 100_000_000 }  // ₹1 L – ₹10 Cr
const RATE   = { min: 0.1,      max: 50 }            // 0.1% – 50%
const TENURE = { min: 1,        max: 480 }           // 1 mo – 40 yrs

// Slider display ranges (thumb stays here; label shows real value if beyond)
const LOAN_SLIDER_MAX   = 50_000_000   // ₹5 Cr
const RATE_SLIDER_MAX   = 30           // 30%
const TENURE_SLIDER_MAX = 360          // 30 yrs

const EMI_DATE_MIN = dayjs().subtract(20, 'year').toDate()
const EMI_DATE_MAX = dayjs().add(3, 'year').toDate()

export default function BaseLoanForm() {
  const { loan, setLoan } = useLoanStore()

  return (
    <div className="space-y-7">
      {/* Loan Amount */}
      <div className="space-y-3">
        <SliderField
          label="Loan amount"
          value={loan.loanAmount}
          min={LOAN.min}
          max={LOAN_SLIDER_MAX}
          step={50000}
          onChange={(v) => setLoan({ loanAmount: v })}
          format={(v) => formatRupees(v, true)}
        />
        <NumberInput
          prefix="₹"
          value={loan.loanAmount}
          onChange={(v) => setLoan({ loanAmount: v })}
          min={LOAN.min}
          max={LOAN.max}
          step={50000}
          placeholder="50,00,000"
        />
      </div>

      {/* Interest Rate */}
      <div className="space-y-3">
        <SliderField
          label="Annual interest rate"
          value={loan.annualInterestRate}
          min={RATE.min}
          max={RATE_SLIDER_MAX}
          step={0.05}
          onChange={(v) => setLoan({ annualInterestRate: v })}
          format={(v) => `${v.toFixed(2)}%`}
        />
        <NumberInput
          suffix="%"
          value={loan.annualInterestRate}
          onChange={(v) => setLoan({ annualInterestRate: v })}
          min={RATE.min}
          max={RATE.max}
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
          max={TENURE_SLIDER_MAX}
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
            min={TENURE.min}
            max={TENURE.max}
            className="flex-1"
            placeholder="240"
          />
          <span className="text-ink-300 text-sm">or</span>
          <NumberInput
            suffix="yr"
            value={Math.round(loan.tenureMonths / 12)}
            onChange={(v) => setLoan({ tenureMonths: Math.round(v) * 12 })}
            min={1}
            max={40}
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
        minDate={EMI_DATE_MIN}
        maxDate={EMI_DATE_MAX}
      />
    </div>
  )
}
