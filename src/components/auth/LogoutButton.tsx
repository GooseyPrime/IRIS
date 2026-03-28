'use client'

import { useState } from 'react'

interface LogoutButtonProps {
  className?: string
  label?: string
}

export function LogoutButton({
  className,
  label = 'Log out',
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const resolvedClassName =
    className ??
    'font-sans text-sm text-zinc-400 hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded disabled:opacity-60'

  async function handleLogout() {
    setIsLoading(true)
    window.location.href = '/auth/logout'
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={resolvedClassName}
      aria-label="Log out"
    >
      {isLoading ? 'Logging out...' : label}
    </button>
  )
}
