<?php
/**
 * Fired when the plugin is deleted from the Plugins screen.
 *
 * Removes all plugin-specific options from the database.
 * Order meta (_courier, _tracking_*, _ts_*) is left intact so
 * historical order data is preserved even after the plugin is removed.
 */

// WordPress sets this constant before running uninstall.php; abort if missing.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Remove plugin settings.
delete_option( 'mygift_core_settings' );

// Remove any transients the plugin may have created.
delete_transient( 'mygift_core_version' );
