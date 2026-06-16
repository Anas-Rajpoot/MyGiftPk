<?php
/**
 * Brand ALL default WooCommerce transactional emails (New order, Processing,
 * Completed, On-hold, Customer note, etc.) with the MYGIFT palette and polish.
 *
 * The plugin's custom Shipped/Packed emails are fully hand-built; this class
 * instead skins WooCommerce's own templates by forcing the email colour options
 * and injecting extra CSS — so the "order received" email a customer gets looks
 * on-brand without overriding every template file.
 *
 * Loaded in mygift_core_init(). Pure filters — no WC_Email dependency.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MYGIFT_Email_Branding {

	const WINE      = '#7E2B36';
	const WINE_DEEP = '#5C1F28';
	const CREAM     = '#FAF8F5';
	const IVORY     = '#FFFFFF';
	const INK       = '#1F1A17';
	const STONE     = '#8A8178';
	const HAIRLINE  = '#E8E2DA';
	const GOLD      = '#C9A24B';

	public static function init() {
		// Force the brand palette regardless of what's stored in WC settings.
		add_filter( 'pre_option_woocommerce_email_base_color',           [ __CLASS__, 'wine' ] );
		add_filter( 'pre_option_woocommerce_email_background_color',      [ __CLASS__, 'cream' ] );
		add_filter( 'pre_option_woocommerce_email_body_background_color', [ __CLASS__, 'ivory' ] );
		add_filter( 'pre_option_woocommerce_email_text_color',           [ __CLASS__, 'ink' ] );

		// Premium footer + extra CSS polish.
		add_filter( 'woocommerce_email_footer_text', [ __CLASS__, 'footer_text' ] );
		add_filter( 'woocommerce_email_styles',      [ __CLASS__, 'extra_styles' ], 20, 2 );

		// Warmer customer-facing headings.
		add_filter( 'woocommerce_email_heading_customer_processing_order', [ __CLASS__, 'heading_received' ] );
		add_filter( 'woocommerce_email_heading_customer_completed_order',  [ __CLASS__, 'heading_completed' ] );
		add_filter( 'woocommerce_email_heading_customer_on_hold_order',    [ __CLASS__, 'heading_received' ] );

		// A short branded intro line above the order table on customer emails.
		add_action( 'woocommerce_email_before_order_table', [ __CLASS__, 'intro_line' ], 5, 4 );
	}

	public static function wine()  { return self::WINE; }
	public static function cream() { return self::CREAM; }
	public static function ivory() { return self::IVORY; }
	public static function ink()   { return self::INK; }

	public static function footer_text( $text ) {
		$site = esc_html( get_bloginfo( 'name' ) );
		return $site . ' &middot; Gifts &amp; clothing delivered across Pakistan'
			. '<br><span style="color:' . self::STONE . ';font-size:12px;">'
			. 'Need help? Reply to this email or message us on WhatsApp.</span>';
	}

	public static function extra_styles( $css, $email = null ) {
		$css .= '
			body, #wrapper { background-color: ' . self::CREAM . ' !important; }
			#template_container {
				border-radius: 10px !important;
				overflow: hidden !important;
				box-shadow: 0 6px 24px rgba(31,26,23,0.08) !important;
				border: 1px solid ' . self::HAIRLINE . ' !important;
			}
			#template_header {
				background-color: ' . self::WINE . ' !important;
				border-radius: 0 !important;
				border-bottom: 3px solid ' . self::GOLD . ' !important;
			}
			#template_header h1, #header_wrapper h1, #template_header_image h1 {
				color: ' . self::CREAM . ' !important;
				letter-spacing: 0.10em !important;
				text-transform: uppercase !important;
				font-family: Georgia, "Times New Roman", serif !important;
				text-shadow: none !important;
			}
			h1, h2, h3 { color: ' . self::INK . ' !important; }
			#body_content h2 { color: ' . self::WINE . ' !important; }
			a { color: ' . self::WINE . ' !important; }
			.button, a.button {
				background-color: ' . self::WINE . ' !important;
				border-color: ' . self::WINE . ' !important;
				color: #ffffff !important;
				border-radius: 6px !important;
			}
			#template_footer td { padding-top: 16px !important; }
			#template_footer #credit {
				color: ' . self::STONE . ' !important;
				font-size: 12px !important;
				line-height: 1.6 !important;
			}
			td.order-text, .order_item td { color: ' . self::INK . ' !important; }
		';
		return $css;
	}

	public static function heading_received() {
		return __( 'Thank you for your order', 'mygift-core' );
	}

	public static function heading_completed() {
		return __( 'Your order is complete', 'mygift-core' );
	}

	/**
	 * Adds a short branded sentence above the order details table on
	 * customer-facing emails only (skip admin notifications).
	 */
	public static function intro_line( $order, $sent_to_admin = false, $plain_text = false, $email = null ) {
		if ( $sent_to_admin || $plain_text ) {
			return;
		}
		echo '<p style="margin:0 0 20px;font-size:15px;color:' . esc_attr( self::STONE ) . ';line-height:1.6;">'
			. esc_html__( 'We’re preparing your order with care. Here are the details:', 'mygift-core' )
			. '</p>';
	}
}
