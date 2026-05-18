import { useState, useEffect } from 'react'
import { supabase } from '../supabase.js'
import { GROUPS, ALL_TEAMS } from '../data/teams.js'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'wc2026admin'

const ROUND_CONFIG = [
  { key: 'R32', label: 'Round of 32', count: 16 },
  { key: 'R16', label: 'Round of 16', count: 8 },
  { key: 'QF', label: 'Quarterfinals', count: 4 },
  { key: 'SF', label: 'Semifinals', count: 2 },
]

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [results, setResults] = useState({
    groups: {},
    third_qualifiers: [],
    R32: [], R16: [], QF: [], SF: [],
    champion: '',
    golden_boot: '', golden_glove: '', golden_ball: '', dark_horse: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!authed) return
    async function load() {
      const { data } = await supabase.from('results').select('*').eq('id', 1).single()
      if (data?.data) setResults(data.data)
    }
    load()
  }, [authed])

  async function save() {
    setSaving(true)
    setSaved(false)
    await supabase.from('results').upsert({ id: 1, data: results })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!authed) {
    return (
      <div className="pt-20 max-w-sm mx-auto space-y-4">
        <h1 className="font-display text-4xl text-lime text-center tracking-widest">ADMIN</h1>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && pw === ADMIN_PASSWORD && setAuthed(true)}
          placeholder="Password"
          className="w-full bg-grass/20 border border-grass rounded-xl px-4 py-3 focus:outline-none focus:border-lime"
        />
        <button
          onClick={() => { if (pw === ADMIN_PASSWORD) setAuthed(true) else alert('Wrong password') }}
          className="w-full py-3 bg-lime text-pitch font-bold rounded-xl"
        >
          Enter Admin
        </button>
      </div>
    )
  }

  return (
    <div className="pt-8 max-w-3xl mx-auto space-y-6">
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
      <Section title="📋 Group Stage Results">
        <div className="grid sm:grid-cols-2 gap-4">
          {Object.entries(GROUPS).map(([group, teams]) => (
            <div key={group} className="bg-grass/20 border border-grass rounded-xl p-4 space-y-2">
              <div className="font-display text-lg text-lime">Group {group}</div>
              {['first', 'second'].map((pos) => (
                <div key={pos}>
                  <div className="text-xs text-muted font-mono mb-1">{pos === 'first' ? '1st Place' : '2nd Place'}</div>
                  <select
                    value={results.groups?.[group]?.[pos] || ''}
                    onChange={(e) => setResults((r) => ({ ...r, groups: { ...r.groups, [group]: { ...r.groups?.[group], [pos]: e.target.value } } }))}
                    className="w-full bg-pitch border border-grass rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime"
                  >
                    <option value="">— TBD —</option>
                    {teams.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>

      {/* 3rd Place Qualifiers */}
      <Section title="🐢 3rd Place Qualifiers (8 teams)">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(GROUPS).map(([group, teams]) =>
            teams.map((team) => {
              const checked = results.third_qualifiers?.includes(team)
              return (
                <label key={team} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-all ${checked ? 'border-lime bg-lime/10 text-lime' : 'border-grass/50 hover:border-muted'}`}>
                  <input type="checkbox" checked={!!checked} onChange={() => {
                    const curr = results.third_qualifiers || []
                    if (checked) setResults((r) => ({ ...r, third_qualifiers: curr.filter((x) => x !== team) }))
                    else if (curr.length < 8) setResults((r) => ({ ...r, third_qualifiers: [...curr, team] }))
                  }} className="hidden" />
                  <span>{team}</span>
                  <span className="text-xs text-muted ml-auto">G{group}</span>
                </label>
              )
            })
          )}
        </div>
        <div className="text-muted text-sm font-mono text-center">{(results.third_qualifiers || []).length}/8 selected</div>
      </Section>

      {/* Knockout Results */}
      {ROUND_CONFIG.map(({ key, label, count }) => (
        <Section key={key} title={`⚔️ ${label} — Winners (${count} teams)`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ALL_TEAMS.map((team) => {
              const checked = results[key]?.includes(team)
              return (
                <label key={team} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-all ${checked ? 'border-lime bg-lime/10 text-lime font-medium' : 'border-grass/50 hover:border-muted'}`}>
                  <input type="checkbox" checked={!!checked} onChange={() => {
                    const curr = results[key] || []
                    if (checked) setResults((r) => ({ ...r, [key]: curr.filter((x) => x !== team) }))
                    else if (curr.length < count) setResults((r) => ({ ...r, [key]: [...curr, team] }))
                  }} className="hidden" />
                  {team}
                </label>
              )
            })}
          </div>
          <div className="text-muted text-sm font-mono text-center">{(results[key] || []).length}/{count}</div>
        </Section>
      ))}

      {/* Champion */}
      <Section title="🏆 Champion">
        <select
          value={results.champion || ''}
          onChange={(e) => setResults((r) => ({ ...r, champion: e.target.value }))}
          className="w-full bg-pitch border border-grass rounded-xl px-4 py-3 focus:outline-none focus:border-lime"
        >
          <option value="">— TBD —</option>
          {ALL_TEAMS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </Section>

      {/* Bonus Awards */}
      <Section title="🎖️ Bonus Awards">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key: 'golden_boot', label: '🥇 Golden Boot' },
            { key: 'golden_glove', label: '🧤 Golden Glove' },
            { key: 'golden_ball', label: '⭐ Golden Ball' },
            { key: 'dark_horse', label: '🐴 Dark Horse Team' },
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

      {/* Save button bottom */}
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
