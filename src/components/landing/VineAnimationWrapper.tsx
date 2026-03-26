'use client'

import dynamic from 'next/dynamic'

const VineAnimation = dynamic(
  () => import('@/components/landing/VineAnimation').then((m) => m.VineAnimation),
  { ssr: false },
)

export function VineAnimationWrapper() {
  return <VineAnimation />
}
