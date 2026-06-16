<?php
/**
 * Fires a non-blocking POST to the Next.js /api/revalidate endpoint whenever
 * relevant content changes in WordPress or WooCommerce.
 *
 * Tag mapping (mirrors apps/web/lib/wp/client.ts — keep in sync):
 *
 *   product save / stock change  → product:{slug}  + category:{slug} for each category
 *   page save                    → page:{slug}
 *   blog post save               → post:{slug}
 *
 * Native content managers (Homepage, Global, Gift Builder, FAQs, Careers,
 * Category Intro) fire their own tags via fire_tags() on save — see each
 * MYGIFT_Content_Base subclass. There is no ACF dependency.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MYGIFT_Revalidate_Webhook {

	public static function init() {
		add_action( 'save_post_product',           array( __CLASS__, 'on_product_save'  ), 10, 2 );
		add_action( 'save_post_page',              array( __CLASS__, 'on_page_save'     ), 10, 2 );
		add_action( 'save_post_post',              array( __CLASS__, 'on_post_save'     ), 10, 2 );
		add_action( 'woocommerce_reduce_order_stock', array( __CLASS__, 'on_stock_change' )       );
	}

	// ── Handlers ──────────────────────────────────────────────────────────────

	public static function on_product_save( $post_id, $post ) {
		if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
			return;
		}

		$slug = $post->post_name;
		$tags = array( "product:{$slug}" );

		$cats = get_the_terms( $post_id, 'product_cat' );
		if ( $cats && ! is_wp_error( $cats ) ) {
			foreach ( $cats as $cat ) {
				$tags[] = "category:{$cat->slug}";
			}
		}

		self::fire( $tags );
	}

	public static function on_page_save( $post_id, $post ) {
		if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
			return;
		}
		self::fire( array( "page:{$post->post_name}" ) );
	}

	public static function on_post_save( $post_id, $post ) {
		if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
			return;
		}
		self::fire( array( "post:{$post->post_name}" ) );
	}

	public static function on_stock_change( $order ) {
		foreach ( $order->get_items() as $item ) {
			$product = $item->get_product();
			if ( $product ) {
				$slug   = get_post_field( 'post_name', $product->get_id() );
				self::fire( array( "product:{$slug}" ) );
			}
		}
	}

	// ── Core dispatcher ───────────────────────────────────────────────────────

	/**
	 * Public alias so other classes (e.g. MYGIFT_Home_Content) can trigger revalidation.
	 *
	 * @param string[] $tags
	 */
	public static function fire_tags( array $tags ) {
		self::fire( $tags );
	}

	/**
	 * Send a fire-and-forget revalidation request to Next.js.
	 *
	 * @param string[] $tags  Cache tags to invalidate.
	 */
	private static function fire( array $tags ) {
		$opts   = MYGIFT_Settings::get();
		$secret = $opts['revalidate_secret'];
		$url    = $opts['nextjs_url'];

		if ( empty( $secret ) || empty( $url ) ) {
			return;
		}

		$tags      = array_values( array_unique( array_filter( $tags ) ) );
		$endpoint  = trailingslashit( $url ) . 'api/revalidate';
		$timestamp = (int) ( microtime( true ) * 1000 ); // milliseconds

		wp_remote_post(
			$endpoint,
			array(
				'timeout'     => 5,
				'blocking'    => false, // fire-and-forget — do not wait for response
				'headers'     => array( 'Content-Type' => 'application/json' ),
				'body'        => wp_json_encode(
					array(
						'secret'    => $secret,
						'tags'      => $tags,
						'timestamp' => $timestamp,
					)
				),
				'data_format' => 'body',
			)
		);
	}
}
