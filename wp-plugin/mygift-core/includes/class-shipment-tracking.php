<?php
/**
 * Admin meta box: "Shipment Tracking" on the WooCommerce order edit screen.
 *
 * Saves three order meta keys:
 *   _courier         — courier slug (tcs | leopards | postex | mp | trax | other)
 *   _tracking_number — tracking number string
 *   _tracking_url    — final tracking URL (auto-built from courier prefix, or manual override)
 *
 * "Mark as Shipped" button saves tracking data + moves order to wc-shipped in one click.
 * Compatible with both traditional WP post-based orders and WooCommerce HPOS (WC 7.1+).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MYGIFT_Shipment_Tracking {

	/**
	 * Courier slug => [ display label, tracking URL prefix ]
	 *
	 * @var array<string, array{0: string, 1: string}>
	 */
	private static $couriers = array(
		'tcs'      => array( 'TCS Express',        'https://www.tcsexpress.com/track/'          ),
		'leopards' => array( 'Leopards Courier',    'https://www.leopardscourier.com/track/'     ),
		'postex'   => array( 'PostEx',              'https://postex.pk/track-order/'             ),
		'mp'       => array( 'M&P Courier',         'https://mp.pk/tracking?cn='                 ),
		'trax'     => array( 'Trax (TCS Logistic)', 'https://traxlogistic.com/tracking/'         ),
		'other'    => array( 'Other',               ''                                           ),
	);

	public static function init() {
		add_action( 'add_meta_boxes',                          array( __CLASS__, 'add_meta_box'      )        );
		add_action( 'woocommerce_process_shop_order_meta',     array( __CLASS__, 'save'              ), 10, 2 );
		add_action( 'admin_enqueue_scripts',                   array( __CLASS__, 'enqueue_scripts'   )        );
	}

	// ── Meta box registration ─────────────────────────────────────────────────

	public static function add_meta_box() {
		$screens = array( 'shop_order' );

		if ( function_exists( 'wc_get_page_screen_id' ) ) {
			$hpos_screen = wc_get_page_screen_id( 'shop-order' );
			if ( $hpos_screen && 'shop_order' !== $hpos_screen ) {
				$screens[] = $hpos_screen;
			}
		}

		foreach ( $screens as $screen ) {
			add_meta_box(
				'mygift_shipment_tracking',
				__( 'Shipment Tracking', 'mygift-core' ),
				array( __CLASS__, 'render' ),
				$screen,
				'side',
				'default'
			);
		}
	}

	// ── Scripts / inline JS ───────────────────────────────────────────────────

	public static function enqueue_scripts( $hook ) {
		$is_order_screen = in_array( $hook, array( 'post.php', 'post-new.php' ), true )
			&& isset( $GLOBALS['post']->post_type )
			&& 'shop_order' === $GLOBALS['post']->post_type;

		// HPOS screen detection
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$is_order_screen = $is_order_screen || ( isset( $_GET['page'], $_GET['id'] ) && 'wc-orders' === $_GET['page'] );

		if ( ! $is_order_screen ) {
			return;
		}

		// Build courier prefix map for JS.
		// array_map with regular function (not arrow) for PHP 7.4 compatibility.
		$prefixes = array_map(
			function ( $c ) {
				return $c[1];
			},
			self::$couriers
		);
		?>
		<script id="mygift-tracking-js">
		(function () {
			var couriers = <?php echo wp_json_encode( $prefixes ); ?>;

			function buildUrl( courier, number ) {
				var prefix = couriers[ courier ] || '';
				return ( prefix && number ) ? prefix + encodeURIComponent( number.trim() ) : '';
			}

			document.addEventListener( 'DOMContentLoaded', function () {
				var courierEl  = document.getElementById( 'mygift_courier' );
				var numberEl   = document.getElementById( 'mygift_tracking_number' );
				var urlEl      = document.getElementById( 'mygift_tracking_url' );
				var overrideEl = document.getElementById( 'mygift_url_override' );
				var markBtn    = document.getElementById( 'mygift_mark_shipped_btn' );

				if ( ! courierEl || ! numberEl || ! urlEl ) return;

				function maybeAutoFill() {
					if ( overrideEl && overrideEl.checked ) return;
					var auto = buildUrl( courierEl.value, numberEl.value );
					if ( auto ) urlEl.value = auto;
				}

				courierEl.addEventListener( 'change', maybeAutoFill );
				numberEl.addEventListener( 'input',   maybeAutoFill );

				if ( overrideEl ) {
					overrideEl.addEventListener( 'change', function () {
						urlEl.readOnly = ! this.checked;
						if ( ! this.checked ) maybeAutoFill();
					} );
					urlEl.readOnly = ! overrideEl.checked;
				}

				if ( markBtn ) {
					markBtn.addEventListener( 'click', function ( e ) {
						e.preventDefault();
						var flag = document.getElementById( 'mygift_mark_shipped_flag' );
						if ( flag ) flag.value = '1';
						var form = document.getElementById( 'post' )
							|| document.querySelector( 'form.woocommerce-order-form' );
						if ( form ) form.submit();
					} );
				}
			} );
		}());
		</script>
		<?php
	}

	// ── Meta box renderer ─────────────────────────────────────────────────────

	/**
	 * @param WP_Post|WC_Order $post_or_order
	 */
	public static function render( $post_or_order ) {
		if ( $post_or_order instanceof WC_Order ) {
			$order_id = $post_or_order->get_id();
		} elseif ( isset( $post_or_order->ID ) ) {
			$order_id = (int) $post_or_order->ID;
		} else {
			return;
		}

		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}

		$courier         = $order->get_meta( '_courier',         true ) ?: 'tcs';
		$tracking_number = $order->get_meta( '_tracking_number', true );
		$tracking_url    = $order->get_meta( '_tracking_url',    true );

		$auto_url      = ( $tracking_number && isset( self::$couriers[ $courier ] ) )
			? self::$couriers[ $courier ][1] . rawurlencode( $tracking_number )
			: '';
		$is_overridden = ( $tracking_url && $auto_url && $tracking_url !== $auto_url );

		wp_nonce_field( 'mygift_tracking_save', 'mygift_tracking_nonce' );
		?>
		<style>
		#mygift_shipment_tracking .mygift-field       { margin-bottom: 10px; }
		#mygift_shipment_tracking label               { display:block; font-weight:600; margin-bottom:4px; font-size:12px; }
		#mygift_shipment_tracking input[type="text"],
		#mygift_shipment_tracking select              { width:100%; }
		#mygift_shipment_tracking .mygift-override    { font-size:11px; font-weight:normal; color:#646970; margin-top:6px; }
		#mygift_mark_shipped_btn                      {
			margin-top:10px; width:100%; background:#7E2B36; color:#fff;
			border:none; padding:8px 12px; border-radius:4px; cursor:pointer; font-size:13px;
		}
		#mygift_mark_shipped_btn:hover { background:#5C1F28; }
		</style>

		<div class="mygift-field">
			<label for="mygift_courier"><?php esc_html_e( 'Courier', 'mygift-core' ); ?></label>
			<select id="mygift_courier" name="mygift_courier">
				<?php foreach ( self::$couriers as $slug => $info ) : ?>
					<option value="<?php echo esc_attr( $slug ); ?>" <?php selected( $courier, $slug ); ?>>
						<?php echo esc_html( $info[0] ); ?>
					</option>
				<?php endforeach; ?>
			</select>
		</div>

		<div class="mygift-field">
			<label for="mygift_tracking_number"><?php esc_html_e( 'Tracking Number', 'mygift-core' ); ?></label>
			<input type="text"
				id="mygift_tracking_number"
				name="mygift_tracking_number"
				value="<?php echo esc_attr( $tracking_number ); ?>"
				placeholder="e.g. TCS1234567890"
			/>
		</div>

		<div class="mygift-field">
			<label for="mygift_tracking_url"><?php esc_html_e( 'Tracking URL', 'mygift-core' ); ?></label>
			<input type="text"
				id="mygift_tracking_url"
				name="mygift_tracking_url"
				value="<?php echo esc_attr( $tracking_url ?: $auto_url ); ?>"
				<?php echo $is_overridden ? '' : 'readonly'; ?>
				placeholder="Auto-built from courier + number"
			/>
			<label class="mygift-override">
				<input type="checkbox"
					id="mygift_url_override"
					name="mygift_url_override"
					value="1"
					<?php checked( $is_overridden ); ?>
				/>
				<?php esc_html_e( 'Override URL manually', 'mygift-core' ); ?>
			</label>
		</div>

		<input type="hidden" id="mygift_mark_shipped_flag" name="mygift_mark_shipped" value="0" />

		<?php
		$status = $order->get_status();
		$can_ship = $tracking_number
			&& ! in_array( $status, array( 'shipped', 'completed', 'cancelled', 'refunded' ), true );
		if ( $can_ship ) :
		?>
		<button type="button" id="mygift_mark_shipped_btn">
			<?php esc_html_e( 'Mark as Shipped', 'mygift-core' ); ?>
		</button>
		<?php endif; ?>
		<?php
	}

	// ── Save handler ──────────────────────────────────────────────────────────

	/**
	 * Save shipment tracking meta when order is saved.
	 *
	 * @param int          $order_id
	 * @param WP_Post|null $post
	 */
	public static function save( $order_id, $post = null ) {
		if ( ! isset( $_POST['mygift_tracking_nonce'] )
			|| ! wp_verify_nonce(
				sanitize_text_field( wp_unslash( $_POST['mygift_tracking_nonce'] ) ),
				'mygift_tracking_save'
			)
		) {
			return;
		}

		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}

		// phpcs:disable WordPress.Security.NonceVerification.Missing -- nonce verified above
		$courier         = sanitize_text_field( wp_unslash( isset( $_POST['mygift_courier'] )         ? $_POST['mygift_courier']         : '' ) );
		$tracking_number = sanitize_text_field( wp_unslash( isset( $_POST['mygift_tracking_number'] ) ? $_POST['mygift_tracking_number'] : '' ) );
		$tracking_url    = esc_url_raw( wp_unslash( isset( $_POST['mygift_tracking_url'] )   ? $_POST['mygift_tracking_url']   : '' ) );
		$mark_shipped    = ( '1' === ( isset( $_POST['mygift_mark_shipped'] ) ? $_POST['mygift_mark_shipped'] : '0' ) );
		// phpcs:enable

		if ( $courier ) {
			$order->update_meta_data( '_courier', $courier );
		}
		if ( $tracking_number ) {
			$order->update_meta_data( '_tracking_number', $tracking_number );
		}
		if ( $tracking_url ) {
			$order->update_meta_data( '_tracking_url', $tracking_url );
		}

		$order->save_meta_data();

		if ( $mark_shipped && $tracking_number ) {
			$current = $order->get_status();
			if ( ! in_array( $current, array( 'shipped', 'completed', 'cancelled', 'refunded' ), true ) ) {
				$order->update_status( 'wc-shipped', __( 'Marked as shipped via tracking meta box.', 'mygift-core' ) );
			}
		}
	}
}
