# PROGRESS.md — MYGIFT Session Log

## Live staging wiring + go-live config — 2026-06-17

### Status: CONNECTED ✓ (content config pending user clicks)

Frontend `.env.local` now points at live staging `wp-mygift-pk.stackstaging.com`
(`MOCK_MODE=false`). Plugins active on WP: mygift-core v0.5.0, WPGraphQL,
WooCommerce, JWT Auth, Yoast SEO, Add WPGraphQL SEO.

**Verified live (curl):**
- WPGraphQL ping ✓ · Yoast `seo` field now resolves ✓ (no more "Cannot query field seo")
- WooCommerce REST ✓ — 47 published products
- All 6 mygift-core REST endpoints → 200 ✓
- **WooGraphQL (`wp-graphql-woocommerce`) is NOT installed** — not needed; app reads
  products via WC REST. Documented; do not add unless GraphQL product data is wanted.

**Runtime fixes shipped this session (committed 3279be2 + follow-ups):**
- `fetchGraphQLSafe` — missing/erroring Yoast `seo` no longer 500s any page
- `next/image` host + CSP `img-src` derived from `WP_GRAPHQL_URL`
- track-order `'use server'` file exports only the async action (types moved to
  `lib/woo/order-status.ts`) — fixes `TimelineStatus is not defined`
- `GET_WP_PAGE` `idType: SLUG → URI`
- Control Center product count via live `wc_get_products` (cache-proof)

**Pushed:** github.com/Anas-Rajpoot/MyGiftPk branch `master` (commit 3279be2).

**Pending user actions (WP admin, see WP-SETUP §13):**
- [ ] Create `gift-components` parent + `gift-chocolates/gift-candies/gift-biscuits/gift-extras` subcats + sample hidden products → builder populates
- [ ] MYGIFT → Connection & Emails → Revalidate Secret = `a74724a4210cad337823918b1507e584addb58fe87d0146e` (matches .env.local)
- [ ] Confirm Yoast + Add WPGraphQL SEO active (done — verified)
- [ ] After categories created: re-verify `/gift-builder` endpoint returns non-empty `categories` + `components`

---

## ACF Pro Removal → Native mygift-core Content (v0.5.0) — 2026-06-16

### Status: BUILT ✓ (see D-009)

Replaced the paid **ACF Pro + WPGraphQL-for-ACF** stack with **free, native content
managers** in the mygift-core plugin, exposed over REST and consumed by Next.js.

**WordPress (mygift-core v0.5.0)** — all PHP `php -l` clean:
- `class-content-base.php` — shared base: Settings API + REST + revalidate-on-save + admin-field helpers
- `class-home-content.php` — Homepage Builder: announcement bar + 7 ordered/toggleable blocks → `/mygift/v1/home-content`
- `class-global-settings.php` — threshold, gift-wrap, footer/socials/contact → `/mygift/v1/global`
- `class-gift-builder-settings.php` — boxes/add-ons/options + **live Woo components** → `/mygift/v1/gift-builder`
- `class-faqs.php`, `class-careers.php` — repeaters → `/mygift/v1/faqs`, `/careers`
- `class-category-intro.php` — "Storefront Intro" term meta → `/mygift/v1/category-intro?slug=`
- `class-control-center.php` — branded **MYGIFT** top-level menu + dashboard (counts, quick links, help)
- `assets/admin.{css,js}` — shared no-code repeater + media picker
- Removed `acf/save_post` hook; reparented settings page; product count uses live `wc_get_products` (cache-proof)

**Next.js** — `pnpm typecheck` ✓ · `pnpm lint` ✓ · `pnpm build` ✓ (118 routes):
- `lib/wp/home-content.ts` — unified REST content layer + `DEFAULT_*` fallbacks (gated on MOCK_MODE + shape-validated)
- Rewired: layout, home page, HomeBlockRenderer, cart route-helpers, contact, faqs, careers, gift-builder, category
- Deleted ACF GraphQL queries (`homepageBuilder`, `globalOptions`, `giftBuilderOptions`, FAQ/careers, `acfCategoryIntro`); trimmed fixtures

**Docs/skills:** WP-SETUP, RUNBOOK, headless-wp-woo (§4a), gift-builder, seo skills, PHASES,
dev plan, playbook all de-ACF'd. Decision logged as D-009.

### Marketing-team test (to run on staging after re-uploading v0.5.0)
- [ ] MYGIFT → Homepage Builder → edit hero slide 1 heading + image → Save → storefront updates
- [ ] MYGIFT → FAQs → + Add FAQ → Save → appears on /faqs
- [ ] Dashboard shows correct published-product count (56)

### Remaining (needs live WP)
- [ ] Re-upload mygift-core v0.5.0; confirm Control Center + all 6 REST endpoints return data
- [ ] Set MOCK_MODE=false; confirm storefront reads live content (no nulls)

---

## Phase 8A + 8B — Account/Auth + QA Hardening — 2026-06-15

### Status: COMPLETE ✓

### Phase 8A — Customer Account + Auth (already built, verified)

