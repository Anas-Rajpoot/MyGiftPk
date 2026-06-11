---
name: mygift-design-system
description: The MYGIFT visual system — colors, typography, components, motion. Use this skill EVERY time any UI is created or edited — any component, page, layout, style, className, animation, or copy on screen — even if the task doesn't mention "design". No UI code may be written without following this skill.
---

# MYGIFT Design System — "Warm Atelier"

Wine red on warm cream. Typography-led, image-led, generous whitespace.
The site must feel like a refined Pakistani fashion + gifting brand, never a template.

## 1. Tokens (tokens.css — the ONLY place colors/fonts/sizes are defined)

```css
:root {
  --wine: #7E2B36;        /* primary: CTAs, links, active, sale price, focus ring */
  --wine-deep: #5C1F28;   /* hover states, footer bg */
  --wine-tint: #F6ECEE;   /* badges bg, selected chips, subtle highlights */
  --cream: #FAF8F5;       /* page background — pages are NEVER pure white */
  --ivory: #FFFFFF;       /* cards, drawer, modal surfaces */
  --ink: #1F1A17;         /* headings + body text */
  --stone: #8A8178;       /* secondary text, captions */
  --hairline: #E8E2DA;    /* borders, dividers */
  --gold: #C9A24B;        /* ONLY gift contexts: builder progress, gift badges, ribbon */
  --radius-card: 12px; --radius-input: 8px; --radius-chip: 999px;
  --shadow-float: 0 8px 30px rgba(31,26,23,.12); /* drawer + modal ONLY */
}
```
Tailwind maps theme colors to these vars. Hardcoding a hex anywhere else = violation.

## 2. Typography

Fonts via next/font (self-hosted): **Bebas Neue** (display) + **Poppins** (body).

| Role | Face | Size desktop/mobile | Notes |
|---|---|---|---|
| Hero headline | Bebas | 64 / 44 | uppercase, letter-spacing .02em |
| Section title | Bebas | 40 / 30 | always inside RibbonHeading |
| Card/tile title | Bebas | 24 / 20 | category tiles |
| Product name | Poppins 600 | 18 / 16 | sentence case |
| Body | Poppins 400 | 16, line-height 1.6 | |
| Small/caption | Poppins 400 | 14 | color --stone |
| Button | Poppins 600 | 15, letter-spacing .03em | |
| Price | Poppins 600 tabular-nums | 18 | sale price in --wine, original struck in --stone |

Bebas is loud — use it ONLY for headings/titles, never body or buttons.
Exactly one H1 per page; RibbonHeading takes an `as` prop (h1–h3) for semantics.

## 3. Signature: the Ribbon Line

A 2px wine SVG underline ending in a small bow-notch, under every Bebas heading.
Animates (path draws left→right, 400ms ease-out) when scrolled into view.
In the Gift Builder it becomes the progress bar, in --gold.
Respect `prefers-reduced-motion`: render fully drawn, no animation.
One shared component: `<RibbonHeading as="h2" align="left|center">`.

## 4. Component recipes

- **Button**: primary = wine bg / white text, hover --wine-deep, 150ms; secondary =
  wine 1.5px outline on transparent, hover wine-tint bg; ghost = ink text underline
  on hover. Heights 48px (44px mobile). Loading = spinner replaces label, width locked.
- **ProductCard**: 3:4 image on cream; hover: second image crossfades (250ms) AND
  quick-action bar slides up (Quick View · ♥ · Add to Cart); name, price row,
  Sale/New/Gift badge top-left. Whole card link; actions are separate buttons
  (no nested links). Mobile: actions always visible as small icons.
- **Inputs**: 48px, ivory bg, hairline border, focus = wine border + wine ring.
  Error = message below in wine, never placeholder-only labels.
- **Chips**: pill, hairline border; selected = wine-tint bg + wine text + wine border.
- **Drawer**: right side, 400px (100vw−24 on mobile), ivory, shadow-float, backdrop
  rgba(31,26,23,.4) + blur(4px); 300ms slide; focus-trapped; Esc + backdrop close;
  body scroll-lock.
- **Modal**: centered, max-w 880 (QuickView) / 560 (default), same overlay rules.
- **Badges**: Sale = wine-tint bg/wine text; New = ink/ivory; Gift = gold-tint bg
  (#F8F1E2)/gold text + tiny ribbon icon.
- **Skeletons**: cream→hairline shimmer, match exact final dimensions (CLS = 0).
- **EmptyStates**: line icon in stone, one sentence, one primary CTA.

## 5. Motion rules

150–250ms ease-out micro-interactions; 300ms drawer; heart fills with a small pop
(scale 1→1.25→1); cart count pulses on add; hero entrance = single orchestrated
fade-up on load, nothing else animates on load. No parallax, no scroll-jacking.
Every animation checks `prefers-reduced-motion`.

## 6. Layout

Max content width 1320px, 24px gutters (16 mobile). Section vertical rhythm 96px
desktop / 56px mobile. Product grids: 2-col mobile, 3-col tablet, 4-col desktop,
24px gap. Hairline dividers between footer sections.

## 7. Do / Don't

DO: cream page bg · hairline borders · whitespace · big Bebas + ribbon · gold only
for gifts · wine focus rings on every interactive element.
DON'T: shadows on cards · pure white pages · gradients · more than one accent in a
view · Bebas in paragraphs · centered long body text · stock-template hero stats.

## 8. Copy voice

Warm, direct, gift-minded. Buttons say what happens: "Add to Cart", "Build a Gift",
"Send to Pakistan". Errors explain the fix, never blame. Empty cart: "Your cart is
waiting for something lovely." Keep PK context natural (Rs., COD, Eid) without
over-explaining.
