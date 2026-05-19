import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Leaderboard' },
    { to: '/enter', label: 'Enter Pool' },
    { to: '/admin', label: 'Admin' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-grass bg-pitch/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3">
          <span className="text-3xl leading-none">⚽</span>
          <div>
            <div className="font-display text-2xl text-lime tracking-widest">WC 2026</div>
            <div className="text-xs text-muted -mt-1 font-mono uppercase tracking-wider">Prediction Pool</div>
          </div>
        </Link>

        <nav className="flex gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded text-sm font-medium transition-all duration-150
                ${pathname === to
                  ? 'bg-lime text-pitch font-bold'
                  : 'text-muted hover:text-lime hover:bg-grass/50'
                }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
