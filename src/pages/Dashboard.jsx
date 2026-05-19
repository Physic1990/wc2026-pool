import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { listMyLeagues } from '../lib/leagues.js'
import { supabase } from '../supabase.js'

export default function Dashboard() {
  const { user } = useAuth()
  const [leagues, setLeagues] = useState([])
  const [hasEntry, setHasEntry] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const [ls, { data: entry }] = await Promise.all([
          listMyLeagues(user.id),
          supabase.from('entries').select('user_id, name').eq('user_id', user.id).maybeSingle(),
        ])
        setLeagues(ls)
        setHasEntry(!!entry)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="pt-20 text-center">
        <div className="text-5xl animate-bounce">⚽</div>
      </div>
    )
  }

  return (
    <div className="pt-8 max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="font-display text-5xl text-lime tracking-widest">YOUR DASHBOARD</h1>
        <p className="text-muted font-mono text-sm mt-1">Signed in as {user?.email}</p>
      </div>

      {/* Bracket card */}
      <Section title={hasEntry ? '✅ Your Bracket' : '⚠️ Fill Out Your Bracket'}>
        <div className="bg-grass/20 border border-grass rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <div className="font-display text-xl text-lime">
              {hasEntry ? 'Bracket Submitted' : 'No Bracket Yet'}
            </div>
            <div className="text-sm text-muted mt-1">
              {hasEntry
                ? 'You can edit your picks any time before tournament kickoff.'
                : 'Submit your picks to compete in your leagues.'}
            </div>
          </div>
          <Link
            to="/enter"
            className="px-4 py-2 bg-lime text-pitch font-bold rounded-lg hover:bg-lime/90 whitespace-nowrap"
          >
            {hasEntry ? 'Edit Picks' : 'Fill Out Bracket →'}
          </Link>
        </div>
      </Section>

      {/* Leagues */}
      <Section title="🏆 Your Leagues">
        {error && (
          <div className="text-sm font-mono p-3 rounded-lg bg-grass/40 border border-grass" style={{ color: '#fca5a5' }}>
            {error}
          </div>
        )}

        {leagues.length === 0 ? (
          <div className="bg-grass/20 border border-dashed border-grass rounded-xl p-8 text-center space-y-3">
            <div className="text-4xl">🌱</div>
            <p className="text-muted font-mono text-sm">
              You're not in any leagues yet. Create one and share the code with friends, or join one with a code.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {leagues.map((l) => (
              <Link
                key={l.id}
                to={`/leagues/${l.id}`}
                className="block bg-grass/20 border border-grass rounded-xl p-4 hover:border-lime transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-display text-xl text-lime">{l.name}</div>
                    <div className="text-xs font-mono text-muted mt-1">
                      Invite code: <span className="text-lime tracking-widest">{l.invite_code}</span>
                    </div>
                  </div>
                  <span className="text-muted text-sm">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            to="/leagues/new"
            className="flex-1 py-3 text-center bg-lime text-pitch font-bold rounded-xl hover:bg-lime/90"
          >
            + Create League
          </Link>
          <Link
            to="/leagues/join"
            className="flex-1 py-3 text-center border-2 border-grass text-lime font-bold rounded-xl hover:border-lime"
          >
            Join with Code
          </Link>
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl text-lime tracking-wider border-b border-grass pb-2">{title}</h2>
      {children}
    </div>
  )
}
