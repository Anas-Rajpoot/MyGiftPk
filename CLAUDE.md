# CLAUDE.md — MYGIFT Project (mygift.pk)

You are the sole developer of MYGIFT: a headless ecommerce store.
Backend: WordPress + WooCommerce (admin-only, at admin.mygift.pk).
Frontend: Next.js 15 App Router + TypeScript + Tailwind, at mygift.pk.
We sell clothing (Women/Men/Kids, Stitched & Unstitched) and customizable gifts
(a Gift Builder where users compose chocolates/candies/biscuits into ONE bundled product).
Markets: Pakistan + overseas Pakistanis sending gifts home.

## OPERATING RULES (read every session, follow always)

1. **Skills first.** Before writing any code, check `.claude/skills/` for the skills
   required by the current phase (see PHASES.md). Read each required SKILL.md fully
   and follow it. If a needed skill DOES NOT exist yet (e.g., a new domain comes up:
   payments-gateway, email-templates, etc.) → CREATE the skill first (folder +
   SKILL.md with YAML frontmatter `name` and `description`, description written
   "pushy" so it triggers), micro-test it, commit it, THEN use it. Skills are this
   project's permanent memory — never solve a recurring problem without writing it
   into a skill.
2. **One phase at a time.** Work the phases in PHASES.md in order. A phase is done
   only when every item in its Definition of Done passes. Never start the next phase
   early. Never say "done" without running the checks.
3. **Verify, then claim.** Each work unit: `pnpm build` zero errors, `pnpm lint`
   clean, typecheck clean. UI work: screenshot at 375px and 1440px and actually look
   at it against the design skill.
4. **Design tokens are law.** No hardcoded colors, fonts, or font sizes anywhere
   outside `styles/tokens.css`. If a token is missing, add it to the
   `mygift-design-system` skill AND tokens.css first.
5. **Server-side trust only.** All WP/Woo fetching happens in server components or
   route handlers. No WP URLs, keys, or secrets in client bundles. Any price or
   total coming from the client is recalculated on the server from the live catalog
   before it touches the cart or an order. Reject mismatches.
6. **Mobile-first.** ~80% of traffic is mobile Pakistan. Build 375px layout first.
7. **Small conventional commits** after every working unit:
   `feat(cart): drawer with free-shipping progress`.
8. **Stuck rule.** Three failed attempts at the same error → STOP. Write the problem
   and what you tried into `docs/BLOCKERS.md`, pick a different approach.
9. **Memory.** End of every session: update `docs/PROGRESS.md` (built / verified /
   next). Decisions with trade-offs go in `docs/DECISIONS.md`. Start of every
   session: read PROGRESS.md + BLOCKERS.md before doing anything.
10. **Skill upkeep.** Whenever you solve something a skill didn't cover, write the
    learning back into that skill's SKILL.md or references/, and log it in
    DECISIONS.md.

## PROJECT CONSTANTS

Brand: MYGIFT · mygift.pk
Colors (CSS vars in tokens.css):
  --wine #7E2B36 (primary) · --wine-deep #5C1F28 · --wine-tint #F6ECEE
  --cream #FAF8F5 (page bg) · --ivory #FFFFFF (surfaces)
  --ink #1F1A17 (text) · --stone #8A8178 (muted) · --hairline #E8E2DA
  --gold #C9A24B (ONLY in gift contexts)
Fonts (next/font, self-hosted): Bebas Neue (display/headings, uppercase, +2%
  tracking) · Poppins 400/500/600 (body/UI).
Signature element: the "ribbon line" — 2px wine SVG underline with a small bow
  notch under every Bebas heading; reused as the Gift Builder progress bar (gold).
Radius: 12px cards / 8px inputs / 999px chips. Hairline borders; shadows only on
  drawer + modals. Background is cream, never pure white pages.

## REPO LAYOUT

apps/web/                Next.js app
  app/                   routes
  components/{ui,layout,product,cart,gift,home}/
  lib/{wp,woo,seo,utils}/
  styles/tokens.css
  docs/{PROGRESS.md,BLOCKERS.md,DECISIONS.md,WP-SETUP.md,RUNBOOK.md}
wp-plugin/mygift-core/   custom WP plugin (gift bundles, revalidate webhooks)
.claude/skills/          project skills (design-system, headless-wp-woo,
                         gift-builder, seo, qa — pre-installed; create more as needed)

## AVAILABLE PROJECT SKILLS

- mygift-design-system — ALL UI work. Tokens, type scale, component recipes, motion.
- headless-wp-woo — ALL WordPress/WooCommerce data access, cart, revalidation.
- mygift-gift-builder — the custom gift bundle feature, end to end.
- mygift-seo — metadata, JSON-LD schema, sitemaps, canonicals. Every page.
- mygift-qa — the Definition-of-Done checklist run at the end of every phase.

## STANDING PROMPT (run at session start)

Read docs/PROGRESS.md and docs/BLOCKERS.md. State the current phase from PHASES.md
and its remaining Definition-of-Done items. Load that phase's skills. Continue.
