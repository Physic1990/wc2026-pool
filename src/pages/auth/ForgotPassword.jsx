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
    const normalized = email.trim().toLowerCase()

    // Check if this email has an account via a DB function
    const { data: exists, error: checkError } = await supabase
      .rpc('email_exists', { p_email: normalized })

    if (!checkError && exists === false) {
      setSubmitting(false)
      setError(`No account found for ${normalized}. Please sign up first.`)
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setSubmitting(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  if (sent) {
    return (
      <AuthShell title="Check Your Email">
        <InfoBox>
          We sent a password-reset link to <strong>{email}</strong>. Check your inbox!
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
