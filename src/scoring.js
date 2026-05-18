import { SCORING } from './data/teams.js'

export function calculateScore(entry, results) {
  let total = 0
  const breakdown = {}

  // --- Group Stage ---
  let groupTotal = 0
  if (results.groups && entry.group_picks) {
    Object.keys(results.groups).forEach((group) => {
      const actual = results.groups[group]   // { first: 'X', second: 'Y' }
      const picked = entry.group_picks[group] // { first: 'X', second: 'Y' }
      if (!actual || !picked) return

      let pts = 0
      if (picked.first === actual.first) pts += SCORING.group_first
      if (picked.second === actual.second) pts += SCORING.group_second
      if (picked.first === actual.first && picked.second === actual.second)
        pts += SCORING.group_perfect_bonus
      groupTotal += pts
    })
  }
  breakdown.groups = groupTotal
  total += groupTotal

  // --- Third Place Qualifiers ---
  let thirdTotal = 0
  if (results.third_qualifiers && entry.third_place_picks) {
    const actualThirds = results.third_qualifiers // array of 8 team names
    const pickedThirds = entry.third_place_picks  // array of 8 team names
    pickedThirds.forEach((team) => {
      if (actualThirds.includes(team)) thirdTotal += SCORING.third_place_advance
    })
  }
  breakdown.third = thirdTotal
  total += thirdTotal

  // --- Knockout Rounds ---
  const rounds = ['R32', 'R16', 'QF', 'SF']
  rounds.forEach((round) => {
    let roundPts = 0
    if (results[round] && entry.knockout_picks?.[round]) {
      const actualWinners = results[round]           // array of winning team names
      const pickedWinners = entry.knockout_picks[round] // array of picked team names
      pickedWinners.forEach((team) => {
        if (actualWinners.includes(team)) roundPts += SCORING[round]
      })
    }
    breakdown[round] = roundPts
    total += roundPts
  })

  // --- Champion ---
  let finalPts = 0
  if (results.champion && entry.knockout_picks?.Final) {
    if (entry.knockout_picks.Final === results.champion) finalPts = SCORING.Final
  }
  breakdown.Final = finalPts
  total += finalPts

  // --- Bonus Predictions ---
  const bonuses = ['golden_boot', 'golden_glove', 'golden_ball', 'dark_horse']
  let bonusTotal = 0
  bonuses.forEach((b) => {
    if (!results[b] || !entry[b]) return
    // Support split points (array of actual winners)
    if (Array.isArray(results[b])) {
      if (results[b].includes(entry[b])) {
        bonusTotal += SCORING[b] / results[b].length
      }
    } else {
      if (entry[b] === results[b]) bonusTotal += SCORING[b]
    }
  })
  breakdown.bonus = bonusTotal
  total += bonusTotal

  return { total: Math.round(total * 100) / 100, breakdown }
}
