/**
 * Native content layer — reads ALL editor-managed content from the mygift-core
 * plugin's REST endpoints (the free, ACF-Pro-free replacement). Every fetcher
 * returns `null` when WordPress is unreachable; callers fall back to the
 * DEFAULT_* constants below so the site renders fully in MOCK_MODE / dev.
 *
 * Endpoints (all under {WP}/wp-json/mygift/v1):
 *   /home-content          → { announcementBar, blocks[] }   (Homepage Builder)
 *   /global                → { freeShippingThreshold, giftWrapPrice, footer }
 *   /gift-builder          → GiftBuilderOptions
 *   /faqs                  → { faqItems[] }
 *   /careers               → { jobListings[] }
 *   /category-intro?slug=  → { intro }
 */

import type { HomeBlock, HeroSlide } from '@/lib/wp/queries/home'
import type { AnnouncementBarData, FooterData } from '@/lib/wp/queries/global'
import type { GiftBuilderOptions } from '@/lib/wp/queries/gift'
import type { FaqItem, JobListing } from '@/lib/wp/queries/pages'

/* ── Shapes ─────────────────────────────────────────────────────────────── */

export interface GiftBannerContent {
  heading: string
  subtext: string
  ctaLabel: string
  ctaLink: string
}

export interface HomeContent {
  announcementBar: AnnouncementBarData
  blocks: HomeBlock[]
}

export interface GlobalContent {
  freeShippingThreshold: number
  giftWrapPrice: number
  footer: FooterData
}

/* ── REST helper ────────────────────────────────────────────────────────── */

const MOCK_MODE = process.env.MOCK_MODE === 'true'

function getWpBaseUrl(): string | null {
  const graphqlUrl = process.env.WP_GRAPHQL_URL
  if (!graphqlUrl) return null
  try {
    return new URL(graphqlUrl).origin
  } catch {
    return null
  }
}

/**
 * GET a mygift-core REST endpoint. Returns null (→ caller uses DEFAULT_*) in
 * MOCK_MODE, when WP is not configured/reachable, or when the response fails an
 * optional shape check (guards against a stale plugin returning an old shape).
 */
async function fetchContent<T>(
  path: string,
  tags: string[],
  isValid?: (data: unknown) => boolean
): Promise<T | null> {
  if (MOCK_MODE) return null
  const base = getWpBaseUrl()
  if (!base) return null
  try {
    const res = await fetch(`${base}/wp-json/mygift/v1${path}`, {
      next: { revalidate: 3600, tags },
    })
    if (!res.ok) return null
    const data = (await res.json()) as unknown
    if (isValid && !isValid(data)) return null
    return data as T
  } catch {
    return null
  }
}

/* ── Fetchers ───────────────────────────────────────────────────────────── */

export function fetchHomeContent(): Promise<HomeContent | null> {
  return fetchContent<HomeContent>('/home-content', ['home', 'global'], (d) =>
    Array.isArray((d as HomeContent)?.blocks)
  )
}

export function fetchGlobalOptions(): Promise<GlobalContent | null> {
  return fetchContent<GlobalContent>('/global', ['global'], (d) =>
    Array.isArray((d as GlobalContent)?.footer?.columns)
  )
}

export function fetchGiftBuilderOptions(): Promise<GiftBuilderOptions | null> {
  return fetchContent<GiftBuilderOptions>('/gift-builder', ['gift-builder'], (d) =>
    Array.isArray((d as GiftBuilderOptions)?.boxes)
  )
}

export async function fetchFaqItems(): Promise<FaqItem[] | null> {
  const data = await fetchContent<{ faqItems: FaqItem[] }>('/faqs', ['page:faqs'])
  return data?.faqItems ?? null
}

export async function fetchJobListings(): Promise<JobListing[] | null> {
  const data = await fetchContent<{ jobListings: JobListing[] }>('/careers', ['page:careers'])
  return data?.jobListings ?? null
}

export async function fetchCategoryIntro(slug: string): Promise<string> {
  const data = await fetchContent<{ intro: string }>(
    `/category-intro?slug=${encodeURIComponent(slug)}`,
    [`category:${slug}`]
  )
  return data?.intro ?? ''
}

/* ── Defaults (used when WP is unreachable / MOCK_MODE) ─────────────────── */

