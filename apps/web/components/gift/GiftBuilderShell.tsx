'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { ChevronLeft, ChevronRight, ShoppingBag, RotateCcw } from 'lucide-react'
import { useGiftStore, selectDisplayTotal, selectSlotsUsed } from '@/lib/stores/gift'
import { GiftProgress } from '@/components/gift/GiftProgress'
import { StepBox } from '@/components/gift/StepBox'
import { StepFill } from '@/components/gift/StepFill'
import { StepPersonalize } from '@/components/gift/StepPersonalize'
import { StepReview } from '@/components/gift/StepReview'
import type { GiftBuilderOptions } from '@/lib/wp/queries/gift'

interface GiftBuilderShellProps {
  options: GiftBuilderOptions
}

const STEP_LABELS: Record<number, string> = {
  1: 'Choose Box',
  2: 'Fill It',
  3: 'Personalise',
  4: 'Review',
}

function AnimatedTotal({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(value)
  const rafRef = useRef<number | null>(null)
  const prevRef = useRef(value)

  useEffect(() => {
    const from = prevRef.current
    const to = value
    prevRef.current = to
    if (from === to) return

    const duration = 280
    const startTime = performance.now()

    function animate(now: number) {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(from + (to - from) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value])

  return (
    <span className="font-display text-xl leading-none text-gold tabular-nums tracking-wide">
      Rs.&nbsp;{displayed.toLocaleString('en-PK')}
    </span>
  )
}

export function GiftBuilderShell({ options }: GiftBuilderShellProps) {
  const router = useRouter()
  const step = useGiftStore((s) => s.step)
  const boxId = useGiftStore((s) => s.boxId)
  const setStep = useGiftStore((s) => s.setStep)
  const reset = useGiftStore((s) => s.reset)
  const displayTotal = useGiftStore(selectDisplayTotal)
  const slotsUsed = useGiftStore(selectSlotsUsed)

  const [confirmReset, setConfirmReset] = useState(false)

  function canProceed(): boolean {
    if (step === 1) return boxId !== null
    return true
  }

  function nextStep() {
    if (!canProceed()) return
    if (step < 4) setStep((step + 1) as 1 | 2 | 3 | 4)
  }

  function prevStep() {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3 | 4)
  }

  function handleReset() {
    if (confirmReset) {
      reset()
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
    }
  }

  function handleSuccess() {
    router.push('/')
  }

  const nextLabel = step === 3 ? 'Review' : STEP_LABELS[(step + 1) as keyof typeof STEP_LABELS]

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Progress bar */}
      <GiftProgress step={step} />

      {/* Reset button */}
      <div className="flex justify-end px-4 pt-2">
        <button
          type="button"
          onClick={handleReset}
          className={clsx(
            'flex items-center gap-1.5 font-body text-xs transition-colors py-1 px-2 rounded',
            confirmReset
              ? 'text-wine bg-wine-tint font-medium'
              : 'text-stone hover:text-ink'
          )}
        >
          <RotateCcw className="h-3 w-3" aria-hidden />
          {confirmReset ? 'Tap again to reset' : 'Start over'}
        </button>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto pb-28">
        {step === 1 && <StepBox boxes={options.boxes} />}
        {step === 2 && (
          <StepFill
            components={options.components}
            categories={options.categories}
          />
        )}
        {step === 3 && (
          <StepPersonalize
            addOns={options.addOns}
            messageCharLimit={options.messageCharLimit}
            ribbonColors={options.ribbonColors}
            occasions={options.occasions}
          />
        )}
        {step === 4 && <StepReview onSuccess={handleSuccess} />}
      </div>

      {/* Fixed bottom bar: price ticker + navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-ink border-t border-white/10 px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          {/* Back */}
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="h-11 px-4 flex items-center gap-1.5 rounded-input border border-white/20 text-stone hover:text-ivory font-body text-sm transition-colors shrink-0"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Back
            </button>
          ) : (
            <div className="shrink-0 w-20" />
          )}

          {/* Price ticker */}
          <div className="flex-1 flex flex-col items-center">
            <span className="font-body text-[10px] text-stone uppercase tracking-wider">
              {boxId ? 'Gift Total' : 'Choose a box'}
            </span>
            {boxId && <AnimatedTotal value={displayTotal} />}
            {step === 2 && boxId && (
              <span className="font-body text-[10px] text-stone tabular-nums mt-0.5">
                {slotsUsed} item{slotsUsed !== 1 ? 's' : ''} added
              </span>
            )}
          </div>

          {/* Next (hidden on step 4 — handled by StepReview CTA) */}
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceed()}
              className="h-11 px-4 flex items-center gap-1.5 rounded-input bg-gold hover:bg-amber-500 text-ink font-body text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {nextLabel}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <div className="shrink-0 flex items-center gap-1.5 px-4 h-11 rounded-input bg-gold/20 text-gold font-body text-xs font-medium">
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
              Review
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
