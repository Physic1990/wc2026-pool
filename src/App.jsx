import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import { useAuth, RequireAuth } from './lib/auth.jsx'

import SignIn from './pages/auth/SignIn.jsx'
import SignUp from './pages/auth/SignUp.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import ResetPassword from './pages/auth/ResetPassword.jsx'

import Dashboard from './pages/Dashboard.jsx'
import LeagueNew from './pages/LeagueNew.jsx'
import LeagueJoin from './pages/LeagueJoin.jsx'
import League from './pages/League.jsx'
import Enter from './pages/Enter.jsx'
import Bracket from './pages/Bracket.jsx'
import HowItWorks from './pages/HowItWorks.jsx'
import Admin from './pages/Admin.jsx'
import LiveScores from './pages/LiveScores.jsx'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pb-16">
        <Routes>
          {/* Public auth routes */}
          <Route path="/sign-in"          element={<RedirectIfAuthed><SignIn /></RedirectIfAuthed>} />
          <Route path="/sign-up"          element={<RedirectIfAuthed><SignUp /></RedirectIfAuthed>} />
          <Route path="/forgot-password"  element={<ForgotPassword />} />
          <Route path="/reset-password"   element={<ResetPassword />} />

          {/* Public marketing/info routes */}
          <Route path="/how-it-works"     element={<HowItWorks />} />
          <Route path="/live"             element={<LiveScores />} />

          {/* Protected routes */}
          <Route path="/"                 element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/enter"            element={<RequireAuth><Enter /></RequireAuth>} />
          <Route path="/bracket/:userId"  element={<RequireAuth><Bracket /></RequireAuth>} />
          <Route path="/leagues/new"      element={<RequireAuth><LeagueNew /></RequireAuth>} />
          <Route path="/leagues/join"     element={<RequireAuth><LeagueJoin /></RequireAuth>} />
          <Route path="/leagues/:id"      element={<RequireAuth><League /></RequireAuth>} />

          {/* Admin stays password-gated separately, no user auth required */}
          <Route path="/admin"            element={<Admin />} />

          <Route path="*"                 element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function RedirectIfAuthed({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return children
}
