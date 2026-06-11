# MYGIFT (mygift.pk) — Full Development & Design Plan
**Headless WordPress + Next.js Ecommerce Store**
Clothing (Men / Women / Kids · Stitched & Unstitched) + Customizable Gift Builder · Pakistan + International Gifting

---

## 1. Project Overview

| Item | Detail |
|---|---|
| Brand | MYGIFT — mygift.pk |
| Backend | WordPress + WooCommerce (headless, admin-only) |
| Frontend | Next.js 15 (App Router, React Server Components) |
| API Layer | WPGraphQL + WooGraphQL (REST fallback for checkout/orders) |
| Markets | Pakistan (primary) + International senders gifting into Pakistan |
| Core USP | Clothing store + interactive "Build Your Own Gift" bundle builder |
| Goals | 90+ Lighthouse, full SEO (schema, sitemaps, OG), admin controls everything, distinctive clean design |

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS / GOOGLE                       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Next.js 15 (App   │   Vercel / VPS (Edge CDN)
                    │   Router, RSC, ISR) │   mygift.pk
                    └──────────┬──────────┘
                               │ GraphQL / REST (server-side only)
                    ┌──────────▼──────────┐
                    │  WordPress + Woo    │   admin.mygift.pk (hidden,
                    │  (Headless backend) │   noindexed, IP-restricted wp-admin)
                    └──────────┬──────────┘
                               │
        ┌───────────┬──────────┴──────────┬───────────────┐
   Payments      Shipping             Email/SMS        Media CDN
 (COD, JazzCash, (TCS/Leopards/      (order alerts,   (Cloudinary or
  Easypaisa,      PostEx APIs)        WhatsApp API)    WP offload + 
  Stripe intl)                                         next/image)
