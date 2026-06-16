/**
 * Canonical WooCommerce → timeline status mapping.
 * Single source of truth used by both the server action (actions.ts)
 * and the OrderTimeline display component.
 *
 * WC status strings (without "wc-" prefix as returned by the REST API):
 *   pending / on-hold  → placed
 *   processing         → confirmed
 *   confirmed          → confirmed   (custom status, wc-confirmed)
 *   packed             → packed      (custom status, wc-packed)
 *   shipped            → shipped     (custom status, wc-shipped)
 *   completed          → delivered
 *   cancelled / refunded / failed → 'cancelled' (error state, no timeline step)
 */

export type TimelineStatus = 'placed' | 'confirmed' | 'packed' | 'shipped' | 'delivered'
export type OrderDisplayStatus = TimelineStatus | 'cancelled'

export const TIMELINE_STEPS: { key: TimelineStatus; label: string }[] = [
  { key: 'placed',    label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed',    label: 'Packed' },
  { key: 'shipped',   label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

const WOO_STATUS_MAP: Record<string, OrderDisplayStatus> = {
  pending:    'placed',
  'on-hold':  'placed',
  processing: 'confirmed',
  confirmed:  'confirmed',
  packed:     'packed',
  shipped:    'shipped',
  completed:  'delivered',
  cancelled:  'cancelled',
  refunded:   'cancelled',
  failed:     'cancelled',
}

export function mapWooStatus(wooStatus: string): OrderDisplayStatus {
  return WOO_STATUS_MAP[wooStatus] ?? 'placed'
}

export function getStepIndex(status: TimelineStatus): number {
  return TIMELINE_STEPS.findIndex((s) => s.key === status)
}

/**
 * Shape returned by the track-order server action and consumed by the UI.
 * Lives here (a plain module) rather than in the `'use server'` actions file,
 * because a "use server" module may only export async functions — exporting a
 * type/interface from it breaks at runtime under Next.js 16.
 */
export interface TrackOrderResult {
  status: TimelineStatus
  cancelled?: boolean
  wooStatus: string
  orderNumber: string
  date: string
  items: {
    name: string
    qty: number
    total: string
    hidePrice: boolean
    bundleContents?: { name: string; qty: number }[]
  }[]
  city?: string
  trackingNumber?: string
  trackingUrl?: string
  courierName?: string
  timestamps?: Partial<Record<TimelineStatus, string>>
}
