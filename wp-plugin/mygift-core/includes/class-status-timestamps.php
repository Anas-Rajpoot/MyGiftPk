<?php
/**
 * Records ISO-8601 timestamps when an order moves through each pipeline stage.
 * Loaded inside mygift_core_init() on plugins_loaded priority 10.
 *
 * Meta keys written (server-side only, exposed via WC REST meta_data):
 *   _ts_confirmed  — when order entered wc-confirmed (or processing as fallback)
 *   _ts_packed     — when order entered wc-packed
 *   _ts_shipped    — when order entered wc-shipped
 *   _ts_delivered  — when order entered completed
 *
 * The "placed" timestamp is order->date_created (always present), so it is NOT
 * stored as a separate meta key — the Next.js action reads date_created directly.
 *
 * Timestamps are written ONCE and never overwritten; moving an order backward
 * does not erase recorded timestamps so the audit trail stays intact.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MYGIFT_Status_Timestamps {

    /** WC status (without wc- prefix) → meta key */
    private static $status_meta = [
        'confirmed'  => '_ts_confirmed',
        'packed'     => '_ts_packed',
        'shipped'    => '_ts_shipped',
        'completed'  => '_ts_delivered',
        'processing' => '_ts_confirmed', // WC built-in processing also maps to "confirmed"
    ];

    public static function init() {
        // Fires on every order status transition. $new_status is WITHOUT the 'wc-' prefix.
        add_action( 'woocommerce_order_status_changed', [ __CLASS__, 'on_status_change' ], 10, 4 );
    }

    /**
     * @param int      $order_id
     * @param string   $old_status  Status slug without 'wc-' prefix
     * @param string   $new_status  Status slug without 'wc-' prefix
     * @param WC_Order $order
     */
    public static function on_status_change( int $order_id, string $old_status, string $new_status, $order ) {
        if ( ! isset( self::$status_meta[ $new_status ] ) ) {
            return;
        }

        $meta_key = self::$status_meta[ $new_status ];

        // Never overwrite — first timestamp wins
        $existing = $order->get_meta( $meta_key, true );
        if ( ! empty( $existing ) ) {
            return;
        }

        $order->update_meta_data( $meta_key, gmdate( 'c' ) ); // ISO-8601
        $order->save_meta_data();
    }
}
