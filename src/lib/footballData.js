/**
 * football-data.org API integration for WC 2026
 * Fetches live match results and maps them to the app's results format.
 */

const WC_CODE = 'WC'

// Official WC 2026 venue data (API returns null for venue)
export const MATCH_VENUES = {
  // Group A
  537327: { stadium: 'Estadio Azteca',              city: 'Mexico City',      country: 'MEX' },
  537328: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537329: { stadium: 'AT&T Stadium',                city: 'Dallas',           country: 'USA' },
  537330: { stadium: "Levi's Stadium",              city: 'Santa Clara',      country: 'USA' },
  537331: { stadium: 'AT&T Stadium',                city: 'Dallas',           country: 'USA' },
  537332: { stadium: 'SoFi Stadium',                city: 'Los Angeles',      country: 'USA' },
  // Group B
  537333: { stadium: 'BC Place',                    city: 'Vancouver',        country: 'CAN' },
  537334: { stadium: 'Arrowhead Stadium',           city: 'Kansas City',      country: 'USA' },
  537335: { stadium: 'Hard Rock Stadium',           city: 'Miami',            country: 'USA' },
  537336: { stadium: 'BMO Field',                   city: 'Toronto',          country: 'CAN' },
  537337: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537338: { stadium: 'Lincoln Financial Field',     city: 'Philadelphia',     country: 'USA' },
  // Group C
  537339: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537340: { stadium: 'Mercedes-Benz Stadium',       city: 'Atlanta',          country: 'USA' },
  537341: { stadium: 'SoFi Stadium',                city: 'Los Angeles',      country: 'USA' },
  537342: { stadium: 'Gillette Stadium',            city: 'Foxborough',       country: 'USA' },
  537343: { stadium: 'AT&T Stadium',                city: 'Dallas',           country: 'USA' },
  537344: { stadium: 'Lincoln Financial Field',     city: 'Philadelphia',     country: 'USA' },
  // Group D
  537345: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537346: { stadium: 'SoFi Stadium',                city: 'Los Angeles',      country: 'USA' },
  537347: { stadium: 'Hard Rock Stadium',           city: 'Miami',            country: 'USA' },
  537348: { stadium: 'Arrowhead Stadium',           city: 'Kansas City',      country: 'USA' },
  537349: { stadium: 'AT&T Stadium',                city: 'Dallas',           country: 'USA' },
  537350: { stadium: 'Lincoln Financial Field',     city: 'Philadelphia',     country: 'USA' },
  // Group E
  537351: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537352: { stadium: 'Hard Rock Stadium',           city: 'Miami',            country: 'USA' },
  537353: { stadium: "Levi's Stadium",              city: 'Santa Clara',      country: 'USA' },
  537354: { stadium: 'Mercedes-Benz Stadium',       city: 'Atlanta',          country: 'USA' },
  537355: { stadium: 'Lumen Field',                 city: 'Seattle',          country: 'USA' },
  537356: { stadium: 'Gillette Stadium',            city: 'Foxborough',       country: 'USA' },
  // Group F
  537357: { stadium: 'AT&T Stadium',                city: 'Dallas',           country: 'USA' },
  537358: { stadium: 'SoFi Stadium',                city: 'Los Angeles',      country: 'USA' },
  537359: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537360: { stadium: 'Hard Rock Stadium',           city: 'Miami',            country: 'USA' },
  537361: { stadium: 'Arrowhead Stadium',           city: 'Kansas City',      country: 'USA' },
  537362: { stadium: "Levi's Stadium",              city: 'Santa Clara',      country: 'USA' },
  // Group G
  537363: { stadium: 'Lumen Field',                 city: 'Seattle',          country: 'USA' },
  537364: { stadium: 'Mercedes-Benz Stadium',       city: 'Atlanta',          country: 'USA' },
  537365: { stadium: 'SoFi Stadium',                city: 'Los Angeles',      country: 'USA' },
  537366: { stadium: 'BC Place',                    city: 'Vancouver',        country: 'CAN' },
  537367: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537368: { stadium: 'Lincoln Financial Field',     city: 'Philadelphia',     country: 'USA' },
  // Group H
  537369: { stadium: 'BC Place',                    city: 'Vancouver',        country: 'CAN' },
  537370: { stadium: 'Estadio BBVA',                city: 'Monterrey',        country: 'MEX' },
  537371: { stadium: 'AT&T Stadium',                city: 'Dallas',           country: 'USA' },
  537372: { stadium: 'Hard Rock Stadium',           city: 'Miami',            country: 'USA' },
  537373: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537374: { stadium: 'Gillette Stadium',            city: 'Foxborough',       country: 'USA' },
  // Group I
  537391: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537392: { stadium: 'Estadio Akron',               city: 'Guadalajara',      country: 'MEX' },
  537393: { stadium: 'SoFi Stadium',                city: 'Los Angeles',      country: 'USA' },
  537394: { stadium: 'AT&T Stadium',                city: 'Dallas',           country: 'USA' },
  537395: { stadium: 'Mercedes-Benz Stadium',       city: 'Atlanta',          country: 'USA' },
  537396: { stadium: 'Lumen Field',                 city: 'Seattle',          country: 'USA' },
  // Group J
  537397: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537398: { stadium: 'Hard Rock Stadium',           city: 'Miami',            country: 'USA' },
  537399: { stadium: 'Arrowhead Stadium',           city: 'Kansas City',      country: 'USA' },
  537400: { stadium: "Levi's Stadium",              city: 'Santa Clara',      country: 'USA' },
  537401: { stadium: 'Mercedes-Benz Stadium',       city: 'Atlanta',          country: 'USA' },
  537402: { stadium: 'BC Place',                    city: 'Vancouver',        country: 'CAN' },
  // Group K
  537403: { stadium: 'Arrowhead Stadium',           city: 'Kansas City',      country: 'USA' },
  537404: { stadium: 'Gillette Stadium',            city: 'Foxborough',       country: 'USA' },
  537405: { stadium: 'Lumen Field',                 city: 'Seattle',          country: 'USA' },
  537406: { stadium: 'AT&T Stadium',                city: 'Dallas',           country: 'USA' },
  537407: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537408: { stadium: 'SoFi Stadium',                city: 'Los Angeles',      country: 'USA' },
  // Group L
  537409: { stadium: 'Hard Rock Stadium',           city: 'Miami',            country: 'USA' },
  537410: { stadium: 'Lincoln Financial Field',     city: 'Philadelphia',     country: 'USA' },
  537411: { stadium: 'Lumen Field',                 city: 'Seattle',          country: 'USA' },
  537412: { stadium: 'BC Place',                    city: 'Vancouver',        country: 'CAN' },
  537413: { stadium: 'Arrowhead Stadium',           city: 'Kansas City',      country: 'USA' },
  537414: { stadium: 'Mercedes-Benz Stadium',       city: 'Atlanta',          country: 'USA' },
  // Round of 32
  537415: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537416: { stadium: 'AT&T Stadium',                city: 'Dallas',           country: 'USA' },
  537417: { stadium: 'SoFi Stadium',                city: 'Los Angeles',      country: 'USA' },
  537418: { stadium: 'Hard Rock Stadium',           city: 'Miami',            country: 'USA' },
  537419: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537420: { stadium: "Levi's Stadium",              city: 'Santa Clara',      country: 'USA' },
  537421: { stadium: 'Arrowhead Stadium',           city: 'Kansas City',      country: 'USA' },
  537422: { stadium: 'BC Place',                    city: 'Vancouver',        country: 'CAN' },
  537423: { stadium: 'Lincoln Financial Field',     city: 'Philadelphia',     country: 'USA' },
  537424: { stadium: 'AT&T Stadium',                city: 'Dallas',           country: 'USA' },
  537425: { stadium: 'Mercedes-Benz Stadium',       city: 'Atlanta',          country: 'USA' },
  537426: { stadium: 'Lumen Field',                 city: 'Seattle',          country: 'USA' },
  537427: { stadium: 'SoFi Stadium',                city: 'Los Angeles',      country: 'USA' },
  537428: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537429: { stadium: 'AT&T Stadium',                city: 'Dallas',           country: 'USA' },
  537430: { stadium: 'Hard Rock Stadium',           city: 'Miami',            country: 'USA' },
  // Round of 16
  537375: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537376: { stadium: 'AT&T Stadium',                city: 'Dallas',           country: 'USA' },
  537377: { stadium: 'SoFi Stadium',                city: 'Los Angeles',      country: 'USA' },
  537378: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537379: { stadium: 'AT&T Stadium',                city: 'Dallas',           country: 'USA' },
  537380: { stadium: 'SoFi Stadium',                city: 'Los Angeles',      country: 'USA' },
  537381: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537382: { stadium: 'AT&T Stadium',                city: 'Dallas',           country: 'USA' },
  // Quarter Finals
  537383: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537384: { stadium: 'AT&T Stadium',                city: 'Dallas',           country: 'USA' },
  537385: { stadium: 'SoFi Stadium',                city: 'Los Angeles',      country: 'USA' },
  537386: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  // Semi Finals
  537387: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
  537388: { stadium: 'AT&T Stadium',                city: 'Dallas',           country: 'USA' },
  // Third Place
  537389: { stadium: 'Hard Rock Stadium',           city: 'Miami',            country: 'USA' },
  // Final
  537390: { stadium: 'MetLife Stadium',             city: 'East Rutherford',  country: 'USA' },
}

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
  // Route through our Vercel serverless proxy to avoid CORS + keep API key server-side
  const [pathname, qs] = path.split('?')
  const params = new URLSearchParams(qs || '')
  params.set('path', pathname)
  const res = await fetch(`/api/football?${params.toString()}`)
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
 * Fetch ALL matches (finished + scheduled + live) for WC 2026.
 * Returns array of { matchId, homeTeam, awayTeam, homeScore, awayScore, status, stage, utcDate, goals }
 */
