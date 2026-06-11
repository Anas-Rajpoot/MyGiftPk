<?php
/**
 * Fires a POST to Next.js /api/revalidate after relevant content changes.
 *
 * Tag mapping:
 *   product save/update  → product:{slug}  + category tags for its categories
 *   homepage/ACF options → home, global
 *   gift-builder options → gift-builder
 *   page/post            → page:{slug} / post:{slug}
 */
class MYGIFT_Revalidate_Webhook {

    public static function init() {
        add_action( 'save_post_product', [ __CLASS__, 'on_product_save' ], 10, 2 );
        add_action( 'save_post_page',    [ __CLASS__, 'on_page_save' ],    10, 2 );
        add_action( 'save_post_post',    [ __CLASS__, 'on_post_save' ],    10, 2 );

        // ACF options pages
        add_action( 'acf/save_post', [ __CLASS__, 'on_acf_save' ], 20 );

        // WooCommerce product stock changes (e.g. order reduces stock)
        add_action( 'woocommerce_reduce_order_stock', [ __CLASS__, 'on_stock_change' ] );
    }

    public static function on_product_save( int $post_id, WP_Post $post ) {
        if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) return;

        $slug  = $post->post_name;
        $tags  = [ "product:{$slug}" ];

        // Also invalidate each category this product belongs to
        $cats = get_the_terms( $post_id, 'product_cat' );
        if ( $cats && ! is_wp_error( $cats ) ) {
            foreach ( $cats as $cat ) {
                $tags[] = "category:{$cat->slug}";
            }
        }

        self::fire( $tags );
    }

    public static function on_page_save( int $post_id, WP_Post $post ) {
        if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) return;
        self::fire( [ "page:{$post->post_name}" ] );
    }

    public static function on_post_save( int $post_id, WP_Post $post ) {
        if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) return;
        self::fire( [ "post:{$post->post_name}" ] );
    }

    public static function on_acf_save( $post_id ) {
        // ACF options pages save with a string post_id like 'options' or the menu slug
        if ( ! is_string( $post_id ) ) return;

        if ( str_contains( $post_id, 'homepage' ) ) {
            self::fire( [ 'home', 'global' ] );
        } elseif ( str_contains( $post_id, 'global' ) ) {
            self::fire( [ 'global' ] );
        } elseif ( str_contains( $post_id, 'gift-builder' ) ) {
            self::fire( [ 'gift-builder' ] );
        } else {
            // Unknown options page — invalidate global as a safe default
            self::fire( [ 'global' ] );
        }
    }

    public static function on_stock_change( $order ) {
        foreach ( $order->get_items() as $item ) {
            $product = $item->get_product();
            if ( $product ) {
                $slug  = get_post_field( 'post_name', $product->get_id() );
                self::fire( [ "product:{$slug}" ] );
            }
        }
    }

    /**
     * Send revalidation request to Next.js.
     *
     * @param string[] $tags
     */
    private static function fire( array $tags ): void {
        $opts   = MYGIFT_Settings::get();
        $secret = $opts['revalidate_secret'];
        $url    = trailingslashit( $opts['nextjs_url'] ) . 'api/revalidate';

        if ( empty( $secret ) || empty( $opts['nextjs_url'] ) ) return;

        $tags = array_values( array_unique( $tags ) );

        wp_remote_post( $url, [
            'timeout'     => 5,
            'blocking'    => false, // fire-and-forget
            'headers'     => [ 'Content-Type' => 'application/json' ],
            'body'        => wp_json_encode( [ 'secret' => $secret, 'tags' => $tags ] ),
            'data_format' => 'body',
        ] );
    }
}
