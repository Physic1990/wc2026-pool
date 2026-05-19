import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../supabase.js'
import { AuthShell, Field, ErrorBox, InfoBox } from './SignIn.jsx'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/reset-password` }
    )
    setSubmitting(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  if (sent) {
    return (
      <AuthShell title="Check Your Email">
        <InfoBox>
          If <strong>{email}</strong> matches an account, we sent a password-reset link.
        </InfoBox>
        <div className="mt-6 text-center text-sm font-mono">
          <Link to="/sign-in" className="text-lime hover:underline">← Back to sign in</Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Forgot Password" subtitle="We'll email you a reset link">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" autoFocus />
        {error && <ErrorBox>{error}</ErrorBox>}
        <button
          type="submit"
          disabled={submitting || !email}
          className="w-full py-3 bg-lime text-pitch font-bold rounded-xl hover:bg-lime/90 disabled:opacity-40 transition-all"
        >
          {submitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      <div className="mt-6 text-center text-sm font-mono text-muted">
        <Link to="/sign-in" className="text-lime hover:underline">← Back to sign in</Link>
      </div>
    </AuthShell>
  )
}
