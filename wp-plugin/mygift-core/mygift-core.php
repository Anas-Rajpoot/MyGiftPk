<?php
/**
 * Plugin Name: MYGIFT Core
 * Plugin URI:  https://mygift.pk
 * Description: Gift bundle handling, revalidation webhooks, and admin tools for MYGIFT headless store.
 * Version:     0.1.0
 * Author:      MYGIFT
 * License:     GPL-2.0-or-later
 * Text Domain: mygift-core
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'MYGIFT_CORE_VERSION', '0.1.0' );
define( 'MYGIFT_CORE_DIR', plugin_dir_path( __FILE__ ) );

require_once MYGIFT_CORE_DIR . 'includes/class-settings.php';
require_once MYGIFT_CORE_DIR . 'includes/class-revalidate-webhook.php';

/**
 * Bootstrap the plugin.
 */
function mygift_core_init() {
    MYGIFT_Settings::init();
    MYGIFT_Revalidate_Webhook::init();
}
add_action( 'plugins_loaded', 'mygift_core_init' );
