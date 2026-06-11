# PHASES.md — MYGIFT Build Plan (work strictly in order)

Rule reminder: load the listed skills before starting. If a needed skill is missing,
create it first per CLAUDE.md rule 1. A phase ends only when its Definition of Done
(DoD) fully passes; log results in docs/PROGRESS.md.

---

## PHASE 0 — Environment, Scaffold, WP Foundation
Skills: headless-wp-woo, mygift-design-system, mygift-qa

PROMPT:
Scaffold the monorepo per CLAUDE.md layout. Next.js 15 + TS + Tailwind + ESLint +
Prettier; install zustand, framer-motion, clsx. next/font: Poppins 400/500/600 +
Bebas Neue. Create styles/tokens.css with every constant from CLAUDE.md and map
Tailwind theme to the CSS vars. Create .env.example (WP_GRAPHQL_URL, WC_CONSUMER_KEY,
WC_CONSUMER_SECRET, REVALIDATE_SECRET, JWT_SECRET, NEXT_PUBLIC_SITE_URL,
PAYMENTS_SANDBOX). Build lib/wp/client.ts (typed fetchGraphQL with tag-based
caching per the headless-wp-woo skill) and app/api/revalidate/route.ts
(secret-checked, revalidateTag). Create docs/ files. Write docs/WP-SETUP.md: exact
WordPress install checklist — subdomain install; plugins (WooCommerce, WPGraphQL,
WooGraphQL, ACF Pro, WPGraphQL for ACF, Yoast + Yoast WPGraphQL addon, Wordfence);
category tree (Women/Men/Kids each with Stitched+Unstitched; Gifts with occasions;
hidden "Gift Components" with Boxes/Chocolates/Candies/Biscuits/Add-ons); global
attribute pa_type (Stitched/Unstitched); seed 24 dummy clothing products + 8 gift
components with images and prices. Scaffold wp-plugin/mygift-core (plugin header,
settings stub, save_post/product-update → POST /api/revalidate webhook sender).
Add a /styleguide route rendering all tokens, both fonts, and a first RibbonHeading.
If WP is not live yet, implement a documented MOCK_MODE in the client returning
fixture data, and note it in BLOCKERS.md.

DoD: build+lint clean · fetchGraphQL returns data (live or mock, documented) ·
/api/revalidate → 401 without secret, 200 with · /styleguide shows all tokens +
fonts + ribbon line · WP-SETUP.md complete · committed.

---

## PHASE 1 — Component Library
Skills: mygift-design-system, mygift-qa

PROMPT:
Build the full UI kit on /styleguide per the design-system skill: Button (primary/
secondary/ghost, loading, disabled), Input, Select, QtyStepper, FilterChip, Badge
(Sale=wine-tint, New, Gift=gold), RibbonHeading (semantic h1–h3 prop, ribbon-line
draws on scroll, reduced-motion safe), ProductCard (3:4 image on cream, hover
second-image crossfade, slide-up quick actions QuickView/♥/Add, price + sale
strike), Skeleton set, Drawer (right 400px, backdrop blur, focus trap, Esc,
scroll-lock), Modal, Accordion, Tabs, Toast, Breadcrumbs, EmptyState. All keyboard
accessible with wine focus rings. Mobile-first.

DoD: every component visible on /styleguide; 375px + 1440px screenshots reviewed ·
keyboard walkthrough passes · `grep -rn "#[0-9a-fA-F]\{3,6\}" components/` returns
nothing (tokens only) · qa checklist logged.

---

## PHASE 2 — Layout Shell + Admin-Driven Home
Skills: mygift-design-system, headless-wp-woo, mygift-seo

PROMPT:
WP side: create ACF Options "Global" (announcement bar text/link/enabled, header
menu, footer columns, socials, contact, free_shipping_threshold, gift_wrap_price)
and page-builder flexible content "Homepage" with layouts: hero_slider[] (desktop
image, mobile image, heading, subtext, cta_label, cta_link), category_tiles[],
featured_tabs (3 tabs: title + source category/tag), gift_banner, occasion_chips[],
from_abroad_block, trust_row[], instagram_toggle. Expose via GraphQL; document
exact field names in the headless-wp-woo skill references. Next side: Header
(logo, mega-menu from WP menu, search stub, wishlist count, cart trigger),
AnnouncementBar, Footer — tag `global`. Home `/` renders blocks in admin order:
HeroSlider (slide 1 = priority LCP image, fixed aspect 21:9 desktop / 4:5 mobile,
swipe + auto), CategoryTiles, FeaturedProductTabs (server-prefetched), Gift banner
(wine bg + gold, "BUILD A GIFT THEY'LL NEVER FORGET", 3-step mini-graphic, CTA),
OccasionChips, FromAbroad block, TrustRow, optional Instagram grid. Add
Organization + WebSite(SearchAction) JSON-LD + full metadata per seo skill.

