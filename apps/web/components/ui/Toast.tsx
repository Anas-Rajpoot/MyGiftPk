'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useToastStore, type ToastType } from '@/lib/toast'

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-success shrink-0" aria-hidden />,
  error:   <XCircle     className="h-5 w-5 text-wine shrink-0" aria-hidden />,
  info:    <Info        className="h-5 w-5 text-info shrink-0" aria-hidden />,
}

const styles: Record<ToastType, string> = {
  success: 'border-success-border bg-success-tint',
  error:   'border-wine-tint bg-wine-tint',
  info:    'border-info-border bg-info-tint',
}

export function ToastContainer() {
  const { toasts, remove } = useToastStore()
  const shouldReduceMotion = useReducedMotion()

  return (
    <div
      aria-live="assertive"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none max-w-[360px] w-[calc(100vw-2rem)]"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            role="status"
            className={clsx(
              'pointer-events-auto flex items-start gap-3 rounded-card border px-4 py-3',
              'shadow-[var(--shadow-float)]',
              styles[toast.type]
            )}
          >
            {icons[toast.type]}
            <p className="flex-1 font-body text-sm text-ink leading-snug">{toast.message}</p>
            <button
              onClick={() => remove(toast.id)}
              aria-label="Dismiss notification"
              className="text-stone hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wine rounded"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
