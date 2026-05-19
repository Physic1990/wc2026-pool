import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { joinLeagueByCode } from '../lib/leagues.js'

export default function LeagueJoin() {
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const leagueId = await joinLeagueByCode(code)
      navigate(`/leagues/${leagueId}`)
    } catch (e) {
      setError(e.message || 'Could not join league')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pt-12 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">🎟️</div>
        <h1 className="font-display text-4xl text-lime tracking-widest">JOIN LEAGUE</h1>
        <p className="text-muted font-mono text-sm mt-1">Enter the invite code a friend shared</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-grass/20 border border-grass rounded-2xl p-6 space-y-4"
      >
        <label className="block">
          <span className="text-xs text-muted font-mono uppercase tracking-wider">Invite Code</span>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder="e.g. ABCD2345"
            autoFocus
            maxLength={12}
            className="mt-1 w-full bg-pitch border border-grass rounded-lg px-3 py-3 text-center font-mono text-2xl tracking-widest focus:outline-none focus:border-lime"
          />
        </label>

        {error && (
          <div className="text-sm font-mono p-3 rounded-lg bg-grass/40 border border-grass" style={{ color: '#fca5a5' }}>
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            to="/"
            className="flex-1 py-3 text-center border border-grass rounded-xl text-muted hover:text-lime hover:border-lime"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || code.length < 4}
            className="flex-1 py-3 bg-lime text-pitch font-bold rounded-xl hover:bg-lime/90 disabled:opacity-40 transition-all"
          >
            {submitting ? 'Joining...' : 'Join League'}
          </button>
        </div>
      </form>
    </div>
  )
}
