'use server'

import { checkRateLimit } from '@/lib/utils/rate-limit'
import { headers } from 'next/headers'
import { mapWooStatus } from '@/lib/woo/order-status'
import type { TimelineStatus, TrackOrderResult } from '@/lib/woo/order-status'

function getMeta(
  metaData: { key: string; value: string }[] | undefined,
  key: string
): string | undefined {
  return metaData?.find((m) => m.key === key)?.value
}

export async function trackOrder(
  orderNumber: string,
  billingPhone: string
): Promise<{ success: true; order: TrackOrderResult } | { success: false; error: string }> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  if (!checkRateLimit(`track:${ip}`, 5, 60_000)) {
    return { success: false, error: 'Too many requests. Please wait a minute and try again.' }
  }

  const WP_BASE = (process.env.WP_GRAPHQL_URL ?? '').replace(/\/graphql\/?$/, '')
  const WC_KEY = process.env.WC_CONSUMER_KEY ?? ''
  const WC_SECRET = process.env.WC_CONSUMER_SECRET ?? ''

  if (process.env.MOCK_MODE === 'true') {
    if (
      orderNumber === '1001' &&
      billingPhone.replace(/\D/g, '').endsWith('3001234567')
    ) {
      return {
        success: true,
        order: {
          status: 'confirmed',
          wooStatus: 'processing',
          orderNumber: '1001',
          date: new Date().toISOString(),
          items: [
            { name: 'Embroidered Lawn 3-Piece', qty: 1, total: 'Rs. 4,500', hidePrice: false },
          ],
          city: 'Karachi',
          timestamps: {
            placed:    new Date(Date.now() - 86_400_000).toISOString(),
            confirmed: new Date(Date.now() - 3_600_000).toISOString(),
          },
        },
      }
    }
    return {
      success: false,
      error:
        "We couldn't find an order matching those details. Please check your order number and the phone number used at checkout.",
    }
  }

  if (!WP_BASE || !WC_KEY || !WC_SECRET) {
    return { success: false, error: 'Order tracking is temporarily unavailable.' }
  }

  try {
    const auth = 'Basic ' + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64')
    const res = await fetch(
      `${WP_BASE}/wp-json/wc/v3/orders?number=${encodeURIComponent(orderNumber)}&per_page=1`,
      { headers: { Authorization: auth }, next: { revalidate: 0 } }
    )
    if (!res.ok) throw new Error(`WC ${res.status}`)
    const orders: unknown[] = await res.json()

    if (!orders.length) {
      return { success: false, error: "We couldn't find an order matching those details." }
    }

    const order = orders[0] as Record<string, unknown>

    // Phone verification — last 10 digits must match (prevents order number enumeration)
    const billing = order.billing as Record<string, string> | undefined
    const storedPhone = (billing?.phone ?? '').replace(/\D/g, '')
    const inputPhone = billingPhone.replace(/\D/g, '')
    if (!storedPhone || !inputPhone || !storedPhone.endsWith(inputPhone.slice(-10))) {
      return { success: false, error: "We couldn't find an order matching those details." }
    }

    const metaData = order.meta_data as { key: string; value: string }[] | undefined
    const hidePrices = getMeta(metaData, '_hide_prices') === '1'
    const trackingNumber = getMeta(metaData, '_tracking_number')
    const trackingUrl   = getMeta(metaData, '_tracking_url')
    const courierName   = getMeta(metaData, '_courier')

    // Per-stage timestamps saved by the plugin's status-transition hook
    const tsPlaced    = order.date_created as string | undefined
    const tsConfirmed = getMeta(metaData, '_ts_confirmed')
    const tsPacked    = getMeta(metaData, '_ts_packed')
    const tsShipped   = getMeta(metaData, '_ts_shipped')
    const tsDelivered = getMeta(metaData, '_ts_delivered')

    const timestamps: Partial<Record<TimelineStatus, string>> = {}
    if (tsPlaced)    timestamps.placed    = tsPlaced
    if (tsConfirmed) timestamps.confirmed = tsConfirmed
    if (tsPacked)    timestamps.packed    = tsPacked
    if (tsShipped)   timestamps.shipped   = tsShipped
    if (tsDelivered) timestamps.delivered = tsDelivered

    const lineItems = order.line_items as { name: string; quantity: number; total: string }[] | undefined
    const items = (lineItems ?? []).map((li) => ({
      name: li.name,
      qty: li.quantity,
      total: hidePrices ? '' : `Rs. ${Math.round(parseFloat(li.total)).toLocaleString('en-PK')}`,
      hidePrice: hidePrices,
    }))

    const shipping = order.shipping as Record<string, string> | undefined
    const wooStatus = order.status as string
    const displayStatus = mapWooStatus(wooStatus)

    // Cancelled orders: still return success so the UI can show the cancellation state
    const isCancelled = displayStatus === 'cancelled'

    return {
      success: true,
      order: {
        status: isCancelled ? 'placed' : (displayStatus as TimelineStatus),
        cancelled: isCancelled || undefined,
        wooStatus,
        orderNumber: (order.number as string) ?? orderNumber,
        date: order.date_created as string,
        items,
        city: shipping?.city || billing?.city,
        trackingNumber,
        trackingUrl,
        courierName,
        timestamps,
      },
    }
  } catch {
    return {
      success: false,
      error: 'Order tracking is temporarily unavailable. Please try again later.',
    }
  }
}
