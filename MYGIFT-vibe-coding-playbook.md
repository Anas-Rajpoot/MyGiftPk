# MYGIFT — Vibe-Coding Execution Playbook for the Coding Agent
**Project:** mygift.pk · Headless WordPress/WooCommerce backend + Next.js 15 frontend
**How to use this file:** Work through phases in order. Each phase has a PROMPT (paste it to the agent / treat it as your task), the SKILLS it must use, and a DEFINITION OF DONE. Never start a phase until the previous phase's Definition of Done passes.

---

## PART A — Global Rules (the agent reads this first, every session)

### A1. Operating rules for the agent

1. **Skills-first rule:** Before writing any code in a phase, check `.claude/skills/` (or `/mnt/skills/`) for the skills listed in that phase.
   - If the skill EXISTS → read its SKILL.md fully and follow it.
   - If the skill DOES NOT EXIST → **create it first** (Phase 0 has the specs), then use it. Never skip this; the skills are the project's memory and consistency layer.
2. **One phase at a time.** Finish, verify, commit, then move on. No skipping ahead, no "I'll fix it later".
3. **Verify before claiming done.** Every phase ends with: `pnpm build` passes with zero errors, `pnpm lint` clean, the listed acceptance criteria checked one by one, and (where UI is involved) screenshots taken at 375px and 1440px widths.
4. **Small commits, conventional messages:** `feat(shop): filter sidebar with URL params`. Commit after every working unit.
5. **Design tokens are law.** Never hardcode a color or font. Everything comes from the `mygift-design-system` skill / `tokens.css`. If a needed token doesn't exist, add it to the skill first, then use it.
6. **No client-side secrets.** WordPress URL, consumer keys, JWT secrets live in `.env` and are only used in server components / route handlers.
7. **Never trust client prices.** Any cart/bundle total is recalculated on the server from the live catalog.
8. **When stuck >3 attempts** on the same error: stop, write the problem + attempts into `docs/BLOCKERS.md`, and try an alternative approach rather than looping.
9. **Update `docs/PROGRESS.md`** at the end of every session: what was built, what's verified, what's next. (This is the agent's memory between sessions.)
10. **Mobile-first.** Pakistan traffic is ~80% mobile. Build mobile layout first, then scale up.

### A2. Project constants (single source of truth)

```
Brand:        MYGIFT (mygift.pk)
Primary:      #7E2B36 (wine)      --wine
Deep:         #5C1F28              --wine-deep
Tint:         #F6ECEE              --wine-tint
Background:   #FAF8F5 (cream)      --cream
Surface:      #FFFFFF              --ivory
Text:         #1F1A17              --ink
Muted:        #8A8178 / #E8E2DA    --stone / --hairline
Accent:       #C9A24B (gold, GIFT areas only) --gold
Display font: Bebas Neue (next/font, headings/section titles only)
Body font:    Poppins 400/500/600 (next/font)
Signature:    "ribbon line" — 2px wine underline SVG with bow notch under
              every Bebas heading; doubles as Gift Builder progress bar.
Radius: 12px cards / 8px inputs / 999px chips · Hairline borders, shadows only on drawer+modals
```

### A3. Repo layout

```
mygift/
├── apps/web/                  # Next.js 15 (App Router, TS, Tailwind)
│   ├── app/                   # routes (see Phase 3 map)
│   ├── components/{ui,layout,product,cart,gift,home}/
│   ├── lib/{wp/,woo/,seo/,utils}/   # GraphQL client, queries, schema builders
│   ├── styles/tokens.css
│   └── docs/{PROGRESS.md,BLOCKERS.md,DECISIONS.md}
├── wp-plugin/mygift-core/     # custom WP plugin: gift builder + revalidate webhooks
└── .claude/skills/            # project skills (created in Phase 0)
```

---

## PART B — The Phases

---

## PHASE 0 — Skills, Scaffold & Environment (do this before anything)

### Skills to check/create
Check `.claude/skills/`. **Create any of these five that are missing** (specs below). Each skill = folder with `SKILL.md` (YAML frontmatter: `name`, `description`) + optional `references/`. Keep each SKILL.md under 500 lines. Write descriptions "pushy" so they trigger reliably (e.g., "Use this whenever ANY component, page, or style is created or edited…").

**1. `mygift-design-system`** — the law for all UI.
Contents: full token table from A2 as CSS variables + Tailwind config mapping; typography scale (Bebas: hero 64/48, section 40/32, tile 24 — all uppercase, +2% tracking; Poppins: body 16/1.6, small 14, button 15/600 + letter-spacing); the ribbon-line SVG component code; component recipes (button primary/secondary/ghost, product card with hover crossfade + quick actions, input, chip, badge, drawer, modal, skeleton); spacing scale; motion rules (150–250ms ease-out; drawer 300ms; respect `prefers-reduced-motion`); do/don't list (no shadows on cards, no pure white page bg, gold only in gift contexts, one H1 per page).

**2. `headless-wp-woo`** — how this codebase talks to WordPress.
Contents: env var names (`WP_GRAPHQL_URL`, `WC_CONSUMER_KEY/SECRET`, `REVALIDATE_SECRET`, `JWT_SECRET`); the typed `fetchGraphQL()` helper with error handling + Next `revalidateTag` tags convention (`product:{slug}`, `category:{slug}`, `home`, `global`); canonical GraphQL fragments (ProductCard, ProductFull, Category, SeoFields); cart strategy (WooGraphQL session token in httpOnly cookie via `/api/cart` route handlers — addToCart, updateQuantity, removeItem, applyCoupon); checkout/order creation via Woo REST from the server; webhook contract: WP fires `POST /api/revalidate {secret, tags[]}` on save_post/product update; rule list (server-only fetching, never expose WP domain to client, ISR `revalidate: 3600` as fallback).

**3. `mygift-gift-builder`** — the signature feature spec.
Contents: the 4-step flow (Box → Fill → Personalize → Review) with state shape (Zustand): `{box, slotsUsed, items:[{productId, qty, price}], message, ribbonColor, addOns[], total}`; pricing rule: **additive** (box base price + each component's live price + add-ons) unless `DECISIONS.md` says otherwise; capacity validation per box; the server contract: client sends `{boxId, items[], addOns[], message}` → `/api/gift/add-to-cart` → server re-fetches every component price + stock from Woo, recomputes total, rejects on mismatch/out-of-stock, creates ONE cart line item with meta `_gift_contents` (JSON) — WP plugin renders this expanded in admin order + emails + packing slip; UI rules: gold progress ribbon, sticky live price ticker, component grid tabs from the hidden "Gift Components" category's children; admin-configurable via ACF options (boxes, capacities, allowed categories, message char limit 200).

**4. `mygift-seo`** — every page must pass this.
Contents: `generateMetadata()` pattern pulling Yoast fields via GraphQL with fallbacks; JSON-LD builder functions in `lib/seo/schema.ts` for Organization, WebSite+SearchAction, Product+Offer+AggregateRating, BreadcrumbList, CollectionPage+ItemList, FAQPage, Article — injected as `<script type="application/ld+json">` per template; sitemap rules (`app/sitemap.ts` splits products/categories/pages/blog; hidden gift-component products EXCLUDED); robots.txt (block /api, /account, /cart, /checkout, /wishlist); canonical rules (filtered shop URLs canonicalize to clean category; pagination self-canonical); per-page checklist: exactly one H1, alt text on all images, OG image, no CLS from images (aspect ratios fixed), LCP element preloaded.

**5. `mygift-qa`** — definition-of-done checker.
Contents: the verification script every phase runs: build + lint + typecheck pass; Lighthouse (mobile) targets Perf ≥ 90, SEO ≥ 95, A11y ≥ 95 on home/category/product; keyboard-only walkthrough (tab order, visible focus rings in wine, Esc closes drawer/modal); 375px + 768px + 1440px screenshots reviewed; schema validated (paste JSON-LD into validator or run a local checker); cart math spot-check; broken-link crawl of nav/footer.

> After creating each skill, do one micro-test: use it to produce one small artifact (e.g., render a Button per the design skill) and confirm the skill's instructions were sufficient. Fix the skill if not. Then commit skills.

### Then scaffold

**PROMPT 0:**
> Using the `headless-wp-woo` and `mygift-design-system` skills: scaffold the monorepo per Part A3. Next.js 15 + TypeScript + Tailwind + ESLint + Prettier; install zustand, framer-motion, clsx; set up next/font for Poppins (400/500/600) and Bebas Neue; create `styles/tokens.css` with all A2 variables and wire Tailwind theme to them; create `.env.example` with all required vars; create `lib/wp/client.ts` (fetchGraphQL), `app/api/revalidate/route.ts` (secret-checked, calls revalidateTag); add docs/PROGRESS.md, DECISIONS.md, BLOCKERS.md. For WordPress: write `docs/WP-SETUP.md` — exact install checklist (WP on subdomain, plugins: WooCommerce, WPGraphQL, WooGraphQL, ACF Pro, WPGraphQL-for-ACF, Yoast + Yoast-WPGraphQL, Wordfence; permalink settings; create the category tree from the project plan including hidden "Gift Components"; create the global attribute pa_type = Stitched/Unstitched; seed 24 dummy products across all categories with images, prices, sizes; 8 gift components). Scaffold `wp-plugin/mygift-core/` with plugin header, a settings page stub, and the save_post→revalidate webhook sender.

**Definition of Done 0:** 5 skills exist and pass micro-tests · repo builds · `fetchGraphQL` returns live data from the WP install (or a documented mock mode toggle if WP isn't live yet) · revalidate endpoint returns 401 without secret, 200 with · tokens render on a `/styleguide` test route showing all colors, both fonts, ribbon-line.

---

## PHASE 1 — Component Library & Styleguide

**Skills:** `mygift-design-system` (primary), `mygift-qa`.

**PROMPT 1:**
> Build the full UI kit per the design-system skill, displayed on `/styleguide`: Button (primary/secondary/ghost/loading/disabled), Input + Select + QtyStepper, Chip/FilterChip, Badge (Sale in wine-tint, New, Gift in gold), RibbonHeading (Bebas + animated ribbon-line underline, draws on scroll, maps to semantic h1–h3 via prop), ProductCard (image aspect 3:4 on cream, hover second-image crossfade, slide-up quick actions: QuickView/♥/Add, price row, sale strikethrough), Skeletons, Drawer (right, 400px, backdrop blur, focus-trapped, Esc closes), Modal (focus-trapped), Accordion, Tabs, Toast, Breadcrumbs, EmptyState. All keyboard accessible, reduced-motion safe, mobile-first.

**Definition of Done 1:** every component on /styleguide at 375/1440px screenshots · keyboard pass · zero hardcoded colors (grep for `#` in components returns only token file) · qa skill checklist run and logged in PROGRESS.md.

---

## PHASE 2 — Layout Shell + Home Page (admin-driven)

**Skills:** `mygift-design-system`, `headless-wp-woo`, `mygift-seo`.

**Backend first:** In WP, build the ACF structure (and matching GraphQL exposure): Options page "Global" (announcement bar, menus, footer, socials, free-shipping threshold) and a "Homepage" flexible-content field with layouts: hero_slider (desktop image, mobile image, heading, sub, cta_label, cta_link)[], category_tiles[], featured_tabs (3 tabs each = title + product source tag/category), gift_banner, occasion_chips[], from_abroad_block, trust_row[], instagram_toggle. Document field names in the `headless-wp-woo` skill references so queries never drift.

**PROMPT 2:**
> Build Header (logo, mega-menu from WP menu, search stub, wishlist count, cart icon→drawer trigger), AnnouncementBar, Footer — all data from Global options, cached with tag `global`. Then build `/` rendering the Homepage flexible-content blocks in admin-defined order: HeroSlider (first slide priority LCP image, fixed aspect, auto+swipe), CategoryTiles, FeaturedProductTabs (server-prefetched, client tab switch), GiftBuilderBanner (wine bg, gold accents, 3-step mini illustration), OccasionChips, FromAbroadBlock, TrustRow, optional InstagramGrid. Add Organization + WebSite(SearchAction) JSON-LD and full metadata per the seo skill. Editing any field in WP and saving must update the live page via the revalidate webhook within seconds.

**Definition of Done 2:** reorder/edit blocks in WP → site updates without redeploy · LCP < 2.0s and CLS < 0.05 on local Lighthouse mobile · schema validates · home screenshots logged.

---

## PHASE 3 — Catalog: Shop, Category, Product, Quick View

**Skills:** `headless-wp-woo`, `mygift-design-system`, `mygift-seo`.

**PROMPT 3:**
> Build `/shop` and `/category/[slug]` (server components): filter sidebar (desktop) / bottom-sheet (mobile) with Category, Stitched/Unstitched (pa_type), Size, Color, Price range, On Sale; all filters as URL searchParams, server-rendered, shareable, back-safe; active-filter chips, sort dropdown, result count; grid 2-col mobile → 4-col desktop; Load More that appends `?page=n` (crawlable numbered fallback links in a noscript/footer nav); CollectionPage + ItemList + Breadcrumb schema; category intro text from ACF (collapsible). Build `/product/[slug]`: gallery (vertical thumbs, zoom, swipe), variation selectors (type, size with size-guide modal), price with sale logic, qty, Add to Cart (→ drawer in Phase 4, stub event for now), wishlist heart, delivery-estimate line, WhatsApp order button, sticky mobile add-to-cart bar, tabs (Description/Fabric/Size Chart/Reviews/Shipping), Related products; full Product+Offer+Breadcrumb schema; `generateStaticParams` + ISR with tag `product:{slug}`. Build Quick View as intercepted parallel route `@modal/(.)product/[slug]` rendering a compact modal (mini gallery, variations, qty, add, "full details" link) — direct URL still renders the full page.

**Definition of Done 3:** filters compose correctly via URL · variation price/stock updates correctly · quick view opens instantly from card and deep-links fine · product schema passes rich-results validation · Lighthouse SEO ≥ 95 on both templates.

---

## PHASE 4 — Cart Drawer, Cart Page, Wishlist

**Skills:** `headless-wp-woo` (cart contract), `mygift-design-system`, `mygift-qa`.

**PROMPT 4:**
> Implement the cart per the headless-wp-woo skill: route handlers `/api/cart/*` proxying WooGraphQL with session token in an httpOnly cookie; Zustand store hydrated from server cart; optimistic updates with rollback on error. Add to Cart anywhere → Drawer opens: line items (thumb, name, variation, qty stepper, remove), free-shipping progress bar reading the threshold from Global options ("Rs. X away from free shipping", fills in wine, celebrates at 100%), gift-wrap toggle (+price from options), subtotal, sticky Checkout + View Cart buttons, cross-sell rail "Add a little extra 🎁" pulling 4 small gift add-ons. Cart icon count animates on add. Build `/cart`: full list, coupon field (server applied), order-note, delivery estimator, trust badges, empty state with CTA. Build `/wishlist`: localStorage for guests (sync to account later), heart toggles everywhere update it, grid with add-to-cart, shareable `?items=` link, empty state.

**Definition of Done 4:** add/update/remove/coupon all persist across refresh · totals always match a direct Woo recalculation (write a quick test) · drawer focus-trap + Esc + scroll-lock correct · wishlist survives refresh and share-link restores items.

---

## PHASE 5 — Checkout, Payments, Accounts, Gift Mode

**Skills:** `headless-wp-woo`, `mygift-design-system`, `mygift-qa`.

**PROMPT 5:**
> Build `/checkout` as a single-page 3-step flow (Contact → Delivery → Payment) with inline validation and an order summary rail. Include "🎁 This order is a gift" toggle revealing: recipient name/phone/address (separate from sender billing), preferred delivery date, free card message (200 chars, live preview), hide-prices-on-receipt checkbox — all mapped to order meta. Payments via Woo order creation on the server: COD (default), Bank Transfer (instructions page), JazzCash + Easypaisa (integrate the chosen gateway plugin's API or hosted redirect; if credentials are not yet provided, build behind a `PAYMENTS_SANDBOX` flag with a mocked success/fail screen and document the swap in BLOCKERS.md), and card payments for international senders via the provider configured in env (Safepay/PayFast/Stripe-entity — same flag approach). After order: `/order-confirmation/[id]` with summary + gift message echo. Accounts: register/login (JWT per skill), `/account` with orders list, order detail, addresses, profile; `/track-order` for guests (order # + phone). Branded transactional emails (WP side template overrides): order received, processing, shipped.

**Definition of Done 5:** full test order succeeds for each enabled method (sandbox ok) · gift orders show recipient + message + hide-price flag in WP admin order screen · guest tracking works · checkout usable end-to-end with keyboard only · no payment secrets in client bundle (verify with build analysis).

---

## PHASE 6 — Gift Builder (signature feature, 2 sprints)

**Skills:** `mygift-gift-builder` (primary), `headless-wp-woo`, `mygift-design-system`.

**PROMPT 6A (backend):**
> In `wp-plugin/mygift-core`: register the Gift Bundle handling — accept cart items carrying `_gift_contents` meta; on order creation decrement stock for every component; render contents expanded (indented list with qtys + message) in admin order screen, customer emails, and a printable packing slip; ACF options page "Gift Builder" (boxes: name/image/base price/capacity; allowed component categories; add-ons: name/price; message char limit). Expose all of it over GraphQL. Add server pricing endpoint logic per the skill: recompute + validate, reject tampered totals.

**PROMPT 6B (frontend):**
> Build `/gift-builder` per the mygift-gift-builder skill: 4 steps with the gold ribbon progress bar and an always-visible sticky price ticker. Step 1 box cards (image, capacity, base price). Step 2 component grid with category tabs from ACF, tap-to-add with qty steppers, bottom tray showing chosen items + slots used/total, capacity enforcement with friendly limit message. Step 3 personalize: card message with live preview on a card mockup, ribbon color swatches, photo-print add-on upload stub, occasion tag. Step 4 review: visual stack of everything + total → "Add Gift to Cart" calls `/api/gift/add-to-cart`; server validates & creates ONE line item; drawer opens showing the bundle as one item with an expandable contents list. Persist builder state in localStorage so a refresh doesn't lose the gift. Mobile experience must be flawless — steps as full-screen panels with bottom nav.

**Definition of Done 6:** tampering with the client total is rejected server-side (test it) · out-of-stock component blocks add with clear message · order in WP admin shows full expanded contents + message · packing slip prints correctly · refresh mid-build restores state · the flow feels delightful at 375px (record a screen capture).

---

## PHASE 7 — SEO Hardening, Performance, Content Pages

**Skills:** `mygift-seo` (primary), `mygift-qa`.

**PROMPT 7:**
> Run the full mygift-seo skill across the site: audit every template's metadata + schema; build `app/sitemap.ts` (split indexes, exclude hidden components, lastmod from WP), `robots.ts`, branded dynamic OG-image route (`/api/og` — cream bg, Bebas title, wine ribbon, product image); occasion landing pages `/gifts/[occasion]` (Birthday/Anniversary/Eid/Wedding) each with editable ACF intro, curated products, FAQPage schema; static pages (about/contact with form/faqs/shipping/returns/privacy/terms) from WP pages; `/blog` + `/blog/[slug]` with Article schema, related posts, TOC. Performance pass: bundle analysis, dynamic-import heavy client components (gallery zoom, builder), image sizes audit, font preload check, remove unused deps. 301 redirect map wired from WP Redirection to next.config. Add GA4 + Meta Pixel via a consent-light loader, and Google Merchant feed endpoint (or document the Woo feed plugin choice).

**Definition of Done 7:** Lighthouse mobile on Home/Category/Product/Gift-builder: Perf ≥ 90, SEO ≥ 95, A11y ≥ 95, Best-practices ≥ 95 · all schema types validate · sitemap correct + components excluded · every page has unique title/description/OG.

---

## PHASE 8 — QA, Seed Real Content, Launch

**Skills:** `mygift-qa` (primary), all others as needed.

**PROMPT 8:**
> Execute the full mygift-qa checklist site-wide and fix everything found. Then: cross-browser pass (Chrome/Safari/Firefox + iOS Safari + Android Chrome), 404/500 branded error pages, security review (rate-limit cart/checkout/gift APIs, sanitize gift messages, headers: CSP/HSTS/X-Frame), `docs/RUNBOOK.md` (deploy steps, env vars, WP content how-tos for the marketing team with screenshots: edit hero, add product, configure a gift box, create occasion page), uptime + error monitoring (Sentry), backup plan for WP. Production deploy: Next.js to Vercel with prod env, WP hardened (admin IP-allowlist, noindex verified), DNS for mygift.pk → frontend, admin.mygift.pk → WP. Place 3 real test orders end-to-end (clothing COD, gift bundle prepaid, international card sandbox) and verify emails + admin views. Submit sitemap to Search Console.

**Definition of Done 8 (= LAUNCH):** all 3 test orders perfect · monitoring live · runbook delivered · marketing team successfully edits the hero without help · Search Console verified, sitemap submitted.

---

## PART C — Standing prompts (use anytime)

- **Session start:** "Read docs/PROGRESS.md and docs/BLOCKERS.md, list the current phase's remaining Definition-of-Done items, and continue from there. Load the skills required by this phase first."
- **Before any UI work:** "Re-read mygift-design-system. Confirm which existing components you'll reuse before creating new ones."
- **Drift check (run at each phase end):** "Grep the codebase for hex colors, font-family declarations, and inline px font sizes outside tokens.css. Fix violations. Then run the mygift-qa checklist and append results to PROGRESS.md."
- **Skill upkeep:** "You just solved something not covered by a skill (new pattern, gotcha, decision). Update the relevant skill's SKILL.md or references/ so future sessions inherit it, and note the change in DECISIONS.md."