export async function fetchMatchGoalScorers() {
  const data = await apiFetch(`/competitions/${WC_CODE}/matches?season=2026`)
  const matches = data.matches || []
  return matches.map(m => ({
    matchId: m.id,
    homeTeam: mapTeam(m.homeTeam?.name || 'TBD'),
    awayTeam: mapTeam(m.awayTeam?.name || 'TBD'),
    homeScore: m.score?.fullTime?.home ?? null,
    awayScore: m.score?.fullTime?.away ?? null,
    status: m.status, // SCHEDULED, TIMED, IN_PLAY, PAUSED, FINISHED, SUSPENDED, POSTPONED
    stage: m.stage,
    matchday: m.matchday,
    utcDate: m.utcDate,
    venue: MATCH_VENUES[m.id] || null,
    goals: (m.goals || []).map(g => ({
      name: g.scorer?.name || '',
      team: mapTeam(g.team?.name || ''),
      minute: g.minute,
      type: g.type,
    })),
  }))
}


/**
 * Fetch all WC 2026 squads from football-data.org.
 * Returns array of { name, team, position } sorted by name.
 * Position codes: Goalkeeper, Defence, Midfield, Offence
 */
export async function fetchSquads() {
  const data = await apiFetch(`/competitions/${WC_CODE}/teams?season=2026`)
  const teams = data.teams || []
  const players = []
  for (const team of teams) {
    const teamName = mapTeam(team.name)
    for (const p of (team.squad || [])) {
      players.push({
        name: p.name,
        team: teamName,
        pos: p.position === 'Goalkeeper' ? 'GK' : 'F',
      })
    }
  }
  return players.sort((a, b) => a.name.localeCompare(b.name))
}