```

**Key principles**

- WordPress lives on a subdomain (`admin.mygift.pk`), completely hidden from public/Google. All traffic and SEO value goes to the Next.js frontend at `mygift.pk`.
- Next.js fetches via WPGraphQL on the server (RSC) — no API keys or WP URLs exposed to the browser. Cart/checkout mutations go through Next.js API routes (`/api/*`) acting as a secure proxy.
- **ISR + on-demand revalidation:** product/page edits in WP fire a webhook → Next.js revalidates only that page. Content is instant for editors, static-fast for users.

### Backend plugin stack (WordPress)

| Plugin | Purpose |
|---|---|
| WooCommerce | Products, orders, inventory, coupons |
| WPGraphQL + WooGraphQL | GraphQL API for products, categories, cart |
| ACF Pro + WPGraphQL for ACF | All frontend content control (hero, banners, sections) |
| Yoast SEO + WPGraphQL Yoast addon | Meta titles/descriptions editable per page/product, exposed to Next.js |
| JWT Auth / WooCommerce sessions | Customer login, cart persistence |
| Custom plugin: "MYGIFT Gift Builder" | Bundle pricing logic, gift component categories (built in-house, see §6) |
| WP Webhooks / custom hook | On-demand ISR revalidation pings |
| Redirection, WP Mail SMTP, Wordfence | Hygiene & security |

### Frontend stack (Next.js)

- **Next.js 15, App Router, TypeScript, Tailwind CSS** (design tokens as CSS variables)
- **State:** Zustand for cart drawer + wishlist (persisted to localStorage), server components for everything data-heavy
- **Animations:** Framer Motion — used sparingly (drawer slide, hover reveals, hero entrance)
- **Images:** `next/image` with AVIF/WebP, blur placeholders, Cloudinary or WP-served with sizes
- **Search:** instant client search via a lightweight indexed endpoint (later: Typesense/Algolia if catalog grows)

---

## 3. Design System — "Warm Atelier"

You asked for Claude-style design language + your wine red. Here's the system:

### Color tokens

| Token | Hex | Use |
|---|---|---|
| `--wine` (primary) | **#7E2B36** | CTAs, active states, price highlights, logo |
| `--wine-deep` | #5C1F28 | Hover states, footer background |
| `--wine-tint` | #F6ECEE | Badge backgrounds, selected chips, sale tags |
| `--cream` (background) | #FAF8F5 | Page background (Claude-style warm paper, not stark white) |
| `--ivory` | #FFFFFF | Cards, drawer, modal surfaces |
| `--ink` | #1F1A17 | Headings, body text (warm near-black) |
| `--stone` | #8A8178 | Secondary text, captions, borders (#E8E2DA for hairlines) |
| `--gold` (accent, rare) | #C9A24B | "Gift" moments only — ribbon icon, gift-builder progress, festive badges |

Rule: wine is the voice, cream is the room, gold appears only in the gift experience so the gift section *feels* like a celebration the moment you enter it.

### Typography

| Role | Font | Treatment |
|---|---|---|
| Display / headings | **Bebas Neue** | Tall, tracking +2%, used BIG and sparingly — hero headline, section titles ("NEW ARRIVALS", "BUILD A GIFT"), category tiles |
| Body / UI | **Poppins** | 400/500 for body, 600 for buttons & prices. 16px base, 1.6 line height |
| Price & labels | Poppins 600, tabular numbers | Prices always in `--ink`, sale price in `--wine` |

Both loaded via `next/font` (self-hosted, zero layout shift, no external Google Fonts request — better CLS + privacy).

### Signature element (what makes the site memorable)

A **"ribbon line"** motif: a thin 2px wine-colored line that underlines section titles with a small knot/bow notch at the end (pure SVG). It appears under every Bebas Neue heading and animates (draws itself) on scroll. Subtle, ownable, and literally ties the "gift" idea into the clothing store. Used again as the progress bar in the Gift Builder.

### Component personality

- Generous whitespace, 12px radius cards, hairline `#E8E2DA` borders instead of shadows (shadows only on drawer/modals).
- Product cards: image on cream, hover → second image crossfade + quick actions slide up (Quick View / ♥ / Add to Cart).
- Buttons: solid wine, white text, slight letter-spacing, 150ms ease; secondary = wine outline on cream.
- Micro-interactions only where they inform: cart count pulse on add, heart fills with a tiny pop, drawer slides with backdrop blur.

### Design references to study (steal patterns, not pixels)

- **Khaadi / Sapphire / Generation (PK)** — how local fashion brands structure stitched vs unstitched, lawn collections, size charts; what local shoppers already understand.
- **SSENSE / COS** — restraint, typography-led product grids, generous whitespace.
- **Aesop** — warm paper backgrounds + serif/display pairing; the closest existing feel to your cream + wine palette.
- **Sugarwish / Greetabl (US gift sites)** — the step-by-step gift builder UX (pick box → pick treats → add message) is exactly your customize-gift flow, proven to convert.
- **Interflora / Ferns N Petals (intl → home delivery)** — the "sender abroad, recipient local" checkout pattern: separate sender/recipient details, delivery date picker, gift message, hide-prices-on-invoice option.

---

## 4. Sitemap & Page Specs

```
/                       Home
/shop                   All products (filters)
/category/[slug]        Women / Men / Kids / Unstitched / Stitched / Gifts
/product/[slug]         Product detail
/gift-builder           Custom gift bundle builder
/cart                   Full cart page
/wishlist               Favourites
/checkout               Multi-step checkout
/account/*              Orders, addresses, profile
/track-order            Guest order tracking
/about, /contact, /faqs, /shipping-policy, /returns, /privacy, /terms
/blog, /blog/[slug]     SEO content engine
```

### 4.1 Home Page (every block admin-controlled — see §7)

1. **Announcement bar** — editable text + link ("Free shipping over Rs. 3,000 🇵🇰 · We deliver gifts across Pakistan").
2. **Header** — logo, mega-menu (Women / Men / Kids / Unstitched / Gifts), search, ♥ wishlist count, cart icon with count → opens drawer.
3. **Hero** — full-bleed slider (admin sets image, Bebas headline, subtext, CTA label + link, optional second slide). Desktop 21:9, mobile gets a separately uploaded 4:5 crop. First slide is server-rendered + `priority` for LCP.
4. **Category tiles** — Women · Men · Kids · Unstitched · Build a Gift. Editorial photos, Bebas labels, ribbon-line hover. Order & images set by admin.
5. **Featured products** — tabbed rail: New Arrivals / Best Sellers / Sale. Tabs filter client-side, data prefetched.
6. **Gift Builder banner** — full-width wine block with gold accents: "BUILD A GIFT THEY'LL NEVER FORGET" → 3 mini-steps illustration → CTA. (This is a major differentiator; it deserves homepage real estate.)
7. **Shop-by-occasion strip** — Birthday · Anniversary · Eid · Wedding chips → pre-filtered gift category pages (also great SEO landing pages).
8. **Sending from abroad?** block — short reassurance for overseas Pakistanis: pay by card, we deliver to their door, add a free card message. (Targets your second audience explicitly.)
9. **Trust row** — COD · Easy returns · Nationwide delivery · Secure payment.
10. **Instagram / lookbook grid** (optional, admin toggle) + **Footer** — newsletter, links, payment icons.

### 4.2 Shop & Category pages

- Left sidebar filters (desktop) / bottom-sheet filter drawer (mobile): Category, Sub-category, **Stitched / Unstitched** (a top-level attribute filter — critical for PK clothing shoppers), Size, Fabric, Color, Price slider, On Sale.
- Filters update via URL search-params (`?type=unstitched&size=m`) → shareable, crawlable, back-button-safe; rendered server-side so filtered views are SEO-real pages.
- Sort: Newest, Price ↑↓, Best Selling. Toolbar shows result count + active filter chips (dismissible).
- Grid 4-col → 2-col mobile, infinite scroll with "Page 2" URL updates (or Load More + numbered fallback links for crawlers).

### 4.3 Product page

- Gallery: vertical thumbs + zoom-on-hover, swipe on mobile.
- Title (Poppins 600), price, ratings, **Stitched/Unstitched selector** where both exist (as variations), size chips with size-guide modal, fabric/details accordion, quantity, **Add to Cart** (opens drawer), ♥ save, delivery estimate by city, WhatsApp order button (huge in PK).
- Sticky add-to-cart bar appears on scroll (mobile especially).
- Tabs: Description · Fabric & Care · Size Chart · Reviews · Shipping & Returns.
- Related products + "Complete the look".
- Full Product schema (see §8).

### 4.4 Quick View

- Click "Quick View" on any card → centered modal: gallery mini-slider, price, size/variation select, qty, Add to Cart, "View full details" link. Renders via intercepted route (`@modal/(.)product/[slug]`) so it's instant and the URL still works if opened directly.

### 4.5 Cart Drawer (the conversion workhorse)

- Any Add to Cart → drawer slides in from right (380–420px, backdrop blur).
- Contents: line items (thumb, name, variation, qty stepper, remove), **free-shipping progress bar** ("Rs. 540 away from free shipping" — proven AOV booster), subtotal, gift-wrap toggle (+Rs.), gift message field if a gift item is in cart, sticky **Checkout** + "View Cart" buttons.
- Cross-sell row: "Add a little extra 🎁" (small gift add-ons — chocolate bar, card, mug).

### 4.6 Cart page, Wishlist, Checkout

- **Cart page:** full table, coupon field, delivery estimator, order notes, trust badges.
- **Wishlist:** grid of saved items with Add-to-Cart; stored locally for guests, synced to account on login; "share wishlist" link (perfect for gift hinting — on-brand!).
- **Checkout (multi-step, single page):** Contact → Delivery → Payment.
  - **Gift mode toggle:** "This order is a gift" → recipient name/address/phone separate from sender, delivery date preference, free card message, "hide prices on receipt".
  - **Payments:** COD (default PK), JazzCash, Easypaisa, bank transfer, debit/credit cards; **Stripe/PayPal enabled for international cards** so overseas customers can pay while shipping to a Pakistani address.
  - Currency display toggle (PKR default; USD/GBP approx. display for intl visitors via IP hint — charged in PKR or via Stripe in USD, decide with your payment provider).

---

## 5. Catalog Structure (WooCommerce)

```
Clothing
├── Women  ── Stitched │ Unstitched (lawn, chiffon, 2pc/3pc)
├── Men    ── Stitched (kurta, shalwar kameez) │ Unstitched (fabric by meter/suit)
└── Kids   ── Boys │ Girls

Gifts
├── Ready-made gift sets
├── By occasion: Birthday │ Anniversary │ Eid │ Wedding │ Valentine's │ Mother's/Father's Day
└── Gift components (hidden category — feeds the Gift Builder)
    ├── Boxes & wrapping
    ├── Chocolates
    ├── Candies
    ├── Biscuits/Cookies
    ├── Mugs / Cards / Flowers / Add-ons
```

- "Stitched/Unstitched" implemented as **global product attribute** (filterable + usable as variations on a single design sold both ways).
- Occasions as a taxonomy → each occasion gets an SEO landing page ("Birthday gifts for her in Pakistan").

---

## 6. The Gift Builder (your signature feature)

**UX — a 4-step guided flow at `/gift-builder` (Sugarwish-style):**

```
[1 Choose Box] → [2 Fill It] → [3 Personalize] → [4 Review]
 ribbon-line progress bar in gold, price ticker always visible
```

1. **Choose a box/basket** — sets base price + capacity (e.g., Small box: up to 4 items).
2. **Fill it** — component products shown as a tappable grid grouped by tabs (Chocolates / Candies / Biscuits / Extras). Each tap adds it with qty steppers; a live tray at the bottom shows chosen items, slot count, and **running total updating in real time**.
3. **Personalize** — card message (with live preview on a card mockup), ribbon color, optional photo print add-on, occasion tag.
4. **Review** — visual summary; **"Add Gift to Cart"** → the whole bundle enters the cart as **one line item** with the combined final price and a child-list of contents.

**Technical approach:**

- Build a small **custom WP plugin**: a "Gift Bundle" composite product type (or a container product + line-item meta). On add-to-cart, the Next.js API route sends the selected component IDs/qtys → server **recalculates price from the live WooCommerce catalog** (never trust the client's total), validates stock for every component, then creates one cart item with meta listing the contents.
- Order emails/admin order screen show the bundle expanded (so packing staff see exactly: 1× small box, 2× Dairy Milk, 1× candy jar, message text).
- Inventory decrements on each component product. Components are excluded from sitemaps/shop (hidden catalog visibility) but purchasable inside bundles.
- Admin controls (ACF on the Builder settings page): which categories appear as tabs, box sizes/capacities, min/max items, add-on prices, message character limit.

This single feature is hard to copy with a theme — it's your moat. Budget real time for it (≈2 sprints).

---

## 7. Admin-Controlled Frontend (no developer needed for content)

Everything marketing-visible is editable in WordPress via **ACF Pro Options Pages + Flexible Content**, exposed over WPGraphQL:

| WP Admin section | Controls |
|---|---|
| **Homepage Builder** (flexible content) | Add/remove/reorder sections: Hero slides (image desktop + mobile, heading, subtext, CTA text/link), category tiles (image + link + order), featured-product tabs (pick by tag/category), gift banner content, occasion chips, trust badges, Instagram toggle |
| **Global** | Announcement bar (text/link/on-off), header menu, footer columns, social links, contact info, free-shipping threshold |
| **Gift Builder settings** | Boxes, capacities, component categories, add-ons, pricing |
| **SEO** (Yoast per page/product) | Title, meta description, OG image, canonical |
| **Promos** | Sale ribbons, popup (optional), coupon banners |

Publishing any change fires a webhook → Next.js **revalidates instantly**. The marketing team never touches code; the design system constrains their inputs so the site can't be made ugly (image sizes enforced, character limits on headlines).

---

## 8. SEO Plan (complete checklist)

### Technical

- **Rendering:** SSG + ISR for home/category/product/blog (HTML fully rendered for crawlers); streaming SSR for search/filter pages.
- **Core Web Vitals:** LCP < 2.0s (hero `priority` image, font preload via next/font), CLS ≈ 0 (fixed image aspect ratios, no layout-shifting banners), INP < 200ms (RSC = minimal JS).
- `sitemap.xml` (auto: products, categories, occasions, blog; split indexes) + `robots.txt`; WP backend fully `noindex` + blocked.
- Canonicals on all pages; filtered URLs canonicalized to the clean category; pagination with self-referencing canonicals.
- Clean URLs: `/product/red-lawn-3pc-unstitched`, `/category/women-unstitched`. 301 strategy for any renamed slugs (Redirection plugin synced to a Next.js redirects map).
- `hreflang`/geo not needed initially (single locale en-PK), but architecture leaves room for Urdu later.
- HTTPS, HSTS, image AVIF/WebP, edge caching.

### Schema (JSON-LD, injected per template)

| Page | Schema |
|---|---|
| All pages | `Organization` (logo, sameAs socials), `WebSite` + `SearchAction` (sitelinks search box) |
| Product | `Product` + `Offer` (price PKR, availability, condition) + `AggregateRating` + `Review` + `Brand` |
| Category/Shop | `CollectionPage` + `ItemList` |
| All inner pages | `BreadcrumbList` |
| FAQs / product FAQ tab | `FAQPage` |
| Blog | `Article` + author |
| Store info | `LocalBusiness` (if you have a physical address) |

Validate everything in Google Rich Results Test before launch.

### On-page & content

- One H1 per page; Bebas section titles mapped to semantic H2s; descriptive alt text enforced (admin field required).
- Yoast meta per product/page flows into Next.js `generateMetadata()` (title, description, OG/Twitter cards with branded OG image template).
- Category pages get a short editable intro paragraph (keyword-rich, admin-controlled, collapsible).
- **Content engine:** blog targeting PK gifting + fashion queries — "Best birthday gifts for sister in Pakistan", "Lawn suits 2026 guide", "How to send a gift to Pakistan from UK/USA" (this last cluster directly captures your overseas audience).
- Google Merchant Center feed (free listings) + Search Console + GA4 from day one.

---

## 9. Development Phases & Timeline (~10–12 weeks)

| Phase | Weeks | Deliverables |
|---|---|---|
| **0. Foundation** | 1 | Hosting (WP on Cloudways/Kinsta-class PK-friendly host; Next.js on Vercel), domains/subdomain, repo, CI, staging. WP install + plugin stack + WPGraphQL wired. |
| **1. Design** | 1–2 | Design tokens in code, Figma of Home/Shop/Product/Drawer/Gift Builder (desktop+mobile), component library (buttons, cards, inputs, modals) in Storybook or a styleguide route. Sign-off before build. |
| **2. Catalog & content model** | 2–3 | Woo categories/attributes/variations set up, ACF homepage builder + global options, 20–30 real products loaded for development. |
| **3. Core storefront** | 3–5 | Header/footer, Home (all admin blocks), Shop + filters, Category pages, Product page, Quick View, Cart drawer, Cart page, Wishlist. ISR + revalidation webhooks. |
| **4. Checkout & accounts** | 5–7 | Multi-step checkout, gift mode (recipient/sender, message, date), COD + JazzCash/Easypaisa + Stripe intl, order emails (branded), accounts, guest order tracking. |
| **5. Gift Builder** | 7–9 | Custom bundle plugin + 4-step frontend flow, live pricing, stock validation, packing-slip output. |
| **6. SEO & performance hardening** | 9–10 | All schema, sitemaps, metadata pipeline, redirects, Lighthouse ≥90 on mobile, accessibility pass (focus states, contrast, keyboard). |
| **7. QA & launch** | 10–12 | Cross-device QA, test orders on every payment method, load test, GA4 + Search Console + Merchant feed, soft launch → fixes → public launch. |

**Post-launch roadmap:** reviews with photos, Urdu locale, Algolia search, occasion reminder emails ("Ali's birthday is coming up — last year you sent…" — a brilliant retention loop for a gift brand), loyalty points, app via the same API.

---

## 10. Risks & Decisions to Make Early

1. **Confirm headless is worth it for your team size** — headless WooCommerce gives you the speed/design freedom you want, but it means maintaining two systems; the plan above (ISR + admin-controlled blocks) is designed to keep WP people fully self-sufficient after launch.
2. **Payment gateways:** apply for JazzCash/Easypaisa merchant accounts and Stripe (Stripe doesn't operate domestically in Pakistan — typical pattern is Stripe via a supported-country entity or using a PK aggregator like PayFast/Safepay for cards; decide week 1, approvals take time).
3. **Photography is the design.** This layout is image-led; budget a real shoot (cream/neutral backgrounds to match the palette) — it's the single biggest factor in "users must like our site".
4. **Gift Builder pricing rules** (does the box price include N items or is everything additive?) — lock this before Phase 5.
5. **Courier integration** (TCS/Leopards/PostEx) — can start manual, integrate APIs post-launch.
