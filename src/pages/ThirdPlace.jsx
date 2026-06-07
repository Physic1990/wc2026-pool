/**
 * /thirdplace — Admin reference page
 * Shows which R32 slots each 3rd-place group team can qualify into.
 * Based on FIFA WC 2026 official rules for 3rd-place team advancement.
 */
import { GROUPS, R32_MATCHES } from '../data/teams.js'
import { flagFor } from '../data/flags.js'

// Official FIFA rules: which eligible groups feed which R32 slot
// Each R32 match with a 3rd-place slot lists its eligible groups
const THIRD_PLACE_SLOTS = R32_MATCHES.filter(m => m.b?.kind === 'third')

// For a given set of advancing 3rd-place groups, which slot do they go to?
// Source: FIFA WC 2026 official regulations
const ADVANCEMENT_SCENARIOS = [
  { groups: ['A','B','C','D'], slots: [74, 77, 79, 80, 81, 82, 85, 87] },
]

// Which groups can qualify into which slots
function getEligibleSlots(group) {
  return THIRD_PLACE_SLOTS.filter(m =>
    m.b?.eligibleGroups?.includes(group)
  ).map(m => m.id)
}

// Group standings based on FIFA WC 2026 draw
const GROUP_INFO = {
  A: { teams: GROUPS.A, pot: 'Pot 1+2', host: '🇲🇽 Mexico/🇺🇸 USA' },
  B: { teams: GROUPS.B, pot: 'Pot 1+2', host: '🇺🇸 USA/🇨🇦 Canada' },
  C: { teams: GROUPS.C, pot: 'Pot 1+2', host: '🇺🇸 USA' },
  D: { teams: GROUPS.D, pot: 'Pot 1+2', host: '🇺🇸 USA' },
  E: { teams: GROUPS.E, pot: 'Pot 1+2', host: '🇺🇸 USA' },
  F: { teams: GROUPS.F, pot: 'Pot 1+2', host: '🇺🇸 USA' },
  G: { teams: GROUPS.G, pot: 'Pot 1+2', host: '🇺🇸 USA' },
  H: { teams: GROUPS.H, pot: 'Pot 1+2', host: '🇲🇽 Mexico/🇺🇸 USA' },
  I: { teams: GROUPS.I, pot: 'Pot 1+2', host: '🇺🇸 USA' },
  J: { teams: GROUPS.J, pot: 'Pot 1+2', host: '🇺🇸 USA' },
  K: { teams: GROUPS.K, pot: 'Pot 1+2', host: '🇺🇸 USA' },
  L: { teams: GROUPS.L, pot: 'Pot 1+2', host: '🇺🇸 USA' },
}

export default function ThirdPlace() {
  return (
    <div className="pt-8 max-w-5xl mx-auto space-y-8 pb-8">
      <div>
        <h1 className="font-display text-5xl tracking-widest mb-1" style={{ color: '#0d1f3d' }}>
          🥉 3RD PLACE TRACKER
        </h1>
        <p className="font-mono text-sm" style={{ color: '#5a7499' }}>
          Admin reference · 8 of 12 third-place teams advance to Round of 32
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-xl p-5 border" style={{ background: '#04091e', borderColor: '#0d1f3d' }}>
        <h2 className="font-display text-xl tracking-wider mb-3" style={{ color: '#f5c842' }}>How 3rd Place Works</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm font-mono" style={{ color: '#7a8fb0' }}>
          <div>
            <p className="mb-2">• <strong style={{ color: '#fff' }}>12 groups</strong>, each has a 3rd-place team</p>
            <p className="mb-2">• Only <strong style={{ color: '#f5c842' }}>8 of 12</strong> 3rd-place teams advance</p>
            <p className="mb-2">• The 4 with the worst record are eliminated</p>
            <p>• Rankings: Points → GD → GF → FIFA rank</p>
          </div>
          <div>
            <p className="mb-2">• Each R32 slot specifies which groups can fill it</p>
            <p className="mb-2">• The specific slot depends on <strong style={{ color: '#fff' }}>which 8 groups</strong> advance</p>
            <p className="mb-2">• FIFA uses a pre-defined table to assign slots</p>
            <p>• This is the hardest pick in your bracket!</p>
          </div>
        </div>
      </div>

      {/* R32 slots with eligible groups */}
      <div>
        <h2 className="font-display text-2xl tracking-wider mb-4" style={{ color: '#0d1f3d' }}>
          R32 Third-Place Slots
        </h2>
        <div className="space-y-3">
          {THIRD_PLACE_SLOTS.map(m => (
            <div key={m.id} className="rounded-xl border p-4" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-xs font-bold mb-2" style={{ color: '#0d1f3d' }}>
                    MATCH {m.id}
                    <span className="ml-2 font-normal" style={{ color: '#94a3b8' }}>
                      · {m.a.kind === 'winner' ? `Winner Group ${m.a.group}` : `Runner-up Group ${m.a.group}`} vs 3rd place
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.b.eligibleGroups.map(g => (
                      <span key={g}
                        className="rounded-lg px-3 py-1.5 text-sm font-bold"
                        style={{ background: '#04091e', color: '#f5c842' }}>
                        Group {g}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-xs font-mono" style={{ color: '#94a3b8' }}>
                    Eligible groups: {m.b.eligibleGroups.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Groups with 3rd place teams */}
      <div>
        <h2 className="font-display text-2xl tracking-wider mb-4" style={{ color: '#0d1f3d' }}>
          All Groups — 3rd Place Candidates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(GROUPS).map(([group, teams]) => {
            const eligibleSlots = getEligibleSlots(group)
            return (
              <div key={group} className="rounded-xl border overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
                <div className="px-4 py-2.5 flex items-center justify-between"
                     style={{ background: '#04091e' }}>
                  <div className="font-display text-lg tracking-wider" style={{ color: '#f5c842' }}>
                    Group {group}
                  </div>
                  <div className="text-xs font-mono" style={{ color: '#5a7499' }}>
                    {eligibleSlots.length} eligible R32 slot{eligibleSlots.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="p-3 space-y-2" style={{ background: '#fff' }}>
                  {teams.map((team, i) => (
                    <div key={team}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg border"
                      style={{
                        borderColor: i === 2 ? '#c41230' : '#f1f5f9',
                        background: i === 2 ? '#fff5f5' : '#f8fafc',
                      }}>
                      <span className="text-xl">{flagFor(team)}</span>
                      <span className="text-sm font-semibold flex-1" style={{ color: '#0d1f3d' }}>{team}</span>
                      {i === 2 && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                          style={{ background: '#c41230', color: '#fff' }}>
                          3rd pick
                        </span>
                      )}
                      {i === 3 && (
                        <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>eliminated</span>
                      )}
                    </div>
                  ))}
                  {eligibleSlots.length > 0 && (
                    <div className="text-xs font-mono pt-1" style={{ color: '#5a7499' }}>
                      Can go to: {eligibleSlots.map(id => `M${id}`).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
