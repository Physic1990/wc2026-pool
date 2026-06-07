import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: '#04091e', borderTop: '3px solid transparent', borderImage: 'linear-gradient(90deg, #c41230, #f5c842, #c41230) 1' }}>
      {/* Main footer content */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl">⚽</span>
              <div>
                <div className="font-display text-2xl tracking-widest" style={{ color: '#f5c842' }}>WC 2026</div>
                <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#7a8fb0' }}>Prediction Pool</div>
              </div>
            </div>
            <p className="text-xs font-mono leading-relaxed" style={{ color: '#5a7499' }}>
              A free, private bracket pool made for friends to enjoy the FIFA World Cup 2026 together.
            </p>
            <div className="text-xs font-mono" style={{ color: '#5a7499' }}>
              🇺🇸 USA &nbsp;·&nbsp; 🇨🇦 Canada &nbsp;·&nbsp; 🇲🇽 Mexico &nbsp;·&nbsp; 2026
            </div>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: '#f5c842' }}>Quick Links</div>
            {[
              { to: '/how-it-works', label: 'How it Works' },
              { to: '/live',         label: '🔴 Live Scores' },
              { to: '/',             label: 'Dashboard' },
              { to: '/bracket/me',   label: 'My Bracket' },
            ].map(l => (
              <Link key={l.to} to={l.to}
                className="block text-sm font-mono transition-colors hover:underline"
                style={{ color: '#7a8fb0' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f5c842'}
                onMouseLeave={e => e.currentTarget.style.color = '#7a8fb0'}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: '#c41230' }}>Important Notice</div>
            <p className="text-xs font-mono leading-relaxed" style={{ color: '#5a7499' }}>
              This is a <strong style={{ color: '#e8eef8' }}>free, informal prediction pool</strong> created for entertainment purposes only.
            </p>
            <p className="text-xs font-mono leading-relaxed" style={{ color: '#5a7499' }}>
              This site is <strong style={{ color: '#e8eef8' }}>not affiliated</strong> with FIFA, the FIFA World Cup™, or any official fantasy football platform.
            </p>
            <p className="text-xs font-mono leading-relaxed" style={{ color: '#5a7499' }}>
              No real money is collected or managed through this platform.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid #0d1f3d' }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] font-mono text-center" style={{ color: '#3a5070' }}>
            Made with ❤️ for friends · Not affiliated with FIFA or any official body · For entertainment only
          </p>
          <p className="text-[11px] font-mono" style={{ color: '#3a5070' }}>
            © {new Date().getFullYear()} WC 2026 Prediction Pool
          </p>
        </div>
      </div>

      {/* Legal disclaimer */}
      <div style={{ background: '#020714', borderTop: '1px solid #0a1020' }}>
        <div className="max-w-5xl mx-auto px-4 py-3">
          <p className="text-[10px] font-mono leading-relaxed text-center" style={{ color: '#2a3a50' }}>
            DISCLAIMER: This website is an unofficial, fan-made prediction pool intended solely for friendly competition among friends.
            It is not associated with, endorsed by, or connected to FIFA, any national football federation, or any commercial fantasy sports platform.
            FIFA World Cup™ and related marks are trademarks of FIFA. No copyright infringement is intended.
            This platform does not facilitate real-money gambling. Any buy-ins between friends are entirely independent of this platform.
          </p>
        </div>
      </div>
    </footer>
  )
}
