<?php
/**
 * MYGIFT Control Center — one branded top-level admin menu that gathers all of
 * the native content managers in a single, on-brand place for the marketing
 * team. This is an organising wrapper, not a CRUD engine: it links to the
 * native content manager screens and shows an at-a-glance dashboard.
 *
 * @package MYGIFT_Core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MYGIFT_Control_Center {

	const SLUG = 'mygift';

	/** Manager classes surfaced as submenus, in display order. */
	private static function managers(): array {
		return array(
			'MYGIFT_Home_Content',
			'MYGIFT_Global_Settings',
			'MYGIFT_Gift_Builder_Settings',
			'MYGIFT_Faqs',
			'MYGIFT_Careers',
		);
	}

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register_menu' ), 9 );
	}

	/* ── Menu ──────────────────────────────────────────────────────────── */

	public static function register_menu() {
		add_menu_page(
			__( 'MYGIFT Control Center', 'mygift-core' ),
			__( 'MYGIFT', 'mygift-core' ),
			'manage_options',
			self::SLUG,
			array( __CLASS__, 'render_dashboard' ),
			self::icon(),
			58.5
		);

		// Rename the auto-created first item to "Dashboard".
		add_submenu_page(
			self::SLUG,
			__( 'Dashboard', 'mygift-core' ),
			__( 'Dashboard', 'mygift-core' ),
			'manage_options',
			self::SLUG,
			array( __CLASS__, 'render_dashboard' )
		);

		foreach ( self::managers() as $class ) {
			if ( ! class_exists( $class ) ) {
				continue;
			}
			add_submenu_page(
				self::SLUG,
				$class::page_title(),
				$class::menu_label(),
				'manage_options',
				$class::menu_slug(),
				array( $class, 'render_page' )
			);
		}

		// Connection & email settings (revalidation secret, packed email).
		if ( class_exists( 'MYGIFT_Settings' ) ) {
			add_submenu_page(
				self::SLUG,
				__( 'Connection & Emails', 'mygift-core' ),
				__( 'Connection & Emails', 'mygift-core' ),
				'manage_options',
				'mygift-core',
				array( 'MYGIFT_Settings', 'render_page' )
			);
		}
	}

	/** Wine gift-box SVG as a base64 menu icon (keeps its colour, not recoloured). */
	private static function icon(): string {
		$svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">'
			. '<path fill="#7E2B36" d="M17 6h-2.18A3 3 0 0 0 10 2.2 3 3 0 0 0 5.18 6H3a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zM12 5a1 1 0 1 1 1 1h-1zM7 5a1 1 0 0 1 2 0v1H8a1 1 0 0 1-1-1zm2 12H5v-6h4zm0-8H4V8h5zm6 8h-4v-6h4zm1-8h-5V8h5z"/>'
			. '</svg>';
		return 'data:image/svg+xml;base64,' . base64_encode( $svg );
	}

	/* ── Dashboard ─────────────────────────────────────────────────────── */

	public static function render_dashboard() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$products = self::product_count();
		$counts   = self::order_counts();
		?>
		<div class="wrap mg-wrap">
			<h1>
				<?php esc_html_e( 'MYGIFT Control Center', 'mygift-core' ); ?>
				<span class="mg-badge">Dashboard</span>
			</h1>
			<p class="description" style="margin-bottom:18px;">
				<?php esc_html_e( 'Everything the storefront shows is editable here — no code, no developer. Changes go live within ~60 seconds.', 'mygift-core' ); ?>
			</p>

			<div class="mg-dash-grid">
				<div class="mg-stat"><div class="mg-stat-num"><?php echo esc_html( $products ); ?></div><div class="mg-stat-label"><?php esc_html_e( 'Published products', 'mygift-core' ); ?></div></div>
				<div class="mg-stat"><div class="mg-stat-num"><?php echo esc_html( $counts['processing'] ); ?></div><div class="mg-stat-label"><?php esc_html_e( 'Orders processing', 'mygift-core' ); ?></div></div>
				<div class="mg-stat"><div class="mg-stat-num"><?php echo esc_html( $counts['packed'] ); ?></div><div class="mg-stat-label"><?php esc_html_e( 'Packed', 'mygift-core' ); ?></div></div>
				<div class="mg-stat"><div class="mg-stat-num"><?php echo esc_html( $counts['shipped'] ); ?></div><div class="mg-stat-label"><?php esc_html_e( 'Shipped', 'mygift-core' ); ?></div></div>
				<div class="mg-stat"><div class="mg-stat-num"><?php echo esc_html( $counts['completed'] ); ?></div><div class="mg-stat-label"><?php esc_html_e( 'Completed', 'mygift-core' ); ?></div></div>
			</div>

			<h2 style="font-size:15px;"><?php esc_html_e( 'Common edits', 'mygift-core' ); ?></h2>
			<div class="mg-links-grid" style="margin-bottom:24px;">
				<?php
				self::link_card( 'mygift-home-content', __( 'Homepage Builder', 'mygift-core' ), __( 'Hero, banners, sections, order', 'mygift-core' ) );
				self::link_card( 'mygift-gift-builder', __( 'Gift Builder', 'mygift-core' ), __( 'Boxes, add-ons, options', 'mygift-core' ) );
				self::link_card( 'mygift-global', __( 'Global Settings', 'mygift-core' ), __( 'Shipping, footer, socials', 'mygift-core' ) );
				self::link_card( 'mygift-faqs', __( 'FAQs', 'mygift-core' ), __( 'Add / edit questions', 'mygift-core' ) );
				self::raw_link_card( admin_url( 'post-new.php?post_type=product' ), __( 'Add a Product', 'mygift-core' ), __( 'New clothing or gift item', 'mygift-core' ) );
				self::raw_link_card( admin_url( 'edit.php?post_type=product' ), __( 'All Products', 'mygift-core' ), __( 'Manage catalogue & stock', 'mygift-core' ) );
				?>
			</div>

			<div class="mg-help">
				<h3><?php esc_html_e( 'How to edit the homepage', 'mygift-core' ); ?></h3>
				<ol>
					<li><?php esc_html_e( 'Open MYGIFT → Homepage Builder.', 'mygift-core' ); ?></li>
					<li><?php esc_html_e( 'Edit a section (e.g. the Hero Slider): change the heading, subtext, button and images.', 'mygift-core' ); ?></li>
					<li><?php esc_html_e( 'Use each section\'s "Show on homepage" toggle to hide it, and the "Order" number to reorder sections (1 = top).', 'mygift-core' ); ?></li>
					<li><?php esc_html_e( 'Click Save Changes. The storefront updates within ~60 seconds.', 'mygift-core' ); ?></li>
				</ol>
			</div>
		</div>
		<?php
	}

	private static function link_card( string $page, string $title, string $sub ) {
		self::raw_link_card( admin_url( 'admin.php?page=' . $page ), $title, $sub );
	}

	private static function raw_link_card( string $url, string $title, string $sub ) {
		printf(
			'<a class="mg-link-card" href="%s"><strong>%s</strong><span>%s</span></a>',
			esc_url( $url ),
			esc_html( $title ),
			esc_html( $sub )
		);
	}

	/**
	 * Live count of published products. Queries WooCommerce directly rather than
	 * wp_count_posts() (whose `count-posts-product` object-cache entry can be
	 * stale on hosts with aggressive caching, showing 0 when products exist).
	 *
	 * @return int
	 */
	private static function product_count(): int {
		if ( function_exists( 'wc_get_products' ) ) {
			$res = wc_get_products(
				array(
					'status'   => 'publish',
					'limit'    => 1,
					'paginate' => true,
					'return'   => 'ids',
				)
			);
			if ( is_object( $res ) && isset( $res->total ) ) {
				return (int) $res->total;
			}
		}
		// Fallback: direct query (also bypasses the count-posts cache).
		$q = new WP_Query(
			array(
				'post_type'      => 'product',
				'post_status'    => 'publish',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'no_found_rows'  => false,
			)
		);
		return (int) $q->found_posts;
	}

	/**
	 * HPOS-aware order counts for the statuses we care about.
	 *
	 * @return array<string,int>
	 */
	private static function order_counts(): array {
		$keys = array( 'processing', 'packed', 'shipped', 'completed' );
		$out  = array_fill_keys( $keys, 0 );

		if ( function_exists( 'wc_orders_count' ) ) {
			foreach ( $keys as $k ) {
				$out[ $k ] = (int) wc_orders_count( $k );
			}
		}
		return $out;
	}
}
