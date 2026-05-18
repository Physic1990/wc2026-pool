# WC 2026 Prediction Pool

A World Cup 2026 prediction pool website. Players enter picks before the tournament, admin updates results after each match, leaderboard auto-calculates.

## Stack
- React + Vite
- Tailwind CSS
- Supabase (database)
- Vercel (hosting)

## Setup

### 1. Supabase
1. Create a free project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase_schema.sql`
3. Copy your Project URL and anon key from Settings → API

### 2. Local Dev
```bash
npm install
cp .env.example .env
# Fill in your Supabase URL and keys in .env
npm run dev
```

### 3. Deploy to Vercel
1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_PASSWORD`

## How It Works

| Route | Purpose |
|-------|---------|
| `/` | Leaderboard — live standings, click player to see breakdown |
| `/enter` | 5-step form for players to submit predictions |
| `/admin` | Password-protected panel to update match results |

## Point System

### Groups (×12)
| Pick | Points |
|------|--------|
| Correct 1st | 2 pts |
| Correct 2nd | 1 pt |
| Perfect group bonus | +1 pt |
| Correct 3rd qualifier | 1 pt each |

### Knockouts
| Round | Points |
|-------|--------|
| Round of 32 | 1 pt |
| Round of 16 | 2 pts |
| Quarterfinals | 3 pts |
| Semifinals | 5 pts |
| Champion | 8 pts |

### Bonuses
| Award | Points |
|-------|--------|
| Golden Boot | 3 pts |
| Golden Glove | 3 pts |
| Golden Ball | 3 pts |
| Dark Horse | 3 pts |

**Tiebreaker:** Total goals in the Final

## Admin Workflow
After every round of matches:
1. Go to `/admin`
2. Enter password
3. Update group results / knockout winners
4. Click Save — leaderboard updates instantly for everyone
