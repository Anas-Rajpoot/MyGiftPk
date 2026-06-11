# PROGRESS.md — MYGIFT Session Log

## Phase 0 — Environment, Scaffold, WP Foundation

### Status: IN PROGRESS

### Built
- Monorepo root (pnpm-workspace.yaml, package.json)
- Next.js 15 + TypeScript + Tailwind + ESLint scaffolded in apps/web/
- zustand, framer-motion, clsx installed
- Poppins 400/500/600 + Bebas Neue via next/font/google (self-hosted at build time)
- styles/tokens.css — all design tokens from CLAUDE.md
- Tailwind theme wired to CSS vars
- .env.example with all required vars
- lib/wp/client.ts — typed fetchGraphQL with tag-based ISR caching + MOCK_MODE
- lib/wp/fixtures/ — mock data for development without live WP
- app/api/revalidate/route.ts — secret-checked, revalidateTag
- docs/WP-SETUP.md — full WordPress install checklist
- wp-plugin/mygift-core/ — plugin header, settings stub, revalidate webhook
- /styleguide route — tokens, fonts, RibbonHeading component

### Verified
- [ ] pnpm build zero errors
- [ ] pnpm lint clean
- [ ] /api/revalidate → 401 without secret, 200 with
- [ ] /styleguide renders tokens + fonts + ribbon line
- [ ] WP-SETUP.md complete

### Next
- Phase 1 — Component Library (/styleguide full UI kit)

---
_Updated: 2026-06-11_
