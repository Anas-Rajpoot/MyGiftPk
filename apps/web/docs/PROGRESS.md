# PROGRESS.md — MYGIFT Session Log

## Phase 1 — Component Library

### Status: COMPLETE ✓

### Built
- `components/ui/Button` — primary/secondary/ghost, loading spinner, disabled
- `components/ui/Badge` — sale/new/gift variants
- `components/ui/FilterChip` — pill chip, selected (wine) + removable
- `components/ui/Skeleton` + SkeletonText + SkeletonProductCard
- `components/ui/Breadcrumbs` — server component, aria-current
- `components/ui/EmptyState` — icon, heading, description, Link CTA
- `components/ui/Input` — label/error/hint, aria-invalid, aria-describedby
- `components/ui/Select` — native select + custom ChevronDown, error state
- `components/ui/QtyStepper` — +/- with min/max, aria-live
- `components/ui/Drawer` — portal, Framer Motion slide-in, focus trap
- `components/ui/Modal` — portal, scale+opacity animation, focus trap
- `components/ui/Accordion` — AnimatePresence height 0→auto, ChevronDown rotate
- `components/ui/Tabs` — layoutId sliding underline indicator
- `components/ui/Toast` + `lib/toast.ts` — Zustand store, AnimatePresence
- `components/ui/RibbonHeading` — SVG ribbon, useSyncExternalStore reduced-motion
- `components/product/ProductCard` — stretched-link, hover crossfade, quick actions
- `app/styleguide/InteractiveDemos.tsx` — client demos for all interactive components
- `app/styleguide/page.tsx` — full showcase: colors, typography, all components
- `styles/tokens.css` — added --success, --success-tint, --success-border, --info, --info-tint, --info-border
- `app/globals.css` — mapped new feedback tokens to Tailwind via @theme inline

### Verified
- [x] pnpm typecheck — clean
- [x] pnpm lint — clean
- [x] pnpm build — zero errors, /styleguide statically prerendered
- [x] No hardcoded hex colors in components/ (`grep -rn "#[0-9a-fA-F]{3,6}" apps/web/components` returns nothing)

---

## Phase 0 — Environment, Scaffold, WP Foundation

### Status: COMPLETE ✓

### Built
- Monorepo root (pnpm-workspace.yaml, package.json)
- Next.js 16.2.9 + TypeScript + Tailwind v4 + ESLint scaffolded in apps/web/
- zustand, framer-motion, clsx installed
- Poppins 400/500/600 + Bebas Neue via next/font/google (self-hosted at build time)
- styles/tokens.css — all design tokens from CLAUDE.md
- Tailwind theme wired to CSS vars via @theme inline
- .env.example with all required vars; .env.local with MOCK_MODE=true
- lib/wp/client.ts — typed fetchGraphQL with tag-based ISR caching + MOCK_MODE
- lib/wp/fixtures/ — mock data for development without live WP
- app/api/revalidate/route.ts — secret-checked, revalidateTag(tag, 'max')
- docs/WP-SETUP.md — full WordPress install checklist
- wp-plugin/mygift-core/ — plugin header, settings stub, revalidate webhook
- /styleguide route created

---

## Next: Phase 2 — Home Page

Components needed: HeroSection, CategoryGrid, FeaturedProductsRow, GiftTeaser CTA.
All data via fetchGraphQL with MOCK_MODE. Mobile-first (375px).

---
_Updated: 2026-06-11_
