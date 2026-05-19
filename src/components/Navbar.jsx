import { Link, useLocation } from 'react-router-dom'
import { useAuth, signOut } from '../lib/auth.jsx'

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, loading } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-grass bg-pitch/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16 gap-3">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <span className="text-3xl leading-none">⚽</span>
          <div className="min-w-0">
            <div className="font-display text-2xl text-lime tracking-widest leading-none">WC 2026</div>
            <div className="text-[10px] text-muted -mt-0.5 font-mono uppercase tracking-wider whitespace-nowrap">
              Prediction Pool
            </div>
          </div>
        </Link>

        <nav className="flex gap-1 items-center">
          <NavLink to="/how-it-works" current={pathname}>How it Works</NavLink>
          {!loading && user && (
            <>
              <NavLink to="/" current={pathname}>Dashboard</NavLink>
              <NavLink to="/bracket/me" current={pathname}>Bracket</NavLink>
              <NavLink to="/admin" current={pathname}>Admin</NavLink>
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
      </div>
    </header>
  )
}

function NavLink({ to, current, children }) {
  const active = current === to
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded text-sm font-medium transition-all
        ${active
          ? 'bg-lime text-pitch font-bold'
          : 'text-muted hover:text-lime hover:bg-grass/50'}`}
    >
      {children}
    </Link>
  )
}
