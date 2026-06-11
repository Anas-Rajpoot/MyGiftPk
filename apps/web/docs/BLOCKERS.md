# BLOCKERS.md — MYGIFT

## Active Blockers

### MOCK_MODE Active (Phase 0)
**Problem:** WordPress/WooCommerce is not yet installed or live at admin.mygift.pk.
**Impact:** fetchGraphQL cannot hit a real endpoint.
**Workaround:** `MOCK_MODE=true` in .env.local returns fixture data from `lib/wp/fixtures/`. All API calls log a warning. The site builds and all routes render with mock content.
**Resolution:** Install WP per docs/WP-SETUP.md, set all env vars in .env.local, set `MOCK_MODE=false`.

---

### Payment Gateways Not Configured (Phase 5)
**Problem:** JazzCash, Easypaisa, and card gateway credentials not yet obtained.
**Impact:** Payment flows will use `PAYMENTS_SANDBOX=true` mock screens.
**Resolution:** Apply for merchant accounts (JazzCash/Easypaisa) and choose a card gateway (Safepay/PayFast/Stripe-entity). Update `PAYMENTS_SANDBOX=false` and fill in gateway env vars when credentials arrive. Swap documented in Phase 5 code.

---

_No other blockers at Phase 0._
