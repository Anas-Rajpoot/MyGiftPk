<?php
/**
 * Gift Builder settings — native replacement for the ACF "Gift Builder" Options page.
 *
 * Stores boxes, add-ons, allowed component category slugs, message char limit,
 * ribbon colours and occasion tags. The REST endpoint merges these settings
 * with the LIVE component products read from WooCommerce (hidden "Gift
 * Components" categories), so the frontend gets one ready-to-use payload.
 *
 * Admin: MYGIFT → Gift Builder
 * REST:  GET /wp-json/mygift/v1/gift-builder
 *        →  { boxes[], components[], addOns[], categories[], messageCharLimit,
 *             ribbonColors[], occasions[] }   (matches GiftBuilderOptions)
 *
 * @package MYGIFT_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MYGIFT_Gift_Builder_Settings extends MYGIFT_Content_Base {

	const OPTION_KEY = 'mygift_gift_builder';

	protected static function option_key(): string { return self::OPTION_KEY; }
	protected static function rest_route(): string { return '/gift-builder'; }
	protected static function rev_tags(): array { return array( 'gift-builder' ); }
	protected static function settings_group(): string { return 'mygift_gift_builder_group'; }
	public static function menu_slug(): string { return 'mygift-gift-builder'; }
	public static function page_title(): string { return __( 'Gift Builder Settings', 'mygift-core' ); }
	public static function menu_label(): string { return __( 'Gift Builder', 'mygift-core' ); }

	public static function init() { self::boot(); }

	protected static function defaults(): array {
		return array(
			'boxes' => array(
				array( 'name' => 'Small Gift Box',  'image_url' => '', 'base_price' => 500,  'capacity' => 3 ),
				array( 'name' => 'Medium Gift Box', 'image_url' => '', 'base_price' => 800,  'capacity' => 5 ),
				array( 'name' => 'Large Gift Box',  'image_url' => '', 'base_price' => 1200, 'capacity' => 8 ),
			),
			'add_ons' => array(
				array( 'name' => 'Photo Print',     'price' => 500 ),
				array( 'name' => 'Premium Ribbon',  'price' => 300 ),
			),
			'category_slugs'     => 'gift-chocolates, gift-candies, gift-biscuits, gift-extras',
			'message_char_limit' => 200,
			'ribbon_colors'      => "Wine Red\nGold\nIvory\nNavy\nBlush Pink\nSage Green",
			'occasions'          => "Birthday\nAnniversary\nEid\nMother's Day\nBaby Shower\nWedding\nJust Because",
		);
	}

	public static function sanitize( $input ) {
		$input = (array) $input;

		$boxes = array();
		foreach ( (array) ( $input['boxes'] ?? array() ) as $row ) {
			$row  = (array) $row;
			$name = sanitize_text_field( $row['name'] ?? '' );
			if ( '' === $name ) {
				continue;
			}
			$boxes[] = array(
				'name'       => $name,
				'image_url'  => esc_url_raw( $row['image_url'] ?? '' ),
				'base_price' => max( 0, (int) ( $row['base_price'] ?? 0 ) ),
				'capacity'   => max( 1, (int) ( $row['capacity'] ?? 1 ) ),
			);
		}

		$add_ons = array();
		foreach ( (array) ( $input['add_ons'] ?? array() ) as $row ) {
			$row  = (array) $row;
			$name = sanitize_text_field( $row['name'] ?? '' );
			if ( '' === $name ) {
				continue;
			}
			$add_ons[] = array(
				'name'  => $name,
				'price' => max( 0, (int) ( $row['price'] ?? 0 ) ),
			);
		}

		return array(
			'boxes'              => array_values( $boxes ),
			'add_ons'            => array_values( $add_ons ),
			'category_slugs'     => sanitize_text_field( $input['category_slugs'] ?? '' ),
			'message_char_limit' => max( 0, (int) ( $input['message_char_limit'] ?? 200 ) ),
			'ribbon_colors'      => sanitize_textarea_field( $input['ribbon_colors'] ?? '' ),
			'occasions'          => sanitize_textarea_field( $input['occasions'] ?? '' ),
		);
	}

	/** Split a newline-separated textarea into a trimmed, non-empty list. */
	private static function lines_to_list( string $value ): array {
		$out = array();
		foreach ( preg_split( '/\r\n|\r|\n/', $value ) as $line ) {
			$line = trim( $line );
			if ( '' !== $line ) {
				$out[] = $line;
			}
		}
		return $out;
	}

	/** Split a comma-separated slug list into a clean array. */
	private static function csv_to_slugs( string $value ): array {
		$out = array();
		foreach ( explode( ',', $value ) as $slug ) {
			$slug = sanitize_title( trim( $slug ) );
			if ( '' !== $slug ) {
				$out[] = $slug;
			}
		}
		return $out;
	}

	public static function rest_shape( array $data ): array {
		$slugs = self::csv_to_slugs( (string) ( $data['category_slugs'] ?? '' ) );

		$boxes = array();
		foreach ( (array) ( $data['boxes'] ?? array() ) as $i => $row ) {
			$boxes[] = array(
				'id'        => $i + 1,
				'name'      => (string) ( $row['name'] ?? '' ),
				'image'     => ! empty( $row['image_url'] ) ? array( 'sourceUrl' => (string) $row['image_url'] ) : null,
				'basePrice' => (int) ( $row['base_price'] ?? 0 ),
				'capacity'  => (int) ( $row['capacity'] ?? 1 ),
			);
		}

		$add_ons = array();
		foreach ( (array) ( $data['add_ons'] ?? array() ) as $i => $row ) {
			$add_ons[] = array(
				'id'    => $i + 1,
				'name'  => (string) ( $row['name'] ?? '' ),
				'price' => (int) ( $row['price'] ?? 0 ),
			);
		}

		list( $components, $category_names ) = self::fetch_components( $slugs );

		return array(
			'boxes'            => $boxes,
			'components'       => $components,
			'addOns'           => $add_ons,
			'categories'       => $category_names,
			'messageCharLimit' => (int) ( $data['message_char_limit'] ?? 200 ),
			'ribbonColors'     => self::lines_to_list( (string) ( $data['ribbon_colors'] ?? '' ) ),
			'occasions'        => self::lines_to_list( (string) ( $data['occasions'] ?? '' ) ),
		);
	}

	/**
	 * Read live component products from WooCommerce for the allowed categories.
	 *
	 * @param string[] $slugs product_cat slugs.
	 * @return array{0: array, 1: array} [components, ordered category display names]
	 */
	private static function fetch_components( array $slugs ): array {
		$components = array();
		$cat_names  = array();

		if ( empty( $slugs ) || ! function_exists( 'wc_get_products' ) || ! taxonomy_exists( 'product_cat' ) ) {
			return array( $components, $cat_names );
		}

		foreach ( $slugs as $slug ) {
			$term = get_term_by( 'slug', $slug, 'product_cat' );
			if ( ! $term || is_wp_error( $term ) ) {
				continue;
			}
			$cat_names[] = $term->name;

			$products = wc_get_products(
				array(
					'status'   => 'publish',
					'limit'    => 100,
					'category' => array( $slug ),
					'orderby'  => 'menu_order',
					'order'    => 'ASC',
				)
			);

			foreach ( $products as $product ) {
				$img_id = $product->get_image_id();
				$src    = $img_id ? wp_get_attachment_image_url( $img_id, 'woocommerce_thumbnail' ) : '';
				$components[] = array(
					'productId'     => $product->get_id(),
					'name'          => $product->get_name(),
					'image'         => $src ? array( 'sourceUrl' => $src ) : null,
					'price'         => (float) wc_get_price_to_display( $product ),
					'category'      => $term->name,
					'stockStatus'   => 'instock' === $product->get_stock_status() ? 'IN_STOCK' : 'OUT_OF_STOCK',
					'stockQuantity' => $product->get_manage_stock() ? (int) $product->get_stock_quantity() : null,
				);
			}
		}

		return array( $components, $cat_names );
	}

	/* ── Admin UI ──────────────────────────────────────────────────────── */

	protected static function box_row_html( $i, array $row ): string {
		ob_start();
		?>
		<div class="mg-row">
			<button type="button" class="mg-remove-row" title="Remove">&times;</button>
			<div class="mg-row-grid">
				<div>
					<label>Box Name</label>
					<input type="text" name="<?php echo self::name( 'boxes', $i, 'name' ); ?>" value="<?php echo esc_attr( $row['name'] ?? '' ); ?>" />
				</div>
				<div>
					<label>Base Price (Rs.)</label>
					<input type="number" min="0" name="<?php echo self::name( 'boxes', $i, 'base_price' ); ?>" value="<?php echo esc_attr( $row['base_price'] ?? 0 ); ?>" />
				</div>
				<div>
					<label>Capacity (items)</label>
					<input type="number" min="1" name="<?php echo self::name( 'boxes', $i, 'capacity' ); ?>" value="<?php echo esc_attr( $row['capacity'] ?? 1 ); ?>" />
				</div>
				<div>
					<label>Image</label>
					<div class="mg-image-row">
						<input type="url" class="mg-image-url" name="<?php echo self::name( 'boxes', $i, 'image_url' ); ?>" value="<?php echo esc_attr( $row['image_url'] ?? '' ); ?>" placeholder="https://..." />
						<button type="button" class="button mg-pick-image">Choose</button>
						<img class="mg-image-preview" src="<?php echo esc_attr( $row['image_url'] ?? '' ); ?>" alt="" <?php echo empty( $row['image_url'] ) ? 'style="display:none"' : ''; ?> />
					</div>
				</div>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	protected static function addon_row_html( $i, array $row ): string {
		ob_start();
		?>
		<div class="mg-row">
			<button type="button" class="mg-remove-row" title="Remove">&times;</button>
			<div class="mg-row-grid">
				<div>
					<label>Add-on Name</label>
					<input type="text" name="<?php echo self::name( 'add_ons', $i, 'name' ); ?>" value="<?php echo esc_attr( $row['name'] ?? '' ); ?>" />
				</div>
				<div>
					<label>Price (Rs.)</label>
					<input type="number" min="0" name="<?php echo self::name( 'add_ons', $i, 'price' ); ?>" value="<?php echo esc_attr( $row['price'] ?? 0 ); ?>" />
				</div>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	protected static function render_fields( array $data ): void {
		$boxes   = (array) ( $data['boxes'] ?? array() );
		$add_ons = (array) ( $data['add_ons'] ?? array() );
		$box_tpl   = self::box_row_html( '{{i}}', array() );
		$addon_tpl = self::addon_row_html( '{{i}}', array() );
		?>
		<div class="mg-section">
			<h2><?php esc_html_e( 'Gift Boxes', 'mygift-core' ); ?></h2>
			<p class="description"><?php esc_html_e( 'Each box sets a base price and how many items it can hold.', 'mygift-core' ); ?></p>
			<div class="mg-repeater" data-template="<?php echo esc_attr( $box_tpl ); ?>">
				<div class="mg-rows">
					<?php foreach ( $boxes as $i => $row ) {
						echo self::box_row_html( $i, (array) $row ); // phpcs:ignore WordPress.Security.EscapeOutput
					} ?>
				</div>
				<button type="button" class="button mg-add-row">+ <?php esc_html_e( 'Add Box', 'mygift-core' ); ?></button>
			</div>
		</div>

		<div class="mg-section">
			<h2><?php esc_html_e( 'Add-ons', 'mygift-core' ); ?></h2>
			<div class="mg-repeater" data-template="<?php echo esc_attr( $addon_tpl ); ?>">
				<div class="mg-rows">
					<?php foreach ( $add_ons as $i => $row ) {
						echo self::addon_row_html( $i, (array) $row ); // phpcs:ignore WordPress.Security.EscapeOutput
					} ?>
				</div>
				<button type="button" class="button mg-add-row">+ <?php esc_html_e( 'Add Add-on', 'mygift-core' ); ?></button>
			</div>
		</div>

		<div class="mg-section">
			<h2><?php esc_html_e( 'Components &amp; Options', 'mygift-core' ); ?></h2>
			<?php
			self::text_field(
				__( 'Component category slugs', 'mygift-core' ),
				self::name( 'category_slugs' ),
				$data['category_slugs'] ?? '',
				'text',
				'gift-chocolates, gift-candies, gift-biscuits, gift-extras'
			);
			?>
			<p class="description" style="margin:-8px 0 16px 196px;">
				<?php esc_html_e( 'Comma-separated WooCommerce product-category slugs (the hidden "Gift Components" sub-categories). Products in these categories become the fillable items, read live from WooCommerce.', 'mygift-core' ); ?>
			</p>
			<?php
			self::text_field( __( 'Message character limit', 'mygift-core' ), self::name( 'message_char_limit' ), $data['message_char_limit'] ?? 200, 'number' );
			self::textarea_field( __( 'Ribbon colours (one per line)', 'mygift-core' ), self::name( 'ribbon_colors' ), $data['ribbon_colors'] ?? '' );
			self::textarea_field( __( 'Occasion tags (one per line)', 'mygift-core' ), self::name( 'occasions' ), $data['occasions'] ?? '' );
			?>
		</div>
		<?php
	}
}
