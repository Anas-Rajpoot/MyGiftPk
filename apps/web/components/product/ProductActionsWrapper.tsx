'use client'

import { useRef, useState } from 'react'
import type { ProductFull } from '@/lib/wp/queries/shop'
import { ProductActions } from './ProductActions'
import { StickyATC } from './StickyATC'
import { SizeGuideModal } from './SizeGuideModal'

interface ProductActionsWrapperProps {
  product: ProductFull
}

export function ProductActionsWrapper({ product }: ProductActionsWrapperProps) {
  const actionsRef = useRef<HTMLDivElement>(null)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  return (
    <>
      <div ref={actionsRef}>
        <ProductActions product={product} onSizeGuide={() => setSizeGuideOpen(true)} />
      </div>
      <StickyATC product={product} actionsRef={actionsRef} />
      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </>
  )
}
