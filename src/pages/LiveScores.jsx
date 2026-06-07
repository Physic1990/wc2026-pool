import { useEffect, useState } from 'react'
import { fetchMatchGoalScorers, fetchTopScorers } from '../lib/footballData.js'

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
          <span className={`font-bold text-xs sm:text-sm flex-1 min-w-0 truncate ${homeWin ? 'text-lime' : 'text-ink'}`}>
            {match.homeTeam}
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

          <span className={`font-bold text-xs sm:text-sm flex-1 min-w-0 truncate text-right ${awayWin ? 'text-lime' : 'text-ink'}`}>
            {match.awayTeam}
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
