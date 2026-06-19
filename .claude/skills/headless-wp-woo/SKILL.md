---
name: headless-wp-woo
description: How this codebase talks to WordPress + WooCommerce. Use this skill for ANY data fetching, GraphQL query, cart operation, checkout/order creation, editor-managed content (homepage/global/gift-builder/FAQs/careers/category intros via the mygift-core REST API), caching/ISR/revalidation, auth, or environment variable work — any time WordPress, WooCommerce, products, categories, cart, or orders are involved, even indirectly.
---

# Headless WP/Woo Contract

WordPress (admin.mygift.pk) is the only data source. The browser NEVER talks to
WordPress — everything goes through Next.js server components or /api route handlers.

## 1. Environment

```
WP_GRAPHQL_URL=          # https://admin.mygift.pk/graphql  (server-only)
WC_CONSUMER_KEY=         # Woo REST key (server-only, orders)
WC_CONSUMER_SECRET=
REVALIDATE_SECRET=       # shared with wp-plugin webhook
JWT_SECRET=              # customer auth
NEXT_PUBLIC_SITE_URL=    # https://mygift.pk (the ONLY public var)
PAYMENTS_SANDBOX=true|false
MOCK_MODE=true|false     # fixtures when WP not reachable (dev only)
```
Anything without NEXT_PUBLIC_ prefix must never appear in a client bundle.
Verify with bundle analysis when touched.

## 2. Fetch helper (lib/wp/client.ts)

`fetchGraphQL<T>(query, variables?, { tags, revalidate=3600 })`
- POST to WP_GRAPHQL_URL, JSON, throws typed error with query name on failure.
- Always pass cache tags. Tag convention (exact strings):
  `global` · `home` · `product:{slug}` · `category:{slug}` · `page:{slug}` ·
  `post:{slug}` · `gift-builder`
- MOCK_MODE=true → return fixtures from lib/wp/fixtures/ and log a warning.

## 3. Revalidation contract

wp-plugin/mygift-core sends on every relevant save/update/delete:
`POST {SITE}/api/revalidate  { "secret": "...", "tags": ["product:red-lawn-3pc"] }`
The route: 401 on bad secret; revalidateTag for each; respond `{revalidated:true}`.
Mapping in WP: product→product:{slug}+its category tags; homepage/options→home/global;
gift settings→gift-builder; page/post→page:/post:{slug}.

## 4. Canonical GraphQL fragments (reuse, never re-invent)

- **ProductCardFields**: id, databaseId, slug, name, type, image{sourceUrl,altText},
  galleryImages(first:2), price, regularPrice, salePrice, onSale, stockStatus,
  productCategories{nodes{slug,name}}, attributes for pa_type.
- **ProductFullFields**: card fields + description, shortDescription, full gallery,
  variations{nodes{databaseId, price, stockStatus, stockQuantity, attributes}},
  related(first:8){...ProductCardFields}, seo{...SeoFields}.
- **CategoryFields**: slug, name, description, image, count, seo. (Storefront intro
  is NOT a GraphQL field — fetch it via `fetchCategoryIntro(slug)`, see §4a.)
- **SeoFields** (Yoast): title, metaDesc, canonical, opengraphTitle, opengraphDescription,
  opengraphImage{sourceUrl}, twitterTitle, twitterDescription.
Document any NEW field you add here, in references/fields.md, immediately.

## 4a. Editor-managed content — native mygift-core REST (NOT ACF)

All marketing-editable content is served by the mygift-core plugin's own REST
endpoints (free; no ACF, no SCF, no WPGraphQL-for-ACF). The browser never calls
these — only server components / route handlers, via `lib/wp/home-content.ts`.
Each fetcher returns `null` in MOCK_MODE / on failure / on a stale-shape response;
callers fall back to the exported `DEFAULT_*` constants.

| Fetcher (lib/wp/home-content.ts) | REST endpoint | Shape | Revalidate tags |
|---|---|---|---|
| `fetchHomeContent()` | `/mygift/v1/home-content` | `{ announcementBar, blocks: HomeBlock[] }` | `home`, `global` |
| `fetchGlobalOptions()` | `/mygift/v1/global` | `{ freeShippingThreshold, giftWrapPrice, footer }` | `global` |
| `fetchGiftBuilderOptions()` | `/mygift/v1/gift-builder` | `GiftBuilderOptions` (components read live from Woo) | `gift-builder` |
| `fetchFaqItems()` | `/mygift/v1/faqs` | `FaqItem[]` | `page:faqs` |
| `fetchJobListings()` | `/mygift/v1/careers` | `JobListing[]` | `page:careers` |
| `fetchCategoryIntro(slug)` | `/mygift/v1/category-intro?slug=` | `string` | `category:{slug}` |

TS interfaces (`HomeBlock`, `GlobalContent`, `GiftBuilderOptions`, `FaqItem`,
`JobListing`) live in `lib/wp/queries/*` and remain the contract. The matching admin
screens are under the **MYGIFT** top-level menu (Control Center); each fires its
revalidation tags on save (no `acf/save_post`).

## 5. Cart strategy (WooGraphQL session)

