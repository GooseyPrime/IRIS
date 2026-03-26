import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'IRIS — Reset Password',
  description: 'Reset your IRIS account password',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
