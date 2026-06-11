<?php
/**
 * Admin settings page: MYGIFT Core configuration.
 */
class MYGIFT_Settings {

    const OPTION_KEY = 'mygift_core_settings';

    public static function init() {
        add_action( 'admin_menu', [ __CLASS__, 'add_menu' ] );
        add_action( 'admin_init', [ __CLASS__, 'register_settings' ] );
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

        add_settings_section( 'mygift_main', 'Revalidation Settings', '__return_false', 'mygift-core' );

        add_settings_field(
            'revalidate_secret',
            'Revalidate Secret',
            [ __CLASS__, 'field_secret' ],
            'mygift-core',
            'mygift_main'
        );

        add_settings_field(
            'nextjs_url',
            'Next.js Site URL',
            [ __CLASS__, 'field_nextjs_url' ],
            'mygift-core',
            'mygift_main'
        );
    }

    public static function field_secret() {
        $opts = self::get();
        echo '<input type="text" name="' . self::OPTION_KEY . '[revalidate_secret]" value="' . esc_attr( $opts['revalidate_secret'] ?? '' ) . '" class="regular-text">';
        echo '<p class="description">Must match REVALIDATE_SECRET in Next.js .env.local</p>';
    }

    public static function field_nextjs_url() {
        $opts = self::get();
        echo '<input type="url" name="' . self::OPTION_KEY . '[nextjs_url]" value="' . esc_attr( $opts['nextjs_url'] ?? 'https://mygift.pk' ) . '" class="regular-text">';
    }

    public static function sanitize( $input ) {
        return [
            'revalidate_secret' => sanitize_text_field( $input['revalidate_secret'] ?? '' ),
            'nextjs_url'        => esc_url_raw( $input['nextjs_url'] ?? '' ),
        ];
    }

    /** @return array{revalidate_secret:string,nextjs_url:string} */
    public static function get(): array {
        $defaults = [ 'revalidate_secret' => '', 'nextjs_url' => 'https://mygift.pk' ];
        return wp_parse_args( (array) get_option( self::OPTION_KEY, [] ), $defaults );
    }

    public static function render_page() {
        ?>
        <div class="wrap">
            <h1>MYGIFT Core Settings</h1>
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
