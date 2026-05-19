import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../supabase.js'
import {
  GROUPS, GROUP_LABELS,
  R32_MATCHES, R16_MATCHES, QF_MATCHES, SF_MATCHES, FINAL_MATCH,
  THIRD_PLACE_SLOTS,
  teamsForMatch, slotLabel,
} from '../data/teams.js'
import { flagFor } from '../data/flags.js'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'wc2026admin'

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [results, setResults] = useState({
    groups: {},                 // { A: { first, second, third }, ... }
    third_place_picks: {},      // { 74: team, 77: team, ... }
    knockout_picks: {},         // { 73: winner, ..., 104: champion }
    golden_boot: '', golden_glove: '', golden_ball: '', dark_horse: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!authed) return
    async function load() {
      const { data } = await supabase.from('results').select('*').eq('id', 1).single()
      if (data?.data) {
        // Defensive merge so missing keys don't blow up
        setResults((prev) => ({ ...prev, ...data.data }))
      }
    }
    load()
  }, [authed])

  async function save() {
    setSaving(true)
    setSaved(false)
    // Sync champion with final-match winner for backward compat
    const champion = results.knockout_picks?.[FINAL_MATCH.id] || ''
    const payload = { ...results, champion }
    const { error } = await supabase.from('results').upsert({ id: 1, data: payload })
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (!authed) {
    return (
      <div className="pt-20 max-w-sm mx-auto space-y-4">
        <h1 className="font-display text-4xl text-lime text-center tracking-widest">ADMIN</h1>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (pw === ADMIN_PASSWORD) setAuthed(true)
              else alert('Wrong password')
            }
          }}
          placeholder="Password"
          className="w-full bg-grass/20 border border-grass rounded-xl px-4 py-3 focus:outline-none focus:border-lime"
        />
        <button
          onClick={() => {
            if (pw === ADMIN_PASSWORD) setAuthed(true)
            else alert('Wrong password')
          }}
          className="w-full py-3 bg-lime text-pitch font-bold rounded-xl"
        >
          Enter Admin
        </button>
      </div>
    )
  }

  const picks = {
    group_picks: results.groups,
    third_place_picks: results.third_place_picks,
    knockout_picks: results.knockout_picks,
  }

  const setGroup = (g, pos, val) =>
    setResults((r) => ({ ...r, groups: { ...r.groups, [g]: { ...r.groups?.[g], [pos]: val } } }))

  const setThirdSlot = (matchId, team) =>
    setResults((r) => ({ ...r, third_place_picks: { ...r.third_place_picks, [matchId]: team } }))

  const setWinner = (matchId, team) =>
    setResults((r) => ({ ...r, knockout_picks: { ...r.knockout_picks, [matchId]: team } }))

  return (
    <div className="pt-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-lime tracking-widest">ADMIN PANEL</h1>
        <button
          onClick={save}
          disabled={saving}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${saved ? 'bg-green-600 text-white' : 'bg-lime text-pitch hover:bg-lime/90'}`}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Results'}
        </button>
      </div>

      {/* Group Results */}
      <Section title="📋 Group Stage Results (1st / 2nd / 3rd)">
        <p className="text-xs text-muted font-mono">Click teams to rank (1st → 2nd → 3rd). Click again to clear.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {Object.entries(GROUPS).map(([group, teams]) => (
            <AdminGroupPicker
              key={group}
              group={group}
              teams={teams}
              picked={results.groups?.[group] || {}}
              onChange={(next) => setResults((r) => ({ ...r, groups: { ...r.groups, [group]: next } }))}
            />
          ))}
        </div>
      </Section>

      {/* R32 third-place slot assignments + match winners */}
      <Section title="⚔️ Round of 32">
        <MatchList
          matches={R32_MATCHES}
          picks={picks}
          results={results}
          setWinner={setWinner}
          setThirdSlot={setThirdSlot}
        />
      </Section>

      <Section title="⚔️ Round of 16">
        <MatchList matches={R16_MATCHES} picks={picks} results={results} setWinner={setWinner} />
      </Section>

      <Section title="⚔️ Quarterfinals">
        <MatchList matches={QF_MATCHES} picks={picks} results={results} setWinner={setWinner} />
      </Section>

      <Section title="⚔️ Semifinals">
        <MatchList matches={SF_MATCHES} picks={picks} results={results} setWinner={setWinner} />
      </Section>

      <Section title="🏆 Final / Champion">
        <MatchList matches={[FINAL_MATCH]} picks={picks} results={results} setWinner={setWinner} />
      </Section>

      <Section title="🎖️ Bonus Awards">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key: 'golden_boot',  label: '🥇 Golden Boot' },
            { key: 'golden_glove', label: '🧤 Golden Glove' },
            { key: 'golden_ball',  label: '⭐ Golden Ball' },
            { key: 'dark_horse',   label: '🐴 Dark Horse Team' },
          ].map(({ key, label }) => (
            <div key={key}>
              <div className="text-sm text-muted font-mono mb-1">{label}</div>
              <input
                type="text"
                value={results[key] || ''}
                onChange={(e) => setResults((r) => ({ ...r, [key]: e.target.value }))}
                placeholder={key === 'dark_horse' ? 'Team name...' : 'Player name...'}
                className="w-full bg-pitch border border-grass rounded-xl px-4 py-2 focus:outline-none focus:border-lime"
              />
            </div>
          ))}
        </div>
      </Section>

      <button
        onClick={save}
        disabled={saving}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${saved ? 'bg-green-600 text-white' : 'bg-lime text-pitch hover:bg-lime/90'}`}
      >
        {saving ? 'Saving...' : saved ? '✓ Results Saved!' : '💾 Save All Results'}
      </button>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl text-lime tracking-wider border-b border-grass pb-2">{title}</h2>
      {children}
    </div>
  )
}

