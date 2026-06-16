# DECISIONS.md — MYGIFT

## D-001: Gift Builder Pricing — Additive (2026-06-11)
**Decision:** Total = box base price + Σ(component live price × qty) + add-on prices.
**Rationale:** Box and all components priced individually; additive is transparent to the customer.
**Status:** LOCKED — change only by updating this record and the mygift-gift-builder skill.

## D-002: Font loading — next/font/google self-hosting (2026-06-11)
**Decision:** Poppins and Bebas Neue loaded via `next/font/google`, which downloads and self-hosts fonts at build time.
**Rationale:** Zero external requests at runtime → better CLS, privacy, and performance. Fully satisfies CLAUDE.md "self-hosted" requirement.

## D-003: MOCK_MODE for development without live WP (2026-06-11)
**Decision:** `MOCK_MODE=true` env var switches fetchGraphQL to return local fixtures from `lib/wp/fixtures/`.
**Rationale:** Allows frontend development and builds to proceed before WordPress is installed. Must be `false` in production.

## D-004: Cart session via httpOnly cookie (2026-06-11)
**Decision:** WooGraphQL session token stored in `woo-session` httpOnly + Secure + SameSite=Lax cookie.
**Rationale:** Prevents XSS access to the session token. Cookie is forwarded by Next.js route handlers to WooGraphQL and refreshed on each response.

## D-005: CSRF protection via Origin header validation (2026-06-12)
**Decision:** All state-changing API routes (checkout, cart/add, gift/add-to-cart) validate the `Origin` request header against `NEXT_PUBLIC_SITE_URL`. Requests without an Origin header pass (server-to-server, same-site navigation). Localhost origins pass in development.
**Rationale:** Prevents cross-site request forgery on cart and checkout flows. No token overhead required since SameSite=Lax cookies are already in use.
**Files:** `lib/utils/csrf.ts` (helper), applied in `app/api/checkout`, `app/api/cart/add`, `app/api/gift/add-to-cart`.

## D-006: Next.js 16 — proxy.ts replaces middleware.ts (2026-06-12)
**Decision:** Route protection uses `proxy.ts` (exporting `proxy()`) at the app root, not `middleware.ts`.
**Rationale:** Next.js 16 deprecated and renamed `middleware.ts` → `proxy.ts`. The exported function must be named `proxy`, not `middleware`. The `config.matcher` API is unchanged. `revalidateTag` also requires 2 arguments in this version.
**Files:** `proxy.ts`

## D-007: JWT_SECRET — fail loudly in production if unset (2026-06-12)
**Decision:** `lib/auth/server.ts` throws at call-time in production if `JWT_SECRET` env var is missing, rather than silently using a public fallback string.
**Rationale:** A public fallback secret lets any attacker forge auth tokens. In development, the fallback is still used to avoid blocking local dev. `JWT_SECRET` must be set in all production deployments.

## D-009: Drop ACF Pro — native mygift-core content managers (2026-06-16)
**Decision:** Remove the paid **ACF Pro + WPGraphQL-for-ACF** dependency entirely. All
editor-managed content (homepage builder, global settings, gift builder, FAQs, careers,
category intros) is now stored and edited **natively in the free mygift-core plugin**
(Settings API + term meta) and exposed to Next.js over a small REST API under
`/wp-json/mygift/v1/*`. The frontend reads it via `lib/wp/home-content.ts`
(`fetchHomeContent`, `fetchGlobalOptions`, `fetchGiftBuilderOptions`, `fetchFaqItems`,
`fetchJobListings`, `fetchCategoryIntro`), each with `DEFAULT_*` fallbacks for
MOCK_MODE / WP-down. WPGraphQL/WooGraphQL is retained for the product catalogue only;
Yoast for SEO.

**Path chosen (vs. SCF):** The user chose to extend the already-started native approach
(commit `7ba35a6` had moved home content off ACF natively) rather than adopt SCF + the
WPGraphQL-for-ACF bridge. **Verification note (STEP 0):** SCF compatibility could NOT be
verified — no access to the staging WP install from the dev environment, and the
WPGraphQL-for-ACF bridge has historically had gaps resolving SCF Flexible Content. The
native path removes that risk entirely (zero third-party content plugins) and is the
robust headless choice. **Reproducibility (replaces STEP 5):** no SCF field-group JSON to
export — the field structure IS the version-controlled PHP in
`wp-plugin/mygift-core/includes/`; rebuilding the WP install only requires installing the
plugin (it self-seeds defaults on activation).

**Admin UX:** one branded **MYGIFT Control Center** top-level menu (wine icon) gathers all
screens + a dashboard (counts, quick links, help). Each manager fires its revalidation
tags on save; the old `acf/save_post` webhook hook was removed.
**Plugin:** mygift-core v0.5.0. **Files:** `includes/class-content-base.php`,
`class-home-content.php`, `class-global-settings.php`, `class-gift-builder-settings.php`,
`class-faqs.php`, `class-careers.php`, `class-category-intro.php`, `class-control-center.php`,
`assets/admin.{css,js}`.

## D-008: Webhook replay guard — optional timestamp window (2026-06-12)
**Decision:** `app/api/revalidate/route.ts` accepts an optional `timestamp` field in the request body and rejects requests whose timestamp differs from server time by more than 5 minutes.
**Rationale:** Prevents replay attacks where a captured revalidation webhook is replayed later. The check is opt-in (absent timestamp = no check) for backwards compatibility with the WP plugin before it's updated to send timestamps.
