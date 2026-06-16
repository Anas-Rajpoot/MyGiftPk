<?php
/**
 * Careers manager — native replacement for the ACF `jobs` repeater.
 *
 * Admin: MYGIFT → Careers
 * REST:  GET /wp-json/mygift/v1/careers
 *        →  { "jobListings": [ {jobTitle, location, jobType, description, applyEmail} ] }
 *
 * @package MYGIFT_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MYGIFT_Careers extends MYGIFT_Content_Base {

	const OPTION_KEY = 'mygift_careers';

	protected static function option_key(): string { return self::OPTION_KEY; }
	protected static function rest_route(): string { return '/careers'; }
	protected static function rev_tags(): array { return array( 'page:careers' ); }
	protected static function settings_group(): string { return 'mygift_careers_group'; }
	public static function menu_slug(): string { return 'mygift-careers'; }
	public static function page_title(): string { return __( 'Careers / Job Listings', 'mygift-core' ); }
	public static function menu_label(): string { return __( 'Careers', 'mygift-core' ); }

	public static function init() { self::boot(); }

	protected static function defaults(): array {
		return array( 'items' => array() );
	}

	public static function sanitize( $input ) {
		$rows  = ( is_array( $input ) && isset( $input['items'] ) ) ? (array) $input['items'] : array();
		$clean = array();
		foreach ( $rows as $row ) {
			$row   = (array) $row;
			$title = sanitize_text_field( $row['jobTitle'] ?? '' );
			if ( '' === $title ) {
				continue;
			}
			$clean[] = array(
				'jobTitle'    => $title,
				'location'    => sanitize_text_field( $row['location'] ?? '' ),
				'jobType'     => sanitize_text_field( $row['jobType'] ?? '' ),
				'description' => wp_kses_post( $row['description'] ?? '' ),
				'applyEmail'  => sanitize_email( $row['applyEmail'] ?? '' ),
			);
		}
		return array( 'items' => array_values( $clean ) );
	}

	public static function rest_shape( array $data ): array {
		$items = array();
		foreach ( (array) ( $data['items'] ?? array() ) as $row ) {
			$items[] = array(
				'jobTitle'    => (string) ( $row['jobTitle'] ?? '' ),
				'location'    => (string) ( $row['location'] ?? '' ),
				'jobType'     => (string) ( $row['jobType'] ?? '' ),
				'description' => (string) ( $row['description'] ?? '' ),
				'applyEmail'  => (string) ( $row['applyEmail'] ?? '' ),
			);
		}
		return array( 'jobListings' => $items );
	}

	/* ── Admin UI ──────────────────────────────────────────────────────── */

	protected static function row_html( $i, array $row ): string {
		ob_start();
		?>
		<div class="mg-row">
			<button type="button" class="mg-remove-row" title="Remove">&times;</button>
			<div class="mg-row-grid">
				<div>
					<label>Job Title</label>
					<input type="text" name="<?php echo self::name( 'items', $i, 'jobTitle' ); ?>" value="<?php echo esc_attr( $row['jobTitle'] ?? '' ); ?>" />
				</div>
				<div>
					<label>Location</label>
					<input type="text" name="<?php echo self::name( 'items', $i, 'location' ); ?>" value="<?php echo esc_attr( $row['location'] ?? '' ); ?>" placeholder="Lahore / Remote" />
				</div>
				<div>
					<label>Type</label>
					<input type="text" name="<?php echo self::name( 'items', $i, 'jobType' ); ?>" value="<?php echo esc_attr( $row['jobType'] ?? '' ); ?>" placeholder="Full-time" />
				</div>
				<div>
					<label>Apply Email</label>
					<input type="text" name="<?php echo self::name( 'items', $i, 'applyEmail' ); ?>" value="<?php echo esc_attr( $row['applyEmail'] ?? '' ); ?>" placeholder="careers@mygift.pk" />
				</div>
				<div class="mg-col-full">
					<label>Description (basic HTML allowed)</label>
					<textarea name="<?php echo self::name( 'items', $i, 'description' ); ?>"><?php echo esc_textarea( $row['description'] ?? '' ); ?></textarea>
				</div>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	protected static function render_fields( array $data ): void {
		$items    = (array) ( $data['items'] ?? array() );
		$template = self::row_html( '{{i}}', array() );
		?>
		<div class="mg-section">
			<h2><?php esc_html_e( 'Open Positions', 'mygift-core' ); ?></h2>
			<p class="description"><?php esc_html_e( 'Listings appear on /careers. Leave empty to show the "no openings" message.', 'mygift-core' ); ?></p>
			<div class="mg-repeater" data-template="<?php echo esc_attr( $template ); ?>">
				<div class="mg-rows">
					<?php foreach ( $items as $i => $row ) {
						echo self::row_html( $i, (array) $row ); // phpcs:ignore WordPress.Security.EscapeOutput
					} ?>
				</div>
				<button type="button" class="button mg-add-row">+ <?php esc_html_e( 'Add Job', 'mygift-core' ); ?></button>
			</div>
		</div>
		<?php
	}
}
