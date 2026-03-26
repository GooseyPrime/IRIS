import type { Metadata } from 'next'
import { SignUpForm } from '@/components/auth/SignUpForm'

export const metadata: Metadata = {
  title: 'IRIS — Create Account',
  description: 'Create your IRIS sobriety companion account',
}

export default function SignUpPage() {
  return <SignUpForm />
}
