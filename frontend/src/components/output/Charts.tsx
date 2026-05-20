import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, TooltipProps,
} from 'recharts'
import { useLoanStore } from '@/stores/loanStore'
import { formatRupees } from '@/utils'

// ── Color palette ─────────────────────────────────────────────────────────────
const COLORS = {
  principal:  '#4D7547',
  interest:   '#E09B12',
  prepayment: '#96B390',
  fees:       '#ADAA93',
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-ink-100 rounded-xl shadow-card-lg px-4 py-3 text-sm min-w-[180px]">
      {label && <p className="font-medium text-ink-700 mb-2">{label}</p>}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: entry.color }} />
            <span className="text-ink-500 capitalize">{entry.name}</span>
          </div>
          <span className="font-mono font-medium text-ink-800 tabular-nums">
            {formatRupees(entry.value ?? 0, true)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Pie chart: Payment breakdown ──────────────────────────────────────────────

export function PaymentBreakdownPie() {
  const { result } = useLoanStore()
  if (!result) return null

  const { summary } = result
  const data = [
    { name: 'Principal',  value: summary.totalPrincipal,        color: COLORS.principal  },
    { name: 'Interest',   value: summary.totalInterestPayable,  color: COLORS.interest   },
    ...(summary.totalPrepaymentAmount > 0
      ? [{ name: 'Prepayment', value: summary.totalPrepaymentAmount, color: COLORS.prepayment }]
      : []),
    ...(summary.totalFees > 0
      ? [{ name: 'Fees', value: summary.totalFees, color: COLORS.fees }]
      : []),
  ]

  return (
    <div>
      <h3 className="text-sm font-display font-600 text-ink-800 mb-4">Payment breakdown</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
              <span className="text-xs text-ink-500">{d.name}</span>
            </div>
            <span className="text-xs font-mono text-ink-700 tabular-nums">{formatRupees(d.value, true)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Line chart: Principal vs Interest over time ───────────────────────────────

export function PrincipalInterestLine() {
  const { result } = useLoanStore()
  if (!result) return null

  // Sample yearly data for the line chart
  const data = result.yearlySchedule.map((row) => ({
    year: row.year,
    Principal: Math.round(row.totalPrincipal),
    Interest:  Math.round(row.totalInterest),
    Balance:   Math.round(row.closingBalance),
  }))

  return (
    <div>
      <h3 className="text-sm font-display font-600 text-ink-800 mb-4">Principal vs Interest (yearly)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E6DF" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#8A8770', fontFamily: 'DM Mono' }}
            tickFormatter={(v) => String(v)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#8A8770', fontFamily: 'DM Mono' }}
            tickFormatter={(v) => formatRupees(v, true).replace('₹', '')}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', fontFamily: 'Inter', color: '#4F4D38' }}
            iconType="square"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey="Principal"
            stroke={COLORS.principal}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="Interest"
            stroke={COLORS.interest}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Line chart: Outstanding balance over time ─────────────────────────────────

export function BalanceLine() {
  const { result } = useLoanStore()
  if (!result) return null

  const data = result.yearlySchedule.map((row) => ({
    year: row.year,
    Balance: Math.round(row.closingBalance),
    'Loan Paid': parseFloat(row.loanPaidPercentage.toFixed(1)),
  }))

  return (
    <div>
      <h3 className="text-sm font-display font-600 text-ink-800 mb-4">Outstanding balance</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E6DF" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#8A8770', fontFamily: 'DM Mono' }}
            tickFormatter={(v) => String(v)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#8A8770', fontFamily: 'DM Mono' }}
            tickFormatter={(v) => formatRupees(v, true).replace('₹', '')}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="Balance"
            stroke="#4F4D38"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
