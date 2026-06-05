import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth, signOut } from '../lib/auth.jsx'

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, loading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  function close() { setMenuOpen(false) }

  return (
    <header className="sticky top-0 z-50 border-b border-grass bg-pitch/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16 gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 min-w-0" onClick={close}>
          <span className="text-3xl leading-none">⚽</span>
          <div className="min-w-0">
            <div className="font-display text-2xl text-lime tracking-widest leading-none">WC 2026</div>
            <div className="text-[10px] text-muted -mt-0.5 font-mono uppercase tracking-wider whitespace-nowrap">
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
                className="px-3 py-2 rounded text-xs font-mono text-muted hover:text-lime ml-2"
                title={user.email}
              >
                Sign out
              </button>
            </>
          )}
          {!loading && !user && (
            <>
              <NavLink to="/sign-in" current={pathname}>Sign In</NavLink>
              <NavLink to="/sign-up" current={pathname}>Sign Up</NavLink>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-grass/30 transition-colors"
          aria-label="Menu"
        >
          <span className={`block w-5 h-0.5 bg-lime transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-lime transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-lime transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-grass bg-pitch/95 backdrop-blur-md px-4 py-3 space-y-1">
          <MobileLink to="/how-it-works" current={pathname} onClick={close}>How it Works</MobileLink>
          <MobileLink to="/live" current={pathname} onClick={close}>🔴 Live Scores</MobileLink>
          {!loading && user && (
            <>
              <MobileLink to="/" current={pathname} onClick={close}>Dashboard</MobileLink>
              <MobileLink to="/enter" current={pathname} onClick={close}>My Bracket</MobileLink>
              <MobileLink to="/bracket/me" current={pathname} onClick={close}>View Bracket</MobileLink>
              <button
                onClick={() => { signOut(); close() }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-mono text-muted hover:text-lime hover:bg-grass/20 transition-colors"
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

function NavLink({ to, current, children }) {
  const active = current === to
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded text-sm font-medium transition-all
        ${active ? 'bg-lime text-pitch font-bold' : 'text-muted hover:text-lime hover:bg-grass/50'}`}
    >
      {children}
    </Link>
  )
}

function MobileLink({ to, current, onClick, children }) {
  const active = current === to
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors
        ${active ? 'bg-lime text-pitch font-bold' : 'text-muted hover:text-lime hover:bg-grass/20'}`}
    >
      {children}
    </Link>
  )
}
