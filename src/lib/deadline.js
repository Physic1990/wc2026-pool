// Pool deadline = first match kickoff.
// FIFA WC26 opens Thursday, 11 June 2026 — Mexico v South Africa at Mexico City Stadium.
// Local kickoff is around noon CDT (UTC-6), so 18:00 UTC.
// Override via .env: VITE_POOL_DEADLINE=2026-06-11T18:00:00Z
export const POOL_DEADLINE = new Date(
  import.meta.env.VITE_POOL_DEADLINE || '2026-06-11T18:00:00Z'
)

export function isLocked(now = new Date()) {
  return now >= POOL_DEADLINE
}

/** Returns { days, hours, minutes, seconds, totalMs } until the deadline, or null if passed. */
export function timeUntilDeadline(now = new Date()) {
  const ms = POOL_DEADLINE.getTime() - now.getTime()
  if (ms <= 0) return null
  return {
    totalMs: ms,
    days:    Math.floor(ms / 86_400_000),
    hours:   Math.floor((ms % 86_400_000) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000)  / 60_000),
    seconds: Math.floor((ms % 60_000)     / 1000),
  }
}

export function formatDeadline() {
  return POOL_DEADLINE.toLocaleString(undefined, {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
    hour:    'numeric',
    minute:  '2-digit',
    timeZoneName: 'short',
  })
}
