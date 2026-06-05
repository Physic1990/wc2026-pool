import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export default function HowItWorks() {
  const { user } = useAuth()
  return (
    <div className="pt-8 max-w-3xl mx-auto space-y-10 pb-8">
      {/* Hero */}
      <header className="text-center space-y-2">
        <div className="text-6xl">⚽</div>
        <h1 className="font-display text-5xl text-lime tracking-widest">HOW IT WORKS</h1>
        <p className="text-muted font-mono text-sm">
          A private World Cup 2026 prediction pool for you and your friends.
        </p>
      </header>

      {/* Quick flow */}
      <Section title="The Flow (in 4 steps)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { n: 1, title: 'Sign up',           body: 'Create an account with your email and password.' },
            { n: 2, title: 'Fill your bracket', body: 'Pick group standings, knockout winners, and bonus awards — one bracket per user.' },
            { n: 3, title: 'Create or join a league', body: 'Generate an invite code or enter someone else\'s. Only people with the code can join.' },
            { n: 4, title: 'Watch it score itself', body: 'After the tournament starts, scores update as real results come in. Highest points wins each league.' },
          ].map(({ n, title, body }) => (
            <div key={n} className="bg-grass/20 border border-grass rounded-xl p-4">
              <div className="flex items-baseline gap-3">
                <div className="font-display text-3xl text-lime">{n}</div>
                <div>
                  <div className="font-bold text-lime">{title}</div>
                  <div className="text-sm text-muted mt-1">{body}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Scoring */}
      <Section title="Scoring (max 130 points)">
        <div className="space-y-4">
          <SubTable
            title="Group stage — 12 groups"
            rows={[
              ['Correct 1st place',                  '2 pts'],
              ['Correct 2nd place',                  '1 pt'],
              ['Both 1st AND 2nd correct (bonus)',   '+1 pt'],
              ['Correct 3rd-place qualifier (advances to R32)', '1 pt each, max 8'],
            ]}
          />
          <SubTable
            title="Knockouts — per match"
            rows={[
              ['Round of 32 winner',  '1 pt × 16 matches  = 16 pts'],
              ['Round of 16 winner',  '2 pts × 8 matches  = 16 pts'],
              ['Quarterfinal winner', '3 pts × 4 matches  = 12 pts'],
              ['Semifinal winner',    '5 pts × 2 matches  = 10 pts'],
              ['Champion',            '14 pts × 1 match   = 14 pts'],
            ]}
          />
          <SubTable
            title="Bonus awards — 3 pts each"
            rows={[
              ['Golden Boot',  'Top scorer of the tournament'],
              ['Golden Glove', 'Best goalkeeper'],
              ['Golden Ball',  'Best player'],
              ['Dark Horse',   'Lowest-ranked team in QF+'],
            ]}
          />
        </div>
      </Section>

      {/* Deadline / privacy */}
      <Section title="Deadline & Privacy">
        <Bullet>
          <strong>Edit any time before kickoff.</strong> You can change your picks as many times as you want right up to the first match. After that, picks are frozen.
        </Bullet>
        <Bullet>
          <strong>Brackets stay private until the pool locks.</strong> Before the first kickoff, no one else can see your picks — not even your league mates. After lock, everyone can compare brackets.
        </Bullet>
        <Bullet>
          <strong>Invite-only leagues.</strong> Leagues can't be joined without the invite code the creator shares.
        </Bullet>
      </Section>

      {/* 3rd-place explainer (from user's spec) */}
      <Section title="How the 3rd-Place Qualifiers Work">
        <p className="text-muted text-sm">
          The 2026 World Cup expands to 12 groups of 4 teams (48 total). The knockout stage features 32 teams:
        </p>
        <Bullet>
          <strong>24 teams automatically</strong> — the group winners (1st) and runners-up (2nd) from each of the 12 groups.
        </Bullet>
        <Bullet>
          <strong>8 of the 12 third-placed teams</strong> advance based on FIFA's official tie-breaker criteria.
        </Bullet>

        <h3 className="font-display text-xl text-lime mt-6">How the 12 third-placed teams are ranked</h3>
        <ol className="list-decimal list-outside ml-5 space-y-1.5 text-sm">
          <li><strong>Points</strong> — wins (3), draws (1), losses (0).</li>
          <li><strong>Goal Difference</strong> — goals scored minus goals conceded.</li>
          <li><strong>Goals Scored</strong> — more goals scored ranks higher.</li>
          <li>
            <strong>Fair Play</strong> — fewer card deductions:
            <span className="block text-xs text-muted font-mono ml-2 mt-1">
              Yellow –1 · Indirect red (2 yellows) –3 · Direct red –4 · Yellow + red –5
            </span>
          </li>
          <li><strong>FIFA World Ranking</strong> — most recent.</li>
          <li><strong>Older FIFA Rankings</strong> — checked in reverse order.</li>
          <li><strong>Drawing of lots</strong> — only if all above tie (never happened in practice).</li>
        </ol>

        <h3 className="font-display text-xl text-lime mt-6">Practical thresholds for advancing</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {[
            ['4+ points (e.g. 1W 1D 1L)', 'Almost guaranteed'],
            ['3 points',                   '~90% if GD ≥ 0'],
            ['2 points',                   'Risky (40–60%)'],
            ['0–1 points',                 'Extremely unlikely (<15%)'],
          ].map(([k, v]) => (
            <div key={k} className="bg-grass/20 border border-grass rounded-lg px-3 py-2 flex justify-between">
              <span>{k}</span>
              <span className="text-lime font-mono text-xs">{v}</span>
            </div>
          ))}
        </div>

        <h3 className="font-display text-xl text-lime mt-6">How it shows up in your bracket</h3>
        <p className="text-muted text-sm">
          When you fill in groups, you pick 1st, 2nd, <em>and</em> 3rd for each of the 12 groups (4th is implied — they're eliminated). Then in the Round of 32 step, you'll see 8 slots that need a 3rd-place team. Each slot tells you which groups its qualifier can come from (per FIFA's pre-published table), and you click one of <em>your</em> third-placed teams to fill it. The 4 third-placed teams you don't assign are the ones your bracket says didn't advance.
        </p>
      </Section>

      {/* CTA */}
      <div className="bg-grass/20 border border-lime/40 rounded-2xl p-6 text-center space-y-3">
        <div className="text-3xl">🏆</div>
        <h2 className="font-display text-2xl text-lime tracking-widest">Ready to play?</h2>
        {user ? (
          <Link to="/" className="inline-block px-6 py-3 bg-lime text-pitch font-bold rounded-xl">
            Go to Dashboard →
          </Link>
        ) : (
          <div className="flex gap-3 justify-center">
            <Link to="/sign-up" className="px-6 py-3 bg-lime text-pitch font-bold rounded-xl">Sign Up</Link>
            <Link to="/sign-in" className="px-6 py-3 border-2 border-lime text-lime font-bold rounded-xl">Sign In</Link>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-3xl text-lime tracking-wider border-b border-grass pb-2">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function SubTable({ title, rows }) {
  return (
    <div className="bg-grass/20 border border-grass rounded-xl overflow-hidden">
      <div className="bg-grass/40 px-4 py-2 font-display text-lg text-lime">{title}</div>
      <div className="divide-y divide-grass">
        {rows.map(([k, v], i) => (
          <div key={i} className="px-4 py-2 flex justify-between gap-3 text-sm">
            <span>{k}</span>
            <span className="text-lime font-mono text-right">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Bullet({ children }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-lime mt-0.5">▸</span>
      <p>{children}</p>
    </div>
  )
}