All routes and components confirmed in-place:
- `proxy.ts` — route protection for `/account/*` (redirects to login when no cookie)
- `lib/auth/server.ts` — HS256 JWT, 30-day cookie, `getAuthUser()`, `setAuthCookie()`, `clearAuthCookie()`
- `app/api/auth/login/route.ts` — rate-limited 5/60s; MOCK_MODE + WPGraphQL real mode
- `app/api/auth/register/route.ts` — rate-limited 3/60s; email regex + 8-char password min
- `app/api/auth/logout/route.ts` — clears cookie
- `app/account/layout.tsx` — server guard → redirect to login; AccountNav sidebar
- `app/account/page.tsx` — dashboard tiles (Orders, Profile, Track, Gift Builder)
- `app/account/login/page.tsx` + `components/account/LoginForm.tsx`
- `app/account/register/page.tsx` + `components/account/RegisterForm.tsx`
- `app/account/orders/page.tsx` + `components/account/OrderList.tsx` — fetches from `GET /api/account/orders`
- `app/account/profile/page.tsx` + `components/account/ProfileForm.tsx` — PATCH `/api/account/profile`
- `app/account/track/page.tsx` + `components/account/TrackOrderForm.tsx` — POST `/api/account/track`
- `app/api/account/orders/route.ts` — WC REST v3 `/orders?customer={id}` with mock
- `app/api/account/profile/route.ts` — WC REST v3 `/customers/{id}` PUT with mock
- `app/api/account/track/route.ts` — order lookup by number + phone last-7 match

### Phase 8B — QA Hardening

**Lint fixes (0 errors, 0 warnings achieved):**
- `Lightbox.tsx` — removed `setState-in-useEffect` violations:
  - Replaced useEffect zoom-reset with zoom reset in `navigate()` + thumbnail click handler
  - Replaced open/initialIndex useEffect with render-phase derived state (`[prevOpen, setPrevOpen]` pattern)
- `SearchOverlay.tsx` — split into outer `SearchOverlay` + inner `SearchContent` (mounts fresh per open);
  replaced `setLoading` + `setResults` at effect top with `useTransition(async)` (React 19)
- `OrderTimeline.tsx` — replaced `<a href="/contact">` with `<Link>`
- `checkout/route.ts` — removed unused `cartResponse` import; removed unused `emptyCart` destructure
- `blog/[slug]/page.tsx` — removed unused `Button` import
- `CheckoutClient.tsx` — removed unused `CreditCard` import; removed dead `updateShipping` function;
  changed `const [shippingSame, setShippingSame]` → `const [shippingSame]` (setter never used);
  changed `const [shipping, setShipping]` → `const [shipping]` (setter removed with updateShipping)

**Branded error pages:**
- `app/not-found.tsx` — 404 page: decorative 404 watermark, RibbonHeading H1, "Back to Home" + "Browse Shop" CTAs, contact link
- `app/error.tsx` — 500 page: `'use client'`, reset + home CTAs, logs to console (Sentry ready)

**Security headers (`next.config.ts`):**
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (production only, 2-year max-age + preload)
- `Content-Security-Policy` — blocks frame-ancestors, object-src, form-action; allows Next.js 16 inline scripts

**Token fix:**
- `styles/tokens.css` — added `--whatsapp-deep: #20b957` (hover variant)
- `app/globals.css` — mapped to `--color-whatsapp-deep`
- `app/contact/page.tsx` — replaced hardcoded `#25D366`/`#20b957` with `bg-whatsapp`/`bg-whatsapp-deep`

**RUNBOOK.md** (`apps/web/docs/RUNBOOK.md`) — complete marketing-team guide:
1. Edit hero banner
2. Add a product
3. Configure gift boxes
4. Create occasion landing pages
5. Change announcement bar
6. Manage blog posts
7. Manage order statuses + shipment tracking
8. Webhook revalidation troubleshooting

### QA results (2026-06-15)
- [x] `pnpm typecheck` — zero errors
- [x] `pnpm lint` — zero errors, zero warnings
- [x] `pnpm build` — zero errors; all routes present
- [x] Hardcoded hex: 0 violations in components/ or app/ (except permitted: RIBBON_SWATCHES in StepPersonalize, OG image route, styleguide token display)
- [x] WP admin URL: not in any client-side file
- [x] Branded 404/500 pages exist and follow design system
- [x] Security headers applied via next.config.ts
- [x] RUNBOOK.md written and complete

### Remaining (needs live WP + deploy):
- [ ] Upload `mygift-core.zip` → activate → verify no fatal errors
- [ ] Payment gateway credentials (JazzCash/Easypaisa)
- [ ] Sentry integration + uptime monitoring
- [ ] WP backups configured
- [ ] Deploy to Vercel prod + DNS cutover
- [ ] 3 real test orders (clothing COD, gift bundle, international card sandbox)
- [ ] Search Console verified + sitemap submitted
- [ ] Lighthouse scores on live site (Perf ≥ 90, SEO ≥ 95)
- [ ] Cross-browser QA (Chrome/Safari/Firefox, iOS Safari, Android Chrome)

---

## Site Hardening + Plugin Rewrite (v0.3.0) — 2026-06-12

### Status: COMPLETE ✓