- Session token stored in httpOnly cookie `woo-session` (Secure, SameSite=Lax),
  set/read ONLY in route handlers under app/api/cart/:
  `GET /api/cart` · `POST /api/cart/add {productId, variationId?, qty, meta?}` ·
  `PATCH /api/cart/item {key, qty}` · `DELETE /api/cart/item {key}` ·
  `POST /api/cart/coupon {code}`
- Each handler forwards the session header to WooGraphQL, persists the refreshed
  token, returns the normalized cart `{items[], subtotal, total, discounts,
  shippingEstimate, freeShippingRemaining}` computed from Global threshold.
- Client: Zustand store mirrors the server cart; optimistic update → reconcile with
  handler response → rollback + toast on error. NEVER compute money client-side for
  anything authoritative; display-only.

## 6. Orders & checkout

Order creation via Woo REST (server route handler, consumer key auth):
build line_items from the SERVER cart (refetch — never from client payload),
billing/shipping, payment method id, plus meta_data:
`_is_gift, _gift_recipient{name,phone,address}, _gift_message, _gift_delivery_date,
_hide_prices, _gift_contents` (bundles — see mygift-gift-builder skill).

## 6a. Order tracking pipeline

### Custom WC statuses (registered by mygift-core plugin)
Inserted between `processing` and `completed` in the admin dropdown:
- `wc-confirmed` — order reviewed and confirmed by staff
- `wc-packed`    — order packed, ready to hand to courier
- `wc-shipped`   — handed to courier (tracking info added)

### Canonical status → timeline step mapping
**Single source of truth: `lib/woo/order-status.ts`** — import `mapWooStatus`,
`TIMELINE_STEPS`, and `TimelineStatus` from there. Never duplicate this map.

| WC status (REST, no `wc-` prefix) | Timeline step | Display label |
|-----------------------------------|-----------  --|---------------|
| `pending`                         | `placed`      | Placed        |
| `on-hold`                         | `placed`      | Placed        |
| `processing`                      | `confirmed`   | Confirmed     |
| `confirmed`                       | `confirmed`   | Confirmed     |
| `packed`                          | `packed`      | Packed        |
| `shipped`                         | `shipped`     | Shipped       |
| `completed`                       | `delivered`   | Delivered     |
| `cancelled` / `refunded` / `failed` | `cancelled` (error state, no timeline step) |

### Shipment tracking meta keys (written by mygift-core plugin, exposed via WC REST `meta_data`)
| Meta key          | Value                              | Notes                              |
|-------------------|------------------------------------|------------------------------------|
| `_courier`        | `tcs|leopards|postex|mp|trax|other`| Courier slug                       |
| `_tracking_number`| string                             | Tracking number                    |
| `_tracking_url`   | URL string                         | Auto-built or manually overridden  |
| `_ts_confirmed`   | ISO-8601 string                    | When order moved to confirmed      |
| `_ts_packed`      | ISO-8601 string                    | When order moved to packed         |
| `_ts_shipped`     | ISO-8601 string                    | When order moved to shipped        |
| `_ts_delivered`   | ISO-8601 string                    | When order moved to completed      |

Timestamps are written once and never overwritten (first-wins audit trail).
`_ts_placed` is NOT a separate meta — use `order.date_created` from the REST response.

### Frontend (actions.ts) reads these fields from the WC REST `/orders` response
- `meta_data` array (key–value pairs; all above keys present when set)
- `date_created` for the "placed" timestamp
- `shipping.city` / `billing.city` for city display
- `billing.phone` for phone verification (never sent to browser)
- `line_items[].{name,quantity,total}` for the item list
- `status` (WC status string, without `wc-` prefix) for timeline mapping
Full billing address and payment details are read server-side but NOT included
in `TrackOrderResult`; they never reach the browser.
Payment flows: COD/Bank = create order `pending/processing` directly.
Gateways (JazzCash/Easypaisa/cards): create order `pending` → redirect/hosted flow →
verify callback signature server-side → set `processing`. Behind PAYMENTS_SANDBOX,
mock the gateway step with a success/fail chooser page.

## 7. Customer auth

JWT login/register mutations via WPGraphQL JWT plugin; token in httpOnly cookie;
middleware guards /account/*; refresh on 401 once, then logout. Guest checkout is
always allowed; guest order tracking = order number + billing phone match via REST.

## 8. Rules

1. Server-only fetching; no WP URL in client code (grep before commit).
2. Always tag fetches; rely on webhook revalidation, ISR 3600 as safety net.
3. Money is recalculated server-side at every boundary (cart add, checkout, gift).
4. Handle WP downtime gracefully: cached page serves; fetch failure on dynamic
   routes → friendly error component, never a crash.
5. Hidden "Gift Components" products: excluded from shop queries, sitemaps, search;
   fetched only by the gift-builder.
6. Woo REST calls go through `wooFetch` (lib/woo/rest-client.ts), which retries
   429/502/503/504 with exponential backoff (honouring `Retry-After`). Static
   generation fires product fetches in a burst; without backoff the host's 429
   rate-limit aborts the whole build. Never add a raw `fetch` to wc/v3 — reuse it.
