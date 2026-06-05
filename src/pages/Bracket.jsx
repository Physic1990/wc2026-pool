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
      <Section title="📋 Group Stage" hint="1st = 2pts · 2nd = 1pt · Both correct = +1 bonus">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GROUP_LABELS.map((g) => (
            <GroupView key={g} group={g} teams={GROUPS[g]} picks={entry.group_picks?.[g] || {}} actual={results.groups?.[g] || {}} hasResults={!!results.groups?.[g]} />
          ))}
        </div>
      </Section>

      {/* Knockout rounds */}
      <Section title="⚔️ Round of 32" hint="1 pt per correct winner">
        <MatchList matches={R32_MATCHES} picks={picks} winners={entry.knockout_picks || {}} actualWinners={results.knockout_picks || {}} pts={1} />
      </Section>
      <Section title="⚔️ Round of 16" hint="2 pts per correct winner">
        <MatchList matches={R16_MATCHES} picks={picks} winners={entry.knockout_picks || {}} actualWinners={results.knockout_picks || {}} pts={2} />
      </Section>
      <Section title="⚔️ Quarterfinals" hint="3 pts per correct winner">
        <MatchList matches={QF_MATCHES} picks={picks} winners={entry.knockout_picks || {}} actualWinners={results.knockout_picks || {}} pts={3} />
      </Section>
      <Section title="⚔️ Semifinals" hint="5 pts per correct winner">
        <MatchList matches={SF_MATCHES} picks={picks} winners={entry.knockout_picks || {}} actualWinners={results.knockout_picks || {}} pts={5} />
      </Section>
      <Section title="🏆 Final" hint="8 pts for correct champion">
        <MatchList matches={[FINAL_MATCH]} picks={picks} winners={entry.knockout_picks || {}} actualWinners={results.knockout_picks || {}} pts={8} />
      </Section>

      {/* Bonuses */}
      <Section title="🎖️ Bonus Awards" hint="3 pts each — Golden Boot · Golden Glove · Golden Ball · Dark Horse">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'golden_boot',  label: '🥇 Golden Boot — Top Scorer' },
            { key: 'golden_glove', label: '🧤 Golden Glove — Best Keeper' },
            { key: 'golden_ball',  label: '⭐ Golden Ball — Best Player' },
            { key: 'dark_horse',   label: '🐴 Dark Horse Team' },
          ].map(({ key, label }) => {
            const myPick = entry[key] || ''
            const actual = results[key] || ''
            const isKnown = !!actual
            const isCorrect = isKnown && myPick && myPick === actual
            const isWrong = isKnown && myPick && myPick !== actual
            return (
            <div key={key} className={`border rounded-xl p-4 ${isCorrect ? 'bg-green-900/20 border-green-600' : isWrong ? 'bg-red-900/20 border-red-700' : 'bg-grass/20 border-grass'}`}>
              <div className="text-xs font-mono text-muted uppercase tracking-wider">{label}</div>
              <div className="flex items-center justify-between mt-1">
                <div className="text-lg text-lime">{myPick || <span className="text-muted italic">— not picked —</span>}</div>
                {isCorrect && <span className="text-green-400 text-lg">✅</span>}
                {isWrong && <div className="text-right"><span className="text-red-400 text-lg">❌</span><div className="text-xs text-muted font-mono">→ {actual}</div></div>}
              </div>
            </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}

// ----------------------------------------------------------------------------
function Section({ title, hint, children }) {
  return (
    <div className="space-y-3">
      <div className="border-b border-grass pb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl text-lime tracking-wider">{title}</h2>
        {hint && <span className="text-xs font-mono text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function GroupView({ group, teams, picks, actual, hasResults }) {
  const rankFor = (obj, team) => {
    if (obj?.first  === team) return 1
    if (obj?.second === team) return 2
    if (obj?.third  === team) return 3
    return 0
  }
  const rankBadge = { 1: '🥇', 2: '🥈', 3: '🥉' }

  return (
    <div className="bg-grass/20 border border-grass rounded-xl p-3">
      <div className="font-display text-lg text-lime mb-2">Group {group}</div>
      <div className="grid grid-cols-2 gap-1.5">
        {teams.map((team) => {
          const myRank = rankFor(picks, team)
          const actualRank = rankFor(actual, team)

          // Determine result state
          let state = 'unpicked' // not in top 3 by user
          if (myRank > 0) {
            if (!hasResults) state = 'picked'
            else if (myRank === actualRank) state = 'correct'
            else if (actualRank > 0) state = 'wrong-rank' // picked to qualify but wrong position
            else state = 'wrong-out' // picked to qualify but actually out
          } else if (hasResults && actualRank > 0) {
            state = 'missed' // user had OUT but they actually qualified
          }

          const styles = {
            correct:    'border-green-500 bg-green-900/30 text-green-300',
            'wrong-rank':'border-yellow-500 bg-yellow-900/20 text-yellow-300',
            'wrong-out':'border-red-600 bg-red-900/20 text-red-300',
            missed:     'border-blue-500 bg-blue-900/20 text-blue-300 opacity-80',
            picked:     myRank === 1 ? 'border-lime bg-lime text-pitch' : myRank === 2 ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300' : 'border-orange-400 bg-orange-400/20 text-orange-300',
            unpicked:   'border-grass/40 bg-pitch/30 text-muted opacity-50 line-through',
          }

          const badge = myRank > 0 ? rankBadge[myRank] : null

          // Points earned from this team
          let pts = null
          if (hasResults) {
            if (state === 'correct') pts = myRank === 1 ? 2 : 1  // 1st=2pts, 2nd/3rd=1pt
            else if (state === 'wrong-rank') pts = 0
            else if (state === 'wrong-out') pts = 0
            else pts = null
          }

          const indicator = {
            correct: '✅',
            'wrong-rank': '⚠️',
            'wrong-out': '❌',
            missed: '↑',
          }[state]

          return (
            <div key={team} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border-2 text-xs ${styles[state]}`}>
              <span className="text-sm">{flagFor(team)}</span>
              <span className="flex-1 truncate">{team}</span>
              <span className="shrink-0 flex items-center gap-0.5">
                {badge && <span>{badge}</span>}
                {indicator && <span>{indicator}</span>}
                {pts !== null && (
                  <span className={`font-bold font-mono text-[10px] ml-0.5 ${pts > 0 ? 'text-green-300' : 'text-red-400'}`}>
                    {pts > 0 ? `+${pts}` : '0'}
                  </span>
                )}
                {state === 'unpicked' && <span className="text-[9px] font-mono">OUT</span>}
              </span>
            </div>
          )
        })}
      </div>
      {hasResults && (
        <div className="mt-2 text-[10px] font-mono text-muted flex gap-2 flex-wrap">
          <span>✅ correct</span><span>⚠️ wrong pos</span><span>❌ out</span>
        </div>
      )}
    </div>
  )
}

function MatchList({ matches, picks, winners, actualWinners, pts }) {
  return (
    <div className="space-y-1.5">
      {matches.map((m) => {
        const [teamA, teamB] = teamsForMatch(m.id, picks)
        const myPick = winners[m.id]
        const actualWinner = actualWinners[m.id]
        const hasResult = !!actualWinner
        return (
          <div key={m.id} className="bg-grass/20 border border-grass rounded-lg p-2 grid grid-cols-12 items-center gap-2 text-sm">
            <div className="col-span-2 text-xs font-mono text-muted">
              M{m.id}<span className="hidden sm:inline"> · {pts}pt{pts > 1 ? 's' : ''}</span>
            </div>
            <TeamChip team={teamA} isPicked={myPick === teamA} isCorrect={hasResult && myPick === teamA && actualWinner === teamA} isWrong={hasResult && myPick === teamA && actualWinner !== teamA} pts={pts} className="col-span-4" />
            <div className="col-span-1 text-center text-muted text-xs font-mono">vs</div>
            <TeamChip team={teamB} isPicked={myPick === teamB} isCorrect={hasResult && myPick === teamB && actualWinner === teamB} isWrong={hasResult && myPick === teamB && actualWinner !== teamB} pts={pts} className="col-span-5" />
          </div>
        )
      })}
    </div>
  )
}

function TeamChip({ team, isPicked, isCorrect, isWrong, pts, className = '' }) {
  if (!team) {
    return <div className={`${className} text-xs text-muted italic px-2`}>—</div>
  }
  return (
    <div className={`${className} flex items-center gap-1.5 px-2 py-1.5 rounded border text-xs
      ${isCorrect ? 'border-green-500 bg-green-900/30 text-green-300 font-bold'
        : isWrong  ? 'border-red-600 bg-red-900/20 text-red-300'
        : isPicked ? 'border-lime bg-lime text-pitch font-bold'
        : 'border-grass bg-pitch text-muted'}`}>
      <span className="text-sm">{flagFor(team)}</span>
      <span className="truncate flex-1">{team}</span>
      {isCorrect && <span className="shrink-0 flex items-center gap-0.5">✅ <span className="text-green-300 font-bold font-mono">+{pts}</span></span>}
      {isWrong   && <span className="shrink-0">❌</span>}
      {isPicked && !isCorrect && !isWrong && <span className="shrink-0 text-xs">✓</span>}
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