### Next.js hardening (apps/web/)
- `proxy.ts` — Next.js 16 route protection for `/account/*` (replaces deprecated middleware.ts; function must be named `proxy`)
- `lib/utils/csrf.ts` — Origin-header CSRF validation shared across API routes
- `lib/auth/server.ts` — JWT_SECRET now throws in production when unset (no silent fallback)
- `app/api/auth/login/route.ts` — rate-limited 5 req/60s per IP
- `app/api/auth/register/route.ts` — rate-limited 3 req/60s; stricter email regex
- `app/api/checkout/route.ts` + `app/api/cart/add/route.ts` + `app/api/gift/add-to-cart/route.ts` — CSRF origin check on all mutation routes
- `app/api/gift/add-to-cart/route.ts` — HTML entity + control-char safe gift message sanitizer
- `app/api/revalidate/route.ts` — optional timestamp replay-attack guard (±5 min); restored `revalidateTag(tag, 'max')` (Next.js 16 requires 2 args)
- `app/api/search/route.ts` — changed `revalidate: 0` → `revalidate: 60` (no longer bypasses CDN cache)
- `app/layout.tsx` — `localBusinessSchema()` injected as JSON-LD
- `next.config.ts` — `formats: ['image/avif', 'image/webp']` for AVIF image optimization
- `docs/DECISIONS.md` — D-005 through D-008

### WordPress plugin rewrite (wp-plugin/mygift-core/ v0.3.0)

**Root cause of fatal activation error (fixed):**
1. `str_contains()` is PHP 8.0+ — replaced with `strpos() !== false` throughout
2. Email classes extending `WC_Email` were required at top level before WooCommerce autoloader was ready

**All 11 files rewritten/updated:**
- `mygift-core.php` — industry-standard headers, constants, HPOS compatibility declaration, proper lifecycle hooks, deferred loading
- `uninstall.php` (new) — `WP_UNINSTALL_PLUGIN` guard; removes options + transients; preserves order meta
- `includes/class-activator.php` (new) — PHP/WC version checks; `seed_options()` via `add_option()` (survives re-activation); `flush_rewrite_rules()`
- `includes/class-deactivator.php` (new) — unschedules cron; `flush_rewrite_rules()`
- `includes/class-settings.php` — added `ABSPATH` guard; `settings_errors()` on render; no WC dependency
- `includes/class-revalidate-webhook.php` — `str_contains` → `strpos`; `timestamp` added to webhook body
- `includes/class-order-statuses.php` — `ABSPATH` guard added
- `includes/class-status-timestamps.php` — `ABSPATH` guard added
- `includes/class-shipment-tracking.php` — `fn()` arrow function → regular function for PHP 7.4 safety; `ABSPATH` guard
- `includes/class-order-emails.php` — loaded LAST inside `mygift_core_init()` so `WC_Email` is available; `ABSPATH` guard; emoji stripped
- `includes/class-admin-columns.php` — `ABSPATH` guard added

**Upload:** `wp-plugin/mygift-core.zip` — upload via WP Admin > Plugins > Add New > Upload Plugin

### QA checklist (WordPress)
- [ ] Upload `mygift-core.zip` → activate → no fatal error
- [ ] Settings page visible at WP Admin > Settings > MYGIFT Core
- [ ] Enter Revalidate Secret + Next.js URL → save → "Settings saved" notice shows
- [ ] Custom statuses visible in order status dropdown (Confirmed / Packed / Shipped)
- [ ] Shipment Tracking meta box appears on order edit screen
- [ ] Enter tracking number → URL auto-builds → "Mark as Shipped" transitions order
- [ ] Shipped email arrives with correct tracking details
- [ ] Save a product in WP → Next.js revalidation fires (check Next.js logs)

### Next
**Phase 8: Customer Account + Auth**

---

## Order Tracking Backend (mygift-core plugin v0.2.0)

### Status: SUPERSEDED — see v0.3.0 rewrite above

### Built

