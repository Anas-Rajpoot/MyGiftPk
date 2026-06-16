import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { RibbonHeading } from '@/components/ui/RibbonHeading'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface ContentPageLayoutProps {
  breadcrumbs: BreadcrumbItem[]
  heading: string
  intro?: string
  children: React.ReactNode
}

export function ContentPageLayout({
  breadcrumbs,
  heading,
  intro,
  children,
}: ContentPageLayoutProps) {
  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Breadcrumbs items={breadcrumbs} className="mb-6" />
        <div className="max-w-[760px]">
          <RibbonHeading as="h1" className="text-[clamp(28px,5vw,40px)] mb-2">
            {heading}
          </RibbonHeading>
          {intro && (
            <p className="font-body text-base text-stone leading-relaxed mt-4 mb-8">{intro}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
