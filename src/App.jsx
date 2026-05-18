import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Enter from './pages/Enter.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pb-16">
        <Routes>
          <Route path="/" element={<Leaderboard />} />
          <Route path="/enter" element={<Enter />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  )
}
