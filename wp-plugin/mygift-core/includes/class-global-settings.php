<?php
/**
 * Global Settings — native replacement for the ACF "Global" Options page.
 *
 * Owns: free-shipping threshold, gift-wrap price, footer columns, social links,
 * contact details and the footer bottom line. (The announcement bar lives in
 * the Homepage manager; the header menu is driven by lib/config/nav.ts + live
 * WooCommerce categories on the frontend.)
 *
 * Admin: MYGIFT → Global Settings
 * REST:  GET /wp-json/mygift/v1/global
 *        →  { freeShippingThreshold, giftWrapPrice, footer{columns[],socials,contact,bottomText} }
 *
 * @package MYGIFT_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MYGIFT_Global_Settings extends MYGIFT_Content_Base {

	const OPTION_KEY = 'mygift_global';

	protected static function option_key(): string { return self::OPTION_KEY; }
	protected static function rest_route(): string { return '/global'; }
	protected static function rev_tags(): array { return array( 'global' ); }
	protected static function settings_group(): string { return 'mygift_global_group'; }
	public static function menu_slug(): string { return 'mygift-global'; }
	public static function page_title(): string { return __( 'Global Settings', 'mygift-core' ); }
	public static function menu_label(): string { return __( 'Global Settings', 'mygift-core' ); }

	public static function init() { self::boot(); }

	protected static function defaults(): array {
		return array(
			'free_shipping_threshold' => 3000,
			'gift_wrap_price'         => 150,
			'footer_columns'          => array(
				array(
					'heading' => 'Shop',
					'links'   => "Women | /category/women\nMen | /category/men\nKids | /category/kids\nGifts | /gifts\nGift Builder | /gift-builder\nSale | /shop?on_sale=1",
				),
				array(
					'heading' => 'Help',
					'links'   => "Track Your Order | /track-order\nShipping & Delivery | /shipping-policy\nReturns & Exchanges | /returns\nSize Guide | /size-guide\nFAQs | /faqs\nContact Us | /contact",
				),
				array(
					'heading' => 'Company',
					'links'   => "About MYGIFT | /about\nBlog | /blog\nCareers | /careers\nPrivacy Policy | /privacy-policy\nTerms & Conditions | /terms",
				),
			),
			'instagram'   => 'https://instagram.com/mygift.pk',
			'facebook'    => 'https://facebook.com/mygift.pk',
			'whatsapp'    => 'https://wa.me/923000000000',
			'phone'       => '+92 300 000 0000',
			'email'       => 'hello@mygift.pk',
			'bottom_text' => '© MYGIFT. All rights reserved.',
		);
	}

	public static function sanitize( $input ) {
		$input = (array) $input;

		$columns = array();
		foreach ( (array) ( $input['footer_columns'] ?? array() ) as $col ) {
			$col     = (array) $col;
			$heading = sanitize_text_field( $col['heading'] ?? '' );
			$links   = sanitize_textarea_field( $col['links'] ?? '' );
			if ( '' === $heading && '' === trim( $links ) ) {
				continue;
			}
			$columns[] = array( 'heading' => $heading, 'links' => $links );
		}

		return array(
			'free_shipping_threshold' => max( 0, (int) ( $input['free_shipping_threshold'] ?? 0 ) ),
			'gift_wrap_price'         => max( 0, (int) ( $input['gift_wrap_price'] ?? 0 ) ),
			'footer_columns'          => array_values( $columns ),
			'instagram'   => esc_url_raw( $input['instagram'] ?? '' ),
			'facebook'    => esc_url_raw( $input['facebook'] ?? '' ),
			'whatsapp'    => esc_url_raw( $input['whatsapp'] ?? '' ),
			'phone'       => sanitize_text_field( $input['phone'] ?? '' ),
			'email'       => sanitize_email( $input['email'] ?? '' ),
			'bottom_text' => sanitize_text_field( $input['bottom_text'] ?? '' ),
		);
	}

	/** Parse "Label | /href" lines into [{label, href}]. */
	private static function parse_links( string $value ): array {
		$out = array();
		foreach ( preg_split( '/\r\n|\r|\n/', $value ) as $line ) {
			$line = trim( $line );
			if ( '' === $line ) {
				continue;
			}
			$parts = array_map( 'trim', explode( '|', $line, 2 ) );
			$label = $parts[0] ?? '';
			$href  = $parts[1] ?? '#';
			if ( '' === $label ) {
				continue;
			}
			$out[] = array( 'label' => $label, 'href' => $href ?: '#' );
		}
		return $out;
	}

	public static function rest_shape( array $data ): array {
		$columns = array();
		foreach ( (array) ( $data['footer_columns'] ?? array() ) as $col ) {
			$columns[] = array(
				'heading' => (string) ( $col['heading'] ?? '' ),
				'links'   => self::parse_links( (string) ( $col['links'] ?? '' ) ),
			);
		}

		return array(
			'freeShippingThreshold' => (int) ( $data['free_shipping_threshold'] ?? 0 ),
			'giftWrapPrice'         => (int) ( $data['gift_wrap_price'] ?? 0 ),
			'footer'                => array(
				'columns' => $columns,
				'socials' => array(
					'instagram' => (string) ( $data['instagram'] ?? '' ),
					'facebook'  => (string) ( $data['facebook'] ?? '' ),
					'whatsapp'  => (string) ( $data['whatsapp'] ?? '' ),
				),
				'contact' => array(
					'phone' => (string) ( $data['phone'] ?? '' ),
					'email' => (string) ( $data['email'] ?? '' ),
				),
				'bottomText' => (string) ( $data['bottom_text'] ?? '' ),
			),
		);
	}

	/* ── Admin UI ──────────────────────────────────────────────────────── */

	protected static function column_row_html( $i, array $col ): string {
		ob_start();
		?>
		<div class="mg-row">
			<button type="button" class="mg-remove-row" title="Remove">&times;</button>
			<div class="mg-row-grid">
				<div class="mg-col-full">
					<label>Column Heading</label>
					<input type="text" name="<?php echo self::name( 'footer_columns', $i, 'heading' ); ?>" value="<?php echo esc_attr( $col['heading'] ?? '' ); ?>" />
				</div>
				<div class="mg-col-full">
					<label>Links — one per line, format: <code>Label | /path</code></label>
					<textarea name="<?php echo self::name( 'footer_columns', $i, 'links' ); ?>" rows="6"><?php echo esc_textarea( $col['links'] ?? '' ); ?></textarea>
				</div>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	protected static function render_fields( array $data ): void {
		?>
		<div class="mg-section">
			<h2><?php esc_html_e( 'Commerce', 'mygift-core' ); ?></h2>
			<?php
			self::text_field( __( 'Free shipping threshold (Rs.)', 'mygift-core' ), self::name( 'free_shipping_threshold' ), $data['free_shipping_threshold'] ?? 0, 'number' );
			self::text_field( __( 'Gift wrap price (Rs.)', 'mygift-core' ), self::name( 'gift_wrap_price' ), $data['gift_wrap_price'] ?? 0, 'number' );
			?>
		</div>

		<div class="mg-section">
			<h2><?php esc_html_e( 'Footer Columns', 'mygift-core' ); ?></h2>
			<?php $cols = (array) ( $data['footer_columns'] ?? array() ); $tpl = self::column_row_html( '{{i}}', array() ); ?>
			<div class="mg-repeater" data-template="<?php echo esc_attr( $tpl ); ?>">
				<div class="mg-rows">
					<?php foreach ( $cols as $i => $col ) {
						echo self::column_row_html( $i, (array) $col ); // phpcs:ignore WordPress.Security.EscapeOutput
					} ?>
				</div>
				<button type="button" class="button mg-add-row">+ <?php esc_html_e( 'Add Column', 'mygift-core' ); ?></button>
			</div>
		</div>

		<div class="mg-section">
			<h2><?php esc_html_e( 'Social &amp; Contact', 'mygift-core' ); ?></h2>
			<?php
			self::text_field( 'Instagram URL', self::name( 'instagram' ), $data['instagram'] ?? '', 'url' );
			self::text_field( 'Facebook URL', self::name( 'facebook' ), $data['facebook'] ?? '', 'url' );
			self::text_field( 'WhatsApp link', self::name( 'whatsapp' ), $data['whatsapp'] ?? '', 'url', 'https://wa.me/923...' );
			self::text_field( 'Contact phone', self::name( 'phone' ), $data['phone'] ?? '', 'text' );
			self::text_field( 'Contact email', self::name( 'email' ), $data['email'] ?? '', 'text' );
			self::text_field( 'Footer bottom line', self::name( 'bottom_text' ), $data['bottom_text'] ?? '', 'text' );
			?>
		</div>
		<?php
	}
}
