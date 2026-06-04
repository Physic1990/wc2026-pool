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

    // Check if the email exists before attempting reset
    const { data: userData } = await supabase
      .from('entries')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data?.user?.id)
      .limit(1)

    // Use admin-safe check: try to sign in with a bad password to detect if user exists
    const normalized = email.trim().toLowerCase()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalized,
      password: '____invalid____check____',
    })

    // "Invalid login credentials" = user exists but wrong password (expected)
    // "Email not confirmed" = user exists
    // Anything else likely means user doesn't exist
    const userExists =
      signInError?.message?.includes('Invalid login credentials') ||
      signInError?.message?.includes('Email not confirmed')

    if (!userExists) {
      setSubmitting(false)
      setError(`We don't have an account for ${normalized}. Please sign up first.`)
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
