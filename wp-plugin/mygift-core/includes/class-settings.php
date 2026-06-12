<?php
/**
 * Admin settings page: MYGIFT Core configuration.
 *
 * Loaded at the top level of mygift-core.php (before plugins_loaded) because
 * class-activator.php references MYGIFT_Settings::OPTION_KEY during activation.
 * This file must therefore have NO dependency on WooCommerce or any other plugin.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MYGIFT_Settings {

    const OPTION_KEY = 'mygift_core_settings';

    public static function init() {
        add_action( 'admin_menu',  [ __CLASS__, 'add_menu' ] );
        add_action( 'admin_init',  [ __CLASS__, 'register_settings' ] );
    }

    public static function add_menu() {
        add_options_page(
            'MYGIFT Core',
            'MYGIFT Core',
            'manage_options',
            'mygift-core',
            [ __CLASS__, 'render_page' ]
        );
    }

    public static function register_settings() {
        register_setting( 'mygift_core_group', self::OPTION_KEY, [
            'sanitize_callback' => [ __CLASS__, 'sanitize' ],
        ] );

        /* ── Revalidation ─────────────────────────────────────────────── */
        add_settings_section( 'mygift_revalidation', 'Revalidation Settings', '__return_false', 'mygift-core' );

        add_settings_field( 'revalidate_secret', 'Revalidate Secret',
            [ __CLASS__, 'field_secret' ], 'mygift-core', 'mygift_revalidation' );

        add_settings_field( 'nextjs_url', 'Next.js Site URL',
            [ __CLASS__, 'field_nextjs_url' ], 'mygift-core', 'mygift_revalidation' );

        /* ── Emails ───────────────────────────────────────────────────── */
        add_settings_section( 'mygift_emails', 'Order Email Settings', '__return_false', 'mygift-core' );

        add_settings_field( 'packed_email_enabled', 'Packed Email',
            [ __CLASS__, 'field_packed_email' ], 'mygift-core', 'mygift_emails' );
    }

    /* ── Field renderers ─────────────────────────────────────────────── */

    public static function field_secret() {
        $opts = self::get();
        echo '<input type="text" name="' . self::OPTION_KEY . '[revalidate_secret]"'
            . ' value="' . esc_attr( $opts['revalidate_secret'] ?? '' ) . '" class="regular-text">';
        echo '<p class="description">Must match REVALIDATE_SECRET in Next.js .env.local</p>';
    }

    public static function field_nextjs_url() {
        $opts = self::get();
        echo '<input type="url" name="' . self::OPTION_KEY . '[nextjs_url]"'
            . ' value="' . esc_attr( $opts['nextjs_url'] ?? 'https://mygift.pk' ) . '" class="regular-text">';
    }

    public static function field_packed_email() {
        $opts = self::get();
        $checked = ! empty( $opts['packed_email_enabled'] ) ? 'checked' : '';
        echo '<label>'
            . '<input type="checkbox" name="' . self::OPTION_KEY . '[packed_email_enabled]" value="1" ' . $checked . '> '
            . esc_html__( 'Send a short "Order Packed" notification to customers', 'mygift-core' )
            . '</label>';
        echo '<p class="description">When enabled, a brief email is sent when an order moves to <strong>Packed</strong> status.</p>';
    }

    /* ── Sanitize ────────────────────────────────────────────────────── */

    public static function sanitize( $input ) {
        return [
            'revalidate_secret'    => sanitize_text_field( $input['revalidate_secret']    ?? '' ),
            'nextjs_url'           => esc_url_raw(          $input['nextjs_url']           ?? '' ),
            'packed_email_enabled' => ! empty( $input['packed_email_enabled'] ) ? 1 : 0,
        ];
    }

    /** @return array{revalidate_secret:string,nextjs_url:string,packed_email_enabled:int} */
    public static function get(): array {
        $defaults = [
            'revalidate_secret'    => '',
            'nextjs_url'           => 'https://mygift.pk',
            'packed_email_enabled' => 0,
        ];
        return wp_parse_args( (array) get_option( self::OPTION_KEY, [] ), $defaults );
    }

    /* ── Page renderer ───────────────────────────────────────────────── */

    public static function render_page() {
        ?>
        <div class="wrap">
            <h1>MYGIFT Core Settings</h1>
            <?php settings_errors( 'mygift_core_group' ); ?>
            <form method="post" action="options.php">
                <?php
                settings_fields( 'mygift_core_group' );
                do_settings_sections( 'mygift-core' );
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }
}
