<?php
/**
 * Home Content Manager — no ACF required.
 *
 * Stores announcement bar, hero slides, and gift banner text in wp_options.
 * Exposes the data via a public REST endpoint consumed by Next.js.
 * Fires a revalidation webhook whenever settings are saved.
 *
 * Admin: Settings → MYGIFT Home
 * REST:  GET /wp-json/mygift/v1/home-content
 *
 * Loaded inside mygift_core_init() on plugins_loaded priority 10.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MYGIFT_Home_Content {

	const OPTION_KEY  = 'mygift_home_content';
	const SLIDE_COUNT = 3;

	// ── Boot ──────────────────────────────────────────────────────────────────

	public static function init() {
		add_action( 'rest_api_init',        array( __CLASS__, 'register_routes'   ) );
		add_action( 'admin_menu',           array( __CLASS__, 'add_menu'          ) );
		add_action( 'admin_init',           array( __CLASS__, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts',array( __CLASS__, 'enqueue_scripts'   ) );
		// After settings save, fire revalidation
		add_action( 'update_option_' . self::OPTION_KEY, array( __CLASS__, 'on_save' ), 10, 0 );
	}

	// ── REST ──────────────────────────────────────────────────────────────────

	public static function register_routes() {
		register_rest_route(
			'mygift/v1',
			'/home-content',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'api_response' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	public static function api_response( WP_REST_Request $request ) {
		$response = rest_ensure_response( self::get_formatted() );
		$response->header( 'Cache-Control', 'public, max-age=60, s-maxage=3600' );
		return $response;
	}

	/**
	 * Returns the home content in the shape expected by the Next.js app.
	 * Matches HeroSlide + AnnouncementBarData TypeScript interfaces.
	 *
	 * @return array
	 */
	public static function get_formatted() {
		$data = self::get();

		// Build hero slides array — only enabled slides are included
		$hero_slides = array();
		foreach ( $data['hero_slides'] as $slide ) {
			if ( empty( $slide['enabled'] ) ) {
				continue;
			}
			$image_url        = $slide['image_url'];
			$mobile_image_url = $slide['mobile_image_url'] ?: $image_url;
			$hero_slides[]    = array(
				'heading'      => $slide['heading'],
				'subtext'      => $slide['subtext'],
				'ctaLabel'     => $slide['cta_label'],
				'ctaLink'      => $slide['cta_link'],
				'desktopImage' => array( 'sourceUrl' => $image_url,        'altText' => $slide['heading'] ),
				'mobileImage'  => array( 'sourceUrl' => $mobile_image_url, 'altText' => $slide['heading'] ),
			);
		}

		return array(
			'announcementBar' => array(
				'enabled' => (bool) $data['announcement_bar']['enabled'],
				'text'    => $data['announcement_bar']['text'],
				'link'    => $data['announcement_bar']['link'],
			),
			'heroSlides' => $hero_slides,
			'giftBanner' => array(
				'heading'  => $data['gift_banner']['heading'],
				'subtext'  => $data['gift_banner']['subtext'],
				'ctaLabel' => $data['gift_banner']['cta_label'],
				'ctaLink'  => $data['gift_banner']['cta_link'],
			),
		);
	}

	// ── Data access ───────────────────────────────────────────────────────────

	public static function get() {
		$saved    = (array) get_option( self::OPTION_KEY, array() );
		$defaults = self::defaults();

		// Deep merge each section independently
		$out = array();

		$out['announcement_bar'] = array_merge(
			$defaults['announcement_bar'],
			isset( $saved['announcement_bar'] ) ? (array) $saved['announcement_bar'] : array()
		);

		$saved_slides   = isset( $saved['hero_slides'] ) ? (array) $saved['hero_slides'] : array();
		$out['hero_slides'] = array();
		for ( $i = 0; $i < self::SLIDE_COUNT; $i++ ) {
			$out['hero_slides'][ $i ] = array_merge(
				$defaults['hero_slides'][ $i ],
				isset( $saved_slides[ $i ] ) ? (array) $saved_slides[ $i ] : array()
			);
		}

		$out['gift_banner'] = array_merge(
			$defaults['gift_banner'],
			isset( $saved['gift_banner'] ) ? (array) $saved['gift_banner'] : array()
		);

		return $out;
	}

	private static function defaults() {
		$empty_slide = array(
			'enabled'          => 0,
			'heading'          => '',
			'subtext'          => '',
			'cta_label'        => 'Shop Now',
			'cta_link'         => '/shop',
			'image_url'        => '',
			'mobile_image_url' => '',
		);

		return array(
			'announcement_bar' => array(
				'enabled' => 1,
				'text'    => 'Free shipping on orders over Rs. 3,000 · Nationwide delivery',
				'link'    => '/shop',
			),
			'hero_slides' => array( $empty_slide, $empty_slide, $empty_slide ),
			'gift_banner' => array(
				'heading'   => "BUILD A GIFT THEY'LL NEVER FORGET",
				'subtext'   => 'Choose a box, fill it with your favourite treats, add a personal message — delivered anywhere in Pakistan.',
				'cta_label' => 'Start Building',
				'cta_link'  => '/gift-builder',
			),
		);
	}

	// ── Settings API ──────────────────────────────────────────────────────────

	public static function add_menu() {
		add_submenu_page(
			'options-general.php',
			__( 'MYGIFT Home Content', 'mygift-core' ),
			__( 'MYGIFT Home', 'mygift-core' ),
			'manage_options',
			'mygift-home-content',
			array( __CLASS__, 'render_page' )
		);
	}

	public static function register_settings() {
		register_setting(
			'mygift_home_group',
			self::OPTION_KEY,
			array( 'sanitize_callback' => array( __CLASS__, 'sanitize' ) )
		);
	}

	public static function sanitize( $input ) {
		if ( ! is_array( $input ) ) {
			return self::defaults();
		}

		$bar    = isset( $input['announcement_bar'] ) ? (array) $input['announcement_bar'] : array();
		$slides = isset( $input['hero_slides'] )      ? (array) $input['hero_slides']      : array();
		$banner = isset( $input['gift_banner'] )      ? (array) $input['gift_banner']      : array();

		$clean_bar = array(
			'enabled' => ! empty( $bar['enabled'] ) ? 1 : 0,
			'text'    => sanitize_text_field( isset( $bar['text'] )  ? $bar['text']  : '' ),
			'link'    => esc_url_raw( isset( $bar['link'] )          ? $bar['link']  : '' ),
		);

		$clean_slides = array();
		for ( $i = 0; $i < self::SLIDE_COUNT; $i++ ) {
			$s              = isset( $slides[ $i ] ) ? (array) $slides[ $i ] : array();
			$clean_slides[] = array(
				'enabled'          => ! empty( $s['enabled'] ) ? 1 : 0,
				'heading'          => sanitize_text_field( isset( $s['heading'] )   ? $s['heading']   : '' ),
				'subtext'          => sanitize_textarea_field( isset( $s['subtext'] ) ? $s['subtext'] : '' ),
				'cta_label'        => sanitize_text_field( isset( $s['cta_label'] ) ? $s['cta_label'] : 'Shop Now' ),
				'cta_link'         => esc_url_raw( isset( $s['cta_link'] )          ? $s['cta_link']  : '/shop' ),
				'image_url'        => esc_url_raw( isset( $s['image_url'] )         ? $s['image_url'] : '' ),
				'mobile_image_url' => esc_url_raw( isset( $s['mobile_image_url'] )  ? $s['mobile_image_url'] : '' ),
			);
		}

		$clean_banner = array(
			'heading'   => sanitize_text_field( isset( $banner['heading'] )   ? $banner['heading']   : '' ),
			'subtext'   => sanitize_textarea_field( isset( $banner['subtext'] ) ? $banner['subtext'] : '' ),
			'cta_label' => sanitize_text_field( isset( $banner['cta_label'] ) ? $banner['cta_label'] : 'Start Building' ),
			'cta_link'  => esc_url_raw( isset( $banner['cta_link'] )          ? $banner['cta_link']  : '/gift-builder' ),
		);

		return array(
			'announcement_bar' => $clean_bar,
			'hero_slides'      => $clean_slides,
			'gift_banner'      => $clean_banner,
		);
	}

	// ── Revalidation ──────────────────────────────────────────────────────────

	public static function on_save() {
		MYGIFT_Revalidate_Webhook::fire_tags( array( 'home', 'global' ) );
	}

	// ── Scripts ───────────────────────────────────────────────────────────────

	public static function enqueue_scripts( $hook ) {
		if ( 'settings_page_mygift-home-content' !== $hook ) {
			return;
		}
		wp_enqueue_media();
		wp_enqueue_script( 'jquery' );
		// Media picker + live preview JS
		wp_add_inline_script(
			'jquery',
			"jQuery(function(\$){
				\$(document).on('click','.mg-pick-image',function(e){
					e.preventDefault();
					var \$btn=\$(this);
					var \$url=\$btn.closest('.mg-image-row').find('.mg-image-url');
					var \$prev=\$btn.closest('.mg-image-row').find('.mg-image-preview');
					var frame=wp.media({title:'Select Image',button:{text:'Use this image'},multiple:false});
					frame.on('select',function(){
						var att=frame.state().get('selection').first().toJSON();
						\$url.val(att.url).trigger('input');
						\$prev.attr('src',att.url).show();
					});
					frame.open();
				});
				\$(document).on('input','.mg-image-url',function(){
					var v=\$(this).val();
					\$(this).closest('.mg-image-row').find('.mg-image-preview')
						.attr('src',v).toggle(v!=='');
				});
				// Toggle slide fieldsets when enabled checkbox changes
				\$(document).on('change','.mg-slide-toggle',function(){
					\$(this).closest('.mg-slide-box').find('.mg-slide-fields')
						.toggle(\$(this).is(':checked'));
				});
			})"
		);
	}

	// ── Admin page renderer ───────────────────────────────────────────────────

	public static function render_page() {
		$data = self::get();
		$bar  = $data['announcement_bar'];
		$slides = $data['hero_slides'];
		$banner = $data['gift_banner'];

		$rest_url = esc_url( get_rest_url( null, 'mygift/v1/home-content' ) );
		?>
		<style>
		.mg-wrap { max-width: 900px; }
		.mg-section { background: #fff; border: 1px solid #c3c4c7; border-radius: 4px; padding: 20px 24px; margin-bottom: 20px; }
		.mg-section h2 { font-size: 15px; font-weight: 600; margin: 0 0 16px; padding-bottom: 10px; border-bottom: 1px solid #e0e0e0; color: #1d2327; }
		.mg-field { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 14px; }
		.mg-field label { flex: 0 0 180px; padding-top: 6px; font-size: 13px; color: #3c434a; font-weight: 500; }
		.mg-field .mg-input { flex: 1; }
		.mg-field input[type="text"],
		.mg-field input[type="url"],
		.mg-field textarea { width: 100%; font-size: 13px; }
		.mg-field textarea { height: 72px; resize: vertical; }
		.mg-slide-box { border: 1px solid #dde3e8; border-radius: 4px; margin-bottom: 14px; overflow: hidden; }
		.mg-slide-head { background: #f6f7f7; padding: 10px 16px; display: flex; align-items: center; gap: 10px; }
		.mg-slide-head strong { font-size: 13px; color: #1d2327; }
		.mg-slide-fields { padding: 16px; border-top: 1px solid #dde3e8; }
		.mg-image-row { display: flex; align-items: center; gap: 8px; flex: 1; }
		.mg-image-url { flex: 1; font-size: 13px; }
		.mg-pick-image { white-space: nowrap; }
		.mg-image-preview { max-width: 60px; max-height: 40px; border-radius: 3px; border: 1px solid #ddd; object-fit: cover; display: none; }
		.mg-rest-url { font-size: 12px; color: #646970; background: #f0f0f1; padding: 6px 10px; border-radius: 3px; margin-bottom: 16px; word-break: break-all; }
		.mg-rest-url strong { color: #3c434a; }
		</style>

		<div class="wrap mg-wrap">
			<h1><?php esc_html_e( 'MYGIFT Home Content', 'mygift-core' ); ?></h1>

			<p class="mg-rest-url">
				<strong>REST endpoint (Next.js reads from here):</strong>
				<code><?php echo $rest_url; ?></code>
			</p>

			<?php settings_errors( 'mygift_home_group' ); ?>

			<form method="post" action="options.php">
				<?php settings_fields( 'mygift_home_group' ); ?>

				<?php /* ── Announcement Bar ── */ ?>
				<div class="mg-section">
					<h2><?php esc_html_e( 'Announcement Bar', 'mygift-core' ); ?></h2>

					<div class="mg-field">
						<label><?php esc_html_e( 'Enable', 'mygift-core' ); ?></label>
						<div class="mg-input">
							<label>
								<input type="checkbox"
									name="<?php echo esc_attr( self::OPTION_KEY ); ?>[announcement_bar][enabled]"
									value="1"
									<?php checked( 1, $bar['enabled'] ); ?>
								/>
								<?php esc_html_e( 'Show announcement bar across the site', 'mygift-core' ); ?>
							</label>
						</div>
					</div>

					<div class="mg-field">
						<label for="mg_bar_text"><?php esc_html_e( 'Text', 'mygift-core' ); ?></label>
						<div class="mg-input">
							<input type="text"
								id="mg_bar_text"
								name="<?php echo esc_attr( self::OPTION_KEY ); ?>[announcement_bar][text]"
								value="<?php echo esc_attr( $bar['text'] ); ?>"
								placeholder="Free shipping on orders over Rs. 3,000"
							/>
						</div>
					</div>

					<div class="mg-field">
						<label for="mg_bar_link"><?php esc_html_e( 'Link (optional)', 'mygift-core' ); ?></label>
						<div class="mg-input">
							<input type="url"
								id="mg_bar_link"
								name="<?php echo esc_attr( self::OPTION_KEY ); ?>[announcement_bar][link]"
								value="<?php echo esc_attr( $bar['link'] ); ?>"
								placeholder="/shop"
							/>
						</div>
					</div>
				</div>

				<?php /* ── Hero Slides ── */ ?>
				<div class="mg-section">
					<h2><?php esc_html_e( 'Hero Slides (up to 3)', 'mygift-core' ); ?></h2>
					<p class="description" style="margin-bottom:16px;font-size:12px;">
						<?php esc_html_e( 'Upload images via Media Library, then paste the URL. Desktop recommended: 1920×800px. Mobile: 750×940px.', 'mygift-core' ); ?>
					</p>

					<?php foreach ( $slides as $idx => $slide ) :
						$n    = $idx + 1;
						$key  = self::OPTION_KEY . '[hero_slides][' . $idx . ']';
						$open = ! empty( $slide['enabled'] );
					?>
					<div class="mg-slide-box">
						<div class="mg-slide-head">
							<input type="checkbox"
								class="mg-slide-toggle"
								name="<?php echo esc_attr( $key ); ?>[enabled]"
								value="1"
								id="mg_slide_<?php echo $idx; ?>_enabled"
								<?php checked( $open ); ?>
							/>
							<strong>
								<label for="mg_slide_<?php echo $idx; ?>_enabled">
									<?php printf( esc_html__( 'Slide %d', 'mygift-core' ), $n ); ?>
									<?php if ( ! empty( $slide['heading'] ) ) echo ' — ' . esc_html( $slide['heading'] ); ?>
								</label>
							</strong>
						</div>

						<div class="mg-slide-fields" <?php echo $open ? '' : 'style="display:none"'; ?>>

							<div class="mg-field">
								<label><?php esc_html_e( 'Heading', 'mygift-core' ); ?></label>
								<div class="mg-input">
									<input type="text"
										name="<?php echo esc_attr( $key ); ?>[heading]"
										value="<?php echo esc_attr( $slide['heading'] ); ?>"
										placeholder="<?php esc_attr_e( 'Gifts That Feel Like Home', 'mygift-core' ); ?>"
									/>
								</div>
							</div>

							<div class="mg-field">
								<label><?php esc_html_e( 'Subtext', 'mygift-core' ); ?></label>
								<div class="mg-input">
									<textarea name="<?php echo esc_attr( $key ); ?>[subtext]"
										placeholder="<?php esc_attr_e( 'Curated clothing &amp; gift boxes for every occasion', 'mygift-core' ); ?>"
									><?php echo esc_textarea( $slide['subtext'] ); ?></textarea>
								</div>
							</div>

							<div class="mg-field">
								<label><?php esc_html_e( 'Button Text', 'mygift-core' ); ?></label>
								<div class="mg-input">
									<input type="text"
										name="<?php echo esc_attr( $key ); ?>[cta_label]"
										value="<?php echo esc_attr( $slide['cta_label'] ); ?>"
										placeholder="Shop Now"
									/>
								</div>
							</div>

							<div class="mg-field">
								<label><?php esc_html_e( 'Button Link', 'mygift-core' ); ?></label>
								<div class="mg-input">
									<input type="url"
										name="<?php echo esc_attr( $key ); ?>[cta_link]"
										value="<?php echo esc_attr( $slide['cta_link'] ); ?>"
										placeholder="/shop"
									/>
								</div>
							</div>

							<div class="mg-field">
								<label><?php esc_html_e( 'Desktop Image', 'mygift-core' ); ?></label>
								<div class="mg-input">
									<div class="mg-image-row">
										<input type="url"
											class="mg-image-url"
											name="<?php echo esc_attr( $key ); ?>[image_url]"
											value="<?php echo esc_attr( $slide['image_url'] ); ?>"
											placeholder="https://..."
										/>
										<button type="button" class="button mg-pick-image">
											<?php esc_html_e( 'Choose', 'mygift-core' ); ?>
										</button>
										<img class="mg-image-preview"
											src="<?php echo esc_attr( $slide['image_url'] ); ?>"
											alt=""
											<?php echo $slide['image_url'] ? '' : 'style="display:none"'; ?>
										/>
									</div>
								</div>
							</div>

							<div class="mg-field">
								<label>
									<?php esc_html_e( 'Mobile Image', 'mygift-core' ); ?>
									<br><span style="font-weight:400;font-size:11px;color:#8c8f94;"><?php esc_html_e( '(optional, uses desktop if empty)', 'mygift-core' ); ?></span>
								</label>
								<div class="mg-input">
									<div class="mg-image-row">
										<input type="url"
											class="mg-image-url"
											name="<?php echo esc_attr( $key ); ?>[mobile_image_url]"
											value="<?php echo esc_attr( $slide['mobile_image_url'] ); ?>"
											placeholder="https://..."
										/>
										<button type="button" class="button mg-pick-image">
											<?php esc_html_e( 'Choose', 'mygift-core' ); ?>
										</button>
										<img class="mg-image-preview"
											src="<?php echo esc_attr( $slide['mobile_image_url'] ); ?>"
											alt=""
											<?php echo $slide['mobile_image_url'] ? '' : 'style="display:none"'; ?>
										/>
									</div>
								</div>
							</div>

						</div><!-- /.mg-slide-fields -->
					</div><!-- /.mg-slide-box -->
					<?php endforeach; ?>
				</div>

				<?php /* ── Gift Banner ── */ ?>
				<div class="mg-section">
					<h2><?php esc_html_e( 'Gift Builder Banner', 'mygift-core' ); ?></h2>

					<div class="mg-field">
						<label for="mg_banner_heading"><?php esc_html_e( 'Heading', 'mygift-core' ); ?></label>
						<div class="mg-input">
							<input type="text"
								id="mg_banner_heading"
								name="<?php echo esc_attr( self::OPTION_KEY ); ?>[gift_banner][heading]"
								value="<?php echo esc_attr( $banner['heading'] ); ?>"
							/>
						</div>
					</div>

					<div class="mg-field">
						<label for="mg_banner_subtext"><?php esc_html_e( 'Subtext', 'mygift-core' ); ?></label>
						<div class="mg-input">
							<textarea id="mg_banner_subtext"
								name="<?php echo esc_attr( self::OPTION_KEY ); ?>[gift_banner][subtext]"
							><?php echo esc_textarea( $banner['subtext'] ); ?></textarea>
						</div>
					</div>

					<div class="mg-field">
						<label for="mg_banner_cta_label"><?php esc_html_e( 'Button Text', 'mygift-core' ); ?></label>
						<div class="mg-input">
							<input type="text"
								id="mg_banner_cta_label"
								name="<?php echo esc_attr( self::OPTION_KEY ); ?>[gift_banner][cta_label]"
								value="<?php echo esc_attr( $banner['cta_label'] ); ?>"
							/>
						</div>
					</div>

					<div class="mg-field">
						<label for="mg_banner_cta_link"><?php esc_html_e( 'Button Link', 'mygift-core' ); ?></label>
						<div class="mg-input">
							<input type="url"
								id="mg_banner_cta_link"
								name="<?php echo esc_attr( self::OPTION_KEY ); ?>[gift_banner][cta_link]"
								value="<?php echo esc_attr( $banner['cta_link'] ); ?>"
							/>
						</div>
					</div>
				</div>

				<?php submit_button( __( 'Save Changes', 'mygift-core' ) ); ?>
			</form>
		</div>
		<?php
	}
}
