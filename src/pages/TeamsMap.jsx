import { flagFor } from '../data/flags.js'
import { FIFA_RANKED_TEAMS } from '../data/rankings.js'

const CONFEDERATIONS = [
  {
    name: 'UEFA',
    label: 'Europe',
    emoji: '🌍',
    color: '#1e40af',
    teams: ['France','Spain','England','Portugal','Netherlands','Germany','Croatia','Belgium',
            'Switzerland','Norway','Austria','Scotland','Sweden','Czechia','Türkiye',
            'Bosnia and Herzegovina'],
  },
  {
    name: 'CONMEBOL',
    label: 'South America',
    emoji: '🌎',
    color: '#15803d',
    teams: ['Argentina','Brazil','Colombia','Uruguay','Ecuador','Paraguay'],
  },
  {
    name: 'CAF',
    label: 'Africa',
    emoji: '🌍',
    color: '#b45309',
    teams: ['Morocco','Senegal','Egypt','Algeria',"Côte d'Ivoire",'Tunisia',
            'South Africa','Ghana','Cabo Verde','Congo DR'],
  },
  {
    name: 'AFC',
    label: 'Asia',
    emoji: '🌏',
    color: '#7c3aed',
    teams: ['Japan','IR Iran','Korea Republic','Australia','Saudi Arabia',
            'Qatar','Jordan','Uzbekistan','Iraq'],
  },
  {
    name: 'CONCACAF',
    label: 'N. & Central America',
    emoji: '🌎',
    color: '#c41230',
    teams: ['USA','Mexico','Canada','Panama','Curaçao','Haiti'],
  },
  {
    name: 'OFC',
    label: 'Oceania',
    emoji: '🌏',
    color: '#0891b2',
    teams: ['New Zealand'],
  },
]

function getFifaRank(name) {
  return FIFA_RANKED_TEAMS.find(t => t.name === name)?.fifaRank || '—'
}

export default function TeamsMap() {
  const total = CONFEDERATIONS.reduce((sum, c) => sum + c.teams.length, 0)

  return (
    <div className="pt-8 max-w-5xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-display text-5xl tracking-widest" style={{ color: '#0d1f3d' }}>
          🗺️ TEAMS MAP
        </h1>
        <p className="font-mono text-sm" style={{ color: '#5a7499' }}>
          {total} qualified teams across 6 confederations · FIFA World Cup 2026™
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {CONFEDERATIONS.map(c => (
          <div key={c.name}
            className="rounded-xl p-3 text-center text-white"
            style={{ background: c.color }}>
            <div className="text-lg">{c.emoji}</div>
            <div className="font-display text-xl">{c.teams.length}</div>
            <div className="text-[10px] font-mono opacity-80">{c.name}</div>
          </div>
        ))}
      </div>

      {/* World map placeholder with confederation colors */}
      <div className="rounded-2xl overflow-hidden border-2 relative"
           style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0ea5e9 100%)', borderColor: '#dde3f0', minHeight: 220 }}>
        {/* Ocean background with continents represented as color blocks */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-4 w-full max-w-2xl px-8 py-8">
            {/* North America */}
            <div className="rounded-xl p-3 text-center text-white text-sm font-bold"
                 style={{ background: 'rgba(196,18,48,0.85)' }}>
              🌎 N. America<br/>
              <span className="text-xs font-normal opacity-80">USA 🇺🇸 CAN 🇨🇦 MEX 🇲🇽 + 3</span>
            </div>
            {/* Europe */}
            <div className="rounded-xl p-3 text-center text-white text-sm font-bold"
                 style={{ background: 'rgba(30,64,175,0.85)' }}>
              🌍 Europe<br/>
              <span className="text-xs font-normal opacity-80">16 teams · UEFA</span>
            </div>
            {/* Asia */}
            <div className="rounded-xl p-3 text-center text-white text-sm font-bold"
                 style={{ background: 'rgba(124,58,237,0.85)' }}>
              🌏 Asia<br/>
              <span className="text-xs font-normal opacity-80">9 teams · AFC</span>
            </div>
            {/* South America */}
            <div className="rounded-xl p-3 text-center text-white text-sm font-bold"
                 style={{ background: 'rgba(21,128,61,0.85)' }}>
              🌎 S. America<br/>
              <span className="text-xs font-normal opacity-80">6 teams · CONMEBOL</span>
            </div>
            {/* Africa */}
            <div className="rounded-xl p-3 text-center text-white text-sm font-bold"
                 style={{ background: 'rgba(180,83,9,0.85)' }}>
              🌍 Africa<br/>
              <span className="text-xs font-normal opacity-80">10 teams · CAF</span>
            </div>
            {/* Oceania */}
            <div className="rounded-xl p-3 text-center text-white text-sm font-bold"
                 style={{ background: 'rgba(8,145,178,0.85)' }}>
              🌏 Oceania<br/>
              <span className="text-xs font-normal opacity-80">1 team · OFC</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-2 right-3 text-[10px] font-mono text-white/60">
          FIFA World Cup 2026 · 48 Teams
        </div>
      </div>

      {/* Teams by confederation */}
      {CONFEDERATIONS.map(conf => (
        <div key={conf.name}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-8 rounded-full" style={{ background: conf.color }} />
            <div>
              <h2 className="font-display text-2xl tracking-wider" style={{ color: '#0d1f3d' }}>
                {conf.emoji} {conf.label}
              </h2>
              <div className="text-xs font-mono" style={{ color: '#5a7499' }}>
                {conf.name} · {conf.teams.length} teams
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {conf.teams.map(team => {
              const rank = getFifaRank(team)
              const isDarkHorse = typeof rank === 'number' && rank >= 60
              return (
                <div key={team}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-shadow hover:shadow-md"
                  style={{
                    background: '#ffffff',
                    borderColor: isDarkHorse ? '#f5c842' : conf.color + '30',
                    boxShadow: '0 1px 4px rgba(13,31,61,0.06)',
                  }}>
                  <span className="text-2xl shrink-0">{flagFor(team)}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: '#111827' }}>
                      {team}
                    </div>
                    <div className="text-[10px] font-mono" style={{ color: rank <= 10 ? conf.color : '#9aafcc' }}>
                      FIFA #{rank}
                      {isDarkHorse && ' 🐴'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-4 border-t" style={{ borderColor: '#dde3f0' }}>
        <span className="text-xs font-mono" style={{ color: '#5a7499' }}>
          <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: '#f5c842', verticalAlign: 'middle' }} />
          🐴 Dark horse (FIFA rank #60+)
        </span>
        <span className="text-xs font-mono" style={{ color: '#5a7499' }}>
          Ranked by official FIFA Men's World Ranking · April 2026
        </span>
      </div>
    </div>
  )
}
