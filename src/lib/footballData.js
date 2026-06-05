/**
 * football-data.org API integration for WC 2026
 * Fetches live match results and maps them to the app's results format.
 */

const API_KEY = import.meta.env.VITE_FOOTBALL_DATA_KEY
const BASE = 'https://api.football-data.org/v4'
const WC_CODE = 'WC'

// Map football-data.org team names → our app's team names
const TEAM_NAME_MAP = {
  'Mexico':                     'Mexico',
  'South Africa':               'South Africa',
  'Korea Republic':             'Korea Republic',
  'Czech Republic':             'Czechia',
  'Czechia':                    'Czechia',
  'Canada':                     'Canada',
  'Bosnia and Herzegovina':     'Bosnia and Herzegovina',
  'Qatar':                      'Qatar',
  'Switzerland':                'Switzerland',
  'Haiti':                      'Haiti',
  'Scotland':                   'Scotland',
  'Brazil':                     'Brazil',
  'Morocco':                    'Morocco',
  'United States':              'USA',
  'USA':                        'USA',
  'Paraguay':                   'Paraguay',
  'Australia':                  'Australia',
  'Turkey':                     'Türkiye',
  'Türkiye':                    'Türkiye',
  "Côte d'Ivoire":              "Côte d'Ivoire",
  'Ivory Coast':                "Côte d'Ivoire",
  'Ecuador':                    'Ecuador',
  'Germany':                    'Germany',
  'Curaçao':                    'Curaçao',
  'Netherlands':                'Netherlands',
  'Japan':                      'Japan',
  'Sweden':                     'Sweden',
  'Tunisia':                    'Tunisia',
  'IR Iran':                    'IR Iran',
  'Iran':                       'IR Iran',
  'New Zealand':                'New Zealand',
  'Belgium':                    'Belgium',
  'Egypt':                      'Egypt',
  'Saudi Arabia':               'Saudi Arabia',
  'Uruguay':                    'Uruguay',
  'Spain':                      'Spain',
  'Cabo Verde':                 'Cabo Verde',
  'Cape Verde':                 'Cabo Verde',
  'France':                     'France',
  'Senegal':                    'Senegal',
  'Iraq':                       'Iraq',
  'Norway':                     'Norway',
  'Argentina':                  'Argentina',
  'Algeria':                    'Algeria',
  'Austria':                    'Austria',
  'Jordan':                     'Jordan',
  'Portugal':                   'Portugal',
  'DR Congo':                   'Congo DR',
  'Congo DR':                   'Congo DR',
  'Uzbekistan':                 'Uzbekistan',
  'Colombia':                   'Colombia',
  'Ghana':                      'Ghana',
  'Panama':                     'Panama',
  'England':                    'England',
  'Croatia':                    'Croatia',
}

function mapTeam(name) {
  return TEAM_NAME_MAP[name] || name
}

async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Auth-Token': API_KEY },
  })
  // Respect rate limit headers
  const remaining = res.headers.get('X-Requests-Available-Minute')
  if (remaining && parseInt(remaining) < 3) {
    console.warn('football-data.org rate limit nearly reached')
  }
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

/**
 * Fetch all WC 2026 matches and return them in the app's results format.
 * Only includes completed (FINISHED) matches.
 */
export async function fetchLiveResults() {
  const data = await apiFetch(`/competitions/${WC_CODE}/matches?season=2026`)
  const matches = data.matches || []

  const groups = {}
  const knockout_picks = {}

  // Process each finished match
  for (const match of matches) {
    if (match.status !== 'FINISHED') continue

    const homeTeam = mapTeam(match.homeTeam.name)
    const awayTeam = mapTeam(match.awayTeam.name)
    const homeScore = match.score.fullTime.home
    const awayScore = match.score.fullTime.away

    const stage = match.stage // GROUP_STAGE, ROUND_OF_32, ROUND_OF_16, QUARTER_FINALS, SEMI_FINALS, FINAL
    const matchId = match.id

    if (stage === 'GROUP_STAGE') {
      // Group standings are fetched separately
    } else {
      // Knockout: record winner by match ID
      const winner = homeScore > awayScore ? homeTeam : awayTeam
      knockout_picks[matchId] = winner
    }
  }

  // Fetch group standings
  const standingsData = await apiFetch(`/competitions/${WC_CODE}/standings?season=2026`)
  const standings = standingsData.standings || []

  for (const standing of standings) {
    if (standing.type !== 'TOTAL') continue
    const group = standing.group?.replace('GROUP_', '') // "GROUP_A" → "A"
    if (!group) continue

    const table = standing.table || []
    const first  = mapTeam(table[0]?.team?.name || '')
    const second = mapTeam(table[1]?.team?.name || '')
    const third  = mapTeam(table[2]?.team?.name || '')

    if (first || second || third) {
      groups[group] = { first, second, third }
    }
  }

  return { groups, knockout_picks }
}

/**
 * Fetch top scorers for WC 2026.
 * Returns array of { name, team, goals } sorted by goals desc.
 */
export async function fetchTopScorers() {
  const data = await apiFetch(`/competitions/${WC_CODE}/scorers?season=2026&limit=20`)
  const scorers = data.scorers || []
  return scorers.map(s => ({
    name: s.player?.name || '',
    team: mapTeam(s.team?.name || ''),
    goals: s.goals || 0,
    assists: s.assists || 0,
  }))
}

/**
 * Fetch goal scorers for all finished matches.
 * Returns array of { matchId, homeTeam, awayTeam, score, goals: [{name, team, minute}] }
 */
export async function fetchMatchGoalScorers() {
  const data = await apiFetch(`/competitions/${WC_CODE}/matches?season=2026&status=FINISHED`)
  const matches = data.matches || []
  return matches.map(m => ({
    matchId: m.id,
    homeTeam: mapTeam(m.homeTeam.name),
    awayTeam: mapTeam(m.awayTeam.name),
    homeScore: m.score.fullTime.home,
    awayScore: m.score.fullTime.away,
    stage: m.stage,
    utcDate: m.utcDate,
    goals: (m.goals || []).map(g => ({
      name: g.scorer?.name || '',
      team: mapTeam(g.team?.name || ''),
      minute: g.minute,
      type: g.type, // NORMAL, OWN_GOAL, PENALTY
    })),
  }))
}
