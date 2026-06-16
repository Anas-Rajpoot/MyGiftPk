---
name: mygift-seo
description: MYGIFT SEO requirements — metadata, JSON-LD schema, sitemaps, canonicals, Core Web Vitals. Use this skill EVERY time a page/route is created or modified, and whenever titles, descriptions, schema, sitemap, robots, OG images, headings, or performance are involved. No route ships without passing this skill.
---

# MYGIFT SEO Rules

mygift.pk must rank for PK clothing + gifting queries. Every route follows this.

## 1. Metadata pipeline

Every route exports `generateMetadata()`:
- Source: Yoast SeoFields via GraphQL (see headless-wp-woo fragments).
- Fallbacks when Yoast empty: title = `{Name} | MYGIFT` (≤60 chars);
  description from excerpt/short description (≤155 chars).
- Always set: canonical (absolute, from NEXT_PUBLIC_SITE_URL), openGraph
  (title, description, image, type, url), twitter card summary_large_image.
- OG image: Yoast image → else dynamic `/api/og?title=...&img=...` (cream bg,
  Bebas title, wine ribbon mark, optional product image). 1200×630.

## 2. JSON-LD (lib/seo/schema.ts — builder functions, injected per template)

| Template | Schema |
|---|---|
| Root layout | Organization (name, url, logo, sameAs socials) + WebSite with SearchAction |
| /product/[slug] | Product: name, image[], description, sku, brand "MYGIFT", Offer (priceCurrency PKR, price, availability from stockStatus, url, itemCondition New) + AggregateRating/Review when reviews exist |
| /shop, /category/* | CollectionPage + ItemList (position, url, name of visible products) |
| All inner pages | BreadcrumbList matching visible breadcrumbs |
| /gifts/[occasion], /faqs | FAQPage (real Q/A from the native FAQs manager, `fetchFaqItems`) |
| /blog/[slug] | Article (headline, image, datePublished/Modified, author) |
| Contact/about | LocalBusiness if physical address exists |

One `<script type="application/ld+json">` per schema object, server-rendered.
Validate every type in Google Rich Results Test before marking a phase done.

## 3. Sitemaps & robots

- `app/sitemap.ts`: split logical sections (products, categories, occasions, pages,
  posts); lastmod from WP modified date; EXCLUDE hidden Gift Components, cart,
  checkout, account, wishlist, api.
- `app/robots.ts`: allow all; disallow /api, /account, /cart, /checkout, /wishlist,
  /order-confirmation; sitemap reference.
- WordPress backend: entirely noindexed + blocked at admin.mygift.pk (verify with
  a fetch — this is checked in QA).

## 4. URLs & canonicals

- Patterns: /product/{slug} · /category/{slug} · /gifts/{occasion} · /blog/{slug}.
  Slugs kebab-case, descriptive (red-lawn-3pc-unstitched).
- Filtered shop URLs (?type=unstitched&size=m): rendered server-side (crawlable)
  but canonical points to the clean category URL.
- Pagination ?page=n: self-referencing canonical; numbered link fallbacks exist
  for crawlers alongside Load More.
- Renamed slugs: add 301 in the WP Redirection plugin; the sync map flows into
  next.config redirects. Never leave a renamed slug without a redirect.

## 5. On-page rules

- Exactly ONE H1 per page (RibbonHeading as="h1"); section titles are H2s.
- Every image: meaningful alt (admin-required field; fallback to product name).
- Category pages: editable "Storefront Intro" paragraph above the grid (the native
  category-intro term meta via `fetchCategoryIntro`; collapsible after
  3 lines) — keyword-rich, written by admin.
- Internal linking: breadcrumbs everywhere; related products; occasion pages
  cross-link to relevant categories; blog posts link to products/categories.

## 6. Core Web Vitals budgets (mobile, enforced in QA)

LCP < 2.0s (hero/product image `priority`, fonts via next/font preloaded) ·
CLS < 0.05 (every image has width/height or aspect class; skeletons match final
size; no late-injected banners) · INP < 200ms (server components by default;
dynamic-import heavy client comps: gallery zoom, gift builder, sliders).
Lighthouse minimums per template: Perf ≥ 90, SEO ≥ 95, A11y ≥ 95.

## 7. Per-page checklist (run before any route is "done")

[ ] generateMetadata with real title/description/canonical/OG
[ ] correct JSON-LD types render & validate
[ ] one H1, logical heading order
[ ] images: alt + fixed aspect, LCP image priority
[ ] in sitemap (or deliberately excluded) · indexable state correct
[ ] Lighthouse budgets met
