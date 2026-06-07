import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth, signOut } from '../lib/auth.jsx'

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, loading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  function close() { setMenuOpen(false) }

  return (
    <header className="sticky top-0 z-50 wc-navbar">
      {/* Host nations strip */}
      <div className="text-center py-0.5 text-[10px] font-mono tracking-[0.2em] uppercase"
           style={{background: 'linear-gradient(90deg, #c41230, #f5c842, #c41230)', color: '#04091e', fontWeight: 700}}>
        🇺🇸 USA &nbsp;·&nbsp; 🇨🇦 CANADA &nbsp;·&nbsp; 🇲🇽 MEXICO &nbsp;·&nbsp; FIFA WORLD CUP 2026™
      </div>

      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14 gap-3">
        {/* Logo with kicked ball */}
        <Link to="/" className="flex items-center gap-2.5 min-w-0" onClick={close}>
          <span className="text-4xl leading-none ball-kicked select-none">⚽</span>
          <div className="min-w-0">
            <div className="font-display text-2xl tracking-widest leading-none" style={{color: '#f5c842'}}>
              WC 2026
            </div>
            <div className="text-[9px] font-mono uppercase tracking-[0.15em] -mt-0.5" style={{color: '#7a8fb0'}}>
              Prediction Pool
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-1 items-center">
          <NavLink to="/how-it-works" current={pathname}>How it Works</NavLink>
          <NavLink to="/live" current={pathname}>🔴 Live</NavLink>
          {!loading && user && (
            <>
              <NavLink to="/" current={pathname}>Dashboard</NavLink>
              <NavLink to="/bracket/me" current={pathname}>Bracket</NavLink>
              <button
                onClick={signOut}
                className="px-3 py-1.5 rounded text-xs font-mono hover:text-gold ml-1 transition-colors"
                style={{color: '#7a8fb0'}}
                title={user.email}
              >
                Sign out
              </button>
            </>
          )}
          {!loading && !user && (
            <>
              <NavLink to="/sign-in" current={pathname}>Sign In</NavLink>
              <NavLink to="/sign-up" current={pathname} highlight>Sign Up</NavLink>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg transition-colors"
          style={{color: '#f5c842'}}
          aria-label="Menu"
        >
          <span className={`block w-5 h-0.5 transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}
                style={{background: '#f5c842'}} />
          <span className={`block w-5 h-0.5 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`}
                style={{background: '#f5c842'}} />
          <span className={`block w-5 h-0.5 transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}
                style={{background: '#f5c842'}} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-3 space-y-1"
             style={{background: '#04091e', borderColor: '#0d1f3d'}}>
          <MobileLink to="/how-it-works" current={pathname} onClick={close}>How it Works</MobileLink>
          <MobileLink to="/live" current={pathname} onClick={close}>🔴 Live Scores</MobileLink>
          {!loading && user && (
            <>
              <MobileLink to="/" current={pathname} onClick={close}>Dashboard</MobileLink>
              <MobileLink to="/enter" current={pathname} onClick={close}>My Bracket</MobileLink>
              <MobileLink to="/bracket/me" current={pathname} onClick={close}>View Bracket</MobileLink>
              <button
                onClick={() => { signOut(); close() }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-mono transition-colors"
                style={{color: '#7a8fb0'}}
              >
                Sign out ({user.email})
              </button>
            </>
          )}
          {!loading && !user && (
            <>
              <MobileLink to="/sign-in" current={pathname} onClick={close}>Sign In</MobileLink>
              <MobileLink to="/sign-up" current={pathname} onClick={close}>Sign Up</MobileLink>
            </>
          )}
        </div>
      )}
    </header>
  )
}

function NavLink({ to, current, children, highlight }) {
  const active = current === to
  if (highlight && !active) {
    return (
      <Link to={to}
        className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
        style={{background: '#c41230', color: '#fff'}}>
        {children}
      </Link>
    )
  }
  return (
    <Link to={to}
      className="px-3 py-1.5 rounded text-sm font-medium transition-all"
      style={active
        ? {background: '#f5c842', color: '#04091e', fontWeight: 700}
        : {color: '#7a8fb0'}
      }
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#f5c842' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#7a8fb0' }}
    >
      {children}
    </Link>
  )
}

function MobileLink({ to, current, onClick, children }) {
  const active = current === to
  return (
    <Link to={to} onClick={onClick}
      className="block px-4 py-3 rounded-xl text-sm font-medium transition-colors"
      style={active
        ? {background: '#f5c842', color: '#04091e', fontWeight: 700}
        : {color: '#7a8fb0'}
      }
    >
      {children}
    </Link>
  )
}
