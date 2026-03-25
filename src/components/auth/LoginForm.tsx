'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

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

    router.push('/dashboard')
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
        <h1 className="font-serif font-light text-2xl text-text-primary text-center mb-6">
          Welcome back
        </h1>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="font-sans text-sm text-text-secondary"
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
              className="bg-surface-0 border border-iris-900/40 rounded-xl px-4 py-3 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-iris-500 focus:ring-offset-2 focus:ring-offset-surface-1 transition-all duration-200"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="font-sans text-sm text-text-secondary"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-surface-0 border border-iris-900/40 rounded-xl px-4 py-3 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-iris-500 focus:ring-offset-2 focus:ring-offset-surface-1 transition-all duration-200"
              placeholder="••••••••"
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

      {/* New here link */}
      <p className="font-sans text-center text-sm text-text-muted">
        New here?{' '}
        <Link
          href="/onboarding"
          className="text-iris-400 hover:text-iris-300 transition-colors underline underline-offset-2"
        >
          Begin your journey
        </Link>
      </p>
    </div>
  )
}
