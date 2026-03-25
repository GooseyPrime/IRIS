'use client'

import { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const parsed = ForgotPasswordSchema.safeParse({ email })
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Invalid input')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      parsed.data.email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      },
    )

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-8">
        {/* IRIS wordmark */}
        <div className="text-center">
          <p className="font-serif font-light text-4xl tracking-tight text-text-primary">
            IRIS
          </p>
          <p className="font-sans text-xs text-text-muted mt-1 uppercase tracking-[0.2em]">
            I Rise, I Shine
          </p>
        </div>

        <div className="bg-surface-1 rounded-3xl border border-iris-900/30 p-8 shadow-[0_8px_40px_rgba(107,76,230,0.08)] text-center">
          <div className="w-12 h-12 rounded-full bg-iris-600/20 flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-iris-400"
              aria-hidden="true"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h2 className="font-serif font-light text-2xl text-text-primary mb-2">
            Check your inbox
          </h2>
          <p className="font-sans text-sm text-text-secondary">
            If an account exists for{' '}
            <span className="text-iris-400">{email}</span>, you'll receive a
            password reset link shortly.
          </p>
        </div>

        <p className="font-sans text-center text-sm text-text-muted">
          Remembered it?{' '}
          <Link
            href="/login"
            className="text-iris-400 hover:text-iris-300 transition-colors underline underline-offset-2"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* IRIS wordmark */}
      <div className="text-center">
        <p className="font-serif font-light text-4xl tracking-tight text-text-primary">
          IRIS
        </p>
        <p className="font-sans text-xs text-text-muted mt-1 uppercase tracking-[0.2em]">
          I Rise, I Shine
        </p>
      </div>

      {/* Card */}
      <div className="bg-surface-1 rounded-3xl border border-iris-900/30 p-8 shadow-[0_8px_40px_rgba(107,76,230,0.08)]">
        <h1 className="font-serif font-light text-2xl text-text-primary text-center mb-2">
          Reset your password
        </h1>
        <p className="font-sans text-sm text-text-secondary text-center mb-6">
          Enter your email and we'll send you a reset link.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-sans text-sm text-text-secondary">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-surface-0 border border-iris-900/40 rounded-xl px-4 py-3 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-iris-500 focus:ring-offset-2 focus:ring-offset-surface-1 transition-all duration-200"
              placeholder="you@example.com"
            />
          </div>

          {error && (
            <p className="font-sans text-sm text-error text-center" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-2"
          >
            {loading ? 'Sending…' : 'Send Reset Link'}
          </Button>
        </form>
      </div>

      <p className="font-sans text-center text-sm text-text-muted">
        Remembered it?{' '}
        <Link
          href="/login"
          className="text-iris-400 hover:text-iris-300 transition-colors underline underline-offset-2"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
