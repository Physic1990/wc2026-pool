import { useEffect, useState } from 'react'
import { isLocked, timeUntilDeadline, formatDeadline } from '../lib/deadline.js'

/**
 * Sticky status banner: live countdown before lock, "LOCKED" badge after.
 * Variant controls size — 'compact' for navbar/dashboard, 'large' for landing.
 */
export default function DeadlineBanner({ variant = 'compact' }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const locked = isLocked()
  const t = timeUntilDeadline()

  if (variant === 'large') {
    return (
      <div className={`rounded-2xl border p-5 text-center
        ${locked ? 'bg-grass/30 border-grass' : 'bg-lime/10 border-lime/40'}`}>
        {locked ? (
          <>
            <div className="text-4xl mb-1">🔒</div>
            <div className="font-display text-2xl text-lime tracking-widest">PICKS LOCKED</div>
            <div className="text-xs font-mono text-muted mt-1">
              Tournament started {formatDeadline()}
            </div>
          </>
        ) : (
          <>
            <div className="text-xs font-mono text-muted uppercase tracking-widest">Picks lock in</div>
            <div className="font-display text-3xl text-lime mt-1 tracking-widest">
              {t.days}d {t.hours}h {t.minutes}m
            </div>
            <div className="text-xs font-mono text-muted mt-1">{formatDeadline()}</div>
          </>
        )}
      </div>
    )
  }

  // compact
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono
      ${locked ? 'bg-grass/50 text-muted border border-grass' : 'bg-lime/10 text-lime border border-lime/40'}`}>
      {locked ? (
        <>🔒 Picks locked</>
      ) : (
        <>⏱ Lock in {t.days}d {t.hours}h {t.minutes}m</>
      )}
    </div>
  )
}