DoD: editing/reordering blocks in WP updates the live page via webhook within
seconds, no redeploy · Lighthouse mobile on `/`: LCP < 2.0s, CLS < 0.05 ·
schema validates · screenshots logged.

---

## PHASE 3 — Shop, Category, Product, Quick View
Skills: headless-wp-woo, mygift-design-system, mygift-seo

PROMPT:
/shop and /category/[slug] (server components): filters as URL searchParams —
category, pa_type Stitched/Unstitched, size, color, price range, on-sale; desktop
sidebar, mobile bottom-sheet; active chips, sort, result count; 2-col→4-col grid;
Load More appending ?page=n with crawlable numbered links fallback; ACF category
intro (collapsible); CollectionPage+ItemList+Breadcrumb schema. /product/[slug]:
gallery (vertical thumbs, zoom, swipe), variation selectors (type, size + size-guide
modal), price/sale, qty, Add to Cart (drawer event), wishlist heart, delivery
estimate line, WhatsApp order button, sticky mobile ATC bar, tabs (Description/
Fabric & Care/Size Chart/Reviews/Shipping & Returns), Related; Product+Offer+
Breadcrumb schema; generateStaticParams + ISR tag product:{slug}. Quick View as
intercepted parallel route @modal/(.)product/[slug]: compact modal with mini
gallery, variations, qty, add, link to full page; direct URL renders full page.

DoD: filters compose + share + back-button correctly · variation switching updates
price/stock/images · quick view instant from card AND deep-links to full page ·
product schema passes rich results test · Lighthouse SEO ≥ 95 both templates.

---

## PHASE 4 — Cart Drawer, Cart Page, Wishlist
Skills: headless-wp-woo, mygift-design-system, mygift-qa

