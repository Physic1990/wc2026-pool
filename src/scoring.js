import {
  SCORING,
  GROUP_LABELS,
  R32_MATCHES,
  R16_MATCHES,
  QF_MATCHES,
  SF_MATCHES,
  FINAL_MATCH,
} from './data/teams.js'

/**
 * Score a single entry against actual results.
 *
 * Entry shape (bracket-driven format, stored in Supabase columns):
 * {
 *   name,
 *   group_picks:       { A: { first, second, third }, ... },
 *   third_place_picks: { 74: 'Team', 77: ..., 79, 80, 81, 82, 85, 87 },
 *   knockout_picks:    { 73: winnerTeam, 74, ..., 102, 104: champion },
 *   champion,
 *   golden_boot, golden_glove, golden_ball, dark_horse
 * }
 *
 * Results shape (admin-entered, stored in results.data jsonb):
 * {
 *   groups:            { A: { first, second, third }, ... },
 *   third_place_picks: { 74: 'Team', ... },
 *   knockout_picks:    { 73: 'winner', ... },
 *   golden_boot, golden_glove, golden_ball, dark_horse
 * }
 */
export function calculateScore(entry, results) {
  const breakdown = { groups: 0, third: 0, R32: 0, R16: 0, QF: 0, SF: 0, Final: 0, bonus: 0 }
  let total = 0

  // --- Groups: 1st (+2), 2nd (+1), perfect bonus (+1)
  const actualGroups = results?.groups || {}
  const pickedGroups = entry?.group_picks || {}
  GROUP_LABELS.forEach((g) => {
    const actual = actualGroups[g]
    const picked = pickedGroups[g]
    if (!actual || !picked) return
    let pts = 0
    if (picked.first  && picked.first  === actual.first)  pts += SCORING.group_first
    if (picked.second && picked.second === actual.second) pts += SCORING.group_second
    if (
      picked.first  && picked.first  === actual.first &&
      picked.second && picked.second === actual.second
    ) pts += SCORING.group_perfect_bonus
    breakdown.groups += pts
  })

  // --- Third-place advancers: +1 per team correctly identified as one of the 8 that advance
  // (regardless of which R32 slot the user put it in).
  const actualThirdTeams = new Set(
    Object.values(results?.third_place_picks || {}).filter(Boolean)
  )
  const pickedThirdTeams = new Set(
    Object.values(entry?.third_place_picks || {}).filter(Boolean)
  )
  pickedThirdTeams.forEach((t) => {
    if (actualThirdTeams.has(t)) breakdown.third += SCORING.third_place_advance
  })

  // --- Knockout matches: per-match scoring
  const actualBracket = results?.knockout_picks || {}
  const pickedBracket = entry?.knockout_picks  || {}
  const scoreMatches = (matches, roundKey) => {
    matches.forEach((m) => {
      const a = actualBracket[m.id]
      const p = pickedBracket[m.id]
      if (a && p && a === p) breakdown[roundKey] += SCORING[roundKey]
    })
  }
  scoreMatches(R32_MATCHES, 'R32')
  scoreMatches(R16_MATCHES, 'R16')
  scoreMatches(QF_MATCHES,  'QF')
  scoreMatches(SF_MATCHES,  'SF')
  // Final = champion (match 104)
  if (
    actualBracket[FINAL_MATCH.id] &&
    pickedBracket[FINAL_MATCH.id] &&
    actualBracket[FINAL_MATCH.id] === pickedBracket[FINAL_MATCH.id]
  ) {
    breakdown.Final += SCORING.Final
  }

  // --- Bonus awards
  const bonusKeys = ['golden_boot', 'golden_glove', 'golden_ball', 'dark_horse']
  bonusKeys.forEach((b) => {
    const a = results?.[b]
    const p = entry?.[b]
    if (!a || !p) return
    if (Array.isArray(a)) {
      if (a.includes(p)) breakdown.bonus += SCORING[b] / a.length
    } else if (a === p) {
      breakdown.bonus += SCORING[b]
    }
  })

  total =
    breakdown.groups + breakdown.third +
    breakdown.R32 + breakdown.R16 + breakdown.QF + breakdown.SF + breakdown.Final +
    breakdown.bonus

  return { total: Math.round(total * 100) / 100, breakdown }
}
