import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Calculator, BarChart3, Receipt, PiggyBank, GitCompare, Home, LayoutDashboard, Menu, X, Zap } from 'lucide-react'
import { cn } from '@/utils'

const NAV = [
  { to: '/',                 label: 'Home',               mobileLabel: 'Home',    icon: LayoutDashboard },
  { to: '/emi-calculator',   label: 'EMI Calculator',     mobileLabel: 'EMI',     icon: Calculator },
  { to: '/loan-comparison',  label: 'Loan Comparison',    mobileLabel: 'Compare', icon: GitCompare },
  { to: '/rent-vs-buy',      label: 'Rent vs Buy',        mobileLabel: 'Rent/Buy',icon: Home       },
  { to: '/tax',              label: 'Income Tax Planner', mobileLabel: 'Tax',     icon: Receipt    },
  { to: '/statistics',       label: 'Statistics',         mobileLabel: 'Stats',   icon: BarChart3  },
]

const NAV_SOON = [
  { label: 'SIP Planner', icon: PiggyBank },
]

function Logo({ showSubtitle = false }: { showSubtitle?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img src="/logo.png" alt="CashIgnite" className="w-8 h-8 rounded-lg flex-shrink-0" />
      <div>
        <span className="font-display font-700 text-lg tracking-tight text-white leading-none block">
          Cash<span style={{ color: '#7090F0' }}>Ignite</span>
        </span>
        {showSubtitle && (
          <span className="text-[10px] leading-none" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Smart Financial Tools
          </span>
        )}
      </div>
    </Link>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()

  const handleNavClick = (to: string) => {
    setDrawerOpen(false)
    navigate(to)
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--page-bg)' }}>

      {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
      <aside
        className="hidden sm:flex w-56 shrink-0 sticky top-0 h-screen flex-col z-40"
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 h-16 px-5 transition-colors duration-150"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          <Logo showSubtitle />
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
                  isActive ? 'font-medium' : 'hover:bg-white/[0.06]'
                )
              }
              style={({ isActive }) => isActive
                ? { background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)', color: 'white' }
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

        {/* 100% Free badge */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={12} className="text-amber-400" />
            <span className="text-xs font-semibold text-white">100% Free</span>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
            No sign-up. No tracking.<br />Just accurate results.
          </p>
        </div>
      </aside>

      {/* ── Mobile top header ────────────────────────────────────────────── */}
      <header
        className="sm:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center px-4 gap-3"
        style={{ background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--sidebar-border)' }}
      >
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          <Menu size={20} />
        </button>
        <Logo />
      </header>

      {/* ── Mobile drawer overlay ─────────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="sm:hidden fixed inset-0 z-50 flex"
          onClick={() => setDrawerOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Drawer panel */}
          <div
            className="relative w-64 h-full flex flex-col"
            style={{ background: 'var(--sidebar-bg)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between h-14 px-4"
              style={{ borderBottom: '1px solid var(--sidebar-border)' }}
            >
              <Logo />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {NAV.map(({ to, label, icon: Icon }) => (
                <button
                  key={to}
                  type="button"
                  onClick={() => handleNavClick(to)}
                  className="flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm w-full transition-all duration-150 hover:bg-white/[0.06]"
                  style={{ color: 'var(--sidebar-text)' }}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}

              <div className="pt-5 pb-1.5 px-3">
                <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Coming soon
                </span>
              </div>

              {NAV_SOON.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm cursor-not-allowed select-none"
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
          </div>
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 px-4 pt-20 pb-24 sm:px-8 sm:py-8 sm:pb-8">
        {children}
      </main>

      {/* ── Mobile bottom nav (show top 4 only) ─────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-ink-100 flex safe-area-inset-bottom">
        {NAV.slice(0, 4).map(({ to, mobileLabel, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-all duration-150',
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
                <span className="text-[10px] leading-none">{mobileLabel}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
