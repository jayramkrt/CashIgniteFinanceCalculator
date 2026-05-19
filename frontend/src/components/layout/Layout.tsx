import { Link, NavLink } from 'react-router-dom'
import { Calculator, BarChart3, Receipt, PiggyBank, GitCompare } from 'lucide-react'
import { cn } from '@/utils'

const NAV = [
  { to: '/emi-calculator', label: 'EMI Calculator',     icon: Calculator },
  { to: '/statistics',     label: 'Statistics',         icon: BarChart3  },
  { to: '/tax',            label: 'Income Tax Planner', icon: Receipt    },
]

const NAV_SOON = [
  { label: 'SIP Planner',     icon: PiggyBank  },
  { label: 'Loan Comparison', icon: GitCompare },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--page-bg)' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className="hidden sm:flex w-56 shrink-0 sticky top-0 h-screen flex-col z-40"
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 h-14 px-5 transition-colors duration-150"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-display font-800">₹</span>
          </div>
          <span className="font-display font-700 text-lg tracking-tight text-white">
            Cash<span style={{ color: '#7090F0' }}>Ignite</span>
          </span>
        </Link>

        {/* Nav */}
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
                    ? 'font-medium'
                    : 'hover:bg-white/[0.06]'
                )
              }
              style={({ isActive }) => isActive
                ? { background: 'var(--sidebar-active-bg)', color: 'var(--sidebar-active-text)' }
                : { color: 'var(--sidebar-text)' }
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}

          <div className="pt-5 pb-1.5 px-3">
            <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Coming soon
            </span>
          </div>

          {NAV_SOON.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-not-allowed select-none"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              <Icon size={15} />
              <span>{label}</span>
              <span
                className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
              >
                Soon
              </span>
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 px-4 py-4 sm:px-8 sm:py-8 pb-20 sm:pb-8">
        {children}
      </main>

      {/* ── Mobile bottom nav ────────────────────────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-ink-100 flex safe-area-inset-bottom">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-xs transition-all duration-150',
                isActive ? 'text-ink-900 font-medium' : 'text-ink-400 hover:text-ink-700'
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
