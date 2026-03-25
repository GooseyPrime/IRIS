'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/auth/PasswordInput'

const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const parsed = ResetPasswordSchema.safeParse({ password, confirmPassword })
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Invalid input')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.updateUser({
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
        <h1 className="font-serif font-light text-2xl text-text-primary text-center mb-2">
          Choose a new password
        </h1>
        <p className="font-sans text-sm text-text-secondary text-center mb-6">
          Make it strong — you won&apos;t need to remember it if you sign in with Google.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="font-sans text-sm text-text-secondary">
              New password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm-password" className="font-sans text-sm text-text-secondary">
              Confirm new password
            </label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              placeholder="Repeat your new password"
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
            {loading ? 'Saving…' : 'Set New Password'}
          </Button>
        </form>
      </div>

      <p className="font-sans text-center text-sm text-text-muted">
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