function MatchList({ matches, picks, results, setWinner, setThirdSlot }) {
  return (
    <div className="space-y-2">
      {matches.map((m) => {
        const [teamA, teamB] = teamsForMatch(m.id, picks)
        const winner = results.knockout_picks?.[m.id]
        const isThirdSlot = m.b?.kind === 'third'

        return (
          <div key={m.id} className="bg-grass/20 border border-grass rounded-xl p-3 grid grid-cols-12 items-center gap-3">
            <div className="col-span-2 font-mono text-xs text-muted">
              M{m.id}
              {m.a && (
                <div className="text-[10px] mt-0.5 hidden sm:block">
                  {slotLabel(m.a)}<br/>vs {slotLabel(m.b)}
                </div>
              )}
            </div>

            <div className="col-span-4">
              <TeamPickButton
                team={teamA}
                selected={winner && winner === teamA}
                onClick={() => teamA && setWinner(m.id, teamA)}
              />
            </div>

            <div className="col-span-5 space-y-1">
              {isThirdSlot && setThirdSlot && !teamB && (
                <AdminThirdPlaceChips
                  matchId={m.id}
                  eligibleGroups={m.b.eligibleGroups}
                  groupResults={results.groups || {}}
                  thirdPlacePicks={results.third_place_picks || {}}
                  onAssign={(team) => setThirdSlot(m.id, team)}
                />
              )}
              {teamB && (
                <TeamPickButton
                  team={teamB}
                  selected={winner && winner === teamB}
                  onClick={() => setWinner(m.id, teamB)}
                  onUnassign={isThirdSlot ? () => setThirdSlot(m.id, '') : undefined}
                />
              )}
              {!teamB && !isThirdSlot && (
                <div className="text-xs text-muted px-2 py-2 italic">—</div>
              )}
            </div>

            <div className="col-span-1 text-right">
              {winner && (
                <button
                  type="button"
                  onClick={() => setWinner(m.id, '')}
                  title="Clear winner"
                  className="text-muted hover:text-lime text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TeamPickButton({ team, selected, onClick, onUnassign }) {
  return (
    <div className="relative">
      <button
        type="button"
        disabled={!team}
        onClick={onClick}
        className={`w-full px-3 py-2 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all
          ${selected
            ? 'border-lime bg-lime text-pitch font-bold'
            : team
              ? 'border-grass bg-pitch hover:border-lime'
              : 'border-grass/40 bg-pitch/40 text-muted cursor-not-allowed'}`}
      >
        {team && <span className="text-lg leading-none">{flagFor(team)}</span>}
        <span>{team || '—'}</span>
      </button>
      {onUnassign && team && (
        <button
          type="button"
          onClick={onUnassign}
          title="Change 3rd-place team"
          className="absolute -top-1.5 -right-1.5 bg-pitch border border-grass rounded-full w-4 h-4 text-[10px] text-muted hover:text-lime hover:border-lime flex items-center justify-center"
        >
          ✕
        </button>
      )}
    </div>
  )
}

function AdminThirdPlaceChips({ matchId, eligibleGroups, groupResults, thirdPlacePicks, onAssign }) {
  const otherSlotsUsed = new Set(
    Object.entries(thirdPlacePicks)
      .filter(([k, v]) => Number(k) !== matchId && v)
      .map(([, v]) => v)
  )

  const options = eligibleGroups
    .map((g) => ({ group: g, team: groupResults[g]?.third }))
    .filter((o) => !!o.team)

  if (options.length === 0) {
    return (
      <div className="text-[11px] text-muted italic px-2">
        Set 3rd-place in groups {eligibleGroups.join(', ')} first
      </div>
    )
  }

  return (
    <div className="border border-dashed border-grass rounded-lg p-1.5 flex flex-wrap gap-1">
      <span className="text-[10px] font-mono text-muted self-center px-1">
        3rd from {eligibleGroups.join('/')}:
      </span>
      {options.map(({ group, team }) => {
        const taken = otherSlotsUsed.has(team)
        return (
          <button
            key={team}
            type="button"
            disabled={taken}
            onClick={() => onAssign(team)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] border transition-all
              ${taken
                ? 'border-grass/40 bg-pitch/40 text-muted cursor-not-allowed line-through opacity-60'
                : 'border-grass bg-pitch hover:border-lime hover:text-lime'}`}
          >
            <span>{flagFor(team)}</span>
            <span>{team}</span>
            <span className="text-muted">G{group}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Admin's group picker — same click-to-rank UX as the entry form. */
function AdminGroupPicker({ group, teams, picked, onChange }) {
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
    if (!picked.first)  return onChange({ ...picked, first:  team })
    if (!picked.second) return onChange({ ...picked, second: team })
    if (!picked.third)  return onChange({ ...picked, third:  team })
  }
  const rankBadge = { 1: '🥇', 2: '🥈', 3: '🥉' }
  const rankStyle = {
    1: 'border-lime bg-lime text-pitch',
    2: 'border-gold bg-gold/30 text-gold',
    3: 'border-orange-400 bg-orange-400/20 text-orange-300',
  }
  return (
    <div className="bg-grass/20 border border-grass rounded-xl p-4">
      <div className="font-display text-lg text-lime mb-2">Group {group}</div>
      <div className="grid grid-cols-2 gap-2">
        {teams.map((team) => {
          const r = rankFor(team)
          const isFourth = r === 0 && picked.first && picked.second && picked.third
          return (
            <button
              key={team}
              type="button"
              onClick={() => handleClick(team)}
              className={`relative flex items-center gap-2 px-2 py-2 rounded-lg border-2 text-xs font-medium transition-all
                ${r ? rankStyle[r]
                  : isFourth ? 'border-grass/40 bg-pitch/30 text-muted opacity-60 line-through'
                  : 'border-grass bg-pitch hover:border-lime'}`}
            >
              <span className="text-base leading-none">{flagFor(team)}</span>
              <span className="text-left flex-1">{team}</span>
              {r > 0 && (
                <span className="text-sm">{rankBadge[r]}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
