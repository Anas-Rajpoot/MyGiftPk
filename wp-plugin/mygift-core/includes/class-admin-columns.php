<?php
/**
 * Adds a "Tracking" column to the WooCommerce admin order list.
 * Shows courier name + tracking number with a clickable link when available.
 * Supports both traditional post-based orders and HPOS.
 * Loaded inside mygift_core_init() on plugins_loaded priority 10.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
class MYGIFT_Admin_Columns {

    public static function init() {
        // Traditional order list (post list table)
        add_filter( 'manage_edit-shop_order_columns',         [ __CLASS__, 'add_column' ] );
        add_action( 'manage_shop_order_posts_custom_column',  [ __CLASS__, 'render_column' ], 10, 2 );

        // HPOS order list (WC 7.1+)
        add_filter( 'manage_woocommerce_page_wc-orders_columns',       [ __CLASS__, 'add_column' ] );
        add_action( 'manage_woocommerce_page_wc-orders_custom_column', [ __CLASS__, 'render_column_hpos' ], 10, 2 );
    }

    public static function add_column( array $columns ): array {
        // Insert before the 'wc_actions' column if it exists, otherwise append
        $new = [];
        $inserted = false;
        foreach ( $columns as $key => $label ) {
            if ( 'wc_actions' === $key && ! $inserted ) {
                $new['mygift_tracking'] = __( 'Tracking', 'mygift-core' );
                $inserted = true;
            }
            $new[ $key ] = $label;
        }
        if ( ! $inserted ) {
            $new['mygift_tracking'] = __( 'Tracking', 'mygift-core' );
        }
        return $new;
    }

    /** Traditional post list: $post_id is the post/order ID. */
    public static function render_column( string $column, int $post_id ) {
        if ( 'mygift_tracking' !== $column ) return;
        $order = wc_get_order( $post_id );
        if ( $order ) self::output( $order );
    }

    /** HPOS list: WC passes the order object directly. */
    public static function render_column_hpos( string $column, $order ) {
        if ( 'mygift_tracking' !== $column ) return;
        if ( is_int( $order ) ) $order = wc_get_order( $order );
        if ( $order instanceof WC_Order ) self::output( $order );
    }

    private static function output( WC_Order $order ) {
        $courier = $order->get_meta( '_courier',         true );
        $number  = $order->get_meta( '_tracking_number', true );
        $url     = $order->get_meta( '_tracking_url',    true );

        if ( ! $number ) {
            echo '<span style="color:#8A8178;font-size:12px;">—</span>';
            return;
        }

        $courier_label = self::courier_label( $courier );

        if ( $courier_label ) {
            echo '<span style="display:block;font-size:11px;color:#8A8178;">' . esc_html( $courier_label ) . '</span>';
        }

        if ( $url ) {
            echo '<a href="' . esc_url( $url ) . '" target="_blank" rel="noopener noreferrer"'
                . ' style="font-size:12px;color:#7E2B36;text-decoration:underline;">'
                . esc_html( $number ) . '</a>';
        } else {
            echo '<span style="font-size:12px;">' . esc_html( $number ) . '</span>';
        }
    }

    private static function courier_label( string $slug ): string {
        $map = [
            'tcs'      => 'TCS',
            'leopards' => 'Leopards',
            'postex'   => 'PostEx',
            'mp'       => 'M&P',
            'trax'     => 'Trax',
            'other'    => '',
        ];
        return $map[ $slug ] ?? $slug;
    }
}
