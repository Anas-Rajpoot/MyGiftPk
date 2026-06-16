<?php
/**
 * Category storefront intro — native replacement for the ACF `acfCategoryIntro`
 * field on product categories.
 *
 * Adds an "Storefront Intro" textarea to the WooCommerce product-category
 * add/edit screens, stores it as term meta, and exposes it to the frontend.
 *
 * Term meta: `mygift_intro`
 * REST:  GET /wp-json/mygift/v1/category-intro?slug={category-slug}
 *        →  { "intro": "..." }
 *
 * @package MYGIFT_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MYGIFT_Category_Intro {

	const META_KEY = 'mygift_intro';
	const TAXONOMY = 'product_cat';

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_route' ) );

		// Term form fields (add + edit).
		add_action( self::TAXONOMY . '_add_form_fields',  array( __CLASS__, 'add_field' ) );
		add_action( self::TAXONOMY . '_edit_form_fields', array( __CLASS__, 'edit_field' ), 10, 1 );
		add_action( 'created_' . self::TAXONOMY, array( __CLASS__, 'save' ) );
		add_action( 'edited_' . self::TAXONOMY,  array( __CLASS__, 'save' ) );
	}

	/* ── REST ──────────────────────────────────────────────────────────── */

	public static function register_route() {
		register_rest_route(
			'mygift/v1',
			'/category-intro',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'api_response' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'slug' => array( 'required' => true, 'sanitize_callback' => 'sanitize_title' ),
				),
			)
		);
	}

	public static function api_response( WP_REST_Request $request ) {
		$slug = (string) $request->get_param( 'slug' );
		$term = get_term_by( 'slug', $slug, self::TAXONOMY );
		$intro = ( $term && ! is_wp_error( $term ) )
			? (string) get_term_meta( $term->term_id, self::META_KEY, true )
			: '';

		$response = rest_ensure_response( array( 'intro' => $intro ) );
		$response->header( 'Cache-Control', 'public, max-age=60, s-maxage=3600' );
		return $response;
	}

	/* ── Term form fields ──────────────────────────────────────────────── */

	public static function add_field() {
		?>
		<div class="form-field">
			<label for="mygift_intro"><?php esc_html_e( 'Storefront Intro', 'mygift-core' ); ?></label>
			<textarea name="mygift_intro" id="mygift_intro" rows="4"></textarea>
			<p class="description"><?php esc_html_e( 'Short keyword-rich paragraph shown above the product grid on the storefront category page.', 'mygift-core' ); ?></p>
		</div>
		<?php
	}

	public static function edit_field( $term ) {
		$value = get_term_meta( $term->term_id, self::META_KEY, true );
		?>
		<tr class="form-field">
			<th scope="row"><label for="mygift_intro"><?php esc_html_e( 'Storefront Intro', 'mygift-core' ); ?></label></th>
			<td>
				<textarea name="mygift_intro" id="mygift_intro" rows="5" cols="50"><?php echo esc_textarea( (string) $value ); ?></textarea>
				<p class="description"><?php esc_html_e( 'Short keyword-rich paragraph shown above the product grid on the storefront category page.', 'mygift-core' ); ?></p>
			</td>
		</tr>
		<?php
	}

	public static function save( $term_id ) {
		// Only act when our field was submitted (avoids wiping on unrelated saves).
		if ( ! isset( $_POST['mygift_intro'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			return;
		}
		if ( ! current_user_can( 'manage_product_terms' ) && ! current_user_can( 'manage_categories' ) ) {
			return;
		}
		$value = sanitize_textarea_field( wp_unslash( $_POST['mygift_intro'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
		update_term_meta( $term_id, self::META_KEY, $value );

		$term = get_term( $term_id, self::TAXONOMY );
		if ( $term && ! is_wp_error( $term ) && class_exists( 'MYGIFT_Revalidate_Webhook' ) ) {
			MYGIFT_Revalidate_Webhook::fire_tags( array( 'category:' . $term->slug ) );
		}
	}
}
