'use client'

import { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'

const SignUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const parsed = SignUpSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Invalid input')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex flex-col gap-8">
        {/* IRIS wordmark */}
        <div className="text-center">
          <p className="font-serif font-light text-4xl tracking-tight text-text-primary">
            IRIS
          </p>
          <p className="font-sans text-xs text-text-muted mt-1 uppercase tracking-[0.2em] whitespace-nowrap">
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="font-serif font-light text-2xl text-text-primary mb-2">
            Check your inbox
          </h2>
          <p className="font-sans text-sm text-text-secondary">
            We sent a confirmation link to{' '}
            <span className="text-iris-400">{email}</span>.
            Click it to activate your account and begin your journey.
          </p>
        </div>

        <p className="font-sans text-center text-sm text-text-muted">
          Already confirmed?{' '}
          <Link
            href="/login"
            className="text-iris-400 hover:text-iris-300 transition-colors underline underline-offset-2"
          >
            Sign in
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
        <p className="font-sans text-xs text-text-muted mt-1 uppercase tracking-[0.2em] whitespace-nowrap">
          I Rise, I Shine
        </p>
      </div>

      {/* Card */}
      <div className="bg-surface-1 rounded-3xl border border-iris-900/30 p-8 shadow-[0_8px_40px_rgba(107,76,230,0.08)]">
        <h1 className="font-serif font-light text-2xl text-text-primary text-center mb-6">
          Create your account
        </h1>

        {/* Google sign-up */}
        <GoogleAuthButton mode="signup" redirectTo="/onboarding" />

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-iris-900/30" />
          <span className="font-sans text-xs text-text-muted uppercase tracking-[0.15em]">or</span>
          <div className="flex-1 h-px bg-iris-900/30" />
        </div>

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

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="font-sans text-sm text-text-secondary">
              Password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              aria-describedby="password-hint"
            />
            <p id="password-hint" className="font-sans text-xs text-text-muted">
              At least 8 characters, one uppercase letter, and one number.
            </p>
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
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>
      </div>

      {/* Links */}
      <div className="flex flex-col items-center gap-2">
        <p className="font-sans text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-iris-400 hover:text-iris-300 transition-colors underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
        <p className="font-sans text-center text-sm text-text-muted">
          Want to explore first?{' '}
          <Link
            href="/onboarding"
            className="text-gold-400 hover:text-gold-300 transition-colors underline underline-offset-2"
          >
            Begin your journey
          </Link>
        </p>
      </div>
    </div>
  )
}
