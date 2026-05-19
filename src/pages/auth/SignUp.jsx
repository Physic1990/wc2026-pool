import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase.js'
import { AuthShell, Field, ErrorBox, InfoBox } from './SignIn.jsx'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [needsConfirm, setNeedsConfirm] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    })
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    // If email confirmation is enabled, session will be null and user must
    // confirm via email. If disabled, they're signed in immediately.
    if (data.session) {
      navigate('/', { replace: true })
    } else {
      setNeedsConfirm(true)
    }
  }

  if (needsConfirm) {
    return (
      <AuthShell title="Check Your Email" subtitle="Confirm to finish signing up">
        <InfoBox>
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your
          account, then come back and sign in.
        </InfoBox>
        <div className="mt-6 text-center text-sm font-mono">
          <Link to="/sign-in" className="text-lime hover:underline">
            ← Back to sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create Account" subtitle="Sign up to play in pools with friends">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" autoFocus />
        <Field label="Password (min 6 chars)" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
        <Field label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
        {error && <ErrorBox>{error}</ErrorBox>}
        <button
          type="submit"
          disabled={submitting || !email || !password || !confirmPassword}
          className="w-full py-3 bg-lime text-pitch font-bold rounded-xl hover:bg-lime/90 disabled:opacity-40 transition-all"
        >
          {submitting ? 'Creating...' : 'Sign Up'}
        </button>
      </form>
      <div className="mt-6 text-center text-sm font-mono text-muted">
        Already have an account?{' '}
        <Link to="/sign-in" className="text-lime hover:underline">Sign in</Link>
      </div>
    </AuthShell>
  )
}
