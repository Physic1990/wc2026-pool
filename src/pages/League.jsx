import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabase.js'
import { useAuth } from '../lib/auth.jsx'
import { getLeague, getLeagueMembersWithEntries } from '../lib/leagues.js'
import { calculateScore } from '../scoring.js'
import { MAX_POSSIBLE } from '../data/teams.js'
import { FLAGS } from '../data/flags.js'

const MEDAL = ['🥇', '🥈', '🥉']

export default function League() {
  const { id } = useParams()
  const { user } = useAuth()
  const [league, setLeague] = useState(null)
  const [members, setMembers] = useState([])
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [lg, ms, { data: r }] = await Promise.all([
          getLeague(id),
          getLeagueMembersWithEntries(id),
          supabase.from('results').select('*').eq('id', 1).maybeSingle(),
        ])
        setLeague(lg)
        setMembers(ms)
        setResults(r?.data || {})
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="pt-20 text-center">
        <div className="text-5xl animate-bounce">⚽</div>
        <p className="text-muted font-mono mt-4">Loading standings...</p>
      </div>
    )
  }

  if (error || !league) {
    return (
      <div className="pt-20 max-w-md mx-auto text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <p className="text-muted font-mono">{error || 'League not found.'}</p>
        <Link to="/" className="inline-block text-lime hover:underline font-mono">← Dashboard</Link>
      </div>
    )
  }

  const ranked = members
    .filter((m) => m.entry)
    .map((m) => {
      const { total, breakdown } = calculateScore(m.entry, results)
      return { ...m.entry, user_id: m.user_id, total, breakdown }
    })
    .sort((a, b) => b.total - a.total)

  const noEntries = members.filter((m) => !m.entry).length

  function copyCode() {
    navigator.clipboard.writeText(league.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="pt-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Link to="/" className="text-xs text-muted hover:text-lime font-mono">← Dashboard</Link>
        <h1 className="font-display text-5xl text-lime tracking-widest">{league.name}</h1>
        <div className="flex justify-center items-center gap-2 text-xs font-mono text-muted">
          <span>Invite code:</span>
          <button
            onClick={copyCode}
            className="text-lime tracking-widest border border-grass px-2 py-0.5 rounded hover:border-lime"
          >
            {league.invite_code}
          </button>
          {copied && <span className="text-lime">✓ copied</span>}
        </div>
      </div>

      {/* Stats bar */}
      {ranked.length > 0 && (
        <div className="grid grid-cols-3 gap-3 max-w-3xl mx-auto">
          {[
            { label: 'Leader',    value: ranked[0]?.name,                                                       sub: `${ranked[0]?.total} pts` },
            { label: 'Avg Score', value: Math.round(ranked.reduce((s, e) => s + e.total, 0) / ranked.length), sub: 'points' },
            { label: 'Players',   value: ranked.length,                                                          sub: noEntries ? `(${noEntries} pending)` : 'all in' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-grass/30 border border-grass rounded-xl p-4 text-center">
              <div className="text-muted text-xs uppercase tracking-widest font-mono mb-1">{label}</div>
              <div className="font-display text-2xl text-lime">{value}</div>
              <div className="text-muted text-xs">{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-2 max-w-3xl mx-auto">
        {ranked.length === 0 && (
          <div className="text-center py-16 text-muted bg-grass/10 border border-dashed border-grass rounded-xl">
            <div className="text-5xl mb-3">📋</div>
            <p className="font-mono text-sm">No brackets submitted yet in this league.</p>
            <p className="font-mono text-xs mt-1">Share the invite code or submit your own picks.</p>
          </div>
        )}

        {ranked.map((player, i) => {
          const pct = MAX_POSSIBLE > 0 ? (player.total / MAX_POSSIBLE) * 100 : 0
          const isMe = player.user_id === user?.id
          const isOpen = expanded === player.user_id
          return (
            <div
              key={player.user_id}
              className={`border rounded-xl overflow-hidden transition-all
                ${isMe ? 'border-lime' : 'border-grass'}`}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : player.user_id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-grass/20 transition-colors"
              >
                <div className="w-10 text-center">
                  {i < 3
                    ? <span className="text-2xl">{MEDAL[i]}</span>
                    : <span className="font-display text-2xl text-muted">{i + 1}</span>}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg flex items-center gap-2">
                    {player.name}
                    {isMe && <span className="text-xs font-mono text-lime border border-lime rounded px-1.5">YOU</span>}
                  </div>
                  <div className="text-xs text-muted font-mono">
                    🏆 {player.champion ? `${FLAGS[player.champion] || ''} ${player.champion}` : '—'}
                    &nbsp;|&nbsp; ⚽ {player.golden_boot || '—'}
                  </div>
                </div>
                <div className="w-32 hidden sm:block">
                  <div className="h-1.5 bg-grass rounded-full overflow-hidden">
                    <div className="h-full bg-lime rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="text-right min-w-[60px]">
                  <div className="font-display text-3xl text-lime">{player.total}</div>
                  <div className="text-xs text-muted">pts</div>
                </div>
                <div className="text-muted text-sm">{isOpen ? '▲' : '▼'}</div>
              </button>

              {isOpen && (
                <div className="border-t border-grass bg-grass/10 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Groups',    value: player.breakdown?.groups ?? 0 },
                    { label: '3rd Place', value: player.breakdown?.third  ?? 0 },
                    { label: 'R32',       value: player.breakdown?.R32    ?? 0 },
                    { label: 'R16',       value: player.breakdown?.R16    ?? 0 },
                    { label: 'Quarter',   value: player.breakdown?.QF     ?? 0 },
                    { label: 'Semi',      value: player.breakdown?.SF     ?? 0 },
                    { label: 'Final',     value: player.breakdown?.Final  ?? 0 },
                    { label: 'Bonuses',   value: player.breakdown?.bonus  ?? 0 },
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
