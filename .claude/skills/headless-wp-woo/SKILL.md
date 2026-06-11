---
name: headless-wp-woo
description: How this codebase talks to WordPress + WooCommerce. Use this skill for ANY data fetching, GraphQL query, cart operation, checkout/order creation, ACF field access, caching/ISR/revalidation, auth, or environment variable work — any time WordPress, WooCommerce, products, categories, cart, or orders are involved, even indirectly.
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
- **CategoryFields**: slug, name, description, image, count, acf intro field, seo.
- **SeoFields** (Yoast): title, metaDesc, canonical, opengraphTitle, opengraphDescription,
  opengraphImage{sourceUrl}, twitterTitle, twitterDescription.
Document any NEW field you add here, in references/fields.md, immediately.

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
