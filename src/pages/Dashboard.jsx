import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { listMyLeagues } from '../lib/leagues.js'
import { supabase } from '../supabase.js'
import { isLocked } from '../lib/deadline.js'
import DeadlineBanner from '../components/DeadlineBanner.jsx'
import { FIFA_RANKED_TEAMS } from './Enter.jsx'

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

  const locked = isLocked()

  return (
    <div className="pt-8 max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h1 className="font-display text-5xl text-lime tracking-widest">YOUR DASHBOARD</h1>
        <p className="text-muted font-mono text-sm">Signed in as {user?.email}</p>
        <DeadlineBanner variant="large" />
      </div>

      {/* Bracket card */}
      <Section title={hasEntry ? '✅ Your Bracket' : (locked ? '🔒 Pool Locked' : '⚠️ Fill Out Your Bracket')}>
        <div className="bg-grass/20 border border-grass rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <div className="font-display text-xl text-lime">
              {hasEntry ? 'Bracket Submitted' : 'No Bracket Yet'}
            </div>
            <div className="text-sm text-muted mt-1">
              {hasEntry
                ? (locked
                    ? 'Picks are locked — view your bracket and league standings.'
                    : 'You can edit your picks any time before tournament kickoff.')
                : (locked
                    ? 'The deadline has passed. No picks under your account.'
                    : 'Submit your picks to compete in your leagues.')}
            </div>
          </div>
          {hasEntry ? (
            <Link
              to={locked ? '/bracket/me' : '/enter'}
              className="px-4 py-2 bg-lime text-pitch font-bold rounded-lg hover:bg-lime/90 whitespace-nowrap"
            >
              {locked ? 'View Bracket →' : '✏️ Edit Picks'}
            </Link>
          ) : !locked ? (
            <Link
              to="/enter"
              className="px-4 py-2 bg-lime text-pitch font-bold rounded-lg hover:bg-lime/90 whitespace-nowrap"
            >
              Fill Out Bracket →
            </Link>
          ) : null}
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

      {/* FIFA Rankings */}
      <Section title="🌍 FIFA Rankings — WC 2026 Teams">
        <div className="bg-grass/10 border border-grass rounded-xl p-3 space-y-2">
          <p className="text-xs text-muted font-mono">Official FIFA Men's World Ranking · April 2026 · Used for 🐴 Dark Horse picks</p>
          <p className="text-xs text-muted font-mono">The <strong className="text-lime">🐴 Dark Horse bonus</strong> = pick the lowest-ranked team in QF+. If New Zealand (FIFA #86) somehow made the QF, anyone who picked them gets 3 pts!</p>
        </div>
        <FIFARankingsTable />
      </Section>
    </div>
  )
}

function FIFARankingsTable() {
  const [open, setOpen] = useState(false)
  const top10 = FIFA_RANKED_TEAMS.slice(0, 10)
  const rest  = FIFA_RANKED_TEAMS.slice(10)
  return (
    <div className="bg-grass/10 border border-grass rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-grass text-muted font-mono text-xs uppercase">
            <th className="text-left px-4 py-2">FIFA Rank</th>
            <th className="text-left px-4 py-2">Team</th>
            <th className="text-left px-4 py-2 hidden sm:table-cell">Confederation</th>
          </tr>
        </thead>
        <tbody>
          {top10.map((t, i) => (
            <RankRow key={t.name} t={t} i={i} />
          ))}
          {open && rest.map((t, i) => (
            <RankRow key={t.name} t={t} i={i + 10} />
          ))}
        </tbody>
      </table>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full py-2.5 text-xs font-mono text-muted hover:text-lime border-t border-grass transition-colors"
      >
        {open ? '▲ Show less' : `▼ Show all ${FIFA_RANKED_TEAMS.length} teams`}
      </button>
    </div>
  )
}

function RankRow({ t, i }) {
  const isDarkHorse = t.fifaRank >= 60
  return (
    <tr className={`border-b border-grass/30 ${isDarkHorse ? 'bg-yellow-900/10' : i % 2 === 0 ? '' : 'bg-grass/5'}`}>
      <td className="px-4 py-2 font-mono font-bold">
        <span className={isDarkHorse ? 'text-yellow-400' : 'text-lime'}>#{t.fifaRank}</span>
      </td>
      <td className="px-4 py-2 font-medium">
        {t.name}
        {isDarkHorse && <span className="ml-2 text-[10px] text-yellow-400 font-mono">🐴 dark horse</span>}
      </td>
      <td className="px-4 py-2 text-xs text-muted font-mono hidden sm:table-cell">
        {confed(t.name)}
      </td>
    </tr>
  )
}

function confed(name) {
  const UEFA = ['France','Spain','England','Portugal','Netherlands','Germany','Croatia','Belgium','Switzerland','Norway','Austria','Scotland','Sweden','Czechia','Bosnia and Herzegovina','Türkiye']
  const CONMEBOL = ['Argentina','Brazil','Colombia','Uruguay','Ecuador','Paraguay']
  const CAF = ['Morocco','Senegal','Egypt','Algeria',"Côte d'Ivoire",'Tunisia','South Africa','Ghana','Cabo Verde','Congo DR']
  const AFC = ['Japan','IR Iran','Korea Republic','Australia','Saudi Arabia','Qatar','Jordan','Uzbekistan','Iraq']
  const CONCACAF = ['USA','Mexico','Canada','Panama','Curaçao','Haiti']
  const OFC = ['New Zealand']
  if (UEFA.includes(name)) return 'UEFA'
  if (CONMEBOL.includes(name)) return 'CONMEBOL'
  if (CAF.includes(name)) return 'CAF'
  if (AFC.includes(name)) return 'AFC'
  if (CONCACAF.includes(name)) return 'CONCACAF'
  if (OFC.includes(name)) return 'OFC'
  return '—'
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl text-lime tracking-wider border-b border-grass pb-2">{title}</h2>
      {children}
    </div>
  )
}
