import { supabase } from '../supabase.js'

// Readable invite codes — omit easily-confused chars (0/O, 1/I, etc.)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateInviteCode(length = 8) {
  let s = ''
  const buf = new Uint32Array(length)
  crypto.getRandomValues(buf)
  for (let i = 0; i < length; i++) {
    s += CODE_CHARS[buf[i] % CODE_CHARS.length]
  }
  return s
}

/**
 * Create a league. Retries on the (extremely unlikely) chance of a code
 * collision. Returns the new row.
 */
export async function createLeague(name, userId) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const invite_code = generateInviteCode()
    const { data, error } = await supabase
      .from('leagues')
      .insert({ name: name.trim(), invite_code, created_by: userId })
      .select()
      .single()
    if (!error) return data
    // 23505 = unique violation; only retry on that
    if (error.code !== '23505') throw error
  }
  throw new Error('Could not generate a unique invite code')
}

/** Look up a league by invite code AND insert caller as a member. */
export async function joinLeagueByCode(code) {
  const { data, error } = await supabase.rpc('join_league', {
    p_code: code.trim().toUpperCase(),
  })
  if (error) throw error
  return data // league_id (uuid)
}

/** Return all leagues the current user is a member of. */
export async function listMyLeagues(userId) {
  // Two-step: get league IDs from league_members, then leagues row.
  const { data: memberships, error: e1 } = await supabase
    .from('league_members')
    .select('league_id, joined_at')
    .eq('user_id', userId)
  if (e1) throw e1
  if (!memberships?.length) return []

  const ids = memberships.map((m) => m.league_id)
  const { data: leagues, error: e2 } = await supabase
    .from('leagues')
    .select('*')
    .in('id', ids)
  if (e2) throw e2

  return leagues.map((l) => ({
    ...l,
    joined_at: memberships.find((m) => m.league_id === l.id)?.joined_at,
  }))
}

/** Fetch a single league by id. */
export async function getLeague(leagueId) {
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .eq('id', leagueId)
    .single()
  if (error) throw error
  return data
}

/** Fetch members of a league with their entries (for the leaderboard). */
export async function getLeagueMembersWithEntries(leagueId) {
  const { data: members, error: e1 } = await supabase
    .from('league_members')
    .select('user_id, joined_at')
    .eq('league_id', leagueId)
  if (e1) throw e1
  if (!members?.length) return []

  const userIds = members.map((m) => m.user_id)
  const { data: entries, error: e2 } = await supabase
    .from('entries')
    .select('*')
    .in('user_id', userIds)
  if (e2) throw e2

  return members.map((m) => ({
    user_id: m.user_id,
    joined_at: m.joined_at,
    entry: entries.find((e) => e.user_id === m.user_id) || null,
  }))
}
