'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const parsed = LoginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Invalid input')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/auth/redirect')
  }

  return (
    <div className="flex flex-col gap-8">
      {/* IRIS wordmark */}
      <div className="text-center">
        <p className="font-serif font-light text-4xl tracking-tight text-zinc-100">
          IRIS
        </p>
        <p className="font-sans text-xs text-zinc-400 mt-1 uppercase tracking-[0.2em]">
          I Rise, I Shine
        </p>
      </div>

      {/* Card */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
        <h1 className="font-serif font-light text-2xl text-zinc-100 text-center mb-6">
          Welcome back
        </h1>

        {/* Google sign-in */}
        <GoogleAuthButton mode="signin" redirectTo="/auth/redirect" />

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-iris-900/30" />
          <span className="font-sans text-xs text-text-muted uppercase tracking-[0.15em]">or</span>
          <div className="flex-1 h-px bg-iris-900/30" />
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="font-sans text-sm text-zinc-400"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 font-sans text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-iris-500 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="font-sans text-sm text-text-secondary"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="font-sans text-xs text-iris-400 hover:text-iris-300 transition-colors underline underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
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
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </div>

      {/* Sign-up / onboarding links */}
      <div className="flex flex-col items-center gap-2">
        <p className="font-sans text-center text-sm text-text-muted">
          New here?{' '}
          <Link
            href="/signup"
            className="text-iris-400 hover:text-iris-300 transition-colors underline underline-offset-2"
          >
            Create an account
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
