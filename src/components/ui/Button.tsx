'use client'

import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-sacred-iris text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-50',
  ghost:
    'border border-iris-600 text-iris-400 hover:bg-iris-600/10 disabled:opacity-50',
  destructive:
    'border border-error/50 text-error hover:bg-error/10 disabled:opacity-50',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 rounded-xl',
  lg: 'px-8 py-4 rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled ?? loading}
      className={[
        'inline-flex items-center justify-center gap-2',
        'font-sans font-medium',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading && (
        <span
          className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}
