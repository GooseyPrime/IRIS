import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IRIS — Get Started',
  description: 'Set up your IRIS sobriety companion',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center px-4 py-12">
      {/* subtle night-bloom radial glow behind content */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(107,76,230,0.12) 0%, transparent 70%)',
        }}
      />
      <div className="w-full max-w-lg">{children}</div>
    </div>
  )
}
