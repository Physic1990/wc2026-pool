import { useState } from 'react'
import { supabase } from '../supabase.js'
import { GROUPS, ALL_TEAMS } from '../data/teams.js'

const ROUNDS_META = [
  { key: 'R32', label: 'Round of 32', picks: 16, hint: 'Pick 16 teams to advance' },
  { key: 'R16', label: 'Round of 16', picks: 8, hint: 'Pick 8 quarterfinalists' },
  { key: 'QF', label: 'Quarterfinals', picks: 4, hint: 'Pick 4 semifinalists' },
  { key: 'SF', label: 'Semifinals', picks: 2, hint: 'Pick 2 finalists' },
]

export default function Enter() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [groupPicks, setGroupPicks] = useState({})
  const [thirdPicks, setThirdPicks] = useState([])
  const [knockoutPicks, setKnockoutPicks] = useState({ R32: [], R16: [], QF: [], SF: [] })
  const [champion, setChampion] = useState('')
  const [bonuses, setBonuses] = useState({ golden_boot: '', golden_glove: '', golden_ball: '', dark_horse: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const steps = ['Name', 'Groups', '3rd Place', 'Knockouts', 'Champion & Bonuses']

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      const { error: err } = await supabase.from('entries').insert({
        name: name.trim(),
        group_picks: groupPicks,
        third_place_picks: thirdPicks,
        knockout_picks: { ...knockoutPicks, Final: champion },
        champion,
        golden_boot: bonuses.golden_boot,
        golden_glove: bonuses.golden_glove,
        golden_ball: bonuses.golden_ball,
        dark_horse: bonuses.dark_horse,
      })
      if (err) throw err
      setDone(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) return <SuccessScreen name={name} />

  return (
    <div className="pt-8 max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="font-display text-5xl text-lime tracking-widest">ENTER YOUR PICKS</h1>
        <p className="text-muted font-mono text-sm mt-1">Deadline: June 11, 2026 before kickoff</p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'bg-lime' : 'bg-grass'}`} />
        ))}
      </div>
      <div className="text-center text-muted font-mono text-xs uppercase tracking-widest">
        Step {step + 1} of {steps.length} — {steps[step]}
      </div>

      {/* Step 0: Name */}
      {step === 0 && (
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
          <NavButtons step={step} setStep={setStep} canNext={name.trim().length > 1} />
        </div>
      )}

      {/* Step 1: Group Picks */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-muted font-mono">Pick 1st and 2nd place for each group</p>
          {Object.entries(GROUPS).map(([group, teams]) => {
            const picked = groupPicks[group] || {}
            return (
              <div key={group} className="bg-grass/20 border border-grass rounded-xl p-4">
                <div className="font-display text-xl text-lime mb-3">Group {group}</div>
                <div className="grid grid-cols-2 gap-3">
                  {['first', 'second'].map((pos) => (
                    <div key={pos}>
                      <div className="text-xs text-muted font-mono mb-1 uppercase">{pos === 'first' ? '🥇 1st (2 pts)' : '🥈 2nd (1 pt)'}</div>
                      <select
                        value={picked[pos] || ''}
                        onChange={(e) => setGroupPicks((p) => ({ ...p, [group]: { ...p[group], [pos]: e.target.value } }))}
                        className="w-full bg-pitch border border-grass rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime"
                      >
                        <option value="">— Select —</option>
                        {teams.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          <NavButtons
            step={step} setStep={setStep}
            canNext={Object.keys(groupPicks).length === 12 && Object.values(groupPicks).every(g => g.first && g.second)}
          />
        </div>
      )}

      {/* Step 2: 3rd Place qualifiers */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-muted font-mono">Pick 8 third-place teams that advance to Round of 32 (1 pt each)</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(GROUPS).map(([group, teams]) => {
              const firstTwo = [groupPicks[group]?.first, groupPicks[group]?.second].filter(Boolean)
              const thirdTeam = teams.find((t) => !firstTwo.includes(t))
              const options = teams.filter((t) => !firstTwo.includes(t))
              return options.map((team) => {
                const checked = thirdPicks.includes(team)
                return (
                  <label key={team} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked ? 'border-lime bg-lime/10' : 'border-grass bg-grass/10 hover:border-muted'}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) setThirdPicks((p) => p.filter((x) => x !== team))
                        else if (thirdPicks.length < 8) setThirdPicks((p) => [...p, team])
                      }}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${checked ? 'bg-lime border-lime text-pitch' : 'border-muted'}`}>
                      {checked && '✓'}
                    </div>
                    <span className="text-sm flex-1">{team}</span>
                    <span className="text-xs text-muted font-mono">Grp {group}</span>
                  </label>
                )
              })
            })}
          </div>
          <div className={`text-center font-mono text-sm ${thirdPicks.length === 8 ? 'text-lime' : 'text-muted'}`}>
            {thirdPicks.length}/8 selected
          </div>
          <NavButtons step={step} setStep={setStep} canNext={thirdPicks.length === 8} />
        </div>
      )}

      {/* Step 3: Knockout picks */}
      {step === 3 && (
        <div className="space-y-6">
          {ROUNDS_META.map(({ key, label, picks, hint }) => (
            <div key={key} className="bg-grass/20 border border-grass rounded-xl p-4 space-y-3">
              <div>
                <div className="font-display text-xl text-lime">{label}</div>
                <div className="text-xs text-muted font-mono">{hint} ({knockoutPicks[key].length}/{picks})</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_TEAMS.map((team) => {
                  const checked = knockoutPicks[key].includes(team)
                  return (
                    <label key={team} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-all ${checked ? 'border-lime bg-lime/10 text-lime font-medium' : 'border-grass/50 hover:border-muted'}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (checked) setKnockoutPicks((p) => ({ ...p, [key]: p[key].filter((x) => x !== team) }))
                          else if (knockoutPicks[key].length < picks) setKnockoutPicks((p) => ({ ...p, [key]: [...p[key], team] }))
                        }}
                        className="hidden"
                      />
                      {team}
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
          <NavButtons
            step={step} setStep={setStep}
            canNext={ROUNDS_META.every(({ key, picks }) => knockoutPicks[key].length === picks)}
          />
        </div>
      )}

      {/* Step 4: Champion & Bonuses */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-grass/20 border border-grass rounded-xl p-4 space-y-3">
            <div className="font-display text-xl text-lime">🏆 Champion (8 pts)</div>
            <select value={champion} onChange={(e) => setChampion(e.target.value)}
              className="w-full bg-pitch border border-grass rounded-xl px-4 py-3 focus:outline-none focus:border-lime">
              <option value="">— Pick your winner —</option>
              {ALL_TEAMS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          {[
            { key: 'golden_boot', label: '🥇 Golden Boot — Top Scorer', pts: 3 },
            { key: 'golden_glove', label: '🧤 Golden Glove — Best Keeper', pts: 3 },
            { key: 'golden_ball', label: '⭐ Golden Ball — Best Player', pts: 3 },
            { key: 'dark_horse', label: '🐴 Dark Horse — Lowest ranked team in QF+', pts: 3 },
          ].map(({ key, label, pts }) => (
            <div key={key} className="bg-grass/20 border border-grass rounded-xl p-4 space-y-2">
              <div className="font-display text-lg text-lime">{label} <span className="text-muted text-sm">({pts} pts)</span></div>
              <input
                type="text"
                value={bonuses[key]}
                onChange={(e) => setBonuses((b) => ({ ...b, [key]: e.target.value }))}
                placeholder={key === 'dark_horse' ? 'Team name...' : 'Player name...'}
                className="w-full bg-pitch border border-grass rounded-xl px-4 py-3 focus:outline-none focus:border-lime"
              />
            </div>
          ))}

          {error && <div className="text-red-400 text-sm font-mono bg-red-900/20 border border-red-800 rounded-xl p-3">{error}</div>}

          <div className="flex gap-3">
            <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 border border-grass rounded-xl text-muted hover:text-lime hover:border-lime transition-colors">Back</button>
            <button
              onClick={handleSubmit}
              disabled={!champion || submitting}
              className="flex-1 py-3 bg-lime text-pitch font-bold rounded-xl hover:bg-lime/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? 'Submitting...' : '🚀 Submit Picks'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function NavButtons({ step, setStep, canNext }) {
  return (
    <div className="flex gap-3 pt-2">
      {step > 0 && (
        <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 border border-grass rounded-xl text-muted hover:text-lime hover:border-lime transition-colors">
          ← Back
        </button>
      )}
      <button
        onClick={() => setStep(s => s + 1)}
        disabled={!canNext}
        className="flex-1 py-3 bg-lime text-pitch font-bold rounded-xl hover:bg-lime/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Next →
      </button>
    </div>
  )
}

function SuccessScreen({ name }) {
  return (
    <div className="pt-20 text-center space-y-6">
      <div className="text-8xl animate-bounce">🏆</div>
      <div>
        <h2 className="font-display text-5xl text-lime tracking-widest">YOU'RE IN!</h2>
        <p className="text-muted mt-2">Good luck <span className="text-lime font-semibold">{name}</span> — check the leaderboard after matches.</p>
      </div>
      <a href="/" className="inline-block bg-lime text-pitch font-bold px-8 py-3 rounded-xl hover:bg-lime/90 transition">
        View Leaderboard →
      </a>
    </div>
  )
}
