<?php
/**
 * Plugin Name:       MYGIFT Core
 * Plugin URI:        https://mygift.pk
 * Description:       Order tracking pipeline, shipment management, revalidation webhooks, and transactional emails for the MYGIFT headless WooCommerce store.
 * Version:           0.5.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            MYGIFT
 * Author URI:        https://mygift.pk
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       mygift-core
 * Domain Path:       /languages
 *
 * WC requires at least: 5.0
 * WC tested up to:      9.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// ── Plugin constants ───────────────────────────────────────────────────────────

define( 'MYGIFT_CORE_VERSION',  '0.5.0' );
define( 'MYGIFT_CORE_FILE',     __FILE__ );
define( 'MYGIFT_CORE_DIR',      plugin_dir_path( __FILE__ ) );
define( 'MYGIFT_CORE_URL',      plugin_dir_url( __FILE__ ) );
define( 'MYGIFT_CORE_MIN_PHP',  '7.4' );
define( 'MYGIFT_CORE_MIN_WC',   '5.0.0' );
define( 'MYGIFT_CORE_MIN_WP',   '6.0' );

// ── Files with no WooCommerce dependency — safe to load immediately ────────────

require_once MYGIFT_CORE_DIR . 'includes/class-activator.php';
require_once MYGIFT_CORE_DIR . 'includes/class-deactivator.php';
require_once MYGIFT_CORE_DIR . 'includes/class-settings.php';

// ── Lifecycle hooks ───────────────────────────────────────────────────────────

register_activation_hook(   MYGIFT_CORE_FILE, array( 'MYGIFT_Activator',   'activate'   ) );
register_deactivation_hook( MYGIFT_CORE_FILE, array( 'MYGIFT_Deactivator', 'deactivate' ) );

// ── Declare HPOS + block-editor compatibility ─────────────────────────────────

add_action( 'before_woocommerce_init', function () {
	if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', MYGIFT_CORE_FILE, true );
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', MYGIFT_CORE_FILE, true );
	}
} );

// ── Bootstrap ─────────────────────────────────────────────────────────────────

add_action( 'plugins_loaded', 'mygift_core_init', 10 );

/**
 * Main plugin initialisation — runs after WooCommerce is fully loaded.
 */
function mygift_core_init() {
	// Show notice and bail gracefully when requirements are not met.
	if ( ! mygift_core_requirements_met() ) {
		add_action( 'admin_notices', 'mygift_core_requirements_notice' );
		return;
	}

	load_plugin_textdomain( 'mygift-core', false, dirname( plugin_basename( MYGIFT_CORE_FILE ) ) . '/languages' );

	// Settings class already loaded at top level; just wire up its admin hooks.
	MYGIFT_Settings::init();

	// Feature classes that have no strict WC class-hierarchy dependency.
	require_once MYGIFT_CORE_DIR . 'includes/class-revalidate-webhook.php';
	require_once MYGIFT_CORE_DIR . 'includes/class-order-statuses.php';
	require_once MYGIFT_CORE_DIR . 'includes/class-status-timestamps.php';
	require_once MYGIFT_CORE_DIR . 'includes/class-email-branding.php';

	MYGIFT_Revalidate_Webhook::init();
	MYGIFT_Order_Statuses::init();
	MYGIFT_Status_Timestamps::init();
	MYGIFT_Email_Branding::init();

	// Native content managers (free ACF replacement) — admin screens + REST.
	require_once MYGIFT_CORE_DIR . 'includes/class-content-base.php';
	require_once MYGIFT_CORE_DIR . 'includes/class-home-content.php';
	require_once MYGIFT_CORE_DIR . 'includes/class-global-settings.php';
	require_once MYGIFT_CORE_DIR . 'includes/class-gift-builder-settings.php';
	require_once MYGIFT_CORE_DIR . 'includes/class-faqs.php';
	require_once MYGIFT_CORE_DIR . 'includes/class-careers.php';
	require_once MYGIFT_CORE_DIR . 'includes/class-category-intro.php';

	MYGIFT_Home_Content::init();
	MYGIFT_Global_Settings::init();
	MYGIFT_Gift_Builder_Settings::init();
	MYGIFT_Faqs::init();
	MYGIFT_Careers::init();
	MYGIFT_Category_Intro::init();

	// Admin-only features.
	if ( is_admin() ) {
		require_once MYGIFT_CORE_DIR . 'includes/class-control-center.php';
		require_once MYGIFT_CORE_DIR . 'includes/class-shipment-tracking.php';
		require_once MYGIFT_CORE_DIR . 'includes/class-admin-columns.php';
		MYGIFT_Control_Center::init();
		MYGIFT_Shipment_Tracking::init();
		MYGIFT_Admin_Columns::init();
	}

	// WC_Email is NOT available at plugins_loaded — WooCommerce loads its email
	// infrastructure lazily when woocommerce_email_classes fires (during init).
	// We must defer the require_once until that moment, otherwise PHP cannot
	// resolve the `extends WC_Email` inheritance when the file is parsed.
	add_filter( 'woocommerce_email_classes', function ( array $emails ) {
		require_once MYGIFT_CORE_DIR . 'includes/class-order-emails.php';
		return MYGIFT_Order_Emails::register_emails( $emails );
	}, 10, 1 );
}

// ── Requirement helpers ────────────────────────────────────────────────────────

/**
 * @return bool  true when all runtime requirements are satisfied.
 */
function mygift_core_requirements_met() {
	if ( version_compare( PHP_VERSION, MYGIFT_CORE_MIN_PHP, '<' ) ) {
		return false;
	}
	if ( ! class_exists( 'WooCommerce' ) ) {
		return false;
	}
	if ( defined( 'WC_VERSION' ) && version_compare( WC_VERSION, MYGIFT_CORE_MIN_WC, '<' ) ) {
		return false;
	}
	return true;
}

/**
 * Admin notice shown when requirements are not met.
 */
function mygift_core_requirements_notice() {
	if ( version_compare( PHP_VERSION, MYGIFT_CORE_MIN_PHP, '<' ) ) {
		printf(
			'<div class="notice notice-error"><p><strong>MYGIFT Core</strong> requires PHP %1$s or higher. You are running PHP %2$s. Please ask your host to upgrade PHP.</p></div>',
			esc_html( MYGIFT_CORE_MIN_PHP ),
			esc_html( PHP_VERSION )
		);
	}
	if ( ! class_exists( 'WooCommerce' ) ) {
		echo '<div class="notice notice-error"><p><strong>MYGIFT Core</strong> requires <strong>WooCommerce</strong> to be installed and active.</p></div>';
	} elseif ( defined( 'WC_VERSION' ) && version_compare( WC_VERSION, MYGIFT_CORE_MIN_WC, '<' ) ) {
		printf(
			'<div class="notice notice-error"><p><strong>MYGIFT Core</strong> requires WooCommerce %s or higher.</p></div>',
			esc_html( MYGIFT_CORE_MIN_WC )
		);
	}
}
