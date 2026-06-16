---
name: mygift-gift-builder
description: Complete spec for MYGIFT's custom Gift Builder — the 4-step build-your-own-gift bundle (box + chocolates/candies/biscuits + message → ONE cart product with auto-computed price). Use this skill for ANY work touching /gift-builder, gift bundles, _gift_contents, the wp-plugin bundle handling, gift pricing, packing slips, or gift components — even small tweaks.
---

# Gift Builder — Signature Feature Spec

User composes a gift: pick a box → fill it with treats → personalize → it becomes
ONE product in the cart at the combined live price. This is the brand's moat; the
quality bar is "delightful", not "works".

## 1. The flow (4 steps at /gift-builder)

Progress: the ribbon-line component in --gold, fills per step.
Sticky price ticker visible at ALL times (bottom bar on mobile), updating live.

1. **Choose Box** — box cards from Gift Builder settings: image, name, capacity ("fits up to 4
   items"), base price. Selecting sets capacity + base.
2. **Fill It** — component grid, tabs per allowed category (Chocolates / Candies /
   Biscuits / Extras) from the Gift Builder settings; tap to add, qty steppers on added items; bottom
   tray: thumbnails of chosen items + "3/4 slots". At capacity: disable adds +
   friendly message ("Your box is full — pick a bigger box or swap something").
3. **Personalize** — card message (live preview rendered on a card mockup, char
   limit from Gift Builder settings, default 200), ribbon color swatches, optional photo-print
   add-on (upload stub), occasion tag select.
4. **Review** — visual stack (box + items + card), itemized prices, total →
   **Add Gift to Cart**.

Mobile (~80% of users): each step is a full-screen panel, bottom Prev/Next nav,
must feel native at 375px.

## 2. Client state (Zustand, persisted to localStorage key `mygift-builder-v1`)

```ts
{
  boxId: number|null, capacity: number, basePrice: number,
  items: { productId:number, name:string, image:string, qty:number, unitPrice:number }[],
  message: string, ribbonColor: string, addOns: number[], occasion: string|null,
  // derived: slotsUsed = sum(qty); displayTotal = base + Σ(qty*unitPrice) + addOns
}
```
displayTotal is UI-only. Refresh restores state. "Start over" clears with confirm.

## 3. Pricing rule (LOCKED — change only via docs/DECISIONS.md)

**Additive**: total = box base price + Σ(component live price × qty) + add-on prices.

## 4. Server contract — NEVER trust the client

`POST /api/gift/add-to-cart  { boxId, items:[{productId,qty}], addOns[], message,
ribbonColor, occasion, clientTotal }`

Server steps (all mandatory):
1. Fetch box + every component + add-on LIVE from Woo (price, stockStatus,
   stockQuantity, and that each belongs to an allowed gift category).
2. Validate: capacity not exceeded; every item in stock with enough quantity;
   message ≤ char limit; sanitize message (strip HTML, trim).
3. Recompute total from live prices. If it differs from clientTotal → respond 409
   with the fresh breakdown; UI shows "Prices were updated" and refreshes the ticker.
4. Add ONE cart item (the bundle container product) with meta:
   `_gift_contents` = JSON {boxId, items[{id,name,qty,price}], addOns, message,
   ribbonColor, occasion, computedTotal} and item price = computedTotal.
5. Return normalized cart; UI opens the drawer — bundle renders as one line item
   "Custom Gift Box (Small)" with an expandable contents list and a Gift badge.

## 5. WordPress side (wp-plugin/mygift-core)

- A hidden "Gift Bundle" container product whose cart/order price is set from meta.
- On order creation: decrement stock for EVERY component in _gift_contents.
- Admin order screen: render contents as an indented list (qty × name @ price),
  message, ribbon, occasion — so packers see exactly what to assemble.
- Customer emails: same expanded list under the bundle line.
- Printable packing slip per order (button on order screen): bundle contents,
  message text (large), recipient address, hide-prices flag respected.
- Native "Gift Builder" settings screen (MYGIFT → Gift Builder, class
  `MYGIFT_Gift_Builder_Settings`): boxes[] (name, image, base_price, capacity),
  component category slugs, add_ons[] (name, price), message_char_limit, ribbon
  colours, occasions. Exposed at `GET /wp-json/mygift/v1/gift-builder` (component
  products read LIVE from WooCommerce); cache tag `gift-builder`. No ACF.

## 6. Catalog rules

Components live in hidden category "Gift Components" (catalog visibility: hidden):
excluded from /shop, search, sitemaps, feeds; purchasable only inside bundles.
Each component still tracks its own inventory.

## 7. Edge cases checklist

- Component goes out of stock mid-build → ticker step shows it flagged; add blocked.
- Box change after filling → if new capacity < slotsUsed, prompt to remove items.
- Two bundles in one cart → independent line items, both expand correctly.
- Bundle + clothing mixed cart → checkout + emails render both correctly.
- Empty message is fine; whitespace-only message treated as empty.
- Direct POST with bogus productIds / negative qty / huge qty → 400, never crash.

## 8. Definition of delight

Live total animates on change (number ticks) · gold appears here and nowhere else ·
adding an item drops it into the tray with a small motion · the card-message
preview updates as you type · the whole flow is ≤ 90 seconds for a simple gift.
