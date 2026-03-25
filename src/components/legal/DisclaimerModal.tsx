'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { CrisisResourceCard } from '@/components/crisis/CrisisResourceCard'

const DISCLAIMER_KEY = 'iris_disclaimer_accepted'

export function DisclaimerModal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(DISCLAIMER_KEY)
      if (accepted !== 'true') {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  const handleAccept = useCallback(() => {
    try {
      localStorage.setItem(DISCLAIMER_KEY, 'true')
    } catch {
      // localStorage unavailable — consent recorded in memory only
    }
    setVisible(false)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0/90 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Legal disclaimer"
    >
      <div className="w-full max-w-lg bg-surface-1 border border-iris-900/30 rounded-2xl p-6 shadow-[0_8px_40px_rgba(107,76,230,0.12)] overflow-y-auto max-h-[90vh]">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-full border border-iris-700/50 flex items-center justify-center mb-4">
            <span className="font-serif text-xl text-iris-400 leading-none">I</span>
          </div>
          <h2 className="font-serif font-light text-2xl text-text-primary mb-1">
            Before we begin
          </h2>
          <p className="font-sans text-sm text-text-secondary">
            Please read and acknowledge the following.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <DisclaimerSection title="IRIS is not a therapist">
            IRIS is an AI-powered wellness companion designed to support your
            sobriety journey. IRIS does not provide therapy, medical advice,
            diagnosis, or treatment. IRIS is not a substitute for professional
            mental health care.
          </DisclaimerSection>

          <DisclaimerSection title="Not a medical device">
            IRIS is not a medical device and has not been evaluated by the FDA
            or any regulatory body. Nothing in this app should be interpreted
            as medical guidance.
          </DisclaimerSection>

          <DisclaimerSection title="Crisis situations">
            If you are in immediate danger or experiencing a medical emergency,
            please contact emergency services (911) immediately. IRIS will
            provide crisis resource information when it detects distress, but
            it cannot replace human crisis intervention.
          </DisclaimerSection>

          <DisclaimerSection title="Privacy">
            Your conversations are stored securely and are never shared with
            third parties. Crisis events are logged for safety purposes and
            are never deleted.
          </DisclaimerSection>
        </div>

        <CrisisResourceCard variant="subtle" />

        <div className="mt-6 flex justify-center">
          <Button onClick={handleAccept} size="lg">
            I understand — continue
          </Button>
        </div>

        <p className="font-sans text-[0.6rem] text-text-muted text-center mt-4 leading-relaxed">
          By continuing, you acknowledge that IRIS is a wellness companion and
          not a licensed therapist or medical provider.
        </p>
      </div>
    </div>
  )
}

function DisclaimerSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="font-sans text-sm font-semibold text-text-primary mb-1">
        {title}
      </h3>
      <p className="font-sans text-xs text-text-secondary leading-relaxed">
        {children}
      </p>
    </div>
  )
}