**WP plugin: wp-plugin/mygift-core/**

- **`mygift-core.php`** (v0.2.0) — requires and bootstraps all new classes; emails registered on `woocommerce_loaded`
- **`includes/class-order-statuses.php`** — Registers `wc-confirmed`, `wc-packed`, `wc-shipped` post statuses; inserts them in WC status dropdown immediately after `wc-processing`; adds bulk actions (`mark_confirmed`, `mark_packed`, `mark_shipped`) for both traditional and HPOS order lists; colored admin badge CSS (blue/gold/wine)
- **`includes/class-status-timestamps.php`** — Hooks `woocommerce_order_status_changed`; writes ISO-8601 timestamps to `_ts_confirmed`, `_ts_packed`, `_ts_shipped`, `_ts_delivered` meta on first transition (never overwritten — audit trail)
- **`includes/class-shipment-tracking.php`** — "Shipment Tracking" meta box on order edit screen (side column); courier select (TCS/Leopards/PostEx/M&P/Trax/Other); tracking number text; auto-built tracking URL (JavaScript auto-fills from courier URL pattern + tracking number); manual override checkbox; "Mark as Shipped" one-click button (saves tracking + transitions to `wc-shipped`); HPOS-compatible via `wc_get_page_screen_id()`; saves `_courier`, `_tracking_number`, `_tracking_url`
- **`includes/class-order-emails.php`** — Two email classes extending `WC_Email`:
  - `MYGIFT_Email_Order_Shipped` — triggered on `woocommerce_order_status_shipped_notification`; branded HTML email (wine header, cream bg, white card); tracking card + wine CTA button; gift message echo for gift orders; plain-text fallback
  - `MYGIFT_Email_Order_Packed` — triggered on `woocommerce_order_status_packed_notification`; short "almost there" email; enabled via settings toggle
- **`includes/class-admin-columns.php`** — "Tracking" column on order list; shows courier label + tracking number as clickable link; HPOS-compatible (both `edit-shop_order` and `woocommerce_page_wc-orders` hooks)
- **`includes/class-settings.php`** (updated) — Added "Packed Email" toggle to settings page; sanitized separately

**Next.js: apps/web/**

- **`lib/woo/order-status.ts`** (new) — Canonical status map shared between actions.ts and OrderTimeline.tsx:
  - `TimelineStatus` type: `placed | confirmed | packed | shipped | delivered`
  - `OrderDisplayStatus`: `TimelineStatus | 'cancelled'`
  - `TIMELINE_STEPS` array with key+label pairs
  - `WOO_STATUS_MAP` record + `mapWooStatus()` function
  - `getStepIndex()` helper
- **`app/track-order/actions.ts`** (updated) — Imports from `lib/woo/order-status`; reads new meta keys (`_courier`, `_ts_confirmed`, `_ts_packed`, `_ts_shipped`, `_ts_delivered`); builds `timestamps` partial record; handles cancelled/refunded/failed as `cancelled` state; mock updated with `timestamps` fixture
- **`components/content/OrderTimeline.tsx`** (updated) — Imports `TIMELINE_STEPS`/`getStepIndex` from `lib/woo/order-status`; cancelled state shows info banner with contact link instead of timeline; per-step timestamps displayed when present; minor transition animation on wine connector line

**Skill: `.claude/skills/headless-wp-woo/SKILL.md`** (updated) — Section 6a added: custom statuses, canonical status→timeline map table, shipment tracking meta keys table, REST response field list with security note

### Courier tracking URL patterns
| Courier  | URL pattern                                           |
|----------|-------------------------------------------------------|
| TCS      | `https://www.tcsexpress.com/track/{number}`           |
| Leopards | `https://www.leopardscourier.com/track/{number}`      |
| PostEx   | `https://postex.pk/track-order/{number}`              |
| M&P      | `https://mp.pk/tracking?cn={number}`                  |
| Trax     | `https://traxlogistic.com/tracking/{number}`          |
| Other    | Manual URL required                                   |

### QA checklist (run on live WP install)
- [ ] Activate plugin — verify `confirmed`, `packed`, `shipped` appear in order status dropdown
- [ ] Move test order: pending → confirmed → packed → shipped → completed
  - [ ] `_ts_confirmed`, `_ts_packed`, `_ts_shipped`, `_ts_delivered` timestamps recorded in order meta
  - [ ] Admin badge colors change at each step
  - [ ] Tracking column shows courier + tracking # once entered
  - [ ] /track-order timeline reflects each step live
- [ ] Shipment tracking meta box: enter courier + tracking number → URL auto-built → click "Mark as Shipped" → order transitions + email sends
- [ ] Shipped email: arrives, shows tracking card + wine CTA button; tracking link opens courier site
- [ ] Gift order: tracking page shows items without prices when `_hide_prices=1`
- [ ] Wrong phone + real order number → generic "couldn't find" error (no info leak)
- [ ] Rate limit: 6th request within 60s → "Too many requests" error
- [ ] WC REST response for order: billing/payment fields NOT included in `TrackOrderResult` (stays server-side)
- [ ] Cancelled order: /track-order shows the banner, not the timeline

### Next
**Phase 8: Customer Account + Auth**

---

## Header Redesign + 11 Footer Content Pages

### Status: COMPLETE ✓ (QA passed 2026-06-12)

### Built

**Header / Navigation**
- `components/layout/Header.tsx` — full rewrite: sticky `position: sticky top-0 z-40`, scroll shadow, desktop mega menu (`absolute inset-x-0 top-full` with 2px wine accent bar, "Browse" left column + auto-split child columns), mobile full-height drawer with own header bar + bottom icon strip (Search/Account/Wishlist/Cart)
- `lib/config/nav.ts` — single-source nav config: `NAV_ITEMS` (mock mode), `FIXED_NAV_BEFORE`/`FIXED_NAV_AFTER` (production WC mode); user edits this file to add/remove/reorder nav items
- `lib/woo/rest-client.ts` — added `fetchWooNavCategories()`: fetches live WC categories, groups by parent, returns nav-ready array with real slugs (fixes Kids → 404 bug)
- `app/layout.tsx` — fetches WC nav categories server-side when `WOO_REST_ENABLED`; merges into nav array; falls back to `NAV_ITEMS` in mock mode

**Bug fixes**
- QuickView close button: moved to last DOM child to avoid stacking context paint-over from scrollable right panel
- Mega menu hover flicker: moved `onMouseLeave` to `<header>` element (not individual button) so mouse can travel to panel
- Kids category 404: nav now built from live WC slugs, not hardcoded assumptions
- Mobile product grid: `grid-cols-1` on all small breakpoints across all 3 column modes
- Mobile product card: hover overlay hidden on mobile (`hidden sm:flex`); explicit "Add to Cart" button shown below product info on mobile

**11 Footer Content Pages**

Infrastructure:
- `lib/wp/queries/pages.ts` — `GET_WP_PAGE`, `GET_FAQ_PAGE`, `GET_CAREERS_PAGE`, `GET_BLOG_POSTS`, `GET_BLOG_POST`, `GET_BLOG_SLUGS` + TypeScript interfaces
- `lib/content/size-charts.ts` — `WOMEN_SIZES`, `MEN_SIZES`, `KIDS_SIZES` with fabric guides
- `lib/seo/schema.ts` — added `faqPageSchema()`, `localBusinessSchema()`, `articleSchema()`
- `lib/utils/rate-limit.ts` — in-memory Map rate limiter with TTL
- `components/layout/ContentPageLayout.tsx` — shared server layout: breadcrumbs + RibbonHeading H1 + intro
- `components/ui/Callout.tsx` — `info` / `warning` variants
- `components/content/ProseContent.tsx` — WP HTML with Tailwind arbitrary variant styling
- `lib/wp/fixtures/index.ts` — added fixtures for `GetWpPage`, `GetFaqPage`, `GetCareersPage`, `GetBlogPosts`, `GetBlogPost`, `GetBlogSlugs`

Routes (all have: `generateMetadata`, canonical, BreadcrumbList JSON-LD, one H1, cream bg, breadcrumbs):
- `app/track-order/` — form + `TrackOrderClient` + `OrderTimeline` (5-step, pulse on current, wine fill); server action: rate-limited 5/min, requires BOTH order number AND billing phone, `_hide_prices` meta respected; mock: order 1001 + phone ending 3001234567
- `app/contact/` — contact info card + `ContactForm` with honeypot field; server action: honeypot silently succeeds, rate-limited 3/min; `LocalBusiness` JSON-LD
- `app/faqs/` — `FaqsClient` accordion; `FAQPage` JSON-LD
- `app/size-guide/` — 3-tab table (Women/Men/Kids) from `size-charts.ts`
- `app/shipping-policy/` — WP content via `GET_WP_PAGE`
- `app/returns/` — WP content via `GET_WP_PAGE`
- `app/about/` — WP content + Why MYGIFT feature cards + CTAs; sr-only H1
- `app/blog/` — `PostCard` grid; handles empty state gracefully
- `app/blog/[slug]/` — `generateStaticParams`; `Article` JSON-LD; in-page TOC via `IntersectionObserver`
- `app/careers/` — job listings from `GetCareersPage`; empty state when no listings
- `app/privacy-policy/` — WP content via `GET_WP_PAGE`
- `app/terms/` — WP content via `GET_WP_PAGE`

**Sitemap**: all 11 new routes added with appropriate priorities
**Footer**: "Track Your Order →" prominent CTA added above bottom bar
**Fixtures fix**: `/shipping` → `/shipping-policy`; `/privacy` → `/privacy-policy`

### QA results (2026-06-12)
- [x] `pnpm typecheck` — zero errors
- [x] All 11 routes exist (verified via glob)
- [x] All 12 pages (11 + blog/[slug]) have `application/ld+json` JSON-LD
- [x] BreadcrumbList present on all pages (via `ContentPageLayout` or direct injection)
- [x] One H1 per page (via `ContentPageLayout` or per-page `RibbonHeading as="h1"`)
- [x] Security: no WP admin URLs in client code; no secrets in client bundles
- [x] Hardcoded hex: only in OG image route, styleguide token display, and gift ribbon palette data (all permitted)
- [x] Contact honeypot present + server action silently succeeds on bot submission
- [x] Track order: requires both order number AND phone; rate-limited 5/min
- [x] Dead footer links fixed: `/shipping-policy` and `/privacy-policy` in fixtures
- [x] Sitemap includes all 11 new pages

### Next
**Phase 8: Customer Account + Auth**

---

## SEO Audit Fixes — 2026-06-20

### Status: COMPLETE ✓ (build passes, zero TS/lint errors)

### Fixes shipped

**CRITICAL**
1. **BASE_URL localhost guard** — created `lib/config/site.ts`; exports `BASE_URL` that hard-forces `https://www.mygift.pk` when `NEXT_PUBLIC_SITE_URL` contains `localhost` in a production build. Every page in the app (18 route files + schema.ts + sitemap + robots + csrf) now imports from this single source. ⚠️ **Manual action required**: set `NEXT_PUBLIC_SITE_URL=https://www.mygift.pk` in Vercel → Settings → Environment Variables → Production.
2. **HTML in product meta descriptions** — created `lib/utils/html.ts` (`stripHtml`, `sanitizeMetaDescription`). Product `generateMetadata` now strips tags + decodes entities + truncates to 155 chars for `description`, `og:description`, `twitter:description`. `productSchema()` description also sanitized.

**HIGH**
3. **JSON-LD confirmed rendering** — Organization + WebSite+SearchAction + LocalBusiness: layout.tsx `<head>`. Product+Breadcrumb: product page JSX. ItemList (8 featured products): homepage JSX (guards against empty WooCommerce response).
4. **ProductCard double sale price** — `ProductCardGrid` was passing `p.price` (WC effective/sale price) as the struck-through price AND `p.salePrice` (same value). Fixed to pass `p.regularPrice || p.price` so cards show `~~Rs. 14,000~~ Rs. 11,200`.
5. **Sitemap gift-components exclusion** — `EXCLUDED_CATEGORY_SLUGS` Set added before category URL generation; filters `gift-components`, `gift-component`, `uncategorized`.
6. **Hero LCP image size** — `deviceSizes` capped at 1920 in `next.config.ts` (removes 3840 breakpoint). HeroSlider `sizes` updated per image role: mobile bg `100vw`, desktop bg caps at `1920px` for large viewports, preventing 3840px requests on retina.

### QA results (2026-06-20)
- `pnpm typecheck` → 0 errors ✓
- `pnpm lint` → 0 errors ✓
- `pnpm build` → 0 errors, all 40 product pages prerendered ✓
- Heading order: H1 in HeroSlider (hero), product name H1 on PDP — correct ✓
- robots.txt: disallows /api/, /account/, /cart, /checkout, /wishlist, /order-confirmation, /styleguide; references sitemap ✓

### Remaining (not code — user action required)
- [ ] **Vercel**: set `NEXT_PUBLIC_SITE_URL=https://www.mygift.pk` in production env (this is the #1 priority — nothing else matters until this is done)
- [ ] **WP admin**: update placeholder contact details (phone/email/WhatsApp) via MYGIFT → Global Settings
- [ ] **Google Search Console**: submit sitemap.xml after deploying; verify Rich Results Test passes for a product URL
- [ ] **Nav/catalog**: decide whether to load clothing products or trim the Women/Men/Kids nav links until they have products

---

## Phase 7 — SEO Foundation

### Status: COMPLETE ✓ (QA passed 2026-06-12)

### Built
- `app/robots.txt` — disallows /api/, /cart, /checkout, /wishlist, /order-confirmation, /account/, /styleguide; sitemap reference
- `app/sitemap.xml` — dynamic ISR (1h/1y), 72 URLs: 4 static + 12 WooCommerce categories + 56 products; safe fallback when WC unreachable
- `app/api/og/route.tsx` — 1200×630 OG image: cream bg, wine brand mark + ribbon accent, uppercase title, stone subtext; no external dependencies
- `app/shop/page.tsx` — canonical, openGraph, BreadcrumbList JSON-LD; BASE name conflict resolved
- `app/gifts/page.tsx` — canonical + openGraph with /api/og fallback
- `app/gift-builder/page.tsx` — canonical + openGraph with /api/og fallback
- `app/product/[slug]/page.tsx` — canonical always from NEXT_PUBLIC_SITE_URL (not Yoast backend); twitter card; OG fallback
- `app/category/[slug]/page.tsx` — same; generateStaticParams try-catch for resilience
- `app/page.tsx` — `title.absolute` prevents template duplication

### QA bugs caught and fixed
1. Canonical pointed to WP backend (`anas.inflowcommerce.com`) from Yoast — always compute from NEXT_PUBLIC_SITE_URL
2. Home page title duplicated brand name via template — fixed with `title.absolute`
3. OG `img` param crashed on external WebP — unused feature removed

### Next
**Phase 8: Customer Account + Auth**

---

## Phase 6 — Gift Builder

### Status: COMPLETE ✓

### Built

**Data layer**
- `lib/wp/queries/gift.ts` — `GET_GIFT_BUILDER_OPTIONS` query + TypeScript interfaces (`GiftBox`, `GiftComponent`, `GiftAddOn`, `GiftBuilderOptions`, `GiftBuilderOptionsResponse`)
- `lib/wp/fixtures/index.ts` — added `GetGiftBuilderOptions` fixture: 3 boxes, 13 components across 4 categories (Chocolates/Candies/Biscuits/Extras), 2 add-ons, 6 ribbon colors, 7 occasions
- `lib/stores/gift.ts` — Zustand store persisted to `mygift-builder-v1`; box selection with capacity trimming; item add/remove/qty with slot enforcement; add-ons toggle; `selectSlotsUsed` + `selectDisplayTotal` selectors

**Server API**
- `app/api/gift/add-to-cart/route.ts` — validates boxId, item qty sanity, message sanitization; in MOCK_MODE validates against fixture prices and respects capacity; computes `serverTotal`; returns 409 with `updatedTotal` if `clientTotal` drifts; on success returns normalized `CartData` with bundle item appended; real mode returns 503 until WP plugin installed

**UI Components**
- `components/gift/GiftProgress.tsx` — gold step bar, 4 labeled steps with done/active/pending states
- `components/gift/StepBox.tsx` — 3 box cards, gold selection ring + check badge, price + capacity
- `components/gift/StepFill.tsx` — category tab switcher (gold active indicator), 13 component cards with placeholder emoji, add/qty stepper/remove per card, slot dots tracker, "Box is full" banner, selection tray with tags
- `components/gift/StepPersonalize.tsx` — message textarea with live char count + card preview, ribbon color swatches (6, with inline CSS color), occasion pill grid (single-select), add-on toggles with checkboxes
- `components/gift/StepReview.tsx` — gift summary card (box, items, personalisation, add-ons, price breakdown), 409 price mismatch banner, "Add Gift to Cart" CTA with spinner; on success sets Zustand cart, opens drawer, resets builder
- `components/gift/GiftBuilderShell.tsx` — orchestrates 4 steps; animated price ticker (RAF easing); "Start over" with 3-second confirm safety; fixed bottom bar (Back + gold total + Next/Review); `canProceed` gate on step 1
- `components/gift/GiftBuilderLoader.tsx` — `'use client'` wrapper for `dynamic(..., { ssr: false })`; Skeleton fallback

**Page**
- `app/gift-builder/page.tsx` — `force-dynamic`, fetches `GetGiftBuilderOptions` from WP/fixture, renders `GiftBuilderLoader`

### Verified
- [x] pnpm typecheck — clean
- [x] pnpm lint — 0 errors, 5 pre-existing warnings (checkout only)
- [x] pnpm build — zero errors; /gift-builder dynamic; /api/gift/add-to-cart dynamic
- [x] No hardcoded hex colors (except RIBBON_SWATCHES navy/blush/sage which have no design token)

### Next: Phase 7 — WP Plugin Integration (mygift-core)

---

## Phase 5 — Checkout + Order Confirmation

### Status: COMPLETE ✓

### Built

**Checkout lib**
- `lib/woo/checkout.ts` — `storeCheckout()` via Store API `/checkout` POST (uses same Cart-Token session); `restCreateOrder()` via WooCommerce REST v3 fallback; `CheckoutAddress`, `CheckoutPayload`, `StoreCheckoutResponse`, `RestOrderPayload` types; `PK_PROVINCES` list (7 provinces with ISO state codes); `PAYMENT_METHODS` (COD + bank transfer)

**Checkout API route**
- `app/api/checkout/route.ts` — validates billing fields server-side; re-fetches cart from Store API to confirm it's not empty; builds `CheckoutPayload`; calls `storeCheckout(payload, token)`; on success: calls `storeClearCart`, deletes `woo-cart-token` cookie so next visit starts with a fresh session; returns `{ order_id, order_number, order_key, order_status, payment_redirect }`

**Checkout UI**
- `app/checkout/page.tsx` — dynamic, noindex server shell
- `components/checkout/CheckoutClient.tsx` — full client checkout:
  - Contact section (first/last name, email, phone)
  - Delivery address (address, city, province dropdown, postcode, country)
  - Payment method selector (COD with truck icon, bank transfer with account details revealed on select)
  - Order notes textarea
  - Order summary sidebar (sticky desktop / collapsible accordion mobile) — shows cart items with quantity badge, discounts, subtotal, shipping, total
  - Place Order button with lock icon + total, spinner while submitting
  - Client-side validation (required fields, email format, phone format) with inline errors
  - Server error display
  - On success: clears Zustand cart, redirects to confirmation or payment gateway URL

**Order confirmation**
- `app/order-confirmation/page.tsx` — reads `?id`, `?num`, `?method` params; shows order number card; COD instructions (delivery timeline); Bank Transfer instructions (account details + reference number); WhatsApp support link; Continue Shopping CTA

### Verified
- [x] pnpm typecheck — clean
- [x] pnpm lint — clean
- [x] pnpm build — zero errors; /checkout dynamic; /order-confirmation static; /api/checkout dynamic

### Next: Phase 7 — WP Plugin Integration (mygift-core)

---

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

## Phase 4 — Cart Drawer, Cart Page, Wishlist

### Status: COMPLETE ✓

### Built
**Data layer**
- `lib/wp/queries/cart.ts` — GET_CART, ADD_TO_CART, UPDATE_ITEM_QUANTITIES, REMOVE_ITEMS_FROM_CART, APPLY_COUPON, REMOVE_COUPON mutations + WooCartItem/WooCart types
- `lib/wp/woo-mutate.ts` — session-aware WooGraphQL mutation helper; forwards `woo-session` cookie as `woocommerce-session` header; returns refreshed token
- `lib/cart/normalize.ts` — normalizes WooGraphQL cart → flat CartData (parseRsPrice, variationLabel, freeShippingRemaining computation)
- `lib/cart/mock.ts` — MOCK_CART (2 items, one with variation) + MOCK_EMPTY_CART
- `lib/cart/route-helpers.ts` — shared helpers for route handlers (getSessionToken, buildCartData, cartResponse, errorResponse, extractCart)
- `lib/cart/client.ts` — typed client-side wrappers: fetchCart, addToCart, updateItemQty, removeItem, applyCoupon, removeCoupon

**Cart API routes**
- `app/api/cart/route.ts` — GET: fetch/hydrate cart; MOCK_MODE returns MOCK_CART
- `app/api/cart/add/route.ts` — POST: add item by productId + variationId + qty
- `app/api/cart/item/route.ts` — PATCH: update qty; DELETE: remove by key
- `app/api/cart/coupon/route.ts` — POST: apply coupon; DELETE: remove coupon
- All routes: read/write `woo-session` httpOnly cookie; MOCK_MODE short-circuits WooGraphQL

**Zustand store**
- `lib/stores/cart.ts` — rewritten: holds CartData; optimistic add/remove/qty/giftWrap helpers; setLoading; derived count
- `lib/stores/wishlist.ts` — localStorage-persisted via zustand/middleware persist; toggle/isWishlisted/getShareableSlugList/loadFromSlugList

**Cart components**
- `components/cart/FreeShippingBar.tsx` — progress bar (wine fill → success-green at 100%), "X away" copy
- `components/cart/CartLineItem.tsx` — thumbnail, name, variation label, qty stepper, remove ×, line total
- `components/cart/CrossSellRail.tsx` — 4 hardcoded gift add-ons (horizontal scroll rail), direct addToCart
- `components/cart/CartPageClient.tsx` — full cart page: item list, coupon form, order note, trust badges, sticky summary panel, gift-wrap toggle, empty state

**Rebuilt CartDrawer**
- `components/layout/CartDrawer.tsx` — real items from store, free-shipping bar, gift-wrap toggle, discount chips, cross-sell rail, sticky Checkout + View Cart, spring-animated, Esc/backdrop close, focus trap, scroll lock, hydrates cart on first open

**Updated components**
- `components/product/ProductCardGrid.tsx` — calls addToCart API; VARIABLE products navigate to PDP instead of direct add; wires wishlist toggle from store
- `components/product/ProductActions.tsx` — calls addToCart API with variationId; wishlist button reads/writes store (fill-wine when saved)
- `components/product/StickyATC.tsx` — calls addToCart API; removed old setCount dependency

**Routes**
- `app/cart/page.tsx` — wraps CartPageClient (dynamic, robots: noindex)
- `app/wishlist/page.tsx` — wraps WishlistPageClient in Suspense (for useSearchParams)
- `components/wishlist/WishlistPageClient.tsx` — grid with remove ×, share link (clipboard), add-to-cart (navigates to PDP), ?items= URL share restore, empty state

### Verified
- [x] pnpm typecheck — clean
- [x] pnpm lint — clean (0 errors, 0 warnings)
- [x] pnpm build — zero errors; /cart + /wishlist static; 4 cart API routes dynamic; 8 product pages SSG
- [x] No hardcoded hex colors in components/ or lib/

---

## Phase 3 — Shop, Category, Product, Quick View

### Status: COMPLETE ✓

### Built
**Data layer**
- `lib/wp/queries/shop.ts` — GET_SHOP_PRODUCTS, GET_CATEGORY_WITH_PRODUCTS, GET_PRODUCT, GET_PRODUCT_SLUGS, GET_CATEGORY_SLUGS + all TypeScript types (WpSeo, ProductAttribute, ProductVariation, ProductFull, CategoryData, ShopProductsData, CategoryPageData, ProductPageData)
- `lib/wp/fixtures/index.ts` — expanded: GetShopProducts (8 mock products + pageInfo), GetCategoryWithProducts (women category + products), GetProduct (full VARIABLE product, 12 variations: 2 types × 6 sizes, Stitched/XXL OUT_OF_STOCK), GetProductSlugs (8 slugs), GetCategorySlugs (4 slugs)
- `lib/utils/filters.ts` — parseFilters(), buildFilterUrl() (resets page on filter change), getActiveFilterCount(), clearAllFilters()
- `lib/seo/schema.ts` — added productSchema() and collectionPageSchema()

**Shop components**
- `components/shop/FilterSidebar.tsx` — desktop Link-based toggles (type, size chips, on-sale, sort), sticky positioning
- `components/shop/FilterBottomSheet.tsx` — mobile sheet (spring animation), pending state applied on "Show Results", size/type/sale/sort controls
- `components/shop/ActiveFilters.tsx` — dismissible Link chips for active filters
- `components/shop/CategoryIntro.tsx` — collapsible intro text (line-clamp-3 → expand)

**Product components**
- `components/product/ProductGallery.tsx` — vertical thumbs (desktop), main 3:4 image, zoom modal (AnimatePresence), mobile dot indicators
- `components/product/ProductActions.tsx` — type/size selectors (OUT_OF_STOCK strikethrough), qty stepper, ATC + wishlist + WhatsApp, disabled state when no size selected
- `components/product/ProductActionsWrapper.tsx` — client wrapper owning actionsRef + size guide open state
- `components/product/StickyATC.tsx` — IntersectionObserver hides bar while main ATC is visible, mobile-only
- `components/product/SizeGuideModal.tsx` — measurement table XS–XXL
- `components/product/QuickViewModal.tsx` — bottom sheet (mobile) / centered modal (desktop), shows Gallery + Actions, links to full PDP

**Routes**
- `app/shop/page.tsx` — GET_SHOP_PRODUCTS, FilterSidebar + FilterBottomSheet + ActiveFilters + ProductCardGrid
- `app/category/[slug]/page.tsx` — GET_CATEGORY_WITH_PRODUCTS, generateStaticParams, generateMetadata, BreadcrumbList + CollectionPage JSON-LD, CategoryIntro
- `app/product/[slug]/page.tsx` — GET_PRODUCT, generateStaticParams (8 slugs), generateMetadata, BreadcrumbList + Product JSON-LD, description HTML, related products
- `app/@modal/default.tsx` — null (parallel route default)
- `app/@modal/[...catchAll]/page.tsx` — null (catch-all for non-intercepted routes)
- `app/@modal/(.)product/[slug]/page.tsx` — intercepts /product/[slug] on client nav, renders QuickViewModal
- `app/layout.tsx` — updated to accept optional `modal?: ReactNode` slot

**Design tokens**
- `styles/tokens.css` — added `--whatsapp: #25D366`
- `app/globals.css` — added `--color-whatsapp` mapping

### Verified
- [x] pnpm typecheck — clean
- [x] pnpm lint — clean (0 errors, 0 warnings)
- [x] pnpm build — zero errors, 8 product pages statically prerendered, all routes resolved
- [x] No hardcoded hex colors in components/ or app/ (except styleguide display data)

---

## Phase 2 — Layout Shell + Admin-Driven Home

### Status: COMPLETE ✓

All Phase 2 components built and verified. See prior notes.

---

## Phase 1 — Component Library

### Status: COMPLETE ✓

All 16 components built and verified. See prior session notes.

---

## Phase 0 — Environment, Scaffold, WP Foundation

### Status: COMPLETE ✓

Next.js 16.2.9, Tailwind v4, monorepo scaffold, WP plugin stub. See prior session notes.

---

## Next: Phase 4 — Cart, Checkout, WooCommerce Integration

---
_Updated: 2026-06-12_
