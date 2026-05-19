import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase.js'
import { AuthShell, Field, ErrorBox, InfoBox } from './SignIn.jsx'

/**
 * Landing page from the password-reset email. Supabase establishes a session
 * automatically when the link is clicked (via the URL fragment), then we let
 * the user choose a new password.
 */
export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Wait for Supabase to parse the URL and establish a session.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(!!session)
    })
  }, [])

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
    const { error } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (error) setError(error.message)
    else setDone(true)
  }

  if (done) {
    return (
      <AuthShell title="Password Updated">
        <InfoBox>You can now sign in with your new password.</InfoBox>
        <button
          onClick={() => navigate('/sign-in', { replace: true })}
          className="mt-6 w-full py-3 bg-lime text-pitch font-bold rounded-xl"
        >
          Go to Sign In
        </button>
      </AuthShell>
    )
  }

  if (!ready) {
    return (
      <AuthShell title="Reset Password">
        <ErrorBox>
          This link is invalid or has expired. Request a new one from{' '}
          <Link to="/forgot-password" className="underline">Forgot Password</Link>.
        </ErrorBox>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Reset Password" subtitle="Choose a new password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="New Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" autoFocus />
        <Field label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
        {error && <ErrorBox>{error}</ErrorBox>}
        <button
          type="submit"
          disabled={submitting || !password || !confirmPassword}
          className="w-full py-3 bg-lime text-pitch font-bold rounded-xl hover:bg-lime/90 disabled:opacity-40 transition-all"
        >
          {submitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </AuthShell>
  )
}
