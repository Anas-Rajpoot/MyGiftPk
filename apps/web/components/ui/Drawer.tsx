'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Drawer({ isOpen, onClose, title, children, className }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (!isOpen) return

    const saved = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    if (!panel) return

    // Lock scroll
    document.body.style.overflow = 'hidden'

    // Focus first element
    const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE)
    focusable[0]?.focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return

      const els = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (!els.length) return
      const first = els[0], last = els[els.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
      saved?.focus()
    }
  }, [isOpen, onClose])

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-40 bg-[var(--overlay-bg)] backdrop-blur-[4px]"
            aria-hidden
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal
            aria-label={title ?? 'Drawer'}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ boxShadow: 'var(--shadow-float)' }}
            className={clsx(
              'fixed right-0 top-0 bottom-0 z-50 w-[calc(100vw-24px)] max-w-[400px]',
              'bg-ivory flex flex-col',
              className
            )}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-hairline shrink-0">
                <span className="font-body font-semibold text-ink">{title}</span>
                <button
                  onClick={onClose}
                  aria-label="Close drawer"
                  className="p-2 -mr-2 text-stone hover:text-wine transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
            )}
            {/* Content */}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
