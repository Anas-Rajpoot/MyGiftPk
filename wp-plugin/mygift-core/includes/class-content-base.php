<?php
/**
 * Base class for MYGIFT native content managers.
 *
 * Each manager stores its data in a single wp_option, renders a no-code admin
 * screen (reparented under the MYGIFT Control Center menu), exposes a public
 * read-only REST endpoint consumed by the Next.js frontend, and fires a
 * revalidation webhook whenever its option is saved.
 *
 * This is the free, native replacement for the old ACF Options Pages /
 * Flexible Content. Subclasses implement the abstract hooks; the base wires
 * the lifecycle.
 *
 * @package MYGIFT_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class MYGIFT_Content_Base {

	/* ── Subclass contract ──────────────────────────────────────────────── */

	/** @return string wp_option key (also the Settings API option name). */
	abstract protected static function option_key(): string;

	/** @return string REST route under the mygift/v1 namespace, e.g. '/global'. */
	abstract protected static function rest_route(): string;

	/** @return string[] revalidation cache tags fired on save. */
	abstract protected static function rev_tags(): array;

	/** @return string Settings API group name (unique per manager). */
	abstract protected static function settings_group(): string;

	/** @return string admin submenu page slug. */
	abstract public static function menu_slug(): string;

	/** @return string admin page <h1> title. */
	abstract public static function page_title(): string;

	/** @return string Control Center submenu label. */
	abstract public static function menu_label(): string;

	/** @return array stored defaults (full shape). */
	abstract protected static function defaults(): array;

	/**
	 * Sanitise + normalise raw $_POST input into the stored shape.
	 *
	 * @param mixed $input
	 * @return array
	 */
	abstract public static function sanitize( $input );

	/**
	 * Render the form fields (inside the wrapping <form>).
	 *
	 * @param array $data merged stored data.
	 */
	abstract protected static function render_fields( array $data ): void;

	/**
	 * Transform stored data into the JSON shape the Next.js frontend expects.
	 *
	 * @param array $data merged stored data.
	 * @return array
	 */
	abstract public static function rest_shape( array $data ): array;

	/* ── Lifecycle ──────────────────────────────────────────────────────── */

	public static function boot() {
		add_action( 'admin_init',          array( static::class, 'register' ) );
		add_action( 'rest_api_init',        array( static::class, 'register_route' ) );
		add_action( 'admin_enqueue_scripts',array( static::class, 'enqueue_assets' ) );
		add_action( 'update_option_' . static::option_key(), array( static::class, 'on_save' ), 10, 0 );
	}

	public static function register() {
		register_setting(
			static::settings_group(),
			static::option_key(),
			array( 'sanitize_callback' => array( static::class, 'sanitize' ) )
		);
	}

	/* ── Data access ────────────────────────────────────────────────────── */

	/**
	 * Stored data deep-merged over defaults (top-level keys only; subclasses
	 * may override for nested merges).
	 *
	 * @return array
	 */
	public static function get(): array {
		$saved = (array) get_option( static::option_key(), array() );
		return array_merge( static::defaults(), $saved );
	}

	/* ── REST ───────────────────────────────────────────────────────────── */

	public static function register_route() {
		register_rest_route(
			'mygift/v1',
			static::rest_route(),
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( static::class, 'api_response' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	public static function api_response( WP_REST_Request $request ) {
		$response = rest_ensure_response( static::rest_shape( static::get() ) );
		$response->header( 'Cache-Control', 'public, max-age=60, s-maxage=3600' );
		return $response;
	}

	/* ── Revalidation ───────────────────────────────────────────────────── */

	public static function on_save() {
		if ( class_exists( 'MYGIFT_Revalidate_Webhook' ) ) {
			MYGIFT_Revalidate_Webhook::fire_tags( static::rev_tags() );
		}
	}

	/* ── Assets ─────────────────────────────────────────────────────────── */

	public static function enqueue_assets( $hook ) {
		// Load shared admin CSS/JS on any MYGIFT Control Center screen.
		if ( false === strpos( (string) $hook, 'mygift' ) ) {
			return;
		}
		wp_enqueue_media();
		wp_enqueue_style(
			'mygift-admin',
			MYGIFT_CORE_URL . 'assets/admin.css',
			array(),
			MYGIFT_CORE_VERSION
		);
		wp_enqueue_script(
			'mygift-admin',
			MYGIFT_CORE_URL . 'assets/admin.js',
			array( 'jquery' ),
			MYGIFT_CORE_VERSION,
			true
		);
	}

	/* ── Admin page renderer ────────────────────────────────────────────── */

	public static function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$data     = static::get();
		$rest_url = esc_url( get_rest_url( null, 'mygift/v1' . static::rest_route() ) );
		?>
		<div class="wrap mg-wrap">
			<h1>
				<?php echo esc_html( static::page_title() ); ?>
				<span class="mg-badge">MYGIFT</span>
			</h1>
			<p class="mg-rest-url">
				<strong><?php esc_html_e( 'Frontend reads from:', 'mygift-core' ); ?></strong>
				<code><?php echo $rest_url; ?></code>
			</p>
			<?php settings_errors( static::settings_group() ); ?>
			<form method="post" action="options.php">
				<?php settings_fields( static::settings_group() ); ?>
				<?php static::render_fields( $data ); ?>
				<?php submit_button( __( 'Save Changes', 'mygift-core' ) ); ?>
			</form>
		</div>
		<?php
	}

	/* ── Shared field helpers (keep subclass render code terse) ─────────── */

	/** Escaped option-key field name: name="<option>[a][b]...". */
	protected static function name( ...$keys ): string {
		$n = static::option_key();
		foreach ( $keys as $k ) {
			$n .= '[' . $k . ']';
		}
		return esc_attr( $n );
	}

	/** A text/url/number row in the flex .mg-field layout. */
	protected static function text_field( string $label, string $name, $value, string $type = 'text', string $placeholder = '' ) {
		?>
		<div class="mg-field">
			<label><?php echo esc_html( $label ); ?></label>
			<div class="mg-input">
				<input type="<?php echo esc_attr( $type ); ?>"
					name="<?php echo $name; // already escaped ?>"
					value="<?php echo esc_attr( $value ); ?>"
					placeholder="<?php echo esc_attr( $placeholder ); ?>" />
			</div>
		</div>
		<?php
	}

	/** A textarea row. */
	protected static function textarea_field( string $label, string $name, $value, string $placeholder = '' ) {
		?>
		<div class="mg-field">
			<label><?php echo esc_html( $label ); ?></label>
			<div class="mg-input">
				<textarea name="<?php echo $name; ?>" placeholder="<?php echo esc_attr( $placeholder ); ?>"><?php echo esc_textarea( $value ); ?></textarea>
			</div>
		</div>
		<?php
	}

	/** A checkbox row. */
	protected static function checkbox_field( string $label, string $name, $checked, string $caption ) {
		?>
		<div class="mg-field">
			<label><?php echo esc_html( $label ); ?></label>
			<div class="mg-input">
				<label>
					<input type="checkbox" name="<?php echo $name; ?>" value="1" <?php checked( 1, (int) $checked ); ?> />
					<?php echo esc_html( $caption ); ?>
				</label>
			</div>
		</div>
		<?php
	}
}
