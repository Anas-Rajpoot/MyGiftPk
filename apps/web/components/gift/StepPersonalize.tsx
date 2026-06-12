'use client'

import { clsx } from 'clsx'
import { Check } from 'lucide-react'
import { useGiftStore } from '@/lib/stores/gift'
import type { GiftAddOn } from '@/lib/wp/queries/gift'

// Map ribbon color names to CSS values (design-token compliant)
const RIBBON_SWATCHES: Record<string, string> = {
  'Wine Red': 'var(--wine)',
  'Gold': 'var(--gold)',
  'Ivory': 'var(--hairline)',
  'Navy': '#1B2A4A',
  'Blush Pink': '#F4C2C2',
  'Sage Green': '#8FAF8F',
}

interface StepPersonalizeProps {
  addOns: GiftAddOn[]
  messageCharLimit: number
  ribbonColors: string[]
  occasions: string[]
}

export function StepPersonalize({
  addOns,
  messageCharLimit,
  ribbonColors,
  occasions,
}: StepPersonalizeProps) {
  const message = useGiftStore((s) => s.message)
  const ribbonColor = useGiftStore((s) => s.ribbonColor)
  const selectedAddOns = useGiftStore((s) => s.addOns)
  const occasion = useGiftStore((s) => s.occasion)
  const setMessage = useGiftStore((s) => s.setMessage)
  const setRibbonColor = useGiftStore((s) => s.setRibbonColor)
  const toggleAddOn = useGiftStore((s) => s.toggleAddOn)
  const setOccasion = useGiftStore((s) => s.setOccasion)

  const remaining = messageCharLimit - message.length

  return (
    <div className="px-4 pt-6 pb-4 space-y-7">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-wide text-ink mb-0.5">
          Personalise
        </h1>
        <p className="font-body text-sm text-stone">Make it special with a message and finishing touches.</p>
      </div>

      {/* Card message */}
      <section>
        <label htmlFor="gift-message" className="block font-body text-sm font-medium text-ink mb-2">
          Gift Card Message <span className="text-stone font-normal">(optional)</span>
        </label>
        <div className="relative">
          <textarea
            id="gift-message"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, messageCharLimit))}
            placeholder="Write a heartfelt message…"
            rows={4}
            className="w-full rounded-input border border-hairline bg-ivory px-4 py-3 font-body text-sm text-ink placeholder:text-stone resize-none focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
          />
          <span
            className={clsx(
              'absolute bottom-2 right-3 font-body text-[11px] tabular-nums',
              remaining < 20 ? 'text-wine' : 'text-stone'
            )}
          >
            {remaining}
          </span>
        </div>
        {/* Live message preview */}
        {message.trim() && (
          <div className="mt-3 rounded-card border border-gold/40 bg-gold-tint p-4">
            <p className="font-body text-[11px] text-stone uppercase tracking-wider mb-2">Preview</p>
            <p className="font-body text-sm text-ink italic leading-relaxed whitespace-pre-wrap">
              &ldquo;{message.trim()}&rdquo;
            </p>
          </div>
        )}
      </section>

      {/* Ribbon color */}
      <section>
        <p className="font-body text-sm font-medium text-ink mb-3">Ribbon Colour</p>
        <div className="flex flex-wrap gap-3">
          {ribbonColors.map((color) => {
            const isSelected = ribbonColor === color
            const swatch = RIBBON_SWATCHES[color]
            return (
              <button
                key={color}
                type="button"
                onClick={() => setRibbonColor(color)}
                title={color}
                aria-label={`${color} ribbon${isSelected ? ' (selected)' : ''}`}
                className={clsx(
                  'flex flex-col items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm'
                )}
              >
                <span
                  className={clsx(
                    'w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all',
                    isSelected ? 'border-ink scale-110' : 'border-transparent hover:border-stone'
                  )}
                  style={{ backgroundColor: swatch ?? '#ccc' }}
                >
                  {isSelected && (
                    <Check
                      className={clsx(
                        'h-4 w-4',
                        color === 'Ivory' || color === 'Blush Pink' ? 'text-ink' : 'text-ivory'
                      )}
                      aria-hidden
                    />
                  )}
                </span>
                <span className="font-body text-[10px] text-stone whitespace-nowrap">{color}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Occasion */}
      <section>
        <p className="font-body text-sm font-medium text-ink mb-3">
          Occasion <span className="text-stone font-normal">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {occasions.map((occ) => {
            const isSelected = occasion === occ
            return (
              <button
                key={occ}
                type="button"
                onClick={() => setOccasion(isSelected ? null : occ)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-chip font-body text-sm font-medium border transition-colors',
                  isSelected
                    ? 'bg-gold text-ivory border-gold'
                    : 'bg-ivory text-stone border-hairline hover:border-stone hover:text-ink'
                )}
              >
                {occ}
              </button>
            )
          })}
        </div>
      </section>

      {/* Add-ons */}
      {addOns.length > 0 && (
        <section>
          <p className="font-body text-sm font-medium text-ink mb-3">Add-ons</p>
          <div className="space-y-2">
            {addOns.map((ao) => {
              const isSelected = selectedAddOns.some((a) => a.id === ao.id)
              return (
                <button
                  key={ao.id}
                  type="button"
                  onClick={() => toggleAddOn(ao)}
                  className={clsx(
                    'w-full flex items-center justify-between px-4 py-3 rounded-card border transition-all text-left',
                    isSelected
                      ? 'border-gold bg-gold-tint'
                      : 'border-hairline bg-ivory hover:border-stone'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={clsx(
                        'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                        isSelected ? 'bg-gold border-gold' : 'border-hairline'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-ivory" aria-hidden />}
                    </div>
                    <span className="font-body text-sm text-ink">{ao.name}</span>
                  </div>
                  <span className="font-body text-sm font-medium text-stone tabular-nums">
                    + Rs. {ao.price.toLocaleString('en-PK')}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
