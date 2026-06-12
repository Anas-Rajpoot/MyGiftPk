<?php
/**
 * Fired during plugin activation.
 *
 * Checks minimum PHP / WooCommerce requirements before the plugin is allowed
 * to activate.  Deactivates itself and shows a clear error if requirements
 * are not met.  Also seeds default option values on first install.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MYGIFT_Activator {

	/**
	 * Run all activation tasks.
	 * Called by register_activation_hook().
	 */
	public static function activate() {
		self::check_php_version();
		self::check_woocommerce();
		self::seed_options();
		flush_rewrite_rules();
	}

	// ── Private helpers ───────────────────────────────────────────────────────

	/**
	 * Abort activation if PHP version is too old.
	 */
	private static function check_php_version() {
		if ( version_compare( PHP_VERSION, MYGIFT_CORE_MIN_PHP, '>=' ) ) {
			return;
		}

		deactivate_plugins( plugin_basename( MYGIFT_CORE_FILE ) );
		wp_die(
			'<p><strong>MYGIFT Core</strong> requires PHP ' . esc_html( MYGIFT_CORE_MIN_PHP ) . ' or higher.</p>'
			. '<p>You are running PHP ' . esc_html( PHP_VERSION ) . '. Please ask your hosting provider to upgrade PHP, then try activating the plugin again.</p>'
			. '<p><a href="' . esc_url( admin_url( 'plugins.php' ) ) . '">&laquo; Return to Plugins</a></p>',
			'Plugin Activation Error',
			array( 'back_link' => false, 'response' => 200 )
		);
	}

	/**
	 * Abort activation if WooCommerce is not active.
	 */
	private static function check_woocommerce() {
		if ( class_exists( 'WooCommerce' ) ) {
			return;
		}

		deactivate_plugins( plugin_basename( MYGIFT_CORE_FILE ) );
		wp_die(
			'<p><strong>MYGIFT Core</strong> requires <strong>WooCommerce</strong> to be installed and active.</p>'
			. '<p>Please install and activate WooCommerce first, then activate MYGIFT Core.</p>'
			. '<p><a href="' . esc_url( admin_url( 'plugins.php' ) ) . '">&laquo; Return to Plugins</a></p>',
			'Plugin Activation Error',
			array( 'back_link' => false, 'response' => 200 )
		);
	}

	/**
	 * Write default settings on first install.
	 * Uses add_option() so existing values are never overwritten on re-activation.
	 */
	private static function seed_options() {
		add_option(
			MYGIFT_Settings::OPTION_KEY,
			array(
				'revalidate_secret'    => '',
				'nextjs_url'           => 'https://mygift.pk',
				'packed_email_enabled' => 0,
			)
		);
	}
}