PROMPT:
Implement cart per headless-wp-woo: /api/cart/* route handlers proxy WooGraphQL,
session token in httpOnly cookie; Zustand store hydrated from server; optimistic
updates with rollback. Any Add to Cart opens the Drawer: items (thumb, name,
variation, qty stepper, remove), free-shipping progress bar from Global threshold
("Rs. X away…", wine fill, celebrate at 100%), gift-wrap toggle (+price), subtotal,
sticky Checkout + View Cart, cross-sell rail "Add a little extra 🎁" (4 small gift
add-ons). Cart icon count pulses on add. /cart full page: list, coupon (server-
applied), order note, delivery estimator, trust badges, branded empty state.
/wishlist: guest localStorage, hearts toggle everywhere, add-to-cart from grid,
shareable ?items= link, empty state.

DoD: add/update/remove/coupon persist across refresh · server total always equals
Woo recalculation (write a small test) · drawer focus-trap/Esc/scroll-lock correct ·
wishlist survives refresh; share link restores.

---

## PHASE 5 — Checkout, Payments, Accounts, Gift Mode
Skills: headless-wp-woo, mygift-design-system, mygift-qa
(If a payments skill would help, CREATE `mygift-payments` capturing the chosen
gateway contracts, then use it.)

PROMPT:
/checkout: single-page 3 steps (Contact → Delivery → Payment), inline validation,
summary rail. "🎁 This order is a gift" toggle reveals: recipient name/phone/
address separate from sender billing, preferred delivery date, free card message
(200 chars, live preview), hide-prices-on-receipt — all to order meta. Server-side
Woo order creation. Methods: COD (default), Bank Transfer (instructions screen),
JazzCash + Easypaisa, and international cards via the provider in env (Safepay/
PayFast/Stripe entity). Where credentials are missing, build behind
PAYMENTS_SANDBOX=true with mocked success/fail screens and document the real swap
in BLOCKERS.md. /order-confirmation/[id] with summary + gift message echo.
Accounts: register/login (JWT per skill), /account (orders, order detail,
addresses, profile), /track-order for guests (order # + phone). Branded
transactional email templates on the WP side (received/processing/shipped).

DoD: full test order succeeds per enabled method (sandbox ok) · gift orders show
recipient + message + hide-price flag in WP admin · guest tracking works ·
keyboard-only checkout possible · bundle analysis shows zero payment/WP secrets
client-side.

---

## PHASE 6 — Gift Builder (signature feature — take two sprints)
Skills: mygift-gift-builder, headless-wp-woo, mygift-design-system

PROMPT 6A (backend, wp-plugin/mygift-core):
Handle cart items carrying _gift_contents meta: decrement stock for every
component on order creation; render contents expanded (indented list + qtys +
message) in admin order screen, customer emails, and a printable packing slip.
ACF Options "Gift Builder": boxes (name/image/base_price/capacity), allowed
component categories, add-ons (name/price), message_char_limit. Expose over
GraphQL. Server pricing: recompute every component price + stock live, reject
tampered totals or out-of-stock.

PROMPT 6B (frontend /gift-builder):
4 steps per the skill with gold ribbon progress + sticky live price ticker.
1) Box cards. 2) Component grid with category tabs from ACF, tap-to-add + qty
steppers, bottom tray (items, slots used/capacity), friendly capacity limit.
3) Personalize: message with live card-mockup preview, ribbon color swatches,
photo-print add-on stub, occasion tag. 4) Review: visual stack + total →
"Add Gift to Cart" → /api/gift/add-to-cart → server validates → ONE cart line
item; drawer opens showing the bundle with expandable contents. Persist builder
state to localStorage. Mobile: full-screen step panels with bottom nav — must be
flawless at 375px.

DoD: client-total tampering rejected server-side (test it) · out-of-stock blocks
add with clear message · WP admin order shows expanded contents + message ·
packing slip prints · refresh restores builder state · record a 375px screen
capture of the full flow.

---

## PHASE 7 — SEO Hardening, Performance, Content
Skills: mygift-seo, mygift-qa

PROMPT:
Full seo-skill audit of every template. Build app/sitemap.ts (split indexes,
lastmod from WP, EXCLUDE hidden gift components), robots.ts (block /api /account
/cart /checkout /wishlist), dynamic OG image route /api/og (cream bg, Bebas title,
wine ribbon, optional product image). Occasion landing pages /gifts/[occasion]
(Birthday, Anniversary, Eid, Wedding…): ACF intro, curated products, FAQPage
schema. Static pages from WP (about, contact+form, faqs, shipping, returns,
privacy, terms). /blog + /blog/[slug]: Article schema, TOC, related. Performance:
bundle analysis, dynamic-import heavy client comps (zoom, builder), image sizes
audit, font preload check. 301 map from WP Redirection → next.config. GA4 + Meta
Pixel via lightweight consent loader. Google Merchant feed endpoint or documented
plugin choice.

DoD: Lighthouse mobile Home/Category/Product/Gift-builder: Perf ≥ 90, SEO ≥ 95,
A11y ≥ 95, BP ≥ 95 · all schema validates · sitemap correct · unique
title/description/OG per page.

---

## PHASE 8 — QA, Hardening, Launch
Skills: mygift-qa (+ all as needed)

PROMPT:
Run the full mygift-qa checklist site-wide; fix everything. Cross-browser
(Chrome/Safari/Firefox, iOS Safari, Android Chrome). Branded 404/500. Security:
rate-limit cart/checkout/gift APIs, sanitize gift messages, CSP/HSTS/X-Frame
headers, WP admin IP-allowlist + verified noindex. docs/RUNBOOK.md for the
marketing team with screenshots: edit hero, add product, configure a gift box,
create an occasion page, change announcement bar. Sentry + uptime monitoring,
WP backups. Deploy: Next.js → Vercel prod, DNS mygift.pk → frontend,
admin.mygift.pk → WP. Place 3 real test orders (clothing COD, gift bundle prepaid,
international card sandbox); verify emails + admin views. Search Console verified,
sitemap submitted.

DoD (= LAUNCH): 3 test orders perfect · monitoring live · runbook delivered ·
a non-developer edits the hero successfully · Search Console submitted.

---

## POST-LAUNCH BACKLOG (do not start before launch)
Photo reviews · Urdu locale · Algolia/Typesense search · occasion reminder emails
("last year you sent…") · loyalty points · courier API integration (TCS/Leopards/
PostEx) · wishlist account sync.
