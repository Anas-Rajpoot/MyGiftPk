<?php
/**
 * FAQs manager — native replacement for the ACF `faq_items` repeater.
 *
 * Admin: MYGIFT → FAQs
 * REST:  GET /wp-json/mygift/v1/faqs  →  { "faqItems": [ {question, answer, category} ] }
 *
 * @package MYGIFT_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MYGIFT_Faqs extends MYGIFT_Content_Base {

	const OPTION_KEY = 'mygift_faqs';

	protected static function option_key(): string { return self::OPTION_KEY; }
	protected static function rest_route(): string { return '/faqs'; }
	protected static function rev_tags(): array { return array( 'page:faqs' ); }
	protected static function settings_group(): string { return 'mygift_faqs_group'; }
	public static function menu_slug(): string { return 'mygift-faqs'; }
	public static function page_title(): string { return __( 'FAQs', 'mygift-core' ); }
	public static function menu_label(): string { return __( 'FAQs', 'mygift-core' ); }

	public static function init() { self::boot(); }

	protected static function defaults(): array {
		return array(
			'items' => array(
				array(
					'question' => 'How long does delivery take?',
					'answer'   => 'Karachi, Lahore and Islamabad: 1–2 business days. Other major cities: 2–4 business days. Remote areas: 4–7 business days.',
					'category' => 'Shipping',
				),
				array(
					'question' => 'Do you offer free shipping?',
					'answer'   => 'Yes — free shipping on all orders over Rs. 3,000 nationwide.',
					'category' => 'Shipping',
				),
			),
		);
	}

	public static function sanitize( $input ) {
		$rows = ( is_array( $input ) && isset( $input['items'] ) ) ? (array) $input['items'] : array();
		$clean = array();
		foreach ( $rows as $row ) {
			$row      = (array) $row;
			$question = sanitize_text_field( $row['question'] ?? '' );
			$answer   = wp_kses_post( $row['answer'] ?? '' );
			$category = sanitize_text_field( $row['category'] ?? '' );
			if ( '' === $question && '' === $answer ) {
				continue; // skip blank rows
			}
			$clean[] = array(
				'question' => $question,
				'answer'   => $answer,
				'category' => $category ?: 'General',
			);
		}
		return array( 'items' => array_values( $clean ) );
	}

	public static function rest_shape( array $data ): array {
		$items = array();
		foreach ( (array) ( $data['items'] ?? array() ) as $row ) {
			$items[] = array(
				'question' => (string) ( $row['question'] ?? '' ),
				'answer'   => wpautop( (string) ( $row['answer'] ?? '' ) ),
				'category' => (string) ( $row['category'] ?? 'General' ),
			);
		}
		return array( 'faqItems' => $items );
	}

	/* ── Admin UI ──────────────────────────────────────────────────────── */

	protected static function row_html( $i, array $row ): string {
		$q = self::name( 'items', $i, 'question' );
		$a = self::name( 'items', $i, 'answer' );
		$c = self::name( 'items', $i, 'category' );
		ob_start();
		?>
		<div class="mg-row">
			<button type="button" class="mg-remove-row" title="Remove">&times;</button>
			<div class="mg-row-grid">
				<div>
					<label>Question</label>
					<input type="text" name="<?php echo $q; ?>" value="<?php echo esc_attr( $row['question'] ?? '' ); ?>" />
				</div>
				<div>
					<label>Category</label>
					<input type="text" name="<?php echo $c; ?>" value="<?php echo esc_attr( $row['category'] ?? '' ); ?>" placeholder="Shipping" />
				</div>
				<div class="mg-col-full">
					<label>Answer (basic HTML allowed)</label>
					<textarea name="<?php echo $a; ?>"><?php echo esc_textarea( $row['answer'] ?? '' ); ?></textarea>
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
			<h2><?php esc_html_e( 'Frequently Asked Questions', 'mygift-core' ); ?></h2>
			<p class="description"><?php esc_html_e( 'Add, edit, remove or reorder questions. Group related questions with the same Category.', 'mygift-core' ); ?></p>
			<div class="mg-repeater" data-template="<?php echo esc_attr( $template ); ?>">
				<div class="mg-rows">
					<?php foreach ( $items as $i => $row ) {
						echo self::row_html( $i, (array) $row ); // phpcs:ignore WordPress.Security.EscapeOutput
					} ?>
				</div>
				<button type="button" class="button mg-add-row">+ <?php esc_html_e( 'Add FAQ', 'mygift-core' ); ?></button>
			</div>
		</div>
		<?php
	}
}
