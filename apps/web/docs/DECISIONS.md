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

## D-008: Webhook replay guard — optional timestamp window (2026-06-12)
**Decision:** `app/api/revalidate/route.ts` accepts an optional `timestamp` field in the request body and rejects requests whose timestamp differs from server time by more than 5 minutes.
**Rationale:** Prevents replay attacks where a captured revalidation webhook is replayed later. The check is opt-in (absent timestamp = no check) for backwards compatibility with the WP plugin before it's updated to send timestamps.
