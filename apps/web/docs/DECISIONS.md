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
