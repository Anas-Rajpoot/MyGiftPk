/**
 * NAV CONFIG — edit this file to add, remove, or reorder navigation items.
 *
 * Each item needs:
 *   label   — text shown in the nav
 *   link    — URL it navigates to when clicked
 *   children (optional) — dropdown sub-links
 *
 * This file is used when WOO_REST_ENABLED=false (local/mock mode).
 * When WOO_REST_ENABLED=true, categories are fetched live from WooCommerce
 * and combined with the FIXED_NAV_ITEMS below (Shop + Gifts stay hardcoded).
 */

export interface NavChild {
  label: string
  link: string
}

export interface NavConfig {
  label: string
  link: string
  children?: NavChild[]
}

// ─── Items used in mock / GraphQL mode ───────────────────────────────────────
// Add, remove, or reorder freely. Keep labels short (fits the header bar).
export const NAV_ITEMS: NavConfig[] = [
  {
    label: 'Shop',
    link: '/shop',
    children: [
      { label: 'All Products',  link: '/shop' },
      { label: 'New Arrivals',  link: '/shop?sort=newest' },
      { label: 'On Sale',       link: '/shop?on_sale=1' },
    ],
  },
  {
    label: 'Women',
    link: '/category/women',
    children: [
      { label: 'Stitched',      link: '/category/women?type=stitched' },
      { label: 'Unstitched',    link: '/category/women?type=unstitched' },
      { label: 'Lawn',          link: '/category/women?tag=lawn' },
      { label: 'Chiffon',       link: '/category/women?tag=chiffon' },
      { label: 'Khaddar',       link: '/category/women?tag=khaddar' },
      { label: 'All Women',     link: '/category/women' },
    ],
  },
  {
    label: 'Men',
    link: '/category/men',
    children: [
      { label: 'Stitched',      link: '/category/men?type=stitched' },
      { label: 'Unstitched',    link: '/category/men?type=unstitched' },
      { label: 'Kurta Shalwar', link: '/category/men?tag=kurta-shalwar' },
      { label: 'All Men',       link: '/category/men' },
    ],
  },
  {
    label: 'Kids',
    link: '/category/kids',
    children: [
      { label: 'Girls',         link: '/category/kids?tag=girls' },
      { label: 'Boys',          link: '/category/kids?tag=boys' },
      { label: 'All Kids',      link: '/category/kids' },
    ],
  },
  {
    label: 'Gifts',
    link: '/gifts',
    children: [
      { label: 'Build a Gift',  link: '/gift-builder' },
      { label: 'Ready Gifts',   link: '/gifts' },
      { label: 'Birthday',      link: '/gifts/birthday' },
      { label: 'Eid',           link: '/gifts/eid' },
      { label: 'Anniversary',   link: '/gifts/anniversary' },
      { label: 'All Occasions', link: '/gifts' },
    ],
  },
]

// ─── Items appended when WOO_REST_ENABLED (live WooCommerce mode) ─────────────
// WooCommerce categories are inserted between FIXED_BEFORE and FIXED_AFTER.
export const FIXED_NAV_BEFORE: NavConfig[] = [
  {
    label: 'Shop',
    link: '/shop',
    children: [
      { label: 'All Products', link: '/shop' },
      { label: 'New Arrivals', link: '/shop?sort=newest' },
      { label: 'On Sale',      link: '/shop?on_sale=1' },
    ],
  },
]

export const FIXED_NAV_AFTER: NavConfig[] = [
  {
    label: 'Gifts',
    link: '/gifts',
    children: [
      { label: 'Build a Gift',  link: '/gift-builder' },
      { label: 'Ready Gifts',   link: '/gifts' },
      { label: 'Birthday',      link: '/gifts/birthday' },
      { label: 'Eid',           link: '/gifts/eid' },
      { label: 'Anniversary',   link: '/gifts/anniversary' },
    ],
  },
]
