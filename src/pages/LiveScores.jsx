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
  GROUP_STAGE:   'Group Stage',
  ROUND_OF_32:   'Round of 32',
  ROUND_OF_16:   'Round of 16',
  QUARTER_FINALS:'Quarter Finals',
  SEMI_FINALS:   'Semi Finals',
  FINAL:         'Final',
}

function formatDate(utcDate) {
  const d = new Date(utcDate)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function LiveScores() {
  const [matches, setMatches] = useState([])
  const [scorers, setScorers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeStage, setActiveStage] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [m, s] = await Promise.all([fetchMatchGoalScorers(), fetchTopScorers()])
      setMatches(m)
      setScorers(s)
      setLastUpdated(new Date())
      // Default to the latest stage that has matches
      if (m.length > 0) {
        const stages = [...new Set(m.map(x => x.stage))]
        const latest = STAGE_ORDER.filter(s => stages.includes(s)).pop()
        setActiveStage(latest || stages[0])
      }
    } catch (e) {
      setError('Could not load scores: ' + e.message)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const stages = STAGE_ORDER.filter(s => matches.some(m => m.stage === s))
  const filtered = activeStage ? matches.filter(m => m.stage === activeStage) : matches

  return (
    <div className="pt-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-4xl text-lime tracking-widest">⚽ LIVE SCORES</h1>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 bg-grass/30 border border-grass rounded-xl text-sm font-mono text-lime hover:bg-grass/50 disabled:opacity-50"
        >
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {lastUpdated && (
        <p className="text-xs text-muted font-mono">Last updated: {lastUpdated.toLocaleTimeString()}</p>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-sm font-mono text-red-300">
          {error}
        </div>
      )}

      {!loading && matches.length === 0 && !error && (
        <div className="text-center py-20 text-muted font-mono">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-xl">Tournament hasn't started yet!</p>
          <p className="text-sm mt-2">WC 2026 kicks off June 11 — check back then.</p>
        </div>
      )}

      {/* Stage tabs */}
      {stages.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {stages.map(s => (
            <button
              key={s}
              onClick={() => setActiveStage(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeStage === s
                  ? 'bg-lime text-pitch'
                  : 'bg-grass/20 border border-grass text-muted hover:border-lime hover:text-lime'
              }`}
            >
              {STAGE_LABEL[s] || s}
            </button>
          ))}
        </div>
      )}

      {/* Match cards */}
      <div className="space-y-3">
        {filtered.map((m, i) => (
          <MatchCard key={i} match={m} />
        ))}
      </div>

      {/* Top scorers */}
      {scorers.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-2xl text-lime tracking-widest mb-4">🥇 TOP SCORERS</h2>
          <div className="bg-grass/10 border border-grass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grass text-muted font-mono text-xs uppercase">
                  <th className="text-left px-4 py-3">#</th>
                  <th className="text-left px-4 py-3">Player</th>
                  <th className="text-left px-4 py-3">Team</th>
                  <th className="text-center px-4 py-3">⚽</th>
                  <th className="text-center px-4 py-3">🎯</th>
                </tr>
              </thead>
              <tbody>
                {scorers.slice(0, 10).map((s, i) => (
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
        </div>
      )}
    </div>
  )
}

function MatchCard({ match }) {
  const [open, setOpen] = useState(false)
  const homeWin = match.homeScore > match.awayScore
  const awayWin = match.awayScore > match.homeScore

  return (
    <div className="bg-grass/10 border border-grass rounded-2xl overflow-hidden">
      {/* Score row */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-5 py-4 flex items-center gap-4 hover:bg-grass/20 transition-colors text-left"
      >
        <div className="flex-1 flex items-center justify-between gap-3">
          <span className={`font-bold text-sm ${homeWin ? 'text-lime' : 'text-white'}`}>
            {match.homeTeam}
          </span>
          <div className="flex items-center gap-2 font-display text-2xl">
            <span className={homeWin ? 'text-lime' : 'text-white'}>{match.homeScore}</span>
            <span className="text-muted text-base">–</span>
            <span className={awayWin ? 'text-lime' : 'text-white'}>{match.awayScore}</span>
          </div>
          <span className={`font-bold text-sm text-right ${awayWin ? 'text-lime' : 'text-white'}`}>
            {match.awayTeam}
          </span>
        </div>
        <span className="text-muted text-xs font-mono ml-2">{open ? '▲' : '▼'}</span>
      </button>

      <div className="px-5 pb-1 flex items-center gap-3">
        <span className="text-xs text-muted font-mono">{STAGE_LABEL[match.stage] || match.stage}</span>
        <span className="text-xs text-muted font-mono">· {formatDate(match.utcDate)}</span>
      </div>

      {/* Goal scorers */}
      {open && (
        <div className="px-5 py-3 border-t border-grass/40 grid grid-cols-2 gap-x-8 gap-y-1">
          {/* Home goals */}
          <div className="space-y-1">
            {match.goals
              .filter(g => g.team === match.homeTeam)
              .map((g, i) => (
                <div key={i} className="text-xs font-mono flex items-center gap-1">
                  <span className="text-lime">⚽</span>
                  <span>{g.minute}'</span>
                  <span className="font-bold">{g.name}</span>
                  {g.type === 'OWN_GOAL' && <span className="text-red-400">(OG)</span>}
                  {g.type === 'PENALTY' && <span className="text-yellow-400">(P)</span>}
                </div>
              ))}
          </div>
          {/* Away goals */}
          <div className="space-y-1 text-right">
            {match.goals
              .filter(g => g.team === match.awayTeam)
              .map((g, i) => (
                <div key={i} className="text-xs font-mono flex items-center justify-end gap-1">
                  {g.type === 'OWN_GOAL' && <span className="text-red-400">(OG)</span>}
                  {g.type === 'PENALTY' && <span className="text-yellow-400">(P)</span>}
                  <span className="font-bold">{g.name}</span>
                  <span>{g.minute}'</span>
                  <span className="text-lime">⚽</span>
                </div>
              ))}
          </div>
          {match.goals.length === 0 && (
            <span className="col-span-2 text-xs text-muted font-mono">No goal data available</span>
          )}
        </div>
      )}
    </div>
  )
}