const HERO_SLIDES: HeroSlide[] = [
  {
    desktopImage: { sourceUrl: '/placeholder-hero-desktop.jpg', altText: 'MYGIFT Collection' },
    mobileImage: { sourceUrl: '/placeholder-hero-mobile.jpg', altText: 'MYGIFT Collection' },
    heading: 'GIFTS THAT FEEL LIKE HOME',
    subtext: 'Clothing & custom gift boxes delivered across Pakistan',
    ctaLabel: 'Shop Now',
    ctaLink: '/shop',
  },
  {
    desktopImage: { sourceUrl: '/placeholder-hero-desktop-2.jpg', altText: 'Build a Gift' },
    mobileImage: { sourceUrl: '/placeholder-hero-mobile-2.jpg', altText: 'Build a Gift' },
    heading: "BUILD A GIFT THEY'LL TREASURE",
    subtext: 'Choose a box, fill it with love, add a personal message',
    ctaLabel: 'Build a Gift',
    ctaLink: '/gift-builder',
  },
]

export const DEFAULT_ANNOUNCEMENT: AnnouncementBarData = {
  enabled: true,
  text: 'Free shipping on orders over Rs. 3,000 · Nationwide delivery',
  link: '/shop',
}

export const DEFAULT_HOME_BLOCKS: HomeBlock[] = [
  { fieldGroupName: 'hero_slider', slides: HERO_SLIDES },
  {
    fieldGroupName: 'category_tiles',
    tiles: [
      { slug: 'women', name: 'Women', image: null },
      { slug: 'men', name: 'Men', image: null },
      { slug: 'kids', name: 'Kids', image: null },
      { slug: 'gifts', name: 'Gifts', image: null, link: '/gifts' },
    ],
  },
  {
    fieldGroupName: 'featured_tabs',
    tabs: [
      { id: 'tab-0', title: 'New Arrivals', categorySlug: 'women' },
      { id: 'tab-1', title: 'Best Sellers', categorySlug: 'men' },
      { id: 'tab-2', title: 'On Sale', categorySlug: 'kids' },
    ],
  },
  {
    fieldGroupName: 'gift_banner',
    heading: "BUILD A GIFT THEY'LL NEVER FORGET",
    subtext:
      'Choose a box, fill it with your favourite treats, add a personal message — delivered anywhere in Pakistan.',
    ctaLabel: 'Start Building',
    ctaLink: '/gift-builder',
  },
  {
    fieldGroupName: 'occasion_chips',
    chips: [
      { label: 'Birthday', slug: 'birthday' },
      { label: 'Anniversary', slug: 'anniversary' },
      { label: 'Eid', slug: 'eid' },
      { label: 'Wedding', slug: 'wedding' },
    ],
  },
  {
    fieldGroupName: 'from_abroad_block',
    heading: 'SENDING A GIFT FROM ABROAD?',
    subtext:
      "You're overseas. Your family is in Pakistan. We bridge that distance — order online, we deliver with love.",
    image: null,
    ctaLabel: 'Send a Gift Home',
    ctaLink: '/gift-builder',
  },
  {
    fieldGroupName: 'trust_row',
    items: [
      { icon: 'truck', heading: 'Free Shipping', subtext: 'On orders over Rs. 3,000 nationwide' },
      { icon: 'gift', heading: 'Gift Wrapping', subtext: 'Premium wrapping available' },
      { icon: 'shield-check', heading: '100% Authentic', subtext: 'Quality guaranteed' },
      { icon: 'map-pin', heading: 'Nationwide Delivery', subtext: 'Delivered to all cities' },
    ],
  },
]

export const DEFAULT_HOME_CONTENT: HomeContent = {
  announcementBar: DEFAULT_ANNOUNCEMENT,
  blocks: DEFAULT_HOME_BLOCKS,
}

export const DEFAULT_GLOBAL: GlobalContent = {
  freeShippingThreshold: 3000,
  giftWrapPrice: 150,
  footer: {
    columns: [
      {
        heading: 'Shop',
        links: [
          { label: 'Women', href: '/category/women' },
          { label: 'Men', href: '/category/men' },
          { label: 'Kids', href: '/category/kids' },
          { label: 'Gifts', href: '/gifts' },
          { label: 'Gift Builder', href: '/gift-builder' },
          { label: 'Sale', href: '/shop?on_sale=1' },
        ],
      },
      {
        heading: 'Help',
        links: [
          { label: 'Track Your Order', href: '/track-order' },
          { label: 'Shipping & Delivery', href: '/shipping-policy' },
          { label: 'Returns & Exchanges', href: '/returns' },
          { label: 'Size Guide', href: '/size-guide' },
          { label: 'FAQs', href: '/faqs' },
          { label: 'Contact Us', href: '/contact' },
        ],
      },
      {
        heading: 'Company',
        links: [
          { label: 'About MYGIFT', href: '/about' },
          { label: 'Blog', href: '/blog' },
          { label: 'Careers', href: '/careers' },
          { label: 'Privacy Policy', href: '/privacy-policy' },
          { label: 'Terms & Conditions', href: '/terms' },
        ],
      },
    ],
    socials: {
      instagram: 'https://instagram.com/mygift.pk',
      facebook: 'https://facebook.com/mygift.pk',
      whatsapp: 'https://wa.me/923000000000',
    },
    contact: {
      phone: '+92 300 000 0000',
      email: 'hello@mygift.pk',
    },
    bottomText: '© MYGIFT. All rights reserved.',
  },
}

