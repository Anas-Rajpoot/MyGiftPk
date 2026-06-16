import Link from 'next/link'
import { Truck, ShieldCheck, PackageCheck } from 'lucide-react'
import { RibbonHeading } from '@/components/ui/RibbonHeading'

interface AuthShellProps {
  title: string
  subtitle: string
  children: React.ReactNode
}

const TRUST = [
  { icon: Truck, label: 'Free shipping over Rs. 3,000' },
  { icon: PackageCheck, label: 'Track every order in real time' },
  { icon: ShieldCheck, label: 'Secure checkout & data' },
]

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="grid lg:grid-cols-[1.05fr_1fr] min-h-[calc(100vh-120px)] bg-cream">
      {/* ── Brand panel (desktop only) ──────────────────────────────── */}
      <aside
        className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 xl:p-16 text-ivory"
        style={{
          background:
            'radial-gradient(120% 120% at 0% 0%, #7E2B36 0%, #5C1F28 55%, #44161d 100%)',
        }}
      >
        {/* Decorative ribbon strokes */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          aria-hidden
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, #FFFFFF 0px, #FFFFFF 1px, transparent 1px, transparent 26px)',
          }}
        />
        {/* Gold glow accent */}
        <div
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
          aria-hidden
          style={{ background: 'radial-gradient(circle, #C9A24B 0%, transparent 70%)' }}
        />

        {/* Brand mark */}
        <Link href="/" className="relative z-10 inline-flex items-center gap-2.5 w-fit">
          <span className="block w-1.5 h-7 rounded-sm bg-gold" />
          <span className="font-display text-2xl uppercase tracking-[0.2em]">MYGIFT</span>
        </Link>

        {/* Tagline */}
        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-4xl xl:text-5xl uppercase leading-[1.05] tracking-wide">
            Gifts & clothing,
            <br />
            delivered with love
            <br />
            across Pakistan.
          </h2>
          <div className="flex items-center gap-2 mt-5" aria-hidden>
            <span className="block h-px w-12 bg-gold" />
            <span className="block w-1.5 h-1.5 rounded-full bg-gold" />
          </div>
          <p className="font-body text-ivory/75 text-[15px] leading-relaxed mt-5">
            Sign in to track orders, save your favourites, and build custom gift
            boxes for the people you love.
          </p>
        </div>

        {/* Trust points */}
        <ul className="relative z-10 space-y-3.5">
          {TRUST.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 font-body text-sm text-ivory/85">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-ivory/10 border border-ivory/15 shrink-0">
                <Icon className="h-4 w-4 text-gold" aria-hidden />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </aside>

      {/* ── Form area ───────────────────────────────────────────────── */}
      <main className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile brand mark */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <span className="block w-1.5 h-6 rounded-sm bg-wine" />
            <span className="font-display text-xl uppercase tracking-[0.2em] text-ink">MYGIFT</span>
          </Link>

          <RibbonHeading as="h1" align="left" className="text-[34px] sm:text-[40px]">
            {title}
          </RibbonHeading>
          <p className="font-body text-sm text-stone mt-3 mb-7">{subtitle}</p>

          {children}
        </div>
      </main>
    </div>
  )
}
