# PROGRESS.md — MYGIFT Session Log

## Phase 2 — Layout Shell + Admin-Driven Home

### Status: COMPLETE ✓

### Built
**Data layer**
- `lib/wp/queries/global.ts` — GET_GLOBAL_OPTIONS query + TypeScript interfaces (GlobalOptions, NavItem, FooterData, AnnouncementBarData)
- `lib/wp/queries/home.ts` — GET_HOME_PAGE query + all block types (HomeBlock union, HeroSlide, CategoryTile, FeaturedTab, OccasionChip, TrustItem, FromAbroadData)
- `lib/wp/queries/products.ts` — GET_PRODUCTS + GET_FEATURED_PRODUCTS queries + ProductNode type
- `lib/wp/fixtures/index.ts` — expanded with full home blocks (hero×3 slides, 4 category tiles, 3 featured tabs, gift_banner, 8 occasion chips, from_abroad_block, trust_row) + full globalOptions (headerMenu with mega-menu children, 3 footer columns, socials, contact)
- `lib/stores/cart.ts` — Zustand store (count, isOpen, openCart, closeCart, setCount)
- `lib/seo/schema.ts` — organizationSchema(), webSiteSchema(), breadcrumbSchema()

**Layout components**
- `components/layout/AnnouncementBar.tsx` — server component, ink bg, conditional link wrap
- `components/layout/Header.tsx` — client component: sticky, scroll shadow, logo, mega-menu dropdown (AnimatePresence), mobile slide-in nav, cart/wishlist/search icons, body scroll-lock
- `components/layout/Footer.tsx` — server component: 4-column grid (brand + 3 link cols), inline SVG social icons, contact links
- `components/layout/CartDrawer.tsx` — client component: uses Zustand isOpen, placeholder EmptyState (Phase 4 will fill)

**Home sections**
- `components/home/HeroSlider.tsx` — client, 3 slides, auto-advance 5s, animated dot indicators, prev/next arrows, wine-gradient placeholder when no real image, AnimatePresence slide transitions, prefers-reduced-motion safe
- `components/home/CategoryTiles.tsx` — server, 2→4 col grid, 3:4 tiles with gradient overlay + hover label, color-coded placeholder bg per category
- `components/home/FeaturedProductTabs.tsx` — server async, fetches products per tab server-side, passes JSX content to Tabs client component, "View all" link per tab
- `components/home/GiftBanner.tsx` — server, wine bg + gold accents, 3-step graphic (Package→Gift→Smile icons), gold CTA button
- `components/home/OccasionChips.tsx` — server, wrapping chip links to /gifts/{slug}, emoji labels
- `components/home/FromAbroad.tsx` — server, split layout text+image, decorative placeholder when no image
- `components/home/TrustRow.tsx` — server, 2→4 col icon+text row, mapped from fixture icon keys (truck/gift/shield-check/map-pin)
- `components/home/HomeBlockRenderer.tsx` — async server component, switch on fieldGroupName renders blocks in WP order
- `components/product/ProductCardGrid.tsx` — client wrapper grid, wires up toast + cart handlers

**SEO + metadata**
- `app/layout.tsx` — fetches globalOptions, renders AnnouncementBar/Header/CartDrawer/Footer, injects Organization + WebSite(SearchAction) JSON-LD in `<head>`
- `app/page.tsx` — generateMetadata from WP Yoast SEO fields with fallbacks; renders HomeBlockRenderer

**Component extensions**
- `components/ui/RibbonHeading.tsx` — added `inverted` prop (ivory text + ribbon on dark bg), added `id` prop passthrough
- `components/ui/Button.tsx` — added `as="link"` polymorphic prop (renders next/link), added `size="lg"` (h-14)

### Verified
- [x] pnpm typecheck — clean
- [x] pnpm lint — clean (0 errors, 0 warnings)
- [x] pnpm build — zero errors, `/` statically prerendered with 8 fetchGraphQL calls resolved via MOCK_MODE
- [x] No hardcoded hex colors in components/ or lib/seo/

---

## Phase 1 — Component Library

### Status: COMPLETE ✓

All 16 components built and verified. See prior session notes.

---

## Phase 0 — Environment, Scaffold, WP Foundation

### Status: COMPLETE ✓

Next.js 16.2.9, Tailwind v4, monorepo scaffold, WP plugin stub. See prior session notes.

---

## Next: Phase 3 — Shop, Category, Product, Quick View

Pages needed: /shop, /category/[slug] (filters + URL params), /product/[slug] (gallery, variations, sticky ATC), Quick View parallel route.

---
_Updated: 2026-06-11_
