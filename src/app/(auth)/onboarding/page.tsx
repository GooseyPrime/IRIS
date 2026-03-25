import type { Metadata } from 'next'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export const metadata: Metadata = {
  title: 'IRIS — Your Journey Begins',
  description: 'Tell us a little about yourself so we can personalise your IRIS experience.',
}

export default function OnboardingPage() {
  return <OnboardingWizard />
}
