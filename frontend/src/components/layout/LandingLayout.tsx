import { Link } from 'react-router-dom'
import { Calculator, ArrowRight } from 'lucide-react'

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--page-bg)' }}>

      <header
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{ background: 'rgba(240,244,250,0.85)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="CashIgnite" className="w-7 h-7 rounded-md flex-shrink-0" />
            <span className="font-semibold text-ink-900 text-base tracking-tight">
              Cash<span className="text-sage-500">Ignite</span>
            </span>
          </Link>

          {/* CTA */}
          <Link
            to="/emi-calculator"
            className="btn-primary inline-flex items-center gap-1.5 text-sm py-2 px-4"
          >
            <Calculator size={13} />
            EMI Calculator
            <ArrowRight size={12} />
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </div>
    </div>
  )
}