export const DEFAULT_GIFT_BUILDER: GiftBuilderOptions = {
  boxes: [
    { id: 1, name: 'Small Gift Box', image: null, basePrice: 500, capacity: 3 },
    { id: 2, name: 'Medium Gift Box', image: null, basePrice: 800, capacity: 5 },
    { id: 3, name: 'Large Gift Box', image: null, basePrice: 1200, capacity: 8 },
  ],
  components: [
    { productId: 101, name: 'Ferrero Rocher 3pc', image: null, price: 850, category: 'Chocolates', stockStatus: 'IN_STOCK', stockQuantity: 20 },
    { productId: 102, name: 'Galaxy Chocolate Bar', image: null, price: 300, category: 'Chocolates', stockStatus: 'IN_STOCK', stockQuantity: 30 },
    { productId: 103, name: 'Cadbury Dairy Milk', image: null, price: 250, category: 'Chocolates', stockStatus: 'IN_STOCK', stockQuantity: 25 },
    { productId: 201, name: 'Jolly Rancher Pack', image: null, price: 450, category: 'Candies', stockStatus: 'IN_STOCK', stockQuantity: 20 },
    { productId: 202, name: 'Gummy Bears 100g', image: null, price: 350, category: 'Candies', stockStatus: 'IN_STOCK', stockQuantity: 20 },
    { productId: 301, name: 'Oreo Pack', image: null, price: 300, category: 'Biscuits', stockStatus: 'IN_STOCK', stockQuantity: 25 },
    { productId: 302, name: 'Lotus Biscoff Pack', image: null, price: 600, category: 'Biscuits', stockStatus: 'IN_STOCK', stockQuantity: 10 },
    { productId: 401, name: 'Rose Petals Pack', image: null, price: 200, category: 'Extras', stockStatus: 'IN_STOCK', stockQuantity: 20 },
    { productId: 402, name: 'Mini Plush Bear', image: null, price: 400, category: 'Extras', stockStatus: 'IN_STOCK', stockQuantity: 15 },
  ],
  addOns: [
    { id: 1, name: 'Photo Print', price: 500 },
    { id: 2, name: 'Premium Ribbon', price: 300 },
  ],
  categories: ['Chocolates', 'Candies', 'Biscuits', 'Extras'],
  messageCharLimit: 200,
  ribbonColors: ['Wine Red', 'Gold', 'Ivory', 'Navy', 'Blush Pink', 'Sage Green'],
  occasions: ['Birthday', 'Anniversary', 'Eid', "Mother's Day", 'Baby Shower', 'Wedding', 'Just Because'],
}

export const DEFAULT_FAQS: FaqItem[] = [
  { question: 'How do I place an order?', answer: '<p>Browse our store, add items to your cart, and proceed to checkout. We accept multiple payment methods including cards and cash on delivery.</p>', category: 'Orders' },
  { question: 'What payment methods do you accept?', answer: '<p>We accept credit/debit cards, JazzCash, Easypaisa, bank transfers, and Cash on Delivery (COD) within Pakistan.</p>', category: 'Orders' },
  { question: 'How long does delivery take?', answer: '<p>Karachi, Lahore and Islamabad: 1–2 business days. Other major cities: 2–4 business days. Remote areas: 4–7 business days.</p>', category: 'Shipping' },
  { question: 'Do you offer free shipping?', answer: '<p>Yes — free shipping on all orders over Rs. 3,000 nationwide.</p>', category: 'Shipping' },
  { question: 'What is the Gift Builder?', answer: '<p>Create a personalised gift box: choose a box, fill it with chocolates, candies, biscuits or extras, add a message card, and we deliver it beautifully wrapped.</p>', category: 'Gifts & Customization' },
  { question: 'What is your return policy?', answer: '<p>We accept returns within 7 days of delivery for unused, unwashed items with original tags. Customised gifts and cut/unstitched fabric are not eligible.</p>', category: 'Returns' },
  { question: 'Is Cash on Delivery available?', answer: '<p>Yes, COD is available for all orders across Pakistan.</p>', category: 'Payments' },
]
