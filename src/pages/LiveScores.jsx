import { useEffect, useState } from 'react'
import { fetchMatchGoalScorers, fetchTopScorers } from '../lib/footballData.js'
import { flagFor } from '../data/flags.js'

const STAGE_ORDER = [
  'GROUP_STAGE',
  'ROUND_OF_32',
  'ROUND_OF_16',
  'QUARTER_FINALS',
  'SEMI_FINALS',
  'FINAL',
]

const STAGE_LABEL = {
  GROUP_STAGE:    'Group Stage',
  ROUND_OF_32:    'Round of 32',
  ROUND_OF_16:    'Round of 16',
  QUARTER_FINALS: 'Quarter Finals',
  SEMI_FINALS:    'Semi Finals',
  FINAL:          'Final',
}

function formatDate(utcDate) {
  const d = new Date(utcDate)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatTime(utcDate) {
  const d = new Date(utcDate)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function groupByDate(matches) {
  const map = {}
  for (const m of matches) {
    const key = formatDate(m.utcDate)
    if (!map[key]) map[key] = []
    map[key].push(m)
  }
  return map
}

export default function LiveScores() {
  const [matches, setMatches] = useState([])
  const [scorers, setScorers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeStage, setActiveStage] = useState('ALL')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [tab, setTab] = useState('fixtures') // 'fixtures' | 'scorers'

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [m, s] = await Promise.all([fetchMatchGoalScorers(), fetchTopScorers()])
      setMatches(m)
      setScorers(s)
      setLastUpdated(new Date())
    } catch (e) {
      setError('Could not load scores: ' + e.message)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const stages = STAGE_ORDER.filter(s => matches.some(m => m.stage === s))

  const filtered = activeStage === 'ALL'
    ? matches
    : matches.filter(m => m.stage === activeStage)

  const byDate = groupByDate(filtered)
  const sortedDates = Object.keys(byDate).sort((a, b) => new Date(a) - new Date(b))

  const liveCount = matches.filter(m => m.status === 'IN_PLAY' || m.status === 'PAUSED').length

  return (
    <div className="pt-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-4xl text-lime tracking-widest">
            {liveCount > 0 ? '🔴' : '⚽'} SCORES & FIXTURES
          </h1>
          {lastUpdated && (
            <p className="text-xs text-muted font-mono mt-1">Updated {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 bg-grass/30 border border-grass rounded-xl text-sm font-mono text-lime hover:bg-grass/50 disabled:opacity-50 transition-all"
        >
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-sm font-mono text-red-300">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-grass pb-3">
        <button
          onClick={() => setTab('fixtures')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'fixtures' ? 'bg-lime text-pitch' : 'text-muted hover:text-lime'}`}
        >
          📅 Fixtures & Results
        </button>
        <button
          onClick={() => setTab('scorers')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'scorers' ? 'bg-lime text-pitch' : 'text-muted hover:text-lime'}`}
        >
          🥇 Top Scorers
        </button>
      </div>

      {tab === 'fixtures' && (
        <>
          {/* Stage filter */}
          {stages.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveStage('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeStage === 'ALL' ? 'bg-lime text-pitch' : 'bg-grass/20 border border-grass text-muted hover:border-lime hover:text-lime'
                }`}
              >
                All
              </button>
              {stages.map(s => (
                <button
                  key={s}
                  onClick={() => setActiveStage(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeStage === s ? 'bg-lime text-pitch' : 'bg-grass/20 border border-grass text-muted hover:border-lime hover:text-lime'
                  }`}
                >
                  {STAGE_LABEL[s] || s}
                </button>
              ))}
            </div>
          )}

          {/* No matches yet */}
          {!loading && matches.length === 0 && !error && (
            <div className="text-center py-20 text-muted font-mono">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-xl">Tournament hasn't started yet!</p>
              <p className="text-sm mt-2">WC 2026 kicks off June 11 — check back then.</p>
            </div>
          )}

          {/* Matches grouped by date */}
          {sortedDates.map(date => (
            <div key={date}>
              <div className="text-xs text-muted font-mono uppercase tracking-widest mb-2 mt-4 px-1">
                {date}
              </div>
              <div className="space-y-2">
                {byDate[date].map((m, i) => (
                  <MatchCard key={i} match={m} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {tab === 'scorers' && (
        <TopScorersTable scorers={scorers} loading={loading} />
      )}
    </div>
  )
}

function MatchCard({ match }) {
  const [open, setOpen] = useState(false)
  const isFinished = match.status === 'FINISHED'
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const isScheduled = match.status === 'SCHEDULED' || match.status === 'TIMED'

  const homeWin = isFinished && match.homeScore > match.awayScore
  const awayWin = isFinished && match.awayScore > match.homeScore

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${
      isLive ? 'border-lime bg-lime/5' : 'border-grass bg-grass/10'
    }`}>
      <button
        onClick={() => isFinished && setOpen(v => !v)}
        className={`w-full px-5 py-3 flex items-center gap-3 transition-colors text-left ${
          isFinished ? 'hover:bg-grass/20 cursor-pointer' : 'cursor-default'
        }`}
      >
        {/* Status badge */}
        <div className="w-16 shrink-0 text-center">
          {isLive && (
            <span className="text-xs font-bold text-lime bg-lime/20 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
          )}
          {isFinished && (
            <span className="text-xs font-mono text-muted">FT</span>
          )}
          {isScheduled && (
            <span className="text-xs font-mono text-muted">{formatTime(match.utcDate)}</span>
          )}
        </div>

        {/* Teams & score */}
        <div className="flex-1 flex items-center justify-between gap-1 sm:gap-2 min-w-0">
          <span className={`font-bold text-xs sm:text-sm flex-1 min-w-0 truncate flex items-center gap-1.5 ${homeWin ? 'text-lime' : 'text-ink'}`}>
            <span className="text-base shrink-0">{flagFor(match.homeTeam)}</span>
            <span className="truncate">{match.homeTeam}</span>
          </span>

          <div className="flex items-center gap-1 shrink-0 px-1">
            {isFinished || isLive ? (
              <span className="font-display text-lg sm:text-xl tracking-widest">
                <span className={homeWin ? 'text-lime' : 'text-ink'}>{match.homeScore}</span>
                <span className="text-muted mx-1">–</span>
                <span className={awayWin ? 'text-lime' : 'text-ink'}>{match.awayScore}</span>
              </span>
            ) : (
              <span className="text-muted font-mono text-xs sm:text-sm">vs</span>
            )}
          </div>

          <span className={`font-bold text-xs sm:text-sm flex-1 min-w-0 truncate text-right flex items-center justify-end gap-1.5 ${awayWin ? 'text-lime' : 'text-ink'}`}>
            <span className="truncate">{match.awayTeam}</span>
            <span className="text-base shrink-0">{flagFor(match.awayTeam)}</span>
          </span>
        </div>

        {/* Stage + venue */}
        <div className="shrink-0 text-right hidden sm:block">
          <div className="text-xs text-muted font-mono">
            {match.stage === 'GROUP_STAGE' ? `MD ${match.matchday}` : STAGE_LABEL[match.stage] || ''}
          </div>
          {match.venue && (
            <div className="text-xs text-muted font-mono">{match.venue.city}</div>
          )}
        </div>

        {isFinished && (
          <span className="text-muted text-xs ml-1">{open ? '▲' : '▼'}</span>
        )}
      </button>

      {/* Venue + time bar */}
      {match.venue && (
        <div className="px-4 pb-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted font-mono">
          <span>🏟 {match.venue.stadium}</span>
          <span className="hidden sm:inline">·</span>
          <span>📍 {match.venue.city}</span>
          {isScheduled && <span>🕐 {formatTime(match.utcDate)}</span>}
        </div>
      )}

      {/* Goal scorers expanded */}
      {open && isFinished && (
        <div className="px-5 py-3 border-t border-grass/40 grid grid-cols-2 gap-x-8 gap-y-1">
          <div className="space-y-1">
            {match.goals.filter(g => g.team === match.homeTeam).map((g, i) => (
              <div key={i} className="text-xs font-mono flex items-center gap-1">
                <span className="text-lime">⚽</span>
                <span className="text-muted">{g.minute}'</span>
                <span className="font-bold">{g.name}</span>
                {g.type === 'OWN_GOAL' && <span className="text-red-400">(OG)</span>}
                {g.type === 'PENALTY' && <span className="text-yellow-400">(P)</span>}
              </div>
            ))}
          </div>
          <div className="space-y-1 text-right">
            {match.goals.filter(g => g.team === match.awayTeam).map((g, i) => (
              <div key={i} className="text-xs font-mono flex items-center justify-end gap-1">
                {g.type === 'OWN_GOAL' && <span className="text-red-400">(OG)</span>}
                {g.type === 'PENALTY' && <span className="text-yellow-400">(P)</span>}
                <span className="font-bold">{g.name}</span>
                <span className="text-muted">{g.minute}'</span>
                <span className="text-lime">⚽</span>
              </div>
            ))}
          </div>
          {match.goals.length === 0 && (
            <span className="col-span-2 text-xs text-muted font-mono italic">No goal data available</span>
          )}
        </div>
      )}
    </div>
  )
}

function TopScorersTable({ scorers, loading }) {
  if (loading) return <div className="text-center text-muted font-mono py-10">Loading...</div>
  if (scorers.length === 0) return (
    <div className="text-center py-20 text-muted font-mono">
      <p>No scorer data yet — check back after June 11.</p>
    </div>
  )
  return (
    <div className="bg-grass/10 border border-grass rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-grass text-muted font-mono text-xs uppercase">
            <th className="text-left px-4 py-3">#</th>
            <th className="text-left px-4 py-3">Player</th>
            <th className="text-left px-4 py-3">Team</th>
            <th className="text-center px-4 py-3">⚽ Goals</th>
            <th className="text-center px-4 py-3">🎯 Assists</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((s, i) => (
            <tr key={i} className={`border-b border-grass/40 ${i === 0 ? 'text-lime' : ''}`}>
              <td className="px-4 py-3 font-mono text-muted">{i + 1}</td>
              <td className="px-4 py-3 font-bold">{s.name}</td>
              <td className="px-4 py-3 text-muted font-mono text-xs">{s.team}</td>
              <td className="px-4 py-3 text-center font-bold">{s.goals}</td>
              <td className="px-4 py-3 text-center text-muted">{s.assists ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Host city venue map
// ─────────────────────────────────────────────────────────────────────────────

// Approximate % positions on a North America bounding box (left%, top%)
const CITY_POSITIONS = {
  'Vancouver':      { left: '14%', top: '14%', flag: '🇨🇦' },
  'Toronto':        { left: '42%', top: '20%', flag: '🇨🇦' },
  'Seattle':        { left: '13%', top: '20%', flag: '🇺🇸' },
  'San Francisco':  { left: '10%', top: '33%', flag: '🇺🇸' },
  'Santa Clara':    { left: '10%', top: '33%', flag: '🇺🇸' },
  'Los Angeles':    { left: '12%', top: '42%', flag: '🇺🇸' },
  'Inglewood':      { left: '12%', top: '42%', flag: '🇺🇸' },
  'Kansas City':    { left: '38%', top: '32%', flag: '🇺🇸' },
  'Dallas':         { left: '37%', top: '46%', flag: '🇺🇸' },
  'Foxborough':     { left: '55%', top: '18%', flag: '🇺🇸' },
  'East Rutherford':{ left: '56%', top: '22%', flag: '🇺🇸' },
  'Philadelphia':   { left: '55%', top: '24%', flag: '🇺🇸' },
  'Atlanta':        { left: '48%', top: '38%', flag: '🇺🇸' },
  'Miami':          { left: '50%', top: '48%', flag: '🇺🇸' },
  'Guadalajara':    { left: '26%', top: '58%', flag: '🇲🇽' },
  'Mexico City':    { left: '30%', top: '64%', flag: '🇲🇽' },
  'Monterrey':      { left: '34%', top: '56%', flag: '🇲🇽' },
}

function VenueMap({ matches }) {
  const [hoveredCity, setHoveredCity] = useState(null)

  // Count matches per city
  const cityCounts = {}
  matches.forEach(m => {
    const city = m.venue?.city
    if (city) cityCounts[city] = (cityCounts[city] || 0) + 1
  })

  const activeCities = Object.keys(CITY_POSITIONS).filter(c =>
    Object.keys(cityCounts).some(mc => mc === c || mc.includes(c) || c.includes(mc))
  )

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: '#dde3f0', background: '#fff' }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: '#dde3f0' }}>
        <div className="font-display text-lg tracking-wider" style={{ color: '#0d1f3d' }}>
          🏟️ HOST VENUES · USA 🇺🇸 CANADA 🇨🇦 MEXICO 🇲🇽
        </div>
        <div className="text-xs font-mono" style={{ color: '#9aafcc' }}>
          {Object.keys(cityCounts).length} cities
        </div>
      </div>

      {/* Map */}
      <div className="relative" style={{ paddingTop: '52%', background: 'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 40%, #93c5fd 100%)' }}>
        {/* Ocean */}
        <div className="absolute inset-0">
          {/* Simple North America silhouette using divs */}
          <svg viewBox="0 0 100 55" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Canada */}
            <path d="M8 2 L80 2 L82 8 L78 12 L75 10 L70 14 L65 12 L60 15 L55 12 L50 16 L45 13 L40 16 L35 14 L30 16 L25 13 L20 16 L15 13 L10 16 L8 12 Z"
              fill="#e8f0fe" stroke="#c7d7f7" strokeWidth="0.3"/>
            {/* USA */}
            <path d="M10 16 L75 14 L76 20 L78 26 L74 30 L70 28 L65 32 L60 30 L55 34 L50 32 L45 36 L40 34 L35 38 L30 36 L25 32 L20 28 L15 24 L10 22 Z"
              fill="#fee2e2" stroke="#fca5a5" strokeWidth="0.3"/>
            {/* Florida */}
            <path d="M60 34 L65 34 L66 42 L62 44 L58 40 Z" fill="#fecaca" stroke="#fca5a5" strokeWidth="0.3"/>
            {/* Mexico */}
            <path d="M25 36 L50 34 L52 38 L48 44 L44 48 L38 52 L32 50 L28 46 L24 42 Z"
              fill="#dcfce7" stroke="#86efac" strokeWidth="0.3"/>
            {/* Great Lakes hint */}
            <ellipse cx="52" cy="20" rx="5" ry="3" fill="#bfdbfe" opacity="0.7"/>
          </svg>

          {/* City dots */}
          {Object.entries(CITY_POSITIONS).map(([city, pos]) => {
            const matchCount = Object.entries(cityCounts).find(([mc]) =>
              mc === city || mc.includes(city) || city.includes(mc)
            )?.[1] || 0
            const isHovered = hoveredCity === city

            return (
              <div
                key={city}
                className="absolute"
                style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)', zIndex: isHovered ? 20 : 10 }}
                onMouseEnter={() => setHoveredCity(city)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                {/* Dot */}
                <div
                  className="rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center font-bold text-white"
                  style={{
                    width: isHovered ? 28 : matchCount > 6 ? 22 : 18,
                    height: isHovered ? 28 : matchCount > 6 ? 22 : 18,
                    background: pos.flag === '🇺🇸' ? '#c41230' : pos.flag === '🇨🇦' ? '#d00' : '#006847',
                    boxShadow: isHovered ? '0 0 0 3px rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.2)',
                    fontSize: 9,
                  }}
                >
                  {matchCount || ''}
                </div>

                {/* Tooltip */}
                {isHovered && (
                  <div
                    className="absolute left-1/2 bottom-full mb-2 rounded-lg px-2 py-1.5 text-white text-xs font-mono whitespace-nowrap shadow-xl"
                    style={{ transform: 'translateX(-50%)', background: '#04091e', zIndex: 30 }}
                  >
                    <div className="font-bold">{pos.flag} {city}</div>
                    {matchCount > 0 && <div style={{ color: '#f5c842' }}>{matchCount} matches</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 flex flex-wrap gap-4 text-xs font-mono border-t" style={{ borderColor: '#dde3f0', color: '#5a7499' }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#c41230' }}/>
          USA (10 cities)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#d00' }}/>
          Canada (2 cities)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#006847' }}/>
          Mexico (3 cities)
        </span>
        <span className="ml-auto">Hover dots for details</span>
      </div>
    </div>
  )
}
