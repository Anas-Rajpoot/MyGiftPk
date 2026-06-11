'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { Modal } from '@/components/ui/Modal'
import { Accordion } from '@/components/ui/Accordion'
import { Tabs } from '@/components/ui/Tabs'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { QtyStepper } from '@/components/ui/QtyStepper'
import { FilterChip } from '@/components/ui/FilterChip'
import { ProductCard } from '@/components/product/ProductCard'
import { toast } from '@/lib/toast'

/* ── Drawer demo ─────────────────── */
export function DrawerDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Cart Drawer</Button>
      <Drawer isOpen={open} onClose={() => setOpen(false)} title="Your Cart">
        <div className="p-6 space-y-4">
          <p className="font-body text-stone text-sm">3 items in your cart</p>
          <div className="flex items-center gap-3 p-3 border border-hairline rounded-card">
            <div className="w-14 h-14 bg-wine-tint rounded-input shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-body font-medium text-ink text-sm truncate">Mock Lawn Suit</p>
              <p className="font-body text-wine text-sm font-semibold">Rs. 2,400</p>
            </div>
          </div>
          <div className="border-t border-hairline pt-4">
            <div className="flex justify-between font-body font-semibold text-ink mb-4">
              <span>Subtotal</span>
              <span>Rs. 5,400</span>
            </div>
            <Button className="w-full">Checkout →</Button>
          </div>
        </div>
      </Drawer>
    </>
  )
}

/* ── Modal demo ──────────────────── */
export function ModalDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Size Guide">
        <p className="font-body text-stone text-sm">
          Our sizes follow Pakistani standard measurements. Use the chart below to find your fit.
        </p>
        <table className="mt-4 w-full font-body text-sm border-collapse">
          <thead>
            <tr className="bg-cream">
              <th className="text-left p-2 border border-hairline font-semibold text-ink">Size</th>
              <th className="text-left p-2 border border-hairline font-semibold text-ink">Chest</th>
              <th className="text-left p-2 border border-hairline font-semibold text-ink">Waist</th>
            </tr>
          </thead>
          <tbody>
            {['S', 'M', 'L', 'XL'].map((s, i) => (
              <tr key={s}>
                <td className="p-2 border border-hairline text-ink font-medium">{s}</td>
                <td className="p-2 border border-hairline text-stone">{34 + i * 2}&quot;</td>
                <td className="p-2 border border-hairline text-stone">{28 + i * 2}&quot;</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      </Modal>
    </>
  )
}

/* ── Accordion demo ──────────────── */
export function AccordionDemo() {
  return (
    <Accordion
      items={[
        {
          id: 'fabric',
          title: 'Fabric & Care',
          content: '100% lawn cotton. Machine wash cold, gentle cycle. Do not bleach. Tumble dry low.',
        },
        {
          id: 'sizing',
          title: 'Sizing & Fit',
          content: 'This piece runs true to size. We recommend ordering your usual size. Available in Stitched and Unstitched.',
        },
        {
          id: 'shipping',
          title: 'Shipping & Returns',
          content: 'Free shipping on orders over Rs. 3,000. Delivery within 3–5 working days across Pakistan. 7-day return policy on unstitched fabric.',
        },
      ]}
      defaultOpenId="fabric"
    />
  )
}

/* ── Tabs demo ───────────────────── */
export function TabsDemo() {
  return (
    <Tabs
      tabs={[
        {
          id: 'new',
          label: 'New Arrivals',
          content: <p className="font-body text-stone text-sm">Fresh pieces from our latest collection.</p>,
        },
        {
          id: 'bestsellers',
          label: 'Best Sellers',
          content: <p className="font-body text-stone text-sm">Our most loved styles, season after season.</p>,
        },
        {
          id: 'sale',
          label: 'On Sale',
          content: <p className="font-body text-stone text-sm">Limited-time discounts on selected pieces.</p>,
        },
      ]}
    />
  )
}

/* ── Input demo ──────────────────── */
export function InputDemo() {
  const [val, setVal] = useState('')
  return (
    <div className="space-y-4">
      <Input
        label="Email address"
        type="email"
        placeholder="you@example.com"
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />
      <Input
        label="Phone number"
        type="tel"
        placeholder="+92 300 0000000"
        hint="We'll send order updates via SMS"
      />
      <Input
        label="Card message"
        placeholder="Happy Birthday!"
        error="Message must be at least 4 characters"
      />
      <Input label="Disabled field" defaultValue="Read only" disabled />
    </div>
  )
}

/* ── Select demo ─────────────────── */
export function SelectDemo() {
  return (
    <div className="space-y-4">
      <Select
        label="Shirt size"
        placeholder="Select a size"
        options={['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => ({ value: s, label: s }))}
      />
      <Select
        label="Delivery city"
        placeholder="Choose city"
        options={['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta'].map((c) => ({
          value: c.toLowerCase(),
          label: c,
        }))}
        error="Please select a delivery city"
      />
    </div>
  )
}

/* ── QtyStepper demo ─────────────── */
export function QtyStepperDemo() {
  const [qty, setQty] = useState(1)
  return (
    <div className="flex items-center gap-4">
      <QtyStepper value={qty} onChange={setQty} min={1} max={10} />
      <span className="font-body text-stone text-sm">Max: 10</span>
    </div>
  )
}

/* ── FilterChip demo ─────────────── */
export function FilterChipDemo() {
  const filters = ['Stitched', 'Unstitched', 'Lawn', 'Chiffon', 'Embroidered', 'On Sale']
  const [active, setActive] = useState<string[]>(['Stitched'])

  const toggle = (f: string) =>
    setActive((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <FilterChip
          key={f}
          label={f}
          selected={active.includes(f)}
          onToggle={() => toggle(f)}
          onRemove={() => toggle(f)}
        />
      ))}
    </div>
  )
}

/* ── Toast demo ──────────────────── */
export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => toast.success('Item added to cart')} variant="secondary" size="sm">
        Toast: Success
      </Button>
      <Button onClick={() => toast.error('Out of stock — please try another size')} variant="secondary" size="sm">
        Toast: Error
      </Button>
      <Button onClick={() => toast.info('Free gift wrapping on orders over Rs. 5,000')} variant="secondary" size="sm">
        Toast: Info
      </Button>
    </div>
  )
}

/* ── ProductCard demo ────────────── */
export function ProductCardDemo() {
  const [wishlisted, setWishlisted] = useState<Record<string, boolean>>({})

  const products = [
    { slug: 'red-lawn-3pc', name: 'Red Lawn 3-Piece Unstitched', price: 'Rs. 2,800', salePrice: 'Rs. 2,200', badge: 'sale' as const },
    { slug: 'ivory-kurta', name: 'Ivory Embroidered Kurta', price: 'Rs. 4,500', badge: 'new' as const },
    { slug: 'gift-box-florals', name: 'Custom Gift Box — Florals', price: 'Rs. 1,800', badge: 'gift' as const },
    { slug: 'chiffon-dupatta', name: 'Chiffon Dupatta Set', price: 'Rs. 1,200', salePrice: 'Rs. 950' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((p) => (
        <ProductCard
          key={p.slug}
          {...p}
          isWishlisted={!!wishlisted[p.slug]}
          onWishlist={() => setWishlisted((prev) => ({ ...prev, [p.slug]: !prev[p.slug] }))}
          onAddToCart={() => toast.success(`${p.name} added to cart`)}
          onQuickView={() => toast.info(`Quick view: ${p.name}`)}
        />
      ))}
    </div>
  )
}
