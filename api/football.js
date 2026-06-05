/**
 * Vercel serverless function — proxies football-data.org API requests
 * so the API key and CORS restrictions are handled server-side.
 *
 * Usage: GET /api/football?path=/competitions/WC/matches&season=2026
 */
export default async function handler(req, res) {
  const API_KEY = process.env.FOOTBALL_DATA_KEY
  if (!API_KEY) {
    return res.status(500).json({ error: 'FOOTBALL_DATA_KEY not set' })
  }

  // Build the upstream URL from query params
  const { path, ...rest } = req.query
  if (!path) return res.status(400).json({ error: 'Missing path param' })

  const qs = new URLSearchParams(rest).toString()
  const url = `https://api.football-data.org/v4${path}${qs ? '?' + qs : ''}`

  try {
    const upstream = await fetch(url, {
      headers: { 'X-Auth-Token': API_KEY },
    })
    const data = await upstream.json()
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(upstream.status).json(data)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
