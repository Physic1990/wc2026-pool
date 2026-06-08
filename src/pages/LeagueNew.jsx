import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { createLeague } from '../lib/leagues.js'

export default function LeagueNew() {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(null) // newly created league
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const league = await createLeague(name, user.id)
      setCreated(league)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (created) {
    return (
      <div className="pt-8 max-w-md mx-auto space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-2">🏆</div>
          <h1 className="font-display text-4xl text-lime tracking-widest">LEAGUE CREATED!</h1>
        </div>

        <div className="bg-grass/20 border border-grass rounded-2xl p-6 space-y-4">
          <div>
            <div className="text-xs font-mono text-muted uppercase tracking-wider">League Name</div>
            <div className="font-display text-2xl text-lime mt-1">{created.name}</div>
          </div>

          <div>
            <div className="text-xs font-mono text-muted uppercase tracking-wider">Invite Code</div>
            <div className="flex items-center gap-3 mt-1">
              <div className="font-mono text-3xl text-lime tracking-widest bg-pitch border border-grass rounded-lg px-4 py-3 flex-1 text-center">
                {created.invite_code}
              </div>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(created.invite_code)}
                title="Copy"
                className="px-3 py-3 border border-grass rounded-lg text-muted hover:text-lime hover:border-lime"
              >
                📋
              </button>
            </div>
            <p className="text-xs text-muted font-mono mt-2">
              Share this code with friends. They'll enter it on the "Join with Code" page.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            to="/"
            className="flex-1 py-3 text-center border border-grass rounded-xl text-muted hover:text-lime hover:border-lime"
          >
            ← Dashboard
          </Link>
          <button
            onClick={() => navigate(`/leagues/${created.id}`)}
            className="flex-1 py-3 bg-lime text-pitch font-bold rounded-xl hover:bg-lime/90"
          >
            Go to League →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-12 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">🏆</div>
        <h1 className="font-display text-4xl text-lime tracking-widest">CREATE LEAGUE</h1>
        <p className="font-mono text-sm mt-1" style={{ color: '#5a7499' }}>Name your pool and we'll generate an invite code</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-6 space-y-4 border"
        style={{ background: '#fff', borderColor: '#e2e8f0' }}
      >
        <label className="block">
          <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: '#04091e' }}>League Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Office Pool 2026"
            autoFocus
            className="mt-1 w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-colors"
            style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0d1f3d' }}
            onFocus={e => e.target.style.borderColor = '#c41230'}
            onBlur={e => e.target.style.borderColor = '#cbd5e1'}
          />
        </label>

        {error && (
          <div className="text-sm font-mono p-3 rounded-lg" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}>
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            to="/"
            className="flex-1 py-3 text-center rounded-xl font-medium transition-colors"
            style={{ background: '#f1f5f9', color: '#475569', border: '1.5px solid #cbd5e1' }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || name.trim().length < 2}
            className="flex-1 py-3 font-bold rounded-xl disabled:opacity-40 transition-all"
            style={{ background: '#c41230', color: '#fff' }}
          >
            {submitting ? 'Creating...' : 'Create League'}
          </button>
        </div>
      </form>
    </div>
  )
}
