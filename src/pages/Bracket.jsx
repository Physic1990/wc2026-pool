import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase.js'
import { useAuth } from '../lib/auth.jsx'
import { isLocked } from '../lib/deadline.js'
import {
  GROUPS, GROUP_LABELS,
  R32_MATCHES, R16_MATCHES, QF_MATCHES, SF_MATCHES, FINAL_MATCH,
  teamsForMatch, slotLabel,
} from '../data/teams.js'
import { flagFor } from '../data/flags.js'
import { calculateScore } from '../scoring.js'

/**
 * Read-only bracket viewer. Routes:
 *   /bracket/me    → your own bracket
 *   /bracket/:id   → someone else's bracket (must be authed; privacy: see below)
 *
 * Privacy: BEFORE the pool deadline, only the owner can view their own bracket.
 * After lock, any signed-in user can view any bracket (so league mates can see
 * each other's picks).
 */
export default function Bracket() {
  const { userId: paramUserId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Resolve target user id ("me" → current user)
  const targetUserId = paramUserId === 'me' ? user?.id : paramUserId
  const isOwn = targetUserId === user?.id
  const locked = isLocked()

  const [entry, setEntry] = useState(null)
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!targetUserId) return
    let cancelled = false

    async function load() {
      try {
        const [{ data: e, error: eErr }, { data: r }] = await Promise.all([
          supabase.from('entries').select('*').eq('user_id', targetUserId).maybeSingle(),
          supabase.from('results').select('data').eq('id', 1).maybeSingle(),
        ])
        if (cancelled) return
        if (eErr) throw eErr
        setEntry(e)
        setResults(r?.data || {})
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [targetUserId])

  if (loading) {
    return (
      <div className="pt-20 text-center">
        <div className="text-5xl animate-bounce">⚽</div>
      </div>
    )
  }

  // Pre-lock privacy: no peeking at others' brackets
  if (!locked && !isOwn) {
    return (
      <CenterMessage
        icon="🔒"
        title="Brackets are private"
        body={`Picks aren't visible until the pool locks at the first kickoff.`}
        action={{ to: '/', label: '← Dashboard' }}
      />
    )
  }

  if (!entry) {
    if (isOwn) {
      return (
        <CenterMessage
          icon="📋"
          title="No bracket yet"
          body={locked
            ? 'You missed the deadline. No picks were submitted under your account.'
            : 'Submit your picks to compete in your leagues.'}
          action={!locked ? { to: '/enter', label: 'Fill Out Bracket →' } : { to: '/', label: '← Dashboard' }}
        />
      )
    }
    return (
      <CenterMessage
        icon="📋"
        title="No bracket"
        body="This user didn't submit picks before the deadline."
        action={{ to: '/', label: '← Dashboard' }}
      />
    )
  }

  if (error) {
    return <CenterMessage icon="⚠️" title="Couldn't load bracket" body={error} action={{ to: '/', label: '← Dashboard' }} />
  }

  const { total, breakdown } = calculateScore(entry, results)
  const picks = {
    group_picks: entry.group_picks || {},
    third_place_picks: entry.third_place_picks || {},
    knockout_picks: entry.knockout_picks || {},
  }

  return (
    <div className="pt-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-xs text-muted font-mono uppercase tracking-widest">
            {isOwn ? 'Your Bracket' : "Bracket"}
          </div>
          <h1 className="font-display text-4xl text-lime tracking-widest">{entry.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-display text-3xl text-lime">{total}</div>
            <div className="text-xs text-muted font-mono">points</div>
          </div>
          {isOwn && !locked && (
            <Link
              to="/enter"
              className="px-4 py-2 bg-lime text-pitch font-bold rounded-lg hover:bg-lime/90 whitespace-nowrap"
            >
              ✏️ Edit Picks
            </Link>
          )}
        </div>
      </div>

      {locked && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          {[
            ['Groups',  breakdown?.groups ?? 0],
            ['3rd',     breakdown?.third  ?? 0],
            ['R32',     breakdown?.R32    ?? 0],
            ['R16',     breakdown?.R16    ?? 0],
            ['QF',      breakdown?.QF     ?? 0],
            ['SF',      breakdown?.SF     ?? 0],
            ['Final',   breakdown?.Final  ?? 0],
            ['Bonuses', breakdown?.bonus  ?? 0],
          ].map(([label, value]) => (
            <div key={label} className="bg-grass/30 border border-grass rounded-lg p-2">
              <div className="text-[10px] uppercase font-mono text-muted">{label}</div>
              <div className="font-display text-xl text-lime">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Group picks */}
      <Section title="📋 Group Stage">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GROUP_LABELS.map((g) => (
            <GroupView key={g} group={g} teams={GROUPS[g]} picks={entry.group_picks?.[g] || {}} />
          ))}
        </div>
      </Section>

      {/* Knockout rounds */}
      <Section title="⚔️ Round of 32">
        <MatchList matches={R32_MATCHES} picks={picks} winners={entry.knockout_picks || {}} pts={1} />
      </Section>
      <Section title="⚔️ Round of 16">
        <MatchList matches={R16_MATCHES} picks={picks} winners={entry.knockout_picks || {}} pts={2} />
      </Section>
      <Section title="⚔️ Quarterfinals">
        <MatchList matches={QF_MATCHES} picks={picks} winners={entry.knockout_picks || {}} pts={3} />
      </Section>
      <Section title="⚔️ Semifinals">
        <MatchList matches={SF_MATCHES} picks={picks} winners={entry.knockout_picks || {}} pts={5} />
      </Section>
      <Section title="🏆 Final">
        <MatchList matches={[FINAL_MATCH]} picks={picks} winners={entry.knockout_picks || {}} pts={8} />
      </Section>

      {/* Bonuses */}
      <Section title="🎖️ Bonus Awards">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'golden_boot',  label: '🥇 Golden Boot — Top Scorer' },
            { key: 'golden_glove', label: '🧤 Golden Glove — Best Keeper' },
            { key: 'golden_ball',  label: '⭐ Golden Ball — Best Player' },
            { key: 'dark_horse',   label: '🐴 Dark Horse Team' },
          ].map(({ key, label }) => (
            <div key={key} className="bg-grass/20 border border-grass rounded-xl p-4">
              <div className="text-xs font-mono text-muted uppercase tracking-wider">{label}</div>
              <div className="text-lg text-lime mt-1">{entry[key] || <span className="text-muted italic">— not picked —</span>}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ----------------------------------------------------------------------------
function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl text-lime tracking-wider border-b border-grass pb-2">{title}</h2>
      {children}
    </div>
  )
}

function GroupView({ group, teams, picks }) {
  const rankFor = (team) => {
    if (picks?.first  === team) return 1
    if (picks?.second === team) return 2
    if (picks?.third  === team) return 3
    return 0
  }
  const rankBadge = { 1: '🥇', 2: '🥈', 3: '🥉' }
  const rankStyle = {
    1: 'border-lime bg-lime text-pitch',
    2: 'border-gold bg-gold/30 text-gold',
    3: 'border-orange-400 bg-orange-400/20 text-orange-300',
  }
  return (
    <div className="bg-grass/20 border border-grass rounded-xl p-3">
      <div className="font-display text-lg text-lime mb-2">Group {group}</div>
      <div className="grid grid-cols-2 gap-1.5">
        {teams.map((team) => {
          const r = rankFor(team)
          const isFourth = r === 0
          return (
            <div
              key={team}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border-2 text-xs
                ${r ? rankStyle[r]
                  : 'border-grass/40 bg-pitch/30 text-muted opacity-60 line-through'}`}
            >
              <span className="text-sm">{flagFor(team)}</span>
              <span className="flex-1">{team}</span>
              {r > 0
                ? <span>{rankBadge[r]}</span>
                : <span className="text-[9px] font-mono">OUT</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MatchList({ matches, picks, winners, pts }) {
  return (
    <div className="space-y-1.5">
      {matches.map((m) => {
        const [teamA, teamB] = teamsForMatch(m.id, picks)
        const w = winners[m.id]
        return (
          <div key={m.id} className="bg-grass/20 border border-grass rounded-lg p-2 grid grid-cols-12 items-center gap-2 text-sm">
            <div className="col-span-2 text-xs font-mono text-muted">
              M{m.id}<span className="hidden sm:inline"> · {pts}pt{pts > 1 ? 's' : ''}</span>
            </div>
            <TeamChip team={teamA} highlighted={w && w === teamA} className="col-span-4" />
            <div className="col-span-1 text-center text-muted text-xs font-mono">vs</div>
            <TeamChip team={teamB} highlighted={w && w === teamB} className="col-span-5" />
          </div>
        )
      })}
    </div>
  )
}

function TeamChip({ team, highlighted, className = '' }) {
  if (!team) {
    return <div className={`${className} text-xs text-muted italic px-2`}>—</div>
  }
  return (
    <div className={`${className} flex items-center gap-2 px-2 py-1.5 rounded border
      ${highlighted ? 'border-lime bg-lime text-pitch font-bold' : 'border-grass bg-pitch'}`}>
      <span className="text-base">{flagFor(team)}</span>
      <span className="truncate">{team}</span>
      {highlighted && <span className="ml-auto text-xs">✓</span>}
    </div>
  )
}

function CenterMessage({ icon, title, body, action }) {
  return (
    <div className="pt-20 max-w-md mx-auto text-center space-y-4">
      <div className="text-5xl">{icon}</div>
      <h1 className="font-display text-3xl text-lime tracking-widest">{title}</h1>
      <p className="text-muted font-mono text-sm">{body}</p>
      {action && (
        <Link to={action.to} className="inline-block mt-4 px-6 py-3 bg-lime text-pitch font-bold rounded-xl">
          {action.label}
        </Link>
      )}
    </div>
  )
}
