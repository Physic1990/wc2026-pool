# WC 2026 Prediction Pool

A private World Cup 2026 prediction pool for you and your friends. Sign up, fill in your bracket once, create or join leagues by invite code, and watch the leaderboard update as real results come in.

## Stack
- React + Vite
- Tailwind CSS
- Supabase (auth + Postgres)
- Vercel (hosting)

## Setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. **Run the schema:** SQL Editor → paste the contents of `supabase_schema.sql` → Run. This creates `entries`, `results`, `leagues`, `league_members`, plus RLS policies and a `join_league()` function.
3. **Configure Auth → URL Configuration:**
   - Set **Site URL** to your dev URL (e.g. `http://localhost:5173`).
   - Add the same URL plus `/reset-password` to **Redirect URLs**.
4. **For local development** you probably want to disable email confirmation so you don't need to click a link in your inbox to test: Auth → Providers → Email → uncheck "Confirm email". For production, leave it on.
5. Copy your **Project URL** and **anon public key** from Settings → API.

### 2. Local Dev

```bash
npm install
cp .env.example .env
# Fill in your Supabase URL and keys in .env
npm run dev
```

### 3. Deploy to Vercel

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_PASSWORD`
4. In Supabase, update **Site URL** and **Redirect URLs** to your production domain (and add `/reset-password` to redirects).

## How It Works

| Route | Who | Purpose |
|-------|-----|---------|
| `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password` | Anyone | Auth flows (email + password) |
| `/` | Authed | Dashboard: your bracket status + your leagues |
| `/enter` | Authed | Fill in / edit your bracket (one per user) |
| `/leagues/new` | Authed | Create a league; get an invite code |
| `/leagues/join` | Authed | Join with an invite code |
| `/leagues/:id` | Authed (member) | Per-league leaderboard |
| `/admin` | Password | Enter real match results (one global set) |

### One bracket per user

You fill in your bracket **once**. The same bracket is scored in every league you join — you don't re-enter picks per league. Each league has its own leaderboard ranking among that league's members.

### Invite-only leagues

Leagues are private. The only way to join is via the invite code the creator shares. Codes are 8 readable characters (no 0/O/1/I/L to avoid confusion) — share them in DMs, group chats, whatever.

### Admin

The `/admin` route is still gated by `VITE_ADMIN_PASSWORD`. One person enters the real World Cup results there; everyone's bracket is scored against the same actual outcome. Note that since `VITE_*` env vars are inlined into the client bundle, anyone reading the source can see the admin password — for a friends pool that's fine, but don't use a sensitive password.

## Point System

### Groups (×12 groups)
| Pick | Points |
|------|--------|
| Correct 1st | 2 |
| Correct 2nd | 1 |
| Both 1st AND 2nd correct | +1 bonus |
| Correct 3rd-place qualifier (advances to R32) | 1 each (max 8) |

### Knockouts (per-match)
| Round | Points per correct winner |
|-------|---------------------------|
| Round of 32 | 1 |
| Round of 16 | 2 |
| Quarterfinals | 3 |
| Semifinals | 5 |
| Champion | 8 |

### Bonus Awards
| Award | Points |
|-------|--------|
| Golden Boot | 3 |
| Golden Glove | 3 |
| Golden Ball | 3 |
| Dark Horse | 3 |

**Theoretical max:** 130 points.

## Admin Workflow

After every round of matches:
1. Go to `/admin`, enter password.
2. Click teams to record actual 1st/2nd/3rd per group.
3. For R32 matches with a 3rd-place opponent slot, pick which 3rd-place team actually got that slot.
4. Click winners through R32 → R16 → QF → SF → Final.
5. Fill in bonus award winners.
6. Save. All league leaderboards update instantly.

## Privacy / Trade-offs

- Any authenticated user can read all leagues, all members, all entries (but only write their own). This is intentional so per-league leaderboards work without a custom server function. League names and member IDs are visible to any signed-in user; the real privacy boundary is the invite code (you can't *join* without it).
- The admin password is in the client bundle. Acceptable for friend pools; not acceptable if you need real access control — move admin to a server function in that case.
