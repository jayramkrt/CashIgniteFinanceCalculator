import { Link } from 'react-router-dom'
import { Calculator, ArrowRight } from 'lucide-react'

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--page-bg)' }}>

      {/* CTA only — no duplicate logo (sidebar already shows it) */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{ background: 'rgba(240,244,250,0.85)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-end">
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
