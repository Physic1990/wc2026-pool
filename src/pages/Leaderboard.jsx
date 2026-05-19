import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { calculateScore } from '../scoring.js'
import { MAX_POSSIBLE } from '../data/teams.js'
import { flagFor, FLAGS } from '../data/flags.js'

const MEDAL = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    async function load() {
      const [{ data: entriesData }, { data: resultsData }] = await Promise.all([
        supabase.from('entries').select('*').order('created_at'),
        supabase.from('results').select('*').eq('id', 1).single(),
      ])
      setEntries(entriesData || [])
      setResults(resultsData?.data || {})
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingState />

  const ranked = entries
    .map((e) => ({ ...e, ...calculateScore(e, results || {}) }))
    .sort((a, b) => b.total - a.total)

  const maxPossible = MAX_POSSIBLE

  return (
    <div className="pt-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="font-display text-6xl text-lime tracking-widest">LEADERBOARD</h1>
        <p className="text-muted font-mono text-sm uppercase tracking-wider">
          {entries.length} players • Live standings
        </p>
      </div>

      {/* Stats bar */}
      {ranked.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Leader', value: ranked[0]?.name, sub: `${ranked[0]?.total} pts` },
            { label: 'Avg Score', value: Math.round(ranked.reduce((s, e) => s + e.total, 0) / ranked.length), sub: 'points' },
            { label: 'Gap', value: ranked.length > 1 ? `${(ranked[0]?.total - ranked[ranked.length - 1]?.total).toFixed(1)}` : '—', sub: 'pts spread' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-grass/30 border border-grass rounded-xl p-4 text-center">
              <div className="text-muted text-xs uppercase tracking-widest font-mono mb-1">{label}</div>
              <div className="font-display text-2xl text-lime">{value}</div>
              <div className="text-muted text-xs">{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard rows */}
      <div className="space-y-2">
        {ranked.length === 0 && (
          <div className="text-center py-20 text-muted">
            <div className="text-5xl mb-4">📋</div>
            <p className="font-mono">No entries yet. Be the first to enter!</p>
          </div>
        )}

        {ranked.map((player, i) => {
          const pct = maxPossible > 0 ? (player.total / maxPossible) * 100 : 0
          const isOpen = expanded === player.id

          return (
            <div
              key={player.id}
              className="border border-grass rounded-xl overflow-hidden transition-all duration-200 hover:border-lime/40"
            >
              {/* Main row */}
              <button
                onClick={() => setExpanded(isOpen ? null : player.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-grass/20 transition-colors"
              >
                {/* Rank */}
                <div className="w-10 text-center">
                  {i < 3
                    ? <span className="text-2xl">{MEDAL[i]}</span>
                    : <span className="font-display text-2xl text-muted">{i + 1}</span>
                  }
                </div>

                {/* Name */}
                <div className="flex-1">
                  <div className="font-semibold text-lg">{player.name}</div>
                  <div className="text-xs text-muted font-mono">
                    🏆 {player.champion ? `${FLAGS[player.champion] || ''} ${player.champion}` : '—'}
                    &nbsp;|&nbsp; ⚽ {player.golden_boot || '—'}
                  </div>
                </div>

                {/* Score bar */}
                <div className="w-32 hidden sm:block">
                  <div className="h-1.5 bg-grass rounded-full overflow-hidden">
                    <div
                      className="h-full bg-lime rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Points */}
                <div className="text-right min-w-[60px]">
                  <div className="font-display text-3xl text-lime">{player.total}</div>
                  <div className="text-xs text-muted">pts</div>
                </div>

                <div className="text-muted text-sm">{isOpen ? '▲' : '▼'}</div>
              </button>

              {/* Breakdown */}
              {isOpen && (
                <div className="border-t border-grass bg-grass/10 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Groups', value: player.breakdown?.groups ?? 0 },
                    { label: '3rd Place', value: player.breakdown?.third ?? 0 },
                    { label: 'R32', value: player.breakdown?.R32 ?? 0 },
                    { label: 'R16', value: player.breakdown?.R16 ?? 0 },
                    { label: 'Quarter', value: player.breakdown?.QF ?? 0 },
                    { label: 'Semi', value: player.breakdown?.SF ?? 0 },
                    { label: 'Final', value: player.breakdown?.Final ?? 0 },
                    { label: 'Bonuses', value: player.breakdown?.bonus ?? 0 },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-grass/30 rounded-lg p-3 text-center">
                      <div className="text-muted text-xs uppercase tracking-wider font-mono">{label}</div>
                      <div className="font-display text-xl text-lime">{value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="pt-20 text-center space-y-4">
      <div className="text-5xl animate-bounce">⚽</div>
      <p className="text-muted font-mono animate-pulse">Loading standings...</p>
    </div>
  )
}
