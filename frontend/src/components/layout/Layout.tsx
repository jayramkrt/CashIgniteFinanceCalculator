import { NavLink } from 'react-router-dom'
import { Calculator, BarChart3 } from 'lucide-react'  // History removed (DB disabled)
import { cn } from '@/utils'

const NAV = [
  { to: '/',           label: 'Calculator', icon: Calculator },
  { to: '/statistics', label: 'Statistics', icon: BarChart3  },
  // { to: '/history', label: 'History', icon: History },  // DB disabled
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      {/* ── Top nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-ink-900 flex items-center justify-center">
              <span className="text-white text-xs font-display font-800">₹</span>
            </div>
            <span className="font-display font-700 text-ink-900 text-lg tracking-tight">
              EMI<span className="text-sage-500">Calc</span>
            </span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150',
                    isActive
                      ? 'bg-ink-900 text-white font-medium'
                      : 'text-ink-500 hover:text-ink-800 hover:bg-ink-50'
                  )
                }
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Page body ────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
