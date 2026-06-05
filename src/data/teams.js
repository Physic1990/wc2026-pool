// Real FIFA World Cup 2026 group draw.
// Source: FIFA match schedule (https://www.fifa.com/.../canadamexicousa2026)
export const GROUPS = {
  A: ['Mexico', 'South Africa', 'Korea Republic', 'Czechia'],
  B: ['Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland'],
  C: ['Haiti', 'Scotland', 'Brazil', 'Morocco'],
  D: ['USA', 'Paraguay', 'Australia', 'Türkiye'],
  E: ["Côte d'Ivoire", 'Ecuador', 'Germany', 'Curaçao'],
  F: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  G: ['IR Iran', 'New Zealand', 'Belgium', 'Egypt'],
  H: ['Saudi Arabia', 'Uruguay', 'Spain', 'Cabo Verde'],
  I: ['France', 'Senegal', 'Iraq', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'Congo DR', 'Uzbekistan', 'Colombia'],
  L: ['Ghana', 'Panama', 'England', 'Croatia'],
}

export const GROUP_LABELS = Object.keys(GROUPS)
export const ALL_TEAMS = Object.values(GROUPS).flat()

// ---------------------------------------------------------------------------
// Bracket structure (matches FIFA's official WC26 schedule).
// Each R32 match has two slots. A slot is one of:
//   { kind: 'winner',   group: 'A' }     → 1st place of group A
//   { kind: 'runnerUp', group: 'A' }     → 2nd place of group A
//   { kind: 'third',    eligibleGroups: ['A','B','C','D','F'] }
//        → one of the 8 advancing 3rd-place teams; must come from one of these groups
// ---------------------------------------------------------------------------
export const R32_MATCHES = [
  { id: 73, a: { kind: 'runnerUp', group: 'A' }, b: { kind: 'runnerUp', group: 'B' } },
  { id: 74, a: { kind: 'winner',   group: 'E' }, b: { kind: 'third', eligibleGroups: ['A','B','C','D','F'] } },
  { id: 75, a: { kind: 'winner',   group: 'F' }, b: { kind: 'runnerUp', group: 'C' } },
  { id: 76, a: { kind: 'winner',   group: 'C' }, b: { kind: 'runnerUp', group: 'F' } },
  { id: 77, a: { kind: 'winner',   group: 'I' }, b: { kind: 'third', eligibleGroups: ['C','D','F','G','H'] } },
  { id: 78, a: { kind: 'runnerUp', group: 'E' }, b: { kind: 'runnerUp', group: 'I' } },
  { id: 79, a: { kind: 'winner',   group: 'A' }, b: { kind: 'third', eligibleGroups: ['C','E','F','H','I'] } },
  { id: 80, a: { kind: 'winner',   group: 'L' }, b: { kind: 'third', eligibleGroups: ['E','H','I','J','K'] } },
  { id: 81, a: { kind: 'winner',   group: 'D' }, b: { kind: 'third', eligibleGroups: ['B','E','F','I','J'] } },
  { id: 82, a: { kind: 'winner',   group: 'G' }, b: { kind: 'third', eligibleGroups: ['A','E','H','I','J'] } },
  { id: 83, a: { kind: 'runnerUp', group: 'K' }, b: { kind: 'runnerUp', group: 'L' } },
  { id: 84, a: { kind: 'winner',   group: 'H' }, b: { kind: 'runnerUp', group: 'J' } },
  { id: 85, a: { kind: 'winner',   group: 'B' }, b: { kind: 'third', eligibleGroups: ['E','F','G','I','J'] } },
  { id: 86, a: { kind: 'winner',   group: 'J' }, b: { kind: 'runnerUp', group: 'H' } },
  { id: 87, a: { kind: 'winner',   group: 'K' }, b: { kind: 'third', eligibleGroups: ['D','E','I','J','L'] } },
  { id: 88, a: { kind: 'runnerUp', group: 'D' }, b: { kind: 'runnerUp', group: 'G' } },
]

