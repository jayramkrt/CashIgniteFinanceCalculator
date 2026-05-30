import { forwardRef } from 'react'
import { formatRupees, formatTenure, formatPct } from '@/utils'
import type { CalculationResultDTO } from '@/types'

interface ShareCardProps {
  result: CalculationResultDTO
  loanAmount: number
  annualRate: number
  tenureMonths: number
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ result, loanAmount, annualRate, tenureMonths }, ref) => {
    const { summary } = result
    const total        = summary.totalPrincipal + summary.totalInterestPayable
    const iPct         = summary.totalInterestPayable / total
    const pPct         = summary.totalPrincipal / total
    const interestPct  = Math.round(iPct * 100)
    const hasPrepSaving = (summary.interestSavedByPrepayment ?? 0) > 0
    const hasISASaving  = (summary.interestSavedByInterestSaver ?? 0) > 0

    // Donut
    const r    = 64
    const circ = 2 * Math.PI * r
    const pLen = circ * pPct
    const iLen = circ * iPct

    const cell = (label: string, value: string, accent = false) => (
      <div key={label} style={{
        background: accent ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.75)',
        borderRadius: 12, padding: '12px 16px',
        border: `1px solid ${accent ? 'rgba(124,58,237,0.14)' : 'rgba(15,23,42,0.06)'}`,
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: accent ? '#7C3AED' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: accent ? '#6D28D9' : '#0f172a' }}>{value}</div>
      </div>
    )

    return (
      <div
        ref={ref}
        style={{
          width: 860,
          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
          background: 'linear-gradient(135deg, #faf9ff 0%, #f3f0ff 45%, #fdf2f8 100%)',
          borderRadius: 24,
          overflow: 'hidden',
          boxSizing: 'border-box',
          padding: '32px 36px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Decorative blob */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, rgba(236,72,153,0.08) 60%, transparent 80%)',
          pointerEvents: 'none',
        }} />

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="CashIgnite" style={{ width: 38, height: 38, borderRadius: 10 }} />
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.4px', lineHeight: 1 }}>
                Cash<span style={{ color: '#7C3AED' }}>Ignite</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(15,23,42,0.38)', marginTop: 2 }}>cashignite.in</div>
            </div>
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: 20,
            background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)',
            fontSize: 11, fontWeight: 600, color: '#6D28D9',
          }}>
            🏠 Home Loan EMI Summary
          </div>
        </div>

        {/* ── Body: left + right ── */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* Left column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* EMI hero */}
            <div style={{
              background: 'white', borderRadius: 16, padding: '20px 24px',
              boxShadow: '0 2px 16px rgba(124,58,237,0.10)',
              border: '1px solid rgba(124,58,237,0.08)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Monthly EMI
              </div>
              <div style={{ fontSize: 46, fontWeight: 800, color: '#0f172a', letterSpacing: '-2px', lineHeight: 1 }}>
                {formatRupees(summary.emiAmount)}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                for {formatTenure(summary.actualTenureMonths)}
              </div>
            </div>

            {/* Metrics 2×3 grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {cell('Loan Amount',    formatRupees(loanAmount, true))}
              {cell('Interest Rate',  `${annualRate}% p.a.`)}
              {cell('Tenure',         formatTenure(tenureMonths))}
              {cell('Total Interest', formatRupees(summary.totalInterestPayable, true))}
              {cell('Total Payment',  formatRupees(summary.totalPayment, true))}
              {cell('Effective Rate', `${formatPct(summary.effectiveAnnualRate)} p.a.`, true)}
            </div>

            {/* Prepayment / ISA savings row */}
            {(hasPrepSaving || hasISASaving) && (
              <div style={{ display: 'flex', gap: 10 }}>
                {hasPrepSaving && (
                  <div style={{
                    flex: 1, borderRadius: 12, padding: '12px 16px',
                    background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                      Saved via Prepayments
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#047857' }}>
                      {formatRupees(summary.interestSavedByPrepayment!, true)}
                    </div>
                    {summary.tenureReducedByMonths ? (
                      <div style={{ fontSize: 10, color: '#059669', marginTop: 2 }}>
                        ↓ {formatTenure(summary.tenureReducedByMonths)} shorter
                      </div>
                    ) : null}
                  </div>
                )}
                {hasISASaving && (
                  <div style={{
                    flex: 1, borderRadius: 12, padding: '12px 16px',
                    background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                      Saved via ISA
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#047857' }}>
                      {formatRupees(summary.interestSavedByInterestSaver!, true)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right column: donut card */}
          <div style={{
            width: 230, flexShrink: 0,
            background: 'white', borderRadius: 20, padding: '24px 20px',
            boxShadow: '0 2px 16px rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.08)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
          }}>
            {/* Donut */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={152} height={152} viewBox="0 0 152 152" style={{ transform: 'rotate(-90deg)' }}>
                <defs>
                  <linearGradient id="sc-p" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7C3AED"/>
                    <stop offset="100%" stopColor="#8B5CF6"/>
                  </linearGradient>
                  <linearGradient id="sc-i" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EC4899"/>
                    <stop offset="100%" stopColor="#F97316"/>
                  </linearGradient>
                </defs>
                <circle cx={76} cy={76} r={r} fill="none" stroke="#F3F0FF" strokeWidth={14}/>
                <circle cx={76} cy={76} r={r} fill="none"
                  stroke="url(#sc-p)" strokeWidth={14}
                  strokeDasharray={`${pLen} ${circ - pLen}`} strokeDashoffset={0}/>
                <circle cx={76} cy={76} r={r} fill="none"
                  stroke="url(#sc-i)" strokeWidth={14}
                  strokeDasharray={`${iLen} ${circ - iLen}`} strokeDashoffset={-pLen}/>
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>interest</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                  {interestPct}%
                </div>
              </div>
            </div>

            {/* Legend */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { dot: '#7C3AED', label: 'Principal', value: formatRupees(summary.totalPrincipal, true) },
                { dot: '#F97316', label: 'Interest',  value: formatRupees(summary.totalInterestPayable, true) },
              ].map(({ dot, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: dot, flexShrink: 0 }}/>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{value}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Total</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{formatRupees(summary.totalPayment, true)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 14, borderTop: '1px solid rgba(15,23,42,0.06)',
        }}>
          <span style={{ fontSize: 10, color: 'rgba(15,23,42,0.32)' }}>
            Bank-accurate reducing balance method · Generated on CashIgnite
          </span>
          <span style={{ fontSize: 10, color: 'rgba(15,23,42,0.32)' }}>cashignite.in</span>
        </div>
      </div>
    )
  }
)

ShareCard.displayName = 'ShareCard'
export default ShareCard
