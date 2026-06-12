<?php
/**
 * Fired during plugin deactivation.
 *
 * Cleans up any transient data created by the plugin.
 * Settings and order meta are intentionally kept so they survive
 * a deactivate → reactivate cycle without losing configuration.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MYGIFT_Deactivator {

	/**
	 * Run deactivation tasks.
	 * Called by register_deactivation_hook().
	 */
	public static function deactivate() {
		// Clear any scheduled cron events registered by this plugin.
		$timestamp = wp_next_scheduled( 'mygift_core_cleanup' );
		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, 'mygift_core_cleanup' );
		}

		flush_rewrite_rules();
	}
}
