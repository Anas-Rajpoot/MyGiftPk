---
name: mygift-qa
description: MYGIFT's Definition-of-Done verification. Use this skill at the END of every phase, before claiming ANY feature complete, after refactors, and before any deploy. Also use whenever the user asks "is it done", "test it", "check quality", or a phase checklist must be verified. Nothing is "done" until this passes.
---

# MYGIFT QA — Definition of Done

Run top to bottom. Log results (pass/fail + evidence) in docs/PROGRESS.md.
A single unexplained failure = phase not done.

## 1. Build health

```
pnpm typecheck && pnpm lint && pnpm build   # all zero-error
```
- No `any` introduced without a TODO comment + DECISIONS.md note.
- `grep -rn "#[0-9a-fA-F]\{3,6\}" apps/web/components apps/web/app` → only matches
  in tokens.css/OG image route (token rule).
- `grep -rn "admin.mygift" apps/web` client files → nothing (server-only rule).

## 2. Visual review (mandatory, actually look)

Screenshot every touched page at 375px, 768px, 1440px. Compare against the
mygift-design-system skill: cream bg, hairline borders, Bebas+ribbon headings,
spacing rhythm, gold only in gift contexts. Fix anything that looks templated
or off-system before proceeding.

## 3. Accessibility

- Keyboard-only walkthrough of touched flows: logical tab order, visible wine
  focus rings, Esc closes drawer/modal, focus returns to trigger on close,
  focus trapped while open.
- Images have alt; form fields have labels; contrast spot-check (stone-on-cream
  for captions only, never body text).
- `prefers-reduced-motion` disables animations (toggle and verify).

## 4. Performance (Lighthouse mobile, throttled)

Home, a category, a product, gift-builder (when built):
Perf ≥ 90 · SEO ≥ 95 · A11y ≥ 95 · Best Practices ≥ 95.
Record the four scores per page in PROGRESS.md. Investigate any LCP > 2.0s or
CLS > 0.05 immediately.

## 5. SEO spot-check (with mygift-seo skill)

View-source a touched page: metadata present, canonical correct, JSON-LD renders;
paste JSON-LD into a validator; confirm sitemap inclusion/exclusion is right;
hidden gift components absent from sitemap + search.

## 6. Commerce correctness

- Cart math: add 3 items incl. a variation + coupon → server totals equal a manual
  WooCommerce calculation. Refresh → cart persists.
- Gift bundle (when built): tamper clientTotal in a direct POST → 409; out-of-stock
  component → blocked with message; WP admin order shows expanded contents +
  message; packing slip prints.
- Checkout: one full test order per enabled payment method (sandbox ok); gift-mode
  order meta (recipient, message, date, hide-prices) visible in WP admin; emails
  arrive with correct content.

## 7. Resilience

- WP unreachable (kill MOCK/disconnect): cached pages still serve; dynamic actions
  show friendly errors, no crashes or blank screens.
- 404 unknown product/category → branded 404. Bad API payloads → 4xx JSON, never 500.
- Broken-link pass over header/footer/home links.

## 8. Security quickies

httpOnly cookies for sessions · rate limiting present on cart/gift/checkout routes ·
gift messages sanitized (try `<script>` in a message) · no secrets in client bundle
(bundle analyzer when deps changed) · /api/revalidate rejects bad secret.

## 9. Close-out

PROGRESS.md updated (built/verified/next) · new learnings written back into the
relevant skill · DECISIONS.md updated if any trade-off was made · conventional
commits pushed.