// R16 / QF / SF / Final: each match takes the winners of two earlier matches.
export const R16_MATCHES = [
  { id: 89, feeders: [74, 77] },
  { id: 90, feeders: [73, 75] },
  { id: 91, feeders: [76, 78] },
  { id: 92, feeders: [79, 80] },
  { id: 93, feeders: [83, 84] },
  { id: 94, feeders: [81, 82] },
  { id: 95, feeders: [86, 88] },
  { id: 96, feeders: [85, 87] },
]

export const QF_MATCHES = [
  { id: 97,  feeders: [89, 90] },
  { id: 98,  feeders: [93, 94] },
  { id: 99,  feeders: [91, 92] },
  { id: 100, feeders: [95, 96] },
]

export const SF_MATCHES = [
  { id: 101, feeders: [97, 98] },
  { id: 102, feeders: [99, 100] },
]

export const FINAL_MATCH = { id: 104, feeders: [101, 102] }

// Convenient flat lookup
export const ALL_KNOCKOUT_MATCHES = [
  ...R32_MATCHES.map(m => ({ ...m, round: 'R32' })),
  ...R16_MATCHES.map(m => ({ ...m, round: 'R16' })),
  ...QF_MATCHES.map(m  => ({ ...m, round: 'QF'  })),
  ...SF_MATCHES.map(m  => ({ ...m, round: 'SF'  })),
  { ...FINAL_MATCH, round: 'Final' },
]

// IDs of R32 matches whose B-slot is a 3rd-place team (the ones the user must fill in).
export const THIRD_PLACE_SLOTS = R32_MATCHES
  .filter(m => m.b.kind === 'third')
  .map(m => ({ matchId: m.id, eligibleGroups: m.b.eligibleGroups }))

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------
export const SCORING = {
  group_first: 2,
  group_second: 1,
  group_perfect_bonus: 1,
  third_place_advance: 1,   // per correctly-identified advancing 3rd-place team
  R32: 1,                    // per correct R32 match winner
  R16: 2,
  QF: 3,
  SF: 5,
  Final: 14,                 // = champion (14 pts, bigger reward for the winner)
  golden_boot: 3,
  golden_glove: 3,
  golden_ball: 3,
  dark_horse: 3,
}

// Theoretical max: 12*(2+1+1) + 8*1 + 16*1 + 8*2 + 4*3 + 2*5 + 14 + 4*3 = 136
export const MAX_POSSIBLE = 136

// ---------------------------------------------------------------------------
// Bracket helpers: given an entry (or a results object), figure out which two
// teams play each knockout match.
// ---------------------------------------------------------------------------

/** Get [teamA, teamB] for any knockout match given an entry-like picks object. */
export function teamsForMatch(matchId, picks) {
  const group_picks       = picks?.group_picks       || {}
  const third_place_picks = picks?.third_place_picks || {}
  const knockout_picks    = picks?.knockout_picks    || {}

  const r32 = R32_MATCHES.find(m => m.id === matchId)
  if (r32) {
    const resolve = (slot, matchId) => {
      if (slot.kind === 'winner')   return group_picks[slot.group]?.first  || null
      if (slot.kind === 'runnerUp') return group_picks[slot.group]?.second || null
      if (slot.kind === 'third')    return third_place_picks[matchId]      || null
      return null
    }
    return [resolve(r32.a, r32.id), resolve(r32.b, r32.id)]
  }

  const later = [...R16_MATCHES, ...QF_MATCHES, ...SF_MATCHES, FINAL_MATCH]
    .find(m => m.id === matchId)
  if (later) {
    return [
      knockout_picks[later.feeders[0]] || null,
      knockout_picks[later.feeders[1]] || null,
    ]
  }
  return [null, null]
}

/** Human-readable slot label, e.g. "Winner Group A", "Runner-up Group B", "3rd from C/D/F/G/H" */
export function slotLabel(slot) {
  if (slot.kind === 'winner')   return `Winner Group ${slot.group}`
  if (slot.kind === 'runnerUp') return `Runner-up Group ${slot.group}`
  if (slot.kind === 'third')    return `3rd from ${slot.eligibleGroups.join('/')}`
  return '?'
}
