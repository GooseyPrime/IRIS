import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'IRIS — Sign In',
  description: 'Sign in to your IRIS sobriety companion.',
}

export default function LoginPage() {
  return <LoginForm />
}
