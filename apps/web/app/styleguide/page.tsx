import { RibbonHeading } from '@/components/ui/RibbonHeading'

export const metadata = { title: 'Styleguide | MYGIFT' }

const tokens = [
  { name: '--wine', label: 'wine (primary)', hex: '#7E2B36', textClass: 'text-ivory' },
  { name: '--wine-deep', label: 'wine-deep', hex: '#5C1F28', textClass: 'text-ivory' },
  { name: '--wine-tint', label: 'wine-tint', hex: '#F6ECEE', textClass: 'text-ink' },
  { name: '--cream', label: 'cream (bg)', hex: '#FAF8F5', textClass: 'text-ink' },
  { name: '--ivory', label: 'ivory (surface)', hex: '#FFFFFF', textClass: 'text-ink' },
  { name: '--ink', label: 'ink (text)', hex: '#1F1A17', textClass: 'text-ivory' },
  { name: '--stone', label: 'stone (muted)', hex: '#8A8178', textClass: 'text-ivory' },
  { name: '--hairline', label: 'hairline (border)', hex: '#E8E2DA', textClass: 'text-ink' },
  { name: '--gold', label: 'gold (gifts only)', hex: '#C9A24B', textClass: 'text-ivory' },
  { name: '--gold-tint', label: 'gold-tint', hex: '#F8F1E2', textClass: 'text-ink' },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <RibbonHeading as="h2" className="text-3xl mb-8">
        {title}
      </RibbonHeading>
      {children}
    </section>
  )
}

export default function StyleguidePage() {
  return (
    <div className="max-w-[1320px] mx-auto px-6 py-16">
      <RibbonHeading as="h1" className="text-6xl mb-4">
        MYGIFT STYLEGUIDE
      </RibbonHeading>
      <p className="text-stone mb-16">Design tokens, typography, and components.</p>

      {/* Colors */}
      <Section title="COLOR TOKENS">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {tokens.map((t) => (
            <div key={t.name} className="rounded-card overflow-hidden border border-hairline">
              <div
                className={`h-20 flex items-end p-3 ${t.textClass}`}
                style={{ backgroundColor: t.hex }}
              >
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

      {/* Typography */}
      <Section title="TYPOGRAPHY">
        <div className="space-y-8 bg-ivory rounded-card p-8 border border-hairline">
          <div>
            <p className="text-xs text-stone font-body mb-2">Bebas Neue — Hero (64px)</p>
            <p className="font-display text-[64px] leading-none uppercase text-ink">
              MYGIFT — Build a Gift
            </p>
          </div>
          <div>
            <p className="text-xs text-stone font-body mb-2">Bebas Neue — Section (40px)</p>
            <p className="font-display text-[40px] leading-none uppercase text-ink">
              NEW ARRIVALS
            </p>
          </div>
          <div>
            <p className="text-xs text-stone font-body mb-2">Bebas Neue — Tile (24px)</p>
            <p className="font-display text-[24px] leading-none uppercase text-ink">
              WOMEN · UNSTITCHED
            </p>
          </div>
          <div>
            <p className="text-xs text-stone font-body mb-2">Poppins 600 — Button (15px)</p>
            <p className="font-body font-semibold text-[15px] tracking-wider text-ink">
              Add to Cart · Build a Gift · Send to Pakistan
            </p>
          </div>
          <div>
            <p className="text-xs text-stone font-body mb-2">Poppins 400 — Body (16px, 1.6 lh)</p>
            <p className="font-body text-base leading-relaxed text-ink max-w-lg">
              MYGIFT delivers clothing and custom gift boxes across Pakistan. Shop stitched &
              unstitched for Women, Men and Kids — or build a personalised gift box for someone
              special.
            </p>
          </div>
          <div>
            <p className="text-xs text-stone font-body mb-2">Poppins 400 — Caption (14px)</p>
            <p className="font-body text-sm text-stone">
              Free shipping on orders over Rs. 3,000 · Nationwide delivery
            </p>
          </div>
        </div>
      </Section>

      {/* Ribbon Headings */}
      <Section title="RIBBON LINE">
        <div className="space-y-12 bg-ivory rounded-card p-8 border border-hairline">
          <div>
            <p className="text-xs text-stone font-body mb-4">h1 — Left align (wine)</p>
            <RibbonHeading as="h1" align="left" className="text-5xl">
              HERO HEADING
            </RibbonHeading>
          </div>
          <div>
            <p className="text-xs text-stone font-body mb-4">h2 — Center align (wine)</p>
            <RibbonHeading as="h2" align="center" className="text-4xl">
              SECTION TITLE
            </RibbonHeading>
          </div>
          <div>
            <p className="text-xs text-stone font-body mb-4">h3 — Left align (gold — gift context)</p>
            <RibbonHeading as="h3" align="left" gold className="text-3xl">
              BUILD A GIFT
            </RibbonHeading>
          </div>
        </div>
      </Section>

      {/* Spacing + Radius */}
      <Section title="BORDER RADIUS">
        <div className="flex gap-6 flex-wrap">
          {[
            { label: 'radius-card (12px)', cls: 'rounded-card' },
            { label: 'radius-input (8px)', cls: 'rounded-input' },
            { label: 'radius-chip (999px)', cls: 'rounded-chip' },
          ].map(({ label, cls }) => (
            <div key={cls} className="flex flex-col items-center gap-2">
              <div className={`w-24 h-24 bg-wine-tint border border-wine ${cls}`} />
              <p className="text-xs text-stone font-body">{label}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
