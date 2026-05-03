import { Link } from 'react-router-dom'
import { Calculator, ArrowRight } from 'lucide-react'

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex flex-col">

      {/* ── Top nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-ink-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-ink-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-display font-800">₹</span>
            </div>
            <span className="font-display font-700 text-ink-900 text-lg tracking-tight">
              Cash<span className="text-sage-500">Ignite</span>
            </span>
          </Link>

          {/* CTA */}
          <Link
            to="/emi-calculator"
            className="btn-primary inline-flex items-center gap-1.5 text-sm"
          >
            <Calculator size={14} />
            EMI Calculator
            <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      {/* ── Page body ────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {children}
      </div>
    </div>
  )
}
