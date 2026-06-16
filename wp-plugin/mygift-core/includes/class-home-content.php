<?php
/**
 * Homepage Builder + Announcement Bar — native replacement for the ACF
 * "Homepage" Flexible Content + the announcement bar portion of "Global".
 *
 * Every homepage section is a block with an Enable toggle and an Order number,
 * so a non-developer can show/hide and reorder the homepage with no code. The
 * REST endpoint returns the announcement bar plus the ordered, enabled blocks
 * in the exact shape the Next.js HomeBlockRenderer expects.
 *
 * Admin: MYGIFT → Homepage Builder
 * REST:  GET /wp-json/mygift/v1/home-content
 *        →  { announcementBar{enabled,text,link}, blocks:[ HomeBlock... ] }
 *
 * @package MYGIFT_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MYGIFT_Home_Content extends MYGIFT_Content_Base {

	const OPTION_KEY  = 'mygift_home_content';
	const SLIDE_COUNT = 3;

	protected static function option_key(): string { return self::OPTION_KEY; }
	protected static function rest_route(): string { return '/home-content'; }
	protected static function rev_tags(): array { return array( 'home', 'global' ); }
	protected static function settings_group(): string { return 'mygift_home_group'; }
	public static function menu_slug(): string { return 'mygift-home-content'; }
	public static function page_title(): string { return __( 'Homepage Builder', 'mygift-core' ); }
	public static function menu_label(): string { return __( 'Homepage Builder', 'mygift-core' ); }

	public static function init() { self::boot(); }

	/* ── Defaults ──────────────────────────────────────────────────────── */

	private static function empty_slide(): array {
		return array(
			'enabled'          => 0,
			'heading'          => '',
			'subtext'          => '',
			'cta_label'        => 'Shop Now',
			'cta_link'         => '/shop',
			'image_url'        => '',
			'mobile_image_url' => '',
		);
	}

	protected static function defaults(): array {
		return array(
			'announcement_bar' => array(
				'enabled' => 1,
				'text'    => 'Free shipping on orders over Rs. 3,000 · Nationwide delivery',
				'link'    => '/shop',
			),
			'blocks' => array(
				'hero' => array(
					'enabled' => 1,
					'order'   => 1,
					'slides'  => array(
						array_merge( self::empty_slide(), array(
							'enabled' => 1,
							'heading' => 'GIFTS THAT FEEL LIKE HOME',
							'subtext' => 'Clothing & custom gift boxes delivered across Pakistan',
						) ),
						self::empty_slide(),
						self::empty_slide(),
					),
				),
				'category_tiles' => array(
					'enabled' => 1,
					'order'   => 2,
					'tiles'   => array(
						array( 'slug' => 'women', 'name' => 'Women', 'image_url' => '', 'link' => '' ),
						array( 'slug' => 'men',   'name' => 'Men',   'image_url' => '', 'link' => '' ),
						array( 'slug' => 'kids',  'name' => 'Kids',  'image_url' => '', 'link' => '' ),
						array( 'slug' => 'gifts', 'name' => 'Gifts', 'image_url' => '', 'link' => '/gifts' ),
					),
				),
				'featured_tabs' => array(
					'enabled' => 1,
					'order'   => 3,
					'tabs'    => array(
						array( 'title' => 'New Arrivals', 'category_slug' => 'women' ),
						array( 'title' => 'Best Sellers', 'category_slug' => 'men' ),
						array( 'title' => 'On Sale',      'category_slug' => 'kids' ),
					),
				),
				'gift_banner' => array(
					'enabled'   => 1,
					'order'     => 4,
					'heading'   => "BUILD A GIFT THEY'LL NEVER FORGET",
					'subtext'   => 'Choose a box, fill it with your favourite treats, add a personal message — delivered anywhere in Pakistan.',
					'cta_label' => 'Start Building',
					'cta_link'  => '/gift-builder',
				),
				'occasion_chips' => array(
					'enabled' => 1,
					'order'   => 5,
					'chips'   => array(
						array( 'label' => 'Birthday',     'slug' => 'birthday' ),
						array( 'label' => 'Anniversary',  'slug' => 'anniversary' ),
						array( 'label' => 'Eid',          'slug' => 'eid' ),
						array( 'label' => 'Wedding',      'slug' => 'wedding' ),
					),
				),
				'from_abroad' => array(
					'enabled'   => 1,
					'order'     => 6,
					'heading'   => 'SENDING A GIFT FROM ABROAD?',
					'subtext'   => 'You\'re overseas. Your family is in Pakistan. We bridge that distance — order online, we deliver with love.',
					'image_url' => '',
					'cta_label' => 'Send a Gift Home',
					'cta_link'  => '/gift-builder',
				),
				'trust_row' => array(
					'enabled' => 1,
					'order'   => 7,
					'items'   => array(
						array( 'icon' => 'truck',        'heading' => 'Free Shipping',        'subtext' => 'On orders over Rs. 3,000 nationwide' ),
						array( 'icon' => 'gift',         'heading' => 'Gift Wrapping',        'subtext' => 'Premium wrapping available' ),
						array( 'icon' => 'shield-check', 'heading' => '100% Authentic',       'subtext' => 'Quality guaranteed' ),
						array( 'icon' => 'map-pin',      'heading' => 'Nationwide Delivery',  'subtext' => 'Delivered to all cities' ),
					),
				),
			),
		);
	}

	/* ── Sanitise ──────────────────────────────────────────────────────── */

	public static function sanitize( $input ) {
		if ( ! is_array( $input ) ) {
			return self::defaults();
		}
		$in_bar    = (array) ( $input['announcement_bar'] ?? array() );
		$in_blocks = (array) ( $input['blocks'] ?? array() );

		$bar = array(
			'enabled' => ! empty( $in_bar['enabled'] ) ? 1 : 0,
			'text'    => sanitize_text_field( $in_bar['text'] ?? '' ),
			'link'    => esc_url_raw( $in_bar['link'] ?? '' ),
		);

		// Hero slides.
		$hero_in     = (array) ( $in_blocks['hero'] ?? array() );
		$slides_in   = (array) ( $hero_in['slides'] ?? array() );
		$hero_slides = array();
		for ( $i = 0; $i < self::SLIDE_COUNT; $i++ ) {
			$s = (array) ( $slides_in[ $i ] ?? array() );
			$hero_slides[] = array(
				'enabled'          => ! empty( $s['enabled'] ) ? 1 : 0,
				'heading'          => sanitize_text_field( $s['heading'] ?? '' ),
				'subtext'          => sanitize_textarea_field( $s['subtext'] ?? '' ),
				'cta_label'        => sanitize_text_field( $s['cta_label'] ?? 'Shop Now' ),
				'cta_link'         => esc_url_raw( $s['cta_link'] ?? '/shop' ),
				'image_url'        => esc_url_raw( $s['image_url'] ?? '' ),
				'mobile_image_url' => esc_url_raw( $s['mobile_image_url'] ?? '' ),
			);
		}

		$blocks = array(
			'hero' => array(
				'enabled' => self::flag( $in_blocks, 'hero' ),
				'order'   => self::order( $in_blocks, 'hero' ),
				'slides'  => $hero_slides,
			),
			'category_tiles' => array(
				'enabled' => self::flag( $in_blocks, 'category_tiles' ),
				'order'   => self::order( $in_blocks, 'category_tiles' ),
				'tiles'   => self::sanitize_rows( $in_blocks['category_tiles']['tiles'] ?? array(), function ( $r ) {
					$name = sanitize_text_field( $r['name'] ?? '' );
					$slug = sanitize_title( $r['slug'] ?? '' );
					if ( '' === $name && '' === $slug ) { return null; }
					return array(
						'slug'      => $slug,
						'name'      => $name,
						'image_url' => esc_url_raw( $r['image_url'] ?? '' ),
						'link'      => esc_url_raw( $r['link'] ?? '' ),
					);
				} ),
			),
			'featured_tabs' => array(
				'enabled' => self::flag( $in_blocks, 'featured_tabs' ),
				'order'   => self::order( $in_blocks, 'featured_tabs' ),
				'tabs'    => self::sanitize_rows( $in_blocks['featured_tabs']['tabs'] ?? array(), function ( $r ) {
					$title = sanitize_text_field( $r['title'] ?? '' );
					if ( '' === $title ) { return null; }
					return array(
						'title'         => $title,
						'category_slug' => sanitize_title( $r['category_slug'] ?? '' ),
					);
				} ),
			),
			'gift_banner' => array(
				'enabled'   => self::flag( $in_blocks, 'gift_banner' ),
				'order'     => self::order( $in_blocks, 'gift_banner' ),
				'heading'   => sanitize_text_field( $in_blocks['gift_banner']['heading'] ?? '' ),
				'subtext'   => sanitize_textarea_field( $in_blocks['gift_banner']['subtext'] ?? '' ),
				'cta_label' => sanitize_text_field( $in_blocks['gift_banner']['cta_label'] ?? 'Start Building' ),
				'cta_link'  => esc_url_raw( $in_blocks['gift_banner']['cta_link'] ?? '/gift-builder' ),
			),
			'occasion_chips' => array(
				'enabled' => self::flag( $in_blocks, 'occasion_chips' ),
				'order'   => self::order( $in_blocks, 'occasion_chips' ),
				'chips'   => self::sanitize_rows( $in_blocks['occasion_chips']['chips'] ?? array(), function ( $r ) {
					$label = sanitize_text_field( $r['label'] ?? '' );
					if ( '' === $label ) { return null; }
					return array(
						'label' => $label,
						'slug'  => sanitize_title( $r['slug'] ?? '' ),
					);
				} ),
			),
			'from_abroad' => array(
				'enabled'   => self::flag( $in_blocks, 'from_abroad' ),
				'order'     => self::order( $in_blocks, 'from_abroad' ),
				'heading'   => sanitize_text_field( $in_blocks['from_abroad']['heading'] ?? '' ),
				'subtext'   => sanitize_textarea_field( $in_blocks['from_abroad']['subtext'] ?? '' ),
				'image_url' => esc_url_raw( $in_blocks['from_abroad']['image_url'] ?? '' ),
				'cta_label' => sanitize_text_field( $in_blocks['from_abroad']['cta_label'] ?? '' ),
				'cta_link'  => esc_url_raw( $in_blocks['from_abroad']['cta_link'] ?? '' ),
			),
			'trust_row' => array(
				'enabled' => self::flag( $in_blocks, 'trust_row' ),
				'order'   => self::order( $in_blocks, 'trust_row' ),
				'items'   => self::sanitize_rows( $in_blocks['trust_row']['items'] ?? array(), function ( $r ) {
					$heading = sanitize_text_field( $r['heading'] ?? '' );
					if ( '' === $heading ) { return null; }
					return array(
						'icon'    => sanitize_text_field( $r['icon'] ?? '' ),
						'heading' => $heading,
						'subtext' => sanitize_text_field( $r['subtext'] ?? '' ),
					);
				} ),
			),
		);

		return array( 'announcement_bar' => $bar, 'blocks' => $blocks );
	}

	private static function flag( array $blocks, string $key ): int {
		return ! empty( $blocks[ $key ]['enabled'] ) ? 1 : 0;
	}
	private static function order( array $blocks, string $key ): int {
		return (int) ( $blocks[ $key ]['order'] ?? 99 );
	}
	private static function sanitize_rows( $rows, callable $fn ): array {
		$out = array();
		foreach ( (array) $rows as $row ) {
			$clean = $fn( (array) $row );
			if ( null !== $clean ) {
				$out[] = $clean;
			}
		}
		return array_values( $out );
	}

	/* ── REST shape ────────────────────────────────────────────────────── */

	public static function rest_shape( array $data ): array {
		$bar    = (array) ( $data['announcement_bar'] ?? array() );
		$blocks = (array) ( $data['blocks'] ?? array() );

		$ordered = array();

		// hero_slider
		if ( ! empty( $blocks['hero']['enabled'] ) ) {
			$slides = array();
			foreach ( (array) ( $blocks['hero']['slides'] ?? array() ) as $s ) {
				if ( empty( $s['enabled'] ) ) {
					continue;
				}
				$img = (string) ( $s['image_url'] ?? '' );
				$mob = (string) ( $s['mobile_image_url'] ?? '' );
				$slides[] = array(
					'heading'      => (string) ( $s['heading'] ?? '' ),
					'subtext'      => (string) ( $s['subtext'] ?? '' ),
					'ctaLabel'     => (string) ( $s['cta_label'] ?? '' ),
					'ctaLink'      => (string) ( $s['cta_link'] ?? '' ),
					'desktopImage' => array( 'sourceUrl' => $img, 'altText' => (string) ( $s['heading'] ?? '' ) ),
					'mobileImage'  => array( 'sourceUrl' => $mob ?: $img, 'altText' => (string) ( $s['heading'] ?? '' ) ),
				);
			}
			$ordered[] = array(
				'_order'        => self::order( $blocks, 'hero' ),
				'fieldGroupName' => 'hero_slider',
				'slides'        => $slides,
			);
		}

		// category_tiles
		if ( ! empty( $blocks['category_tiles']['enabled'] ) ) {
			$tiles = array();
			foreach ( (array) ( $blocks['category_tiles']['tiles'] ?? array() ) as $t ) {
				$img = (string) ( $t['image_url'] ?? '' );
				$tiles[] = array(
					'slug'  => (string) ( $t['slug'] ?? '' ),
					'name'  => (string) ( $t['name'] ?? '' ),
					'image' => $img ? array( 'sourceUrl' => $img, 'altText' => (string) ( $t['name'] ?? '' ) ) : null,
					'link'  => ! empty( $t['link'] ) ? (string) $t['link'] : null,
				);
			}
			$ordered[] = array( '_order' => self::order( $blocks, 'category_tiles' ), 'fieldGroupName' => 'category_tiles', 'tiles' => $tiles );
		}

		// featured_tabs
		if ( ! empty( $blocks['featured_tabs']['enabled'] ) ) {
			$tabs = array();
			foreach ( (array) ( $blocks['featured_tabs']['tabs'] ?? array() ) as $i => $t ) {
				$tabs[] = array(
					'id'           => 'tab-' . $i,
					'title'        => (string) ( $t['title'] ?? '' ),
					'categorySlug' => (string) ( $t['category_slug'] ?? '' ),
				);
			}
			$ordered[] = array( '_order' => self::order( $blocks, 'featured_tabs' ), 'fieldGroupName' => 'featured_tabs', 'tabs' => $tabs );
		}

		// gift_banner
		if ( ! empty( $blocks['gift_banner']['enabled'] ) ) {
			$gb = (array) $blocks['gift_banner'];
			$ordered[] = array(
				'_order'         => self::order( $blocks, 'gift_banner' ),
				'fieldGroupName' => 'gift_banner',
				'heading'        => (string) ( $gb['heading'] ?? '' ),
				'subtext'        => (string) ( $gb['subtext'] ?? '' ),
				'ctaLabel'       => (string) ( $gb['cta_label'] ?? '' ),
				'ctaLink'        => (string) ( $gb['cta_link'] ?? '' ),
			);
		}

		// occasion_chips
		if ( ! empty( $blocks['occasion_chips']['enabled'] ) ) {
			$chips = array();
			foreach ( (array) ( $blocks['occasion_chips']['chips'] ?? array() ) as $c ) {
				$chips[] = array( 'label' => (string) ( $c['label'] ?? '' ), 'slug' => (string) ( $c['slug'] ?? '' ) );
			}
			$ordered[] = array( '_order' => self::order( $blocks, 'occasion_chips' ), 'fieldGroupName' => 'occasion_chips', 'chips' => $chips );
		}

		// from_abroad_block
		if ( ! empty( $blocks['from_abroad']['enabled'] ) ) {
			$fa  = (array) $blocks['from_abroad'];
			$img = (string) ( $fa['image_url'] ?? '' );
			$ordered[] = array(
				'_order'         => self::order( $blocks, 'from_abroad' ),
				'fieldGroupName' => 'from_abroad_block',
				'heading'        => (string) ( $fa['heading'] ?? '' ),
				'subtext'        => (string) ( $fa['subtext'] ?? '' ),
				'image'          => $img ? array( 'sourceUrl' => $img, 'altText' => (string) ( $fa['heading'] ?? '' ) ) : null,
				'ctaLabel'       => (string) ( $fa['cta_label'] ?? '' ),
				'ctaLink'        => (string) ( $fa['cta_link'] ?? '' ),
			);
		}

		// trust_row
		if ( ! empty( $blocks['trust_row']['enabled'] ) ) {
			$items = array();
			foreach ( (array) ( $blocks['trust_row']['items'] ?? array() ) as $it ) {
				$items[] = array(
					'icon'    => (string) ( $it['icon'] ?? '' ),
					'heading' => (string) ( $it['heading'] ?? '' ),
					'subtext' => (string) ( $it['subtext'] ?? '' ),
				);
			}
			$ordered[] = array( '_order' => self::order( $blocks, 'trust_row' ), 'fieldGroupName' => 'trust_row', 'items' => $items );
		}

		// Sort by order, then strip the helper key.
		usort( $ordered, function ( $a, $b ) {
			return $a['_order'] <=> $b['_order'];
		} );
		$ordered = array_map( function ( $b ) {
			unset( $b['_order'] );
			return $b;
		}, $ordered );

		return array(
			'announcementBar' => array(
				'enabled' => (bool) ( $bar['enabled'] ?? false ),
				'text'    => (string) ( $bar['text'] ?? '' ),
				'link'    => (string) ( $bar['link'] ?? '' ),
			),
			'blocks' => array_values( $ordered ),
		);
	}

	/* ── Admin UI ──────────────────────────────────────────────────────── */

	/** Enable + Order header row shown atop each block section. */
	private static function block_controls( string $key, array $block ): void {
		?>
		<div class="mg-field">
			<label><?php esc_html_e( 'Show on homepage', 'mygift-core' ); ?></label>
			<div class="mg-input" style="display:flex;gap:24px;align-items:center;">
				<label>
					<input type="checkbox" name="<?php echo self::name( 'blocks', $key, 'enabled' ); ?>" value="1" <?php checked( 1, (int) ( $block['enabled'] ?? 0 ) ); ?> />
					<?php esc_html_e( 'Enabled', 'mygift-core' ); ?>
				</label>
				<label style="font-weight:400;">
					<?php esc_html_e( 'Order', 'mygift-core' ); ?>
					<input type="number" min="1" style="width:64px;" name="<?php echo self::name( 'blocks', $key, 'order' ); ?>" value="<?php echo esc_attr( $block['order'] ?? 99 ); ?>" />
				</label>
			</div>
		</div>
		<?php
	}

	private static function repeater( string $key, string $sub, array $rows, callable $row_fn, string $add_label ): void {
		$template = $row_fn( '{{i}}', array() );
		?>
		<div class="mg-repeater" data-template="<?php echo esc_attr( $template ); ?>">
			<div class="mg-rows">
				<?php foreach ( $rows as $i => $row ) {
					echo $row_fn( $i, (array) $row ); // phpcs:ignore WordPress.Security.EscapeOutput
				} ?>
			</div>
			<button type="button" class="button mg-add-row">+ <?php echo esc_html( $add_label ); ?></button>
		</div>
		<?php
	}

	protected static function render_fields( array $data ): void {
		$bar    = (array) ( $data['announcement_bar'] ?? array() );
		$blocks = (array) ( $data['blocks'] ?? array() );

		/* Announcement bar */
		?>
		<div class="mg-section">
			<h2><?php esc_html_e( 'Announcement Bar', 'mygift-core' ); ?></h2>
			<?php
			self::checkbox_field( __( 'Enable', 'mygift-core' ), self::name( 'announcement_bar', 'enabled' ), $bar['enabled'] ?? 0, __( 'Show the bar across the whole site', 'mygift-core' ) );
			self::text_field( __( 'Text', 'mygift-core' ), self::name( 'announcement_bar', 'text' ), $bar['text'] ?? '', 'text', 'Free shipping on orders over Rs. 3,000' );
			self::text_field( __( 'Link (optional)', 'mygift-core' ), self::name( 'announcement_bar', 'link' ), $bar['link'] ?? '', 'url', '/shop' );
			?>
		</div>

		<?php /* Hero slider */ ?>
		<div class="mg-section">
			<h2><?php esc_html_e( 'Hero Slider', 'mygift-core' ); ?></h2>
			<?php self::block_controls( 'hero', (array) ( $blocks['hero'] ?? array() ) ); ?>
			<p class="description" style="margin-bottom:14px;"><?php esc_html_e( 'Up to 3 slides. Desktop ~1920×800, mobile ~750×940. Tick a slide to show it.', 'mygift-core' ); ?></p>
			<?php
			$slides = (array) ( $blocks['hero']['slides'] ?? array() );
			for ( $i = 0; $i < self::SLIDE_COUNT; $i++ ) :
				$s    = (array) ( $slides[ $i ] ?? array() );
				$open = ! empty( $s['enabled'] );
			?>
			<div class="mg-row">
				<div class="mg-row-grid">
					<div class="mg-col-full">
						<label>
							<input type="checkbox" class="mg-toggle" data-target=".mg-slide-fields-<?php echo $i; ?>"
								name="<?php echo self::name( 'blocks', 'hero', 'slides', $i, 'enabled' ); ?>" value="1" <?php checked( $open ); ?> />
							<?php printf( esc_html__( 'Slide %d enabled', 'mygift-core' ), $i + 1 ); ?>
						</label>
					</div>
					<div class="mg-col-full mg-slide-fields-<?php echo $i; ?>" <?php echo $open ? '' : 'style="display:none"'; ?>>
						<div class="mg-row-grid">
							<div>
								<label>Heading</label>
								<input type="text" name="<?php echo self::name( 'blocks', 'hero', 'slides', $i, 'heading' ); ?>" value="<?php echo esc_attr( $s['heading'] ?? '' ); ?>" />
							</div>
							<div>
								<label>Subtext</label>
								<input type="text" name="<?php echo self::name( 'blocks', 'hero', 'slides', $i, 'subtext' ); ?>" value="<?php echo esc_attr( $s['subtext'] ?? '' ); ?>" />
							</div>
							<div>
								<label>Button Text</label>
								<input type="text" name="<?php echo self::name( 'blocks', 'hero', 'slides', $i, 'cta_label' ); ?>" value="<?php echo esc_attr( $s['cta_label'] ?? '' ); ?>" />
							</div>
							<div>
								<label>Button Link</label>
								<input type="url" name="<?php echo self::name( 'blocks', 'hero', 'slides', $i, 'cta_link' ); ?>" value="<?php echo esc_attr( $s['cta_link'] ?? '' ); ?>" />
							</div>
							<div>
								<label>Desktop Image</label>
								<div class="mg-image-row">
									<input type="url" class="mg-image-url" name="<?php echo self::name( 'blocks', 'hero', 'slides', $i, 'image_url' ); ?>" value="<?php echo esc_attr( $s['image_url'] ?? '' ); ?>" placeholder="https://..." />
									<button type="button" class="button mg-pick-image">Choose</button>
									<img class="mg-image-preview" src="<?php echo esc_attr( $s['image_url'] ?? '' ); ?>" alt="" <?php echo empty( $s['image_url'] ) ? 'style="display:none"' : ''; ?> />
								</div>
							</div>
							<div>
								<label>Mobile Image (optional)</label>
								<div class="mg-image-row">
									<input type="url" class="mg-image-url" name="<?php echo self::name( 'blocks', 'hero', 'slides', $i, 'mobile_image_url' ); ?>" value="<?php echo esc_attr( $s['mobile_image_url'] ?? '' ); ?>" placeholder="https://..." />
									<button type="button" class="button mg-pick-image">Choose</button>
									<img class="mg-image-preview" src="<?php echo esc_attr( $s['mobile_image_url'] ?? '' ); ?>" alt="" <?php echo empty( $s['mobile_image_url'] ) ? 'style="display:none"' : ''; ?> />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<?php endfor; ?>
		</div>

		<?php /* Category tiles */ ?>
		<div class="mg-section">
			<h2><?php esc_html_e( 'Category Tiles', 'mygift-core' ); ?></h2>
			<?php
			self::block_controls( 'category_tiles', (array) ( $blocks['category_tiles'] ?? array() ) );
			self::repeater( 'category_tiles', 'tiles', (array) ( $blocks['category_tiles']['tiles'] ?? array() ),
				function ( $i, $r ) {
					ob_start(); ?>
					<div class="mg-row">
						<button type="button" class="mg-remove-row" title="Remove">&times;</button>
						<div class="mg-row-grid">
							<div><label>Label</label><input type="text" name="<?php echo self::name( 'blocks', 'category_tiles', 'tiles', $i, 'name' ); ?>" value="<?php echo esc_attr( $r['name'] ?? '' ); ?>" /></div>
							<div><label>Category Slug</label><input type="text" name="<?php echo self::name( 'blocks', 'category_tiles', 'tiles', $i, 'slug' ); ?>" value="<?php echo esc_attr( $r['slug'] ?? '' ); ?>" placeholder="women" /></div>
							<div><label>Custom Link (optional)</label><input type="text" name="<?php echo self::name( 'blocks', 'category_tiles', 'tiles', $i, 'link' ); ?>" value="<?php echo esc_attr( $r['link'] ?? '' ); ?>" placeholder="/gifts" /></div>
							<div>
								<label>Image</label>
								<div class="mg-image-row">
									<input type="url" class="mg-image-url" name="<?php echo self::name( 'blocks', 'category_tiles', 'tiles', $i, 'image_url' ); ?>" value="<?php echo esc_attr( $r['image_url'] ?? '' ); ?>" placeholder="https://..." />
									<button type="button" class="button mg-pick-image">Choose</button>
									<img class="mg-image-preview" src="<?php echo esc_attr( $r['image_url'] ?? '' ); ?>" alt="" <?php echo empty( $r['image_url'] ) ? 'style="display:none"' : ''; ?> />
								</div>
							</div>
						</div>
					</div>
					<?php return ob_get_clean();
				}, __( 'Add Tile', 'mygift-core' ) );
			?>
		</div>

		<?php /* Featured tabs */ ?>
		<div class="mg-section">
			<h2><?php esc_html_e( 'Featured Product Tabs', 'mygift-core' ); ?></h2>
			<?php
			self::block_controls( 'featured_tabs', (array) ( $blocks['featured_tabs'] ?? array() ) );
			self::repeater( 'featured_tabs', 'tabs', (array) ( $blocks['featured_tabs']['tabs'] ?? array() ),
				function ( $i, $r ) {
					ob_start(); ?>
					<div class="mg-row">
						<button type="button" class="mg-remove-row" title="Remove">&times;</button>
						<div class="mg-row-grid">
							<div><label>Tab Title</label><input type="text" name="<?php echo self::name( 'blocks', 'featured_tabs', 'tabs', $i, 'title' ); ?>" value="<?php echo esc_attr( $r['title'] ?? '' ); ?>" placeholder="New Arrivals" /></div>
							<div><label>Source Category Slug</label><input type="text" name="<?php echo self::name( 'blocks', 'featured_tabs', 'tabs', $i, 'category_slug' ); ?>" value="<?php echo esc_attr( $r['category_slug'] ?? '' ); ?>" placeholder="women" /></div>
						</div>
					</div>
					<?php return ob_get_clean();
				}, __( 'Add Tab', 'mygift-core' ) );
			?>
		</div>

		<?php /* Gift banner */ ?>
		<div class="mg-section">
			<h2><?php esc_html_e( 'Gift Builder Banner', 'mygift-core' ); ?></h2>
			<?php
			self::block_controls( 'gift_banner', (array) ( $blocks['gift_banner'] ?? array() ) );
			$gb = (array) ( $blocks['gift_banner'] ?? array() );
			self::text_field( 'Heading', self::name( 'blocks', 'gift_banner', 'heading' ), $gb['heading'] ?? '' );
			self::textarea_field( 'Subtext', self::name( 'blocks', 'gift_banner', 'subtext' ), $gb['subtext'] ?? '' );
			self::text_field( 'Button Text', self::name( 'blocks', 'gift_banner', 'cta_label' ), $gb['cta_label'] ?? '' );
			self::text_field( 'Button Link', self::name( 'blocks', 'gift_banner', 'cta_link' ), $gb['cta_link'] ?? '', 'url' );
			?>
		</div>

		<?php /* Occasion chips */ ?>
		<div class="mg-section">
			<h2><?php esc_html_e( 'Occasion Chips', 'mygift-core' ); ?></h2>
			<?php
			self::block_controls( 'occasion_chips', (array) ( $blocks['occasion_chips'] ?? array() ) );
			self::repeater( 'occasion_chips', 'chips', (array) ( $blocks['occasion_chips']['chips'] ?? array() ),
				function ( $i, $r ) {
					ob_start(); ?>
					<div class="mg-row">
						<button type="button" class="mg-remove-row" title="Remove">&times;</button>
						<div class="mg-row-grid">
							<div><label>Label</label><input type="text" name="<?php echo self::name( 'blocks', 'occasion_chips', 'chips', $i, 'label' ); ?>" value="<?php echo esc_attr( $r['label'] ?? '' ); ?>" placeholder="Birthday" /></div>
							<div><label>Occasion Slug</label><input type="text" name="<?php echo self::name( 'blocks', 'occasion_chips', 'chips', $i, 'slug' ); ?>" value="<?php echo esc_attr( $r['slug'] ?? '' ); ?>" placeholder="birthday" /></div>
						</div>
					</div>
					<?php return ob_get_clean();
				}, __( 'Add Chip', 'mygift-core' ) );
			?>
		</div>

		<?php /* From abroad */ ?>
		<div class="mg-section">
			<h2><?php esc_html_e( 'From Abroad Block', 'mygift-core' ); ?></h2>
			<?php
			self::block_controls( 'from_abroad', (array) ( $blocks['from_abroad'] ?? array() ) );
			$fa = (array) ( $blocks['from_abroad'] ?? array() );
			self::text_field( 'Heading', self::name( 'blocks', 'from_abroad', 'heading' ), $fa['heading'] ?? '' );
			self::textarea_field( 'Subtext', self::name( 'blocks', 'from_abroad', 'subtext' ), $fa['subtext'] ?? '' );
			self::text_field( 'Button Text', self::name( 'blocks', 'from_abroad', 'cta_label' ), $fa['cta_label'] ?? '' );
			self::text_field( 'Button Link', self::name( 'blocks', 'from_abroad', 'cta_link' ), $fa['cta_link'] ?? '', 'url' );
			?>
			<div class="mg-field">
				<label>Image (optional)</label>
				<div class="mg-input">
					<div class="mg-image-row">
						<input type="url" class="mg-image-url" name="<?php echo self::name( 'blocks', 'from_abroad', 'image_url' ); ?>" value="<?php echo esc_attr( $fa['image_url'] ?? '' ); ?>" placeholder="https://..." />
						<button type="button" class="button mg-pick-image">Choose</button>
						<img class="mg-image-preview" src="<?php echo esc_attr( $fa['image_url'] ?? '' ); ?>" alt="" <?php echo empty( $fa['image_url'] ) ? 'style="display:none"' : ''; ?> />
					</div>
				</div>
			</div>
		</div>

		<?php /* Trust row */ ?>
		<div class="mg-section">
			<h2><?php esc_html_e( 'Trust Row', 'mygift-core' ); ?></h2>
			<?php
			self::block_controls( 'trust_row', (array) ( $blocks['trust_row'] ?? array() ) );
			self::repeater( 'trust_row', 'items', (array) ( $blocks['trust_row']['items'] ?? array() ),
				function ( $i, $r ) {
					ob_start(); ?>
					<div class="mg-row">
						<button type="button" class="mg-remove-row" title="Remove">&times;</button>
						<div class="mg-row-grid">
							<div><label>Icon (truck / gift / shield-check / map-pin)</label><input type="text" name="<?php echo self::name( 'blocks', 'trust_row', 'items', $i, 'icon' ); ?>" value="<?php echo esc_attr( $r['icon'] ?? '' ); ?>" placeholder="truck" /></div>
							<div><label>Heading</label><input type="text" name="<?php echo self::name( 'blocks', 'trust_row', 'items', $i, 'heading' ); ?>" value="<?php echo esc_attr( $r['heading'] ?? '' ); ?>" /></div>
							<div class="mg-col-full"><label>Subtext</label><input type="text" name="<?php echo self::name( 'blocks', 'trust_row', 'items', $i, 'subtext' ); ?>" value="<?php echo esc_attr( $r['subtext'] ?? '' ); ?>" /></div>
						</div>
					</div>
					<?php return ob_get_clean();
				}, __( 'Add Trust Item', 'mygift-core' ) );
			?>
		</div>
		<?php
	}
}
