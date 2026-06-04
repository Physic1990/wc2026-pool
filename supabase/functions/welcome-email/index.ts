import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'WC 2026 Pool <noreply@wc2026-pool.vercel.app>'

serve(async (req) => {
  try {
    const payload = await req.json()
    const email = payload?.record?.email
    if (!email) return new Response('no email', { status: 400 })

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: 'Welcome to WC 2026 Prediction Pool!',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e5e5e5;padding:32px;border-radius:12px">
            <h1 style="color:#84cc16;font-size:28px;margin-bottom:4px">⚽ WC 2026 Prediction Pool</h1>
            <p style="color:#6b7280;margin-top:0">Your account has been created!</p>

            <p>Welcome! You've been added to the WC 2026 Prediction Pool. Head over to <a href="https://wc2026-pool.vercel.app" style="color:#84cc16">wc2026-pool.vercel.app</a> to fill in your bracket.</p>

            <h2 style="color:#84cc16;border-bottom:1px solid #1f2937;padding-bottom:8px">How to Play</h2>
            <ol style="line-height:1.8">
              <li>Sign in and go to <strong>Enter Bracket</strong> — fill in your predictions once</li>
              <li>Join a league with an invite code from your friend</li>
              <li>Watch the leaderboard update as real results come in</li>
            </ol>

            <h2 style="color:#84cc16;border-bottom:1px solid #1f2937;padding-bottom:8px">Point System</h2>

            <h3 style="color:#d1fae5">Groups (×12 groups)</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr style="background:#1f2937"><td style="padding:8px;border:1px solid #374151">Correct 1st place</td><td style="padding:8px;border:1px solid #374151;text-align:right"><strong>2 pts</strong></td></tr>
              <tr><td style="padding:8px;border:1px solid #374151">Correct 2nd place</td><td style="padding:8px;border:1px solid #374151;text-align:right"><strong>1 pt</strong></td></tr>
              <tr style="background:#1f2937"><td style="padding:8px;border:1px solid #374151">Both 1st AND 2nd correct</td><td style="padding:8px;border:1px solid #374151;text-align:right"><strong>+1 bonus</strong></td></tr>
              <tr><td style="padding:8px;border:1px solid #374151">Correct 3rd-place qualifier (×8 max)</td><td style="padding:8px;border:1px solid #374151;text-align:right"><strong>1 pt each</strong></td></tr>
            </table>

            <h3 style="color:#d1fae5">Knockouts</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr style="background:#1f2937"><td style="padding:8px;border:1px solid #374151">Round of 32</td><td style="padding:8px;border:1px solid #374151;text-align:right"><strong>1 pt</strong></td></tr>
              <tr><td style="padding:8px;border:1px solid #374151">Round of 16</td><td style="padding:8px;border:1px solid #374151;text-align:right"><strong>2 pts</strong></td></tr>
              <tr style="background:#1f2937"><td style="padding:8px;border:1px solid #374151">Quarterfinals</td><td style="padding:8px;border:1px solid #374151;text-align:right"><strong>3 pts</strong></td></tr>
              <tr><td style="padding:8px;border:1px solid #374151">Semifinals</td><td style="padding:8px;border:1px solid #374151;text-align:right"><strong>5 pts</strong></td></tr>
              <tr style="background:#1f2937"><td style="padding:8px;border:1px solid #374151">Champion</td><td style="padding:8px;border:1px solid #374151;text-align:right"><strong>8 pts</strong></td></tr>
            </table>

            <h3 style="color:#d1fae5">Bonus Awards (3 pts each)</h3>
            <p style="font-size:14px">Golden Boot &nbsp;·&nbsp; Golden Glove &nbsp;·&nbsp; Golden Ball &nbsp;·&nbsp; Dark Horse</p>

            <p style="color:#6b7280;font-size:13px;margin-top:0"><strong style="color:#e5e5e5">Theoretical max: 130 points.</strong></p>

            <div style="margin-top:32px;text-align:center">
              <a href="https://wc2026-pool.vercel.app/enter" style="background:#84cc16;color:#000;font-weight:bold;padding:12px 32px;border-radius:8px;text-decoration:none;display:inline-block">Fill In My Bracket →</a>
            </div>

            <p style="color:#4b5563;font-size:12px;margin-top:32px;text-align:center">WC 2026 Prediction Pool</p>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
      return new Response('email failed', { status: 500 })
    }

    return new Response('ok', { status: 200 })
  } catch (e) {
    console.error(e)
    return new Response('error', { status: 500 })
  }
})
