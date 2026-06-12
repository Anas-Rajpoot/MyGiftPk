'use client'

import Image from 'next/image'
import { clsx } from 'clsx'
import { Gift, Check } from 'lucide-react'
import { useGiftStore } from '@/lib/stores/gift'
import type { GiftBox } from '@/lib/wp/queries/gift'

interface StepBoxProps {
  boxes: GiftBox[]
}

export function StepBox({ boxes }: StepBoxProps) {
  const boxId = useGiftStore((s) => s.boxId)
  const selectBox = useGiftStore((s) => s.selectBox)

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="font-display text-2xl uppercase tracking-wide text-ink mb-0.5">
        Choose Your Box
      </h1>
      <p className="font-body text-sm text-stone mb-6">
        The base of your custom gift — pick the size that fits.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {boxes.map((box) => {
          const isSelected = boxId === box.id
          const imgSrc = box.image?.sourceUrl ?? null
          return (
            <button
              key={box.id}
              type="button"
              onClick={() => selectBox({ ...box, image: imgSrc })}
              className={clsx(
                'relative text-left rounded-card border-2 overflow-hidden transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
                isSelected
                  ? 'border-gold bg-gold-tint shadow-sm'
                  : 'border-hairline bg-ivory hover:border-stone'
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-ivory" aria-hidden />
                </div>
              )}

              <div className="aspect-square bg-cream flex items-center justify-center overflow-hidden">
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={box.name}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Gift
                    className={clsx(
                      'h-16 w-16 transition-colors',
                      isSelected ? 'text-gold' : 'text-hairline'
                    )}
                    aria-hidden
                  />
                )}
              </div>

              <div className="p-4">
                <h2 className="font-display text-lg uppercase tracking-wide text-ink leading-none mb-1">
                  {box.name}
                </h2>
                <p className="font-body text-xs text-stone">
                  Fits up to {box.capacity} item{box.capacity !== 1 ? 's' : ''}
                </p>
                <p className="font-body text-base font-semibold text-wine mt-2">
                  Rs. {box.basePrice.toLocaleString('en-PK')}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
