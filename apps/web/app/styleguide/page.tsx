import { RibbonHeading } from '@/components/ui/RibbonHeading'
import { Badge } from '@/components/ui/Badge'
import { Skeleton, SkeletonText, SkeletonProductCard } from '@/components/ui/Skeleton'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  DrawerDemo, ModalDemo, AccordionDemo, TabsDemo,
  InputDemo, SelectDemo, QtyStepperDemo, FilterChipDemo,
  ToastDemo, ProductCardDemo,
} from './InteractiveDemos'

export const metadata = {
  title: 'Styleguide | MYGIFT',
  robots: { index: false, follow: false },
}

const tokens = [
  { name: '--wine',      label: 'wine (primary)',   hex: '#7E2B36', textClass: 'text-ivory' },
  { name: '--wine-deep', label: 'wine-deep',        hex: '#5C1F28', textClass: 'text-ivory' },
  { name: '--wine-tint', label: 'wine-tint',        hex: '#F6ECEE', textClass: 'text-ink'   },
  { name: '--cream',     label: 'cream (bg)',       hex: '#FAF8F5', textClass: 'text-ink'   },
  { name: '--ivory',     label: 'ivory (surface)',  hex: '#FFFFFF', textClass: 'text-ink'   },
  { name: '--ink',       label: 'ink (text)',       hex: '#1F1A17', textClass: 'text-ivory' },
  { name: '--stone',     label: 'stone (muted)',    hex: '#8A8178', textClass: 'text-ivory' },
  { name: '--hairline',  label: 'hairline (border)',hex: '#E8E2DA', textClass: 'text-ink'   },
  { name: '--gold',      label: 'gold (gifts only)',hex: '#C9A24B', textClass: 'text-ivory' },
  { name: '--gold-tint', label: 'gold-tint',        hex: '#F8F1E2', textClass: 'text-ink'   },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-20">
      <RibbonHeading as="h2" className="text-3xl mb-8">{title}</RibbonHeading>
      {children}
    </section>
  )
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-ivory rounded-card border border-hairline p-6 ${className ?? ''}`}>
      {children}
    </div>
  )
}

export default function StyleguidePage() {
  return (
    <div className="max-w-[1320px] mx-auto px-6 py-16">

      <RibbonHeading as="h1" className="text-6xl mb-4">MYGIFT STYLEGUIDE</RibbonHeading>
      <p className="text-stone font-body mb-4">
        Phase 1 component library — all tokens, typography, and UI components.
      </p>
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Styleguide' }]}
        className="mb-16"
      />

      {/* COLORS */}
      <Section title="COLOR TOKENS">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {tokens.map((t) => (
            <div key={t.name} className="rounded-card overflow-hidden border border-hairline">
              <div className={`h-20 flex items-end p-3 ${t.textClass}`} style={{ backgroundColor: t.hex }}>
                <span className="text-xs font-body font-medium">{t.hex}</span>
              </div>
              <div className="bg-ivory p-3">
                <p className="text-xs font-body text-stone">{t.name}</p>
                <p className="text-sm font-body text-ink font-medium">{t.label}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* TYPOGRAPHY */}
      <Section title="TYPOGRAPHY">
        <Card className="space-y-8">
          {[
            { label: 'Bebas Neue 64px — Hero', cls: 'font-display text-[64px] leading-none uppercase', sample: 'MYGIFT — Build a Gift' },
            { label: 'Bebas Neue 40px — Section', cls: 'font-display text-[40px] leading-none uppercase', sample: 'NEW ARRIVALS' },
            { label: 'Bebas Neue 24px — Tile', cls: 'font-display text-[24px] leading-none uppercase', sample: 'WOMEN · UNSTITCHED' },
            { label: 'Poppins 600 15px — Button', cls: 'font-body font-semibold text-[15px] tracking-wider', sample: 'Add to Cart · Build a Gift · Send to Pakistan' },
            { label: 'Poppins 400 16px — Body', cls: 'font-body text-base leading-relaxed max-w-lg', sample: 'MYGIFT delivers clothing and custom gift boxes across Pakistan. Shop stitched & unstitched for Women, Men and Kids.' },
            { label: 'Poppins 400 14px — Caption', cls: 'font-body text-sm text-stone', sample: 'Free shipping on orders over Rs. 3,000 · Nationwide delivery' },
          ].map(({ label, cls, sample }) => (
            <div key={label}>
              <p className="text-xs text-stone font-body mb-2">{label}</p>
              <p className={`text-ink ${cls}`}>{sample}</p>
            </div>
          ))}
        </Card>
      </Section>

      {/* RIBBON HEADINGS */}
      <Section title="RIBBON LINE">
        <Card className="space-y-10">
          <div>
            <p className="text-xs text-stone font-body mb-3">h1 · Left · Wine</p>
            <RibbonHeading as="h1" align="left" className="text-5xl">HERO HEADING</RibbonHeading>
          </div>
          <div>
            <p className="text-xs text-stone font-body mb-3">h2 · Center · Wine</p>
            <RibbonHeading as="h2" align="center" className="text-4xl">SECTION TITLE</RibbonHeading>
          </div>
          <div>
            <p className="text-xs text-stone font-body mb-3">h3 · Left · Gold (gift context)</p>
            <RibbonHeading as="h3" align="left" gold className="text-3xl">BUILD A GIFT</RibbonHeading>
          </div>
        </Card>
      </Section>

      {/* BADGES */}
      <Section title="BADGES">
        <Card className="flex flex-wrap gap-4">
          <Badge variant="sale" />
          <Badge variant="new" />
          <Badge variant="gift" />
        </Card>
      </Section>

      {/* BUTTONS */}
      <Section title="BUTTONS">
        <Card className="space-y-6">
          <div className="flex flex-wrap gap-3 items-center">
            <DrawerDemo />
            <ModalDemo />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Static variants for visual reference */}
            {/* primary handled by DrawerDemo above */}
            <span className="font-body text-xs text-stone self-center">All states:</span>
            <button className="inline-flex items-center h-12 px-6 bg-wine text-ivory rounded-input font-body font-semibold text-[15px] tracking-wide">Primary</button>
            <button className="inline-flex items-center h-12 px-6 bg-transparent text-wine border border-wine rounded-input font-body font-semibold text-[15px] tracking-wide">Secondary</button>
            <button className="inline-flex items-center h-12 px-6 text-ink font-body font-semibold text-[15px] underline">Ghost</button>
            <button disabled className="inline-flex items-center h-12 px-6 bg-wine text-ivory rounded-input font-body font-semibold text-[15px] tracking-wide opacity-40 cursor-not-allowed">Disabled</button>
          </div>
          <ToastDemo />
        </Card>
      </Section>

      {/* FORM CONTROLS */}
      <Section title="FORM CONTROLS">
        <div className="grid md:grid-cols-2 gap-6">
          <Card><InputDemo /></Card>
          <Card className="space-y-6">
            <SelectDemo />
            <div>
              <p className="font-body text-sm font-medium text-ink mb-1.5">Quantity</p>
              <QtyStepperDemo />
            </div>
          </Card>
        </div>
      </Section>

      {/* FILTER CHIPS */}
      <Section title="FILTER CHIPS">
        <Card><FilterChipDemo /></Card>
      </Section>

      {/* ACCORDION */}
      <Section title="ACCORDION">
        <Card className="max-w-xl"><AccordionDemo /></Card>
      </Section>

      {/* TABS */}
      <Section title="TABS">
        <Card><TabsDemo /></Card>
      </Section>

      {/* SKELETON */}
      <Section title="SKELETONS">
        <Card className="grid sm:grid-cols-3 gap-6">
          <div className="space-y-3">
            <p className="text-xs text-stone font-body mb-2">Text lines</p>
            <SkeletonText lines={4} />
          </div>
          <div className="space-y-3">
            <p className="text-xs text-stone font-body mb-2">Product card</p>
            <SkeletonProductCard />
          </div>
          <div className="space-y-3">
            <p className="text-xs text-stone font-body mb-2">Various shapes</p>
            <Skeleton className="h-32 w-full" rounded="card" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-8" rounded="full" />
          </div>
        </Card>
      </Section>

      {/* EMPTY STATE */}
      <Section title="EMPTY STATE">
        <Card>
          <EmptyState
            heading="Your cart is waiting for something lovely."
            description="Browse our collection of clothing and custom gift boxes for your special someone."
            cta={{ label: 'Shop Now', href: '/shop' }}
          />
        </Card>
      </Section>

      {/* PRODUCT CARDS */}
      <Section title="PRODUCT CARDS">
        <ProductCardDemo />
      </Section>

      {/* BORDER RADIUS */}
      <Section title="BORDER RADIUS">
        <Card>
          <div className="flex gap-6 flex-wrap">
            {[
              { label: 'rounded-card (12px)', cls: 'rounded-card' },
              { label: 'rounded-input (8px)', cls: 'rounded-input' },
              { label: 'rounded-chip (999px)', cls: 'rounded-chip' },
            ].map(({ label, cls }) => (
              <div key={cls} className="flex flex-col items-center gap-2">
                <div className={`w-20 h-20 bg-wine-tint border border-wine ${cls}`} />
                <p className="text-xs text-stone font-body text-center">{label}</p>
              </div>
            ))}
          </div>
        </Card>
      </Section>

    </div>
  )
}
