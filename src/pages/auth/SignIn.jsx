import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../supabase.js'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    setSubmitting(false)
    if (error) setError(error.message)
    else navigate(redirectTo, { replace: true })
  }

  return (
    <AuthShell title="Sign In" subtitle="Welcome back">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          autoFocus
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        {error && <ErrorBox>{error}</ErrorBox>}
        <button
          type="submit"
          disabled={submitting || !email || !password}
          className="w-full py-3 bg-lime text-pitch font-bold rounded-xl hover:bg-lime/90 disabled:opacity-40 transition-all"
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-sm text-center font-mono">
        <div>
          <Link to="/forgot-password" className="text-muted hover:text-lime">
            Forgot password?
          </Link>
        </div>
        <div className="text-muted">
          New here?{' '}
          <Link to="/sign-up" className="text-lime hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </AuthShell>
  )
}

// ---------------------------------------------------------------------------
// Shared auth-page primitives (used by SignUp, Forgot, Reset too)
// ---------------------------------------------------------------------------
export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="pt-12 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">⚽</div>
        <h1 className="font-display text-4xl text-lime tracking-widest">{title}</h1>
        {subtitle && <p className="text-muted font-mono text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="bg-grass/20 border border-grass rounded-2xl p-6">{children}</div>
    </div>
  )
}

export function Field({ label, type = 'text', value, onChange, autoComplete, autoFocus }) {
  return (
    <label className="block">
      <span className="text-xs text-muted font-mono uppercase tracking-wider">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className="mt-1 w-full bg-pitch border border-grass rounded-lg px-3 py-2.5 focus:outline-none focus:border-lime transition-colors"
      />
    </label>
  )
}

export function ErrorBox({ children }) {
  return (
    <div
      className="text-sm font-mono bg-grass/40 border border-grass rounded-lg p-3"
      style={{ color: '#fca5a5' }}
    >
      {children}
    </div>
  )
}

export function InfoBox({ children }) {
  return (
    <div className="text-sm font-mono bg-lime/10 border border-lime/30 rounded-lg p-3 text-lime">
      {children}
    </div>
  )
}
