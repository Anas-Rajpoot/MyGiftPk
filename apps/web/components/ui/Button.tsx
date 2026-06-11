'use client'

import Link from 'next/link'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-body font-semibold tracking-wide transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

const variants: Record<Variant, string> = {
  primary:
    'bg-wine text-ivory hover:bg-wine-deep active:bg-wine-deep focus-visible:ring-wine',
  secondary:
    'bg-transparent text-wine border border-wine hover:bg-wine-tint active:bg-wine-tint focus-visible:ring-wine',
  ghost:
    'bg-transparent text-ink hover:underline active:opacity-70 focus-visible:ring-ink',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-input',
  md: 'h-12 px-6 text-[15px] rounded-input',
  lg: 'h-14 px-8 text-base rounded-input',
}

interface BaseProps {
  variant?: Variant
  size?: Size
  loading?: boolean
  className?: string
  children?: React.ReactNode
}

interface ButtonAsButton extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> {
  as?: 'button'
  href?: never
}

interface ButtonAsLink extends BaseProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> {
  as: 'link'
  href: string
  disabled?: never
  loading?: never
}

type ButtonProps = ButtonAsButton | ButtonAsLink

export function Button({
  as: tag = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const styles = clsx(base, variants[variant], sizes[size], className)

  if (tag === 'link') {
    const { href, ...linkRest } = rest as ButtonAsLink
    return (
      <Link href={href} className={styles} {...(linkRest as object)}>
        {children}
      </Link>
    )
  }

  const { disabled, ...btnRest } = rest as ButtonAsButton
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      aria-busy={loading}
      className={clsx(styles, 'disabled:opacity-40 disabled:cursor-not-allowed', loading && 'min-w-[100px]')}
      {...btnRest}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          <span className="sr-only">Loading</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
