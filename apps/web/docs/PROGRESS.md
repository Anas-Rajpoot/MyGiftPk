# PROGRESS.md — MYGIFT Session Log

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
_Updated: 2026-06-11_
