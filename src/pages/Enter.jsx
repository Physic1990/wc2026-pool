import { useState, useMemo, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { supabase } from '../supabase.js'
import { useAuth } from '../lib/auth.jsx'
import { isLocked } from '../lib/deadline.js'
import DeadlineBanner from '../components/DeadlineBanner.jsx'
import {
  GROUPS, GROUP_LABELS,
  R32_MATCHES, R16_MATCHES, QF_MATCHES, SF_MATCHES, FINAL_MATCH,
  THIRD_PLACE_SLOTS,
  teamsForMatch, slotLabel,
} from '../data/teams.js'
import { flagFor } from '../data/flags.js'

const STEP_LABELS = ['Name', 'Groups', 'R32', 'R16', 'QF', 'SF', 'Final & Bonuses']

// FIFA composite ranking of WC 2026 teams (source: Christian Dietmeyer's composite — betting odds + Elo)
// Ordered #1 (strongest) → #48 (weakest/biggest dark horse)
const FIFA_RANKED_TEAMS = [
  { name: 'Spain' },
  { name: 'France' },
  { name: 'England' },
  { name: 'Brazil' },
  { name: 'Argentina' },
  { name: 'Portugal' },
  { name: 'Germany' },
  { name: 'Netherlands' },
  { name: 'Norway' },
  { name: 'Colombia' },
  { name: 'Belgium' },
  { name: 'Japan' },
  { name: 'Morocco' },
  { name: 'Uruguay' },
  { name: 'USA' },
  { name: 'Switzerland' },
  { name: 'Mexico' },
  { name: 'Ecuador' },
  { name: 'Croatia' },
  { name: 'Türkiye' },
  { name: 'Senegal' },
  { name: 'Sweden' },
  { name: 'Austria' },
  { name: 'Paraguay' },
  { name: 'Canada' },
  { name: "Côte d'Ivoire" },
  { name: 'Scotland' },
  { name: 'Korea Republic' },
  { name: 'Czechia' },
  { name: 'Egypt' },
  { name: 'Bosnia and Herzegovina' },
  { name: 'Ghana' },
  { name: 'Australia' },
  { name: 'IR Iran' },
  { name: 'Algeria' },
  { name: 'Tunisia' },
  { name: 'South Africa' },
  { name: 'Congo DR' },
  { name: 'Iraq' },
  { name: 'Saudi Arabia' },
  { name: 'Qatar' },
  { name: 'Cabo Verde' },
  { name: 'Haiti' },
  { name: 'Curaçao' },
  { name: 'Panama' },
  { name: 'Uzbekistan' },
  { name: 'Jordan' },
  { name: 'New Zealand' },
]

export default function Enter() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')

  // group_picks: { A: { first, second, third }, ... }
  const [groupPicks, setGroupPicks] = useState({})

  // third_place_picks: { 74: 'Team', 77: ..., 79, 80, 81, 82, 85, 87 }
  const [thirdPlacePicks, setThirdPlacePicks] = useState({})

  // knockout_picks: { 73: winnerTeam, 74: winnerTeam, ..., 104: champion }
  const [knockoutPicks, setKnockoutPicks] = useState({})

  const [bonuses, setBonuses] = useState({ golden_boot: '', golden_glove: '', golden_ball: '', dark_horse: '' })

  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [isEditing, setIsEditing] = useState(false) // true if user already has an entry
  const [loadingEntry, setLoadingEntry] = useState(true)
  const [error, setError] = useState('')

  // Load existing entry (if any) so users can edit their picks
  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function load() {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      if (cancelled) return
      if (error) {
        setError(error.message)
      } else if (data) {
        setIsEditing(true)
        setName(data.name || '')
        setGroupPicks(data.group_picks || {})
        setThirdPlacePicks(data.third_place_picks || {})
        setKnockoutPicks(data.knockout_picks || {})
        setBonuses({
          golden_boot:  data.golden_boot  || '',
          golden_glove: data.golden_glove || '',
          golden_ball:  data.golden_ball  || '',
          dark_horse:   data.dark_horse   || '',
        })
      }
      setLoadingEntry(false)
    }
    load()
    return () => { cancelled = true }
  }, [user])

  const picks = { group_picks: groupPicks, third_place_picks: thirdPlacePicks, knockout_picks: knockoutPicks }

  // -- Auto-prune stale downstream picks -----------------------------------
  // When the user changes a group pick or a 3rd-place slot, R32 winners that
  // reference a team no longer in the match become stale. Same cascade applies
  // round-by-round through to the Final. Clear anything stale so validation
  // and the UI stay honest.
  useEffect(() => {
    setKnockoutPicks((kp) => {
      const next = { ...kp }
      let changed = false
      const allMatches = [
        ...R32_MATCHES, ...R16_MATCHES, ...QF_MATCHES, ...SF_MATCHES, FINAL_MATCH,
      ]
      // Iterate in order so upstream prunes propagate downstream within one pass.
      for (const m of allMatches) {
        const winner = next[m.id]
        if (!winner) continue
        const [a, b] = teamsForMatch(m.id, {
          group_picks: groupPicks,
          third_place_picks: thirdPlacePicks,
          knockout_picks: next,
        })
        if (winner !== a && winner !== b) {
          delete next[m.id]
          changed = true
        }
      }
      return changed ? next : kp
    })
  }, [groupPicks, thirdPlacePicks])

  // -- Validation per step --------------------------------------------------
  const groupsComplete = useMemo(
    () => GROUP_LABELS.every((g) => {
      const p = groupPicks[g]
      if (!p?.first || !p?.second || !p?.third) return false
      const set = new Set([p.first, p.second, p.third])
      return set.size === 3 // all three must be different
    }),
    [groupPicks]
  )

  const r32Complete = useMemo(() => {
    // All 8 third-place slots filled AND all 16 winners chosen
    const slotsFilled = THIRD_PLACE_SLOTS.every(({ matchId }) => !!thirdPlacePicks[matchId])
    if (!slotsFilled) return false
    return R32_MATCHES.every((m) => {
      const winner = knockoutPicks[m.id]
      if (!winner) return false
      const [a, b] = teamsForMatch(m.id, picks)
      return winner === a || winner === b
    })
  }, [thirdPlacePicks, knockoutPicks, groupPicks])

  const r16Complete = useMemo(
    () => R16_MATCHES.every((m) => {
      const winner = knockoutPicks[m.id]
      if (!winner) return false
      const [a, b] = teamsForMatch(m.id, picks)
      return winner === a || winner === b
    }),
    [knockoutPicks]
  )

  const qfComplete = useMemo(
    () => QF_MATCHES.every((m) => {
      const winner = knockoutPicks[m.id]
      if (!winner) return false
      const [a, b] = teamsForMatch(m.id, picks)
      return winner === a || winner === b
    }),
    [knockoutPicks]
  )

  const sfComplete = useMemo(
    () => SF_MATCHES.every((m) => {
      const winner = knockoutPicks[m.id]
      if (!winner) return false
      const [a, b] = teamsForMatch(m.id, picks)
      return winner === a || winner === b
    }),
    [knockoutPicks]
  )

  const canSubmit = !!knockoutPicks[FINAL_MATCH.id]

  async function handleSubmit() {
    if (!user) return
    setSubmitting(true)
    setError('')
    try {
      const champion = knockoutPicks[FINAL_MATCH.id] || ''
      const payload = {
        user_id: user.id,
        name: name.trim(),
        group_picks: groupPicks,
        third_place_picks: thirdPlacePicks,
        knockout_picks: knockoutPicks,
        champion,
        golden_boot: bonuses.golden_boot,
        golden_glove: bonuses.golden_glove,
        golden_ball: bonuses.golden_ball,
        dark_horse: bonuses.dark_horse,
        updated_at: new Date().toISOString(),
      }
      const { error: err } = await supabase
        .from('entries')
        .upsert(payload, { onConflict: 'user_id' })
      if (err) throw err
      setDone(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingEntry) {
    return (
      <div className="pt-20 text-center">
        <div className="text-5xl animate-bounce">⚽</div>
        <p className="text-muted font-mono mt-4">Loading your bracket...</p>
      </div>
    )
  }
  // Past the deadline → no editing. Send them to the read-only view.
  if (isLocked()) {
    return <Navigate to="/bracket/me" replace />
  }
  if (done) return <SuccessScreen name={name} isEditing={isEditing} />

  return (
    <div className="pt-8 max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-display text-5xl text-lime tracking-widest">
          {isEditing ? 'EDIT YOUR PICKS' : 'ENTER YOUR PICKS'}
        </h1>
        <div className="flex justify-center"><DeadlineBanner /></div>
      </div>

      <div className="flex gap-2">
        {STEP_LABELS.map((s, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'bg-lime' : 'bg-grass'}`} />
        ))}
      </div>
      <div className="text-center text-muted font-mono text-xs uppercase tracking-widest">
        Step {step + 1} of {STEP_LABELS.length} — {STEP_LABELS[step]}
      </div>

      {step === 0 && (
        <NameStep
          name={name}
          setName={setName}
          onNext={() => setStep(1)}
        />
      )}

      {step === 1 && (
        <GroupsStep
          groupPicks={groupPicks}
          setGroupPicks={setGroupPicks}
          canNext={groupsComplete}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <RoundStep
          title="Round of 32"
          subtitle="Pick the 3rd-place team for each slot, then click the winner of each match."
          matches={R32_MATCHES}
          picks={picks}
          knockoutPicks={knockoutPicks}
          setKnockoutPicks={setKnockoutPicks}
          thirdPlacePicks={thirdPlacePicks}
          setThirdPlacePicks={setThirdPlacePicks}
          groupPicks={groupPicks}
          ptsPerWin={1}
          canNext={r32Complete}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <RoundStep
          title="Round of 16"
          subtitle="Click the winner of each match. 2 pts each."
          matches={R16_MATCHES}
          picks={picks}
          knockoutPicks={knockoutPicks}
          setKnockoutPicks={setKnockoutPicks}
          ptsPerWin={2}
          canNext={r16Complete}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <RoundStep
          title="Quarterfinals"
          subtitle="Pick your semi-finalists. 3 pts each."
          matches={QF_MATCHES}
          picks={picks}
          knockoutPicks={knockoutPicks}
          setKnockoutPicks={setKnockoutPicks}
          ptsPerWin={3}
          canNext={qfComplete}
          onBack={() => setStep(3)}
          onNext={() => setStep(5)}
        />
      )}

      {step === 5 && (
        <RoundStep
          title="Semifinals"
          subtitle="Pick your finalists. 5 pts each."
          matches={SF_MATCHES}
          picks={picks}
          knockoutPicks={knockoutPicks}
          setKnockoutPicks={setKnockoutPicks}
          ptsPerWin={5}
          canNext={sfComplete}
          onBack={() => setStep(4)}
          onNext={() => setStep(6)}
        />
      )}

      {step === 6 && (
        <FinalStep
          picks={picks}
          knockoutPicks={knockoutPicks}
          setKnockoutPicks={setKnockoutPicks}
          bonuses={bonuses}
          setBonuses={setBonuses}
          error={error}
          submitting={submitting}
          canSubmit={canSubmit}
          onBack={() => setStep(5)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

// ============================================================================
// Step components
// ============================================================================

function NameStep({ name, setName, onNext }) {
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm text-muted font-mono uppercase tracking-wider">Your Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Shashwot"
          className="mt-2 w-full bg-grass/20 border border-grass rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-lime transition-colors"
        />
      </label>
      <div className="flex gap-3 pt-2">
        <button
          onClick={onNext}
          disabled={name.trim().length < 2}
          className="flex-1 py-3 bg-lime text-pitch font-bold rounded-xl hover:bg-lime/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

function GroupsStep({ groupPicks, setGroupPicks, canNext, onBack, onNext }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted font-mono">
        Click a team to assign the next open rank (🥇 → 🥈 → 🥉). Click again to clear.
        4th-place is whatever's left and gets eliminated.
      </p>

      {Object.entries(GROUPS).map(([group, teams]) => (
        <GroupPicker
          key={group}
          group={group}
          teams={teams}
          picked={groupPicks[group] || {}}
          onChange={(next) => setGroupPicks((p) => ({ ...p, [group]: next }))}
        />
      ))}

      <NavButtons onBack={onBack} onNext={onNext} canNext={canNext} />
    </div>
  )
}

/**
 * One group's picker: 4 clickable team cards.
 * Click rules:
 *   - Unassigned team → goes to next open rank (1st > 2nd > 3rd)
 *   - Assigned team → un-assigns (back to no rank)
 */
function GroupPicker({ group, teams, picked, onChange }) {
  const rankFor = (team) => {
    if (picked.first  === team) return 1
    if (picked.second === team) return 2
    if (picked.third  === team) return 3
    return 0
  }

  const handleClick = (team) => {
    const r = rankFor(team)
    if (r === 1) return onChange({ ...picked, first:  undefined })
    if (r === 2) return onChange({ ...picked, second: undefined })
    if (r === 3) return onChange({ ...picked, third:  undefined })
    // Unassigned → next open slot
    if (!picked.first)  return onChange({ ...picked, first:  team })
    if (!picked.second) return onChange({ ...picked, second: team })
    if (!picked.third)  return onChange({ ...picked, third:  team })
    // All ranks full — ignore
  }

  const rankBadge = { 1: '🥇 1st', 2: '🥈 2nd', 3: '🥉 3rd' }
  const rankStyle = {
    1: 'border-lime bg-lime text-pitch',
    2: 'border-gold bg-gold/30 text-gold',
    3: 'border-orange-400 bg-orange-400/20 text-orange-300',
  }

  return (
    <div className="bg-grass/20 border border-grass rounded-xl p-4">
      <div className="flex items-baseline justify-between mb-3">
        <div className="font-display text-xl text-lime">Group {group}</div>
        <div className="text-[10px] text-muted font-mono uppercase tracking-wider">
          Click to rank · Click again to clear
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {teams.map((team) => {
          const r = rankFor(team)
          const isUnranked = r === 0
          const isFourth = isUnranked && picked.first && picked.second && picked.third
          return (
            <button
              key={team}
              type="button"
              onClick={() => handleClick(team)}
              className={`relative flex flex-col items-center gap-1 px-2 py-3 rounded-lg border-2 text-sm font-medium transition-all
                ${r
                  ? rankStyle[r]
                  : isFourth
                    ? 'border-grass/40 bg-pitch/30 text-muted opacity-60 line-through'
                    : 'border-grass bg-pitch hover:border-lime'
                }
              `}
            >
              <span className="text-2xl leading-none">{flagFor(team)}</span>
              <span className="text-xs text-center leading-tight">{team}</span>
              {r > 0 && (
                <span className="absolute -top-2 -right-2 bg-pitch border border-current rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                  {rankBadge[r]}
                </span>
              )}
              {isFourth && (
                <span className="absolute -top-2 -right-2 bg-pitch border border-grass/60 rounded-full px-1.5 py-0.5 text-[10px] font-mono text-muted">
                  OUT
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function RoundStep({
  title, subtitle, matches, picks,
  knockoutPicks, setKnockoutPicks,
  thirdPlacePicks, setThirdPlacePicks,
  groupPicks,
  ptsPerWin, canNext, onBack, onNext,
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-3xl text-lime tracking-widest">{title}</h2>
        <p className="text-sm text-muted font-mono mt-1">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {matches.map((m) => (
          <MatchCard
            key={m.id}
            match={m}
            picks={picks}
            knockoutPicks={knockoutPicks}
            setKnockoutPicks={setKnockoutPicks}
            thirdPlacePicks={thirdPlacePicks}
            setThirdPlacePicks={setThirdPlacePicks}
            groupPicks={groupPicks}
            ptsPerWin={ptsPerWin}
          />
        ))}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} canNext={canNext} />
    </div>
  )
}

function MatchCard({
  match, picks,
  knockoutPicks, setKnockoutPicks,
  thirdPlacePicks, setThirdPlacePicks,
  groupPicks,
  ptsPerWin,
}) {
  const [teamA, teamB] = teamsForMatch(match.id, picks)
  const winner = knockoutPicks[match.id]
  const setWinner = (team) =>
    setKnockoutPicks((p) => {
      const next = { ...p, [match.id]: team }
      // Walk the bracket downstream and clear any pick that's no longer a
      // participant of its match.
      pruneDownstream(next, { group_picks: picks.group_picks, third_place_picks: picks.third_place_picks })
      return next
    })

  const isR32ThirdSlot = match.a && match.b?.kind === 'third'

  return (
    <div className="bg-grass/20 border border-grass rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-mono text-xs text-muted uppercase tracking-wider">
          Match {match.id} · {ptsPerWin} pt{ptsPerWin > 1 ? 's' : ''}
        </div>
        {match.a && (
          <div className="text-xs font-mono text-muted hidden sm:block">
            {slotLabel(match.a)} vs {slotLabel(match.b)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Slot A */}
        <SlotButton
          team={teamA}
          fallback={match.a ? slotLabel(match.a) : '—'}
          selected={winner && winner === teamA}
          disabled={!teamA}
          onClick={() => teamA && setWinner(teamA)}
        />

        {/* Slot B */}
        {isR32ThirdSlot ? (
          <ThirdPlaceSlot
            matchId={match.id}
            eligibleGroups={match.b.eligibleGroups}
            assignedTeam={teamB}
            isWinner={winner && winner === teamB}
            groupPicks={groupPicks}
            thirdPlacePicks={thirdPlacePicks}
            setThirdPlacePicks={setThirdPlacePicks}
            onPickWinner={() => teamB && setWinner(teamB)}
          />
        ) : (
          <SlotButton
            team={teamB}
            fallback={match.b ? slotLabel(match.b) : '—'}
            selected={winner && winner === teamB}
            disabled={!teamB}
            onClick={() => teamB && setWinner(teamB)}
          />
        )}
      </div>
    </div>
  )
}

function SlotButton({ team, fallback, selected, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full px-3 py-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2
        ${selected
          ? 'border-lime bg-lime text-pitch font-bold'
          : team
            ? 'border-grass bg-pitch hover:border-lime'
            : 'border-grass/40 bg-pitch/40 text-muted cursor-not-allowed'}
      `}
    >
      {team ? (
        <>
          <span className="text-lg leading-none">{flagFor(team)}</span>
          <span>{team}</span>
        </>
      ) : (
        <span className="text-xs">{fallback}</span>
      )}
    </button>
  )
}

/**
 * A R32 slot that needs a 3rd-place team assigned.
 * Shows clickable chips for each eligible 3rd-place team. Once one is picked,
 * the slot becomes a regular winner-picker button.
 */
function ThirdPlaceSlot({
  matchId, eligibleGroups, assignedTeam, isWinner,
  groupPicks, thirdPlacePicks, setThirdPlacePicks,
  onPickWinner,
}) {
  const otherSlotsUsed = new Set(
    Object.entries(thirdPlacePicks)
      .filter(([k, v]) => Number(k) !== matchId && v)
      .map(([, v]) => v)
  )

  const options = eligibleGroups
    .map((g) => ({ group: g, team: groupPicks[g]?.third }))
    .filter((o) => !!o.team)

  const assign = (team) => {
    if (assignedTeam === team) {
      // Click currently-assigned team again → unassign
      setThirdPlacePicks((p) => {
        const next = { ...p }
        delete next[matchId]
        return next
      })
    } else {
      setThirdPlacePicks((p) => ({ ...p, [matchId]: team }))
    }
  }

  if (!assignedTeam) {
    // Show chip picker
    return (
      <div className="border-2 border-dashed border-grass rounded-lg p-2 space-y-1">
        <div className="text-[10px] font-mono text-muted uppercase tracking-wider px-1">
          Pick 3rd-place team from {eligibleGroups.join('/')}
        </div>
        {options.length === 0 ? (
          <div className="text-xs text-muted px-2 py-1">
            (Finish picking 3rd place in groups {eligibleGroups.join(', ')} first)
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {options.map(({ group, team }) => {
              const taken = otherSlotsUsed.has(team)
              return (
                <button
                  key={team}
                  type="button"
                  disabled={taken}
                  onClick={() => assign(team)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-all
                    ${taken
                      ? 'border-grass/40 bg-pitch/40 text-muted cursor-not-allowed line-through opacity-60'
                      : 'border-grass bg-pitch hover:border-lime hover:text-lime'}`}
                  title={taken ? 'Already assigned to another slot' : `Assign ${team} here`}
                >
                  <span>{flagFor(team)}</span>
                  <span>{team}</span>
                  <span className="text-muted">(G{group})</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Team assigned → show as a winner-picker, with a small unassign button
  return (
    <div className="relative">
      <SlotButton
        team={assignedTeam}
        fallback="—"
        selected={isWinner}
        disabled={false}
        onClick={onPickWinner}
      />
      <button
        type="button"
        onClick={() => assign(assignedTeam)} // click same team → unassign
        title="Change 3rd-place team"
        className="absolute -top-2 -right-2 bg-pitch border border-grass rounded-full w-5 h-5 text-xs text-muted hover:text-lime hover:border-lime flex items-center justify-center"
      >
        ✕
      </button>
    </div>
  )
}

function FinalStep({
  picks, knockoutPicks, setKnockoutPicks,
  bonuses, setBonuses,
  error, submitting, canSubmit,
  onBack, onSubmit,
}) {
  const [teamA, teamB] = teamsForMatch(FINAL_MATCH.id, picks)
  const winner = knockoutPicks[FINAL_MATCH.id]
  const setWinner = (team) => setKnockoutPicks((p) => ({ ...p, [FINAL_MATCH.id]: team }))

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-3xl text-lime tracking-widest">FINAL</h2>
        <p className="text-sm text-muted font-mono mt-1">Pick the champion. 8 pts.</p>
      </div>

      <div className="bg-grass/20 border border-grass rounded-xl p-5 space-y-3">
        <div className="text-center font-mono text-xs text-muted uppercase tracking-widest">
          🏆 Match {FINAL_MATCH.id} · Champion
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SlotButton
            team={teamA}
            fallback="—"
            selected={winner && winner === teamA}
            disabled={!teamA}
            onClick={() => teamA && setWinner(teamA)}
          />
          <SlotButton
            team={teamB}
            fallback="—"
            selected={winner && winner === teamB}
            disabled={!teamB}
            onClick={() => teamB && setWinner(teamB)}
          />
        </div>
      </div>

      <div>
        <h3 className="font-display text-2xl text-lime tracking-wider">Bonus Awards</h3>
        <p className="text-xs text-muted font-mono">3 pts each. Optional but encouraged.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { key: 'golden_boot',  label: '🥇 Golden Boot — Top Scorer' },
          { key: 'golden_glove', label: '🧤 Golden Glove — Best Keeper' },
          { key: 'golden_ball',  label: '⭐ Golden Ball — Best Player' },
        ].map(({ key, label }) => (
          <div key={key} className="bg-grass/20 border border-grass rounded-xl p-4 space-y-2">
            <div className="font-mono text-xs text-muted uppercase tracking-wider">{label}</div>
            <input
              type="text"
              value={bonuses[key]}
              onChange={(e) => setBonuses((b) => ({ ...b, [key]: e.target.value }))}
              placeholder="Player name..."
              className="w-full bg-pitch border border-grass rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime"
            />
          </div>
        ))}

        {/* Dark Horse — ranked dropdown */}
        <div className="bg-grass/20 border border-grass rounded-xl p-4 space-y-2 sm:col-span-2">
          <div className="font-mono text-xs text-muted uppercase tracking-wider">🐴 Dark Horse — Pick the lowest-ranked team to reach QF+ (3 pts)</div>
          <p className="text-xs text-muted font-mono">Teams ranked by FIFA composite ranking. Lower rank = bigger upset = dark horse!</p>
          <select
            value={bonuses.dark_horse}
            onChange={(e) => setBonuses((b) => ({ ...b, dark_horse: e.target.value }))}
            className="w-full bg-pitch border border-grass rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime"
          >
            <option value="">— Select a team —</option>
            {FIFA_RANKED_TEAMS.map((t, i) => (
              <option key={t.name} value={t.name}>#{i + 1} {t.name}</option>
            ))}
          </select>
          {bonuses.dark_horse && (
            <div className="text-xs font-mono text-lime">
              Selected: {bonuses.dark_horse} (#{FIFA_RANKED_TEAMS.findIndex(t => t.name === bonuses.dark_horse) + 1} ranked)
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="text-sm font-mono bg-grass/40 border border-grass rounded-xl p-3" style={{ color: '#fca5a5' }}>
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 border border-grass rounded-xl text-muted hover:text-lime hover:border-lime transition-colors">
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit || submitting}
          className="flex-1 py-3 bg-lime text-pitch font-bold rounded-xl hover:bg-lime/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? 'Submitting...' : '🚀 Submit Picks'}
        </button>
      </div>
    </div>
  )
}

function NavButtons({ onBack, onNext, canNext }) {
  return (
    <div className="flex gap-3 pt-2 sticky bottom-2">
      <button onClick={onBack} className="flex-1 py-3 border border-grass rounded-xl text-muted hover:text-lime hover:border-lime transition-colors bg-pitch/80 backdrop-blur">
        ← Back
      </button>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="flex-1 py-3 bg-lime text-pitch font-bold rounded-xl hover:bg-lime/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Next →
      </button>
    </div>
  )
}

function SuccessScreen({ name, isEditing }) {
  return (
    <div className="pt-20 text-center space-y-6">
      <div className="text-8xl animate-bounce">🏆</div>
      <div>
        <h2 className="font-display text-5xl text-lime tracking-widest">
          {isEditing ? 'PICKS UPDATED!' : "YOU'RE IN!"}
        </h2>
        <p className="text-muted mt-2">
          Good luck <span className="text-lime font-semibold">{name}</span> — check your leagues for live standings.
        </p>
      </div>
      <a href="/" className="inline-block bg-lime text-pitch font-bold px-8 py-3 rounded-xl hover:bg-lime/90 transition">
        Back to Dashboard →
      </a>
    </div>
  )
}

// ============================================================================
// Helpers
// ============================================================================

// Walk R16 → Final and clear any winner that's no longer a participant of its match.
// Mutates `knockoutPicks` in place.
function pruneDownstream(knockoutPicks, upstreamPicks) {
  const later = [...R16_MATCHES, ...QF_MATCHES, ...SF_MATCHES, FINAL_MATCH]
  for (const m of later) {
    const winner = knockoutPicks[m.id]
    if (!winner) continue
    const [a, b] = teamsForMatch(m.id, { ...upstreamPicks, knockout_picks: knockoutPicks })
    if (winner !== a && winner !== b) delete knockoutPicks[m.id]
  }
}
