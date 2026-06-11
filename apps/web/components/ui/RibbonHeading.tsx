'use client'

import { useSyncExternalStore, useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'

type HeadingLevel = 'h1' | 'h2' | 'h3'
type Align = 'left' | 'center'

interface RibbonHeadingProps {
  as?: HeadingLevel
  align?: Align
  gold?: boolean
  className?: string
  children: React.ReactNode
}

/* Use useSyncExternalStore to read prefers-reduced-motion safely on client/server. */
function subscribe(cb: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const getSnapshot = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const getServerSnapshot = () => false

interface RibbonSVGProps {
  gold: boolean
  animate: boolean
  align: Align
}

function RibbonSVG({ gold, animate, align }: RibbonSVGProps) {
  const color = gold ? 'var(--gold)' : 'var(--wine)'
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 12"
      height={12}
      className={clsx('overflow-visible', align === 'center' ? 'mx-auto' : '')}
      style={{ display: 'block', width: '100%', maxWidth: 120, marginTop: 6 }}
    >
      <line
        x1="0"
        y1="6"
        x2="104"
        y2="6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        style={
          animate
            ? { strokeDasharray: 104, strokeDashoffset: 0, transition: 'stroke-dashoffset 400ms ease-out' }
            : undefined
        }
      />
      <path
        d="M104 6 C108 2 114 2 116 6 C114 10 108 10 104 6Z"
        fill={color}
        style={animate ? { opacity: 1, transition: 'opacity 200ms ease-out 350ms' } : undefined}
      />
    </svg>
  )
}

export function RibbonHeading({
  as: Tag = 'h2',
  align = 'left',
  gold = false,
  className,
  children,
}: RibbonHeadingProps) {
  const reducedMotion = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    if (wrapperRef.current) observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={wrapperRef} className={clsx(align === 'center' && 'text-center', className)}>
      <Tag className={clsx('font-display uppercase leading-none', gold ? 'text-gold' : 'text-ink')}>
        {children}
      </Tag>
      <RibbonSVG gold={gold} animate={!reducedMotion && visible} align={align} />
    </div>
  )
}
