import type { Metadata } from 'next'
import { ContentPageLayout } from '@/components/layout/ContentPageLayout'
import { Tabs } from '@/components/ui/Tabs'
import { SizeTableClient } from '@/components/content/SizeTableClient'
import { WOMEN_SIZES, MEN_SIZES, KIDS_SIZES } from '@/lib/content/size-charts'
import { breadcrumbSchema } from '@/lib/seo/schema'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'

export const metadata: Metadata = {
  title: 'Size Guide — Women, Men & Kids',
  description: 'Find your perfect fit with MYGIFT\'s size guide for women, men and kids. Includes measurement tips and fabric yardage guide.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE}/size-guide` },
}

function HowToMeasure() {
  const steps = [
    {
      num: '1',
      title: 'Chest',
      desc: 'Measure around the fullest part of your chest, keeping the tape horizontal and parallel to the ground.',
    },
    {
      num: '2',
      title: 'Waist',
      desc: 'Measure around your natural waistline — the narrowest part of your torso, usually above your navel.',
    },
    {
      num: '3',
      title: 'Hip',
      desc: 'Measure around the fullest part of your hips and seat, keeping the tape parallel to the ground.',
    },
  ]

  return (
    <div className="mt-6 space-y-2">
      <h3 className="font-body font-semibold text-[17px] text-ink">How to Measure</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
        {steps.map((step) => (
          <div key={step.num} className="flex gap-3 p-4 rounded-card border border-hairline bg-ivory">
            <span className="font-display text-3xl leading-none text-wine shrink-0">
              {step.num}
            </span>
            <div>
              <p className="font-body font-semibold text-sm text-ink">{step.title}</p>
              <p className="font-body text-xs text-stone leading-relaxed mt-1">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FabricGuide({ rows }: { rows: { name: string; twopiece: string; threepiece: string }[] }) {
  return (
    <div className="mt-6 space-y-2">
      <h3 className="font-body font-semibold text-[17px] text-ink">Fabric Yardage Guide</h3>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-[320px] px-4 sm:px-0">
          <table className="w-full border-collapse text-sm mt-3">
            <thead>
              <tr>
                <th className="bg-wine text-ivory font-body font-semibold px-3 py-2.5 text-left">Style</th>
                <th className="bg-wine text-ivory font-body font-semibold px-3 py-2.5 text-left">Yardage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.name}>
                  <td className={`border border-hairline px-3 py-2 font-body text-ink ${i % 2 === 0 ? 'bg-ivory' : 'bg-cream'}`}>
                    {row.name}
                  </td>
                  <td className={`border border-hairline px-3 py-2 font-body text-stone ${i % 2 === 0 ? 'bg-ivory' : 'bg-cream'}`}>
                    {row.twopiece || row.threepiece}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SizeTabContent({ chart }: { chart: typeof WOMEN_SIZES }) {
  return (
    <div className="space-y-0">
      <SizeTableClient chart={chart} />
      <FabricGuide rows={chart.fabricGuide} />
      <HowToMeasure />
    </div>
  )
}

export default function SizeGuidePage() {
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: SITE },
    { name: 'Size Guide', url: `${SITE}/size-guide` },
  ])

  const tabs = [
    {
      id: 'women',
      label: 'Women',
      content: <SizeTabContent chart={WOMEN_SIZES} />,
    },
    {
      id: 'men',
      label: 'Men',
      content: <SizeTabContent chart={MEN_SIZES} />,
    },
    {
      id: 'kids',
      label: 'Kids',
      content: <SizeTabContent chart={KIDS_SIZES} />,
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ContentPageLayout
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Size Guide' }]}
        heading="Size Guide"
        intro="All measurements are in centimetres unless toggled. When between sizes, size up for a more comfortable fit."
      >
        <div className="max-w-[760px]">
          <Tabs tabs={tabs} defaultTabId="women" />
        </div>
      </ContentPageLayout>
    </>
  )
}
