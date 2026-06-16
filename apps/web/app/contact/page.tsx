import type { Metadata } from 'next'
import { Phone, Mail, Clock } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { RibbonHeading } from '@/components/ui/RibbonHeading'
import { ContactForm } from '@/components/content/ContactForm'
import { fetchGlobalOptions, DEFAULT_GLOBAL } from '@/lib/wp/home-content'
import { breadcrumbSchema, localBusinessSchema } from '@/lib/seo/schema'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with MYGIFT. We are here to help with orders, gift inquiries, and anything else.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE}/contact` },
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

export default async function ContactPage() {
  const opts = (await fetchGlobalOptions()) ?? DEFAULT_GLOBAL
  const contact = opts.footer?.contact ?? {}
  const whatsapp = opts.footer?.socials?.whatsapp

  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: SITE },
    { name: 'Contact Us', url: `${SITE}/contact` },
  ])

  const business = localBusinessSchema(contact)

  // Extract phone number digits for WhatsApp
  const waNumber = whatsapp?.replace(/\D/g, '') ?? ''

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }}
      />

      <div className="bg-cream min-h-screen">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Breadcrumbs
            items={[{ label: 'Home', href: '/' }, { label: 'Contact Us' }]}
            className="mb-6"
          />

          <RibbonHeading as="h1" className="text-[clamp(28px,5vw,40px)] mb-2 max-w-[760px]">
            Contact Us
          </RibbonHeading>
          <p className="font-body text-base text-stone leading-relaxed mt-4 mb-10 max-w-[760px]">
            We would love to hear from you. Reach out for order help, gift inquiries, or anything else.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 lg:gap-16 max-w-[1000px]">

            {/* Left: Contact info card */}
            <aside className="space-y-6">
              <div className="rounded-card border border-hairline bg-ivory p-6 space-y-5">
                {/* WhatsApp */}
                {waNumber && (
                  <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 h-12 px-5 bg-whatsapp text-ivory rounded-input font-body font-semibold text-[15px] hover:bg-whatsapp-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    WhatsApp Us
                  </a>
                )}

                <div className="space-y-3 pt-1">
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-3 font-body text-sm text-stone hover:text-wine transition-colors"
                    >
                      <Phone className="h-4 w-4 shrink-0" aria-hidden />
                      <span>{contact.phone}</span>
                    </a>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-3 font-body text-sm text-stone hover:text-wine transition-colors"
                    >
                      <Mail className="h-4 w-4 shrink-0" aria-hidden />
                      <span>{contact.email}</span>
                    </a>
                  )}
                  <div className="flex items-center gap-3 font-body text-sm text-stone">
                    <Clock className="h-4 w-4 shrink-0" aria-hidden />
                    <span>Mon–Sat: 9am–7pm PKT</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right: Form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
