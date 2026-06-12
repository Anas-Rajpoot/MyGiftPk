<?php
/**
 * Registers three custom WooCommerce order statuses inserted between
 * processing and completed, and adds them to all admin dropdowns.
 * Loaded inside mygift_core_init() on plugins_loaded priority 10.
 *
 * CANONICAL STATUS → TIMELINE MAPPING
 * (mirrors lib/woo/order-status.ts — update both places together)
 *
 *  WC status       Timeline step   Display label
 *  --------------- --------------- -------------
 *  pending         placed          Placed
 *  on-hold         placed          Placed
 *  processing      confirmed       Confirmed
 *  wc-confirmed    confirmed       Confirmed
 *  wc-packed       packed          Packed
 *  wc-shipped      shipped         Shipped
 *  completed       delivered       Delivered
 *  cancelled       (cancelled)     Order Cancelled / Issue
 *  refunded        (cancelled)     Order Refunded
 *  failed          (cancelled)     Order Cancelled / Issue
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MYGIFT_Order_Statuses {

    public static function init() {
        add_action( 'init',                     [ __CLASS__, 'register_statuses' ] );
        add_filter( 'wc_order_statuses',        [ __CLASS__, 'add_to_wc_statuses' ] );
        add_filter( 'woocommerce_bulk_action_ids', [ __CLASS__, 'noop' ], 10, 2 ); // prevent removal
        add_filter( 'bulk_actions-edit-shop_order',              [ __CLASS__, 'add_bulk_actions' ] );
        add_filter( 'bulk_actions-woocommerce_page_wc-orders',   [ __CLASS__, 'add_bulk_actions' ] ); // HPOS
        add_action( 'admin_head',               [ __CLASS__, 'badge_css' ] );
    }

    /**
     * Register post statuses so WP knows about them.
     * Also required even when HPOS is enabled — WC still reads these for label display.
     */
    public static function register_statuses() {
        register_post_status( 'wc-confirmed', [
            'label'                     => _x( 'Confirmed', 'Order status', 'mygift-core' ),
            'public'                    => false,
            'show_in_admin_status_list' => true,
            'show_in_admin_all_list'    => true,
            'exclude_from_search'       => false,
            'label_count'               => _n_noop(
                'Confirmed <span class="count">(%s)</span>',
                'Confirmed <span class="count">(%s)</span>',
                'mygift-core'
            ),
        ] );

        register_post_status( 'wc-packed', [
            'label'                     => _x( 'Packed', 'Order status', 'mygift-core' ),
            'public'                    => false,
            'show_in_admin_status_list' => true,
            'show_in_admin_all_list'    => true,
            'exclude_from_search'       => false,
            'label_count'               => _n_noop(
                'Packed <span class="count">(%s)</span>',
                'Packed <span class="count">(%s)</span>',
                'mygift-core'
            ),
        ] );

        register_post_status( 'wc-shipped', [
            'label'                     => _x( 'Shipped', 'Order status', 'mygift-core' ),
            'public'                    => false,
            'show_in_admin_status_list' => true,
            'show_in_admin_all_list'    => true,
            'exclude_from_search'       => false,
            'label_count'               => _n_noop(
                'Shipped <span class="count">(%s)</span>',
                'Shipped <span class="count">(%s)</span>',
                'mygift-core'
            ),
        ] );
    }

    /**
     * Insert custom statuses into the WC order-status dropdown,
     * immediately after 'wc-processing'.
     */
    public static function add_to_wc_statuses( array $statuses ): array {
        $new = [];
        foreach ( $statuses as $key => $label ) {
            $new[ $key ] = $label;
            if ( 'wc-processing' === $key ) {
                $new['wc-confirmed'] = _x( 'Confirmed', 'Order status', 'mygift-core' );
                $new['wc-packed']    = _x( 'Packed',    'Order status', 'mygift-core' );
                $new['wc-shipped']   = _x( 'Shipped',   'Order status', 'mygift-core' );
            }
        }
        return $new;
    }

    /**
     * Add bulk-action items (works for both traditional post list and HPOS list).
     * WooCommerce bulk handler looks for 'mark_{slug}' and applies 'wc-{slug}'.
     */
    public static function add_bulk_actions( array $actions ): array {
        $new = [];
        foreach ( $actions as $key => $label ) {
            $new[ $key ] = $label;
            if ( 'mark_processing' === $key ) {
                $new['mark_confirmed'] = __( 'Change status to Confirmed', 'mygift-core' );
                $new['mark_packed']    = __( 'Change status to Packed',    'mygift-core' );
                $new['mark_shipped']   = __( 'Change status to Shipped',   'mygift-core' );
            }
        }
        return $new;
    }

    /** Noop filter — prevents WC from stripping our statuses from bulk IDs. */
    public static function noop( $ids, $action ) {
        return $ids;
    }

    /** Inline CSS for colored status badges in the admin order list. */
    public static function badge_css() {
        ?>
        <style>
        mark.order-status.status-confirmed,
        .wc-order-status.status-confirmed { background: #EAF4FC; color: #1A6FAD; }
        mark.order-status.status-packed,
        .wc-order-status.status-packed    { background: #FFF6CE; color: #8A6400; }
        mark.order-status.status-shipped,
        .wc-order-status.status-shipped   { background: #F6ECEE; color: #7E2B36; }
        </style>
        <?php
    }
}
