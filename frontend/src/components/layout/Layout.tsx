import { Link, NavLink } from 'react-router-dom'
import { Calculator, BarChart3, Receipt, PiggyBank, GitCompare } from 'lucide-react'  // History removed (DB disabled)
import { cn } from '@/utils'

const NAV = [
  { to: '/emi-calculator', label: 'EMI Calculator',      icon: Calculator },
  { to: '/statistics',     label: 'Statistics',          icon: BarChart3  },
  { to: '/tax',            label: 'Income Tax Planner',  icon: Receipt    },
  // { to: '/history', label: 'History', icon: History },  // DB disabled
]

const NAV_SOON = [
  { label: 'SIP Planner',     icon: PiggyBank  },
  { label: 'Loan Comparison', icon: GitCompare },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--page-bg)]">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 bg-white border-r border-ink-100 sticky top-0 h-screen flex flex-col z-40">

        {/* Logo → home */}
        <Link
          to="/"
          className="flex items-center gap-2.5 h-14 px-5 border-b border-ink-100 hover:bg-ink-50 transition-colors duration-150"
        >
          <div className="w-7 h-7 rounded-lg bg-ink-900 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-display font-800">₹</span>
          </div>
          <span className="font-display font-700 text-ink-900 text-lg tracking-tight">
            Cash<span className="text-sage-500">Ignite</span>
          </span>
        </Link>

        {/* Nav ─────────────────────────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">

          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm w-full transition-all duration-150',
                  isActive
                    ? 'bg-ink-900 text-white font-medium'
                    : 'text-ink-500 hover:text-ink-800 hover:bg-ink-50'
                )
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}

          <div className="pt-4 pb-1.5 px-3">
            <span className="text-[10px] font-medium text-ink-300 uppercase tracking-widest">
              Coming soon
            </span>
          </div>

          {NAV_SOON.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-300 cursor-not-allowed select-none"
            >
              <Icon size={15} />
              <span>{label}</span>
              <span className="ml-auto text-[10px] bg-ink-100 text-ink-400 px-1.5 py-0.5 rounded font-medium">
                Soon
              </span>
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 px-8 py-8">
        {children}
      </main>

      {/* ── Mobile bottom nav ────────────────────────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-t border-ink-100 flex">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-xs transition-all duration-150',
                isActive
                  ? 'text-ink-900 font-medium'
                  : 'text-ink-400 hover:text-ink-700'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn(
                  'flex items-center justify-center w-8 h-6 rounded-lg transition-colors duration-150',
                  isActive ? 'bg-ink-900' : 'bg-transparent',
                )}>
                  <Icon size={14} className={isActive ? 'text-white' : 'text-ink-400'} />
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
