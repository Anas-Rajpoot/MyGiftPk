'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'default' | 'large'
  children: React.ReactNode
  className?: string
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ isOpen, onClose, title, size = 'default', children, className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (!isOpen) return

    const saved = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    if (!panel) return

    document.body.style.overflow = 'hidden'

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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="panel"
              ref={panelRef}
              role="dialog"
              aria-modal
              aria-label={title ?? 'Modal'}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{ boxShadow: 'var(--shadow-float)' }}
              className={clsx(
                'pointer-events-auto w-full bg-ivory rounded-card overflow-hidden',
                size === 'large' ? 'max-w-[880px]' : 'max-w-[560px]',
                className
              )}
            >
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
                  <span className="font-body font-semibold text-ink">{title}</span>
                  <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="p-2 -mr-2 text-stone hover:text-wine transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>
                </div>
              )}
              <div className="p-6">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
