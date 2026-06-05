import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase.js'
import { useAuth } from '../lib/auth.jsx'
import { getLeague, getLeagueMembersWithEntries, renameLeague, deleteLeague, removeMember } from '../lib/leagues.js'
import { calculateScore } from '../scoring.js'
import { MAX_POSSIBLE } from '../data/teams.js'
import { FLAGS } from '../data/flags.js'
import { isLocked } from '../lib/deadline.js'

const MEDAL = ['🥇', '🥈', '🥉']

export default function League() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [league, setLeague] = useState(null)
  const [members, setMembers] = useState([])
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [copied, setCopied] = useState(false)
  // Management state
  const [managing, setManaging] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState('')
  const [actionError, setActionError] = useState('')
  const [removing, setRemoving] = useState(null)

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

  const isCreator = league?.created_by === user?.id

  async function handleRename() {
    if (!newName.trim()) return
    setActionError('')
    try {
      await renameLeague(id, newName)
      setLeague(prev => ({ ...prev, name: newName.trim() }))
      setRenaming(false)
      setNewName('')
    } catch (e) { setActionError(e.message) }
  }

  async function handleDeleteLeague() {
    if (!window.confirm(`Delete "${league.name}"? This cannot be undone.`)) return
    try {
      await deleteLeague(id)
      navigate('/')
    } catch (e) {
      setActionError(e.message)
      alert('Delete failed: ' + e.message)
    }
  }

  async function handleRemoveMember(userId, name) {
    if (!window.confirm(`Remove ${name} from this league?`)) return
    setRemoving(userId)
    try {
      await removeMember(id, userId)
      setMembers(prev => prev.filter(m => m.user_id !== userId))
    } catch (e) { setActionError(e.message) }
    setRemoving(null)
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

      {/* Creator management */}
      {isCreator && (
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setManaging(v => !v)}
            className="text-xs font-mono text-muted hover:text-lime border border-grass hover:border-lime px-3 py-1.5 rounded-lg transition-all"
          >
            ⚙️ {managing ? 'Hide settings' : 'Manage league'}
          </button>

          {managing && (
            <div className="mt-3 bg-grass/10 border border-grass rounded-2xl p-5 space-y-5">
              {actionError && (
                <div className="text-xs font-mono text-red-400 bg-red-900/20 border border-red-700 rounded-lg p-3">
                  {actionError}
                </div>
              )}

              {/* Rename */}
              <div>
                <div className="text-xs text-muted font-mono uppercase tracking-widest mb-2">Rename League</div>
                {renaming ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder={league.name}
                      className="flex-1 bg-pitch border border-grass rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime"
                      onKeyDown={e => e.key === 'Enter' && handleRename()}
                      autoFocus
                    />
                    <button onClick={handleRename} className="px-4 py-2 bg-lime text-pitch font-bold rounded-lg text-sm">Save</button>
                    <button onClick={() => setRenaming(false)} className="px-4 py-2 border border-grass rounded-lg text-sm text-muted hover:text-lime">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setRenaming(true); setNewName(league.name) }}
                    className="px-4 py-2 border border-grass rounded-lg text-sm text-muted hover:text-lime hover:border-lime transition-all"
                  >
                    ✏️ Rename "{league.name}"
                  </button>
                )}
              </div>

              {/* Remove members */}
              <div>
                <div className="text-xs text-muted font-mono uppercase tracking-widest mb-2">Members</div>
                <div className="space-y-2">
                  {members.map(m => {
                    const entry = ranked.find(r => r.user_id === m.user_id)
                    const name = entry?.name || 'No bracket yet'
                    const isMe = m.user_id === user?.id
                    return (
                      <div key={m.user_id} className="flex items-center justify-between bg-pitch border border-grass rounded-lg px-4 py-2.5">
                        <div>
                          <span className="text-sm font-semibold">{name}</span>
                          {isMe && <span className="ml-2 text-xs text-lime font-mono border border-lime rounded px-1">YOU</span>}
                          {m.user_id === league.created_by && <span className="ml-2 text-xs text-muted font-mono">creator</span>}
                        </div>
                        {!isMe && (
                          <button
                            onClick={() => handleRemoveMember(m.user_id, name)}
                            disabled={removing === m.user_id}
                            className="text-xs font-mono text-red-400 hover:text-red-300 border border-red-800 hover:border-red-500 px-3 py-1 rounded-lg transition-all disabled:opacity-40"
                          >
                            {removing === m.user_id ? 'Removing...' : 'Remove'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Delete league */}
              <div className="border-t border-grass pt-4">
                <div className="text-xs text-muted font-mono uppercase tracking-widest mb-2">Danger Zone</div>
                <button
                  onClick={handleDeleteLeague}
                  className="px-4 py-2 bg-red-900/30 border border-red-700 text-red-400 hover:bg-red-900/50 rounded-lg text-sm font-bold transition-all"
                >
                  🗑 Delete League
                </button>
                <p className="text-xs text-muted font-mono mt-1">This permanently deletes the league and removes all members.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats bar */}
      {ranked.length > 0 && (
        <div className="grid grid-cols-3 gap-2 max-w-3xl mx-auto">
          {[
            { label: 'Leader',    value: ranked[0]?.name,                                                       sub: `${ranked[0]?.total} pts` },
            { label: 'Avg Score', value: Math.round(ranked.reduce((s, e) => s + e.total, 0) / ranked.length), sub: 'points' },
            { label: 'Players',   value: ranked.length,                                                          sub: noEntries ? `(${noEntries} pending)` : 'all in' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-grass/30 border border-grass rounded-xl p-3 text-center">
              <div className="text-muted text-[10px] uppercase tracking-widest font-mono mb-1">{label}</div>
              <div className="font-display text-xl text-lime truncate">{value}</div>
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
          const canViewBracket = isMe || isLocked() // own always; others only after lock
          return (
            <div
              key={player.user_id}
              className={`border rounded-xl overflow-hidden transition-all
                ${isMe ? 'border-lime' : 'border-grass'}`}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : player.user_id)}
                className="w-full flex items-center gap-2 sm:gap-4 p-3 sm:p-4 text-left hover:bg-grass/20 transition-colors"
              >
                <div className="w-8 sm:w-10 text-center shrink-0">
                  {i < 3
                    ? <span className="text-xl sm:text-2xl">{MEDAL[i]}</span>
                    : <span className="font-display text-xl sm:text-2xl text-muted">{i + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base sm:text-lg flex items-center gap-2 flex-wrap">
                    <span className="truncate">{player.name}</span>
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
                <div className="text-right shrink-0">
                  <div className="font-display text-2xl sm:text-3xl text-lime">{player.total}</div>
                  <div className="text-xs text-muted">pts</div>
                </div>
                <div className="text-muted text-sm">{isOpen ? '▲' : '▼'}</div>
              </button>

              {isOpen && (
                <div className="border-t border-grass bg-grass/10 p-4 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                  {canViewBracket ? (
                    <Link
                      to={isMe ? '/bracket/me' : `/bracket/${player.user_id}`}
                      className="block w-full text-center py-2 border border-lime text-lime rounded-lg hover:bg-lime/10 text-sm font-mono"
                    >
                      View {isMe ? 'my' : `${player.name}'s`} full bracket →
                    </Link>
                  ) : (
                    <div className="text-center text-xs font-mono text-muted py-2">
                      🔒 Full bracket visible after picks lock
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
