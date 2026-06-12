<?php
/**
 * Custom WooCommerce transactional emails for MYGIFT order pipeline.
 *   WC_Email_MYGIFT_Order_Shipped  — triggered on wc-shipped status
 *   WC_Email_MYGIFT_Order_Packed   — triggered on wc-packed status (optional, settings toggle)
 *
 * Branding: wine (#7E2B36) header, cream (#FAF8F5) page background, white card,
 * bold tracking CTA button. Gift orders echo the gift message.
 * Loaded inside mygift_core_init() AFTER WooCommerce is initialised so WC_Email is available.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
class MYGIFT_Order_Emails {

    public static function init() {
        add_filter( 'woocommerce_email_classes', [ __CLASS__, 'register_emails' ] );
    }

    public static function register_emails( array $emails ): array {
        $emails['MYGIFT_Email_Order_Shipped'] = new MYGIFT_Email_Order_Shipped();

        $opts = MYGIFT_Settings::get();
        if ( ! empty( $opts['packed_email_enabled'] ) ) {
            $emails['MYGIFT_Email_Order_Packed'] = new MYGIFT_Email_Order_Packed();
        }

        return $emails;
    }
}

/* ─────────────────────────────────────────────────────────────────────────
   Shipped email
───────────────────────────────────────────────────────────────────────── */

class MYGIFT_Email_Order_Shipped extends WC_Email {

    public function __construct() {
        $this->id             = 'mygift_order_shipped';
        $this->title          = __( 'Order Shipped (MYGIFT)', 'mygift-core' );
        $this->description    = __( 'Sent when an order moves to Shipped status.', 'mygift-core' );
        $this->template_html  = ''; // we use get_content_html() directly
        $this->template_plain = '';
        $this->customer_email = true;
        $this->heading        = __( 'Your order has shipped!', 'mygift-core' );
        $this->subject        = __( '[{site_title}] Your order #{order_number} is on its way', 'mygift-core' );

        // Trigger: fires when order status changes to 'shipped' (WC strips 'wc-' prefix)
        add_action( 'woocommerce_order_status_shipped_notification', [ $this, 'trigger' ], 10, 2 );

        parent::__construct();
    }

    public function trigger( int $order_id, $order = null ) {
        $this->setup_locale();

        $this->object = $order instanceof WC_Order ? $order : wc_get_order( $order_id );
        if ( ! $this->object ) return;

        $this->recipient = $this->object->get_billing_email();
        $this->placeholders['{order_date}']   = wc_format_datetime( $this->object->get_date_created() );
        $this->placeholders['{order_number}'] = $this->object->get_order_number();

        if ( $this->is_enabled() && $this->get_recipient() ) {
            $this->send(
                $this->get_recipient(),
                $this->get_subject(),
                $this->get_content(),
                $this->get_headers(),
                $this->get_attachments()
            );
        }

        $this->restore_locale();
    }

    public function get_content_html(): string {
        return self::render_shipped_html( $this->object );
    }

    public function get_content_plain(): string {
        $order = $this->object;
        $name  = $order->get_billing_first_name();
        $num   = $order->get_order_number();
        $track = $order->get_meta( '_tracking_number', true );
        $url   = $order->get_meta( '_tracking_url', true );
        $courier = self::courier_label( $order->get_meta( '_courier', true ) );

        $text  = sprintf( "Hi %s,\n\nYour MYGIFT order #%s has been shipped!\n\n", $name, $num );
        if ( $courier ) $text .= "Courier: {$courier}\n";
        if ( $track )   $text .= "Tracking number: {$track}\n";
        if ( $url )     $text .= "Track here: {$url}\n";
        $text .= "\nYou can also track anytime at: " . home_url( '/track-order' ) . "\n";
        $text .= "\nThank you for shopping with MYGIFT.\n";
        return $text;
    }

    /** Static so the Packed email can reuse the helpers without duplication. */
    public static function render_shipped_html( WC_Order $order ): string {
        $name    = esc_html( $order->get_billing_first_name() );
        $num     = esc_html( $order->get_order_number() );
        $track   = esc_html( $order->get_meta( '_tracking_number', true ) );
        $url     = esc_url(  $order->get_meta( '_tracking_url',    true ) );
        $courier = esc_html( self::courier_label( $order->get_meta( '_courier', true ) ) );

        $is_gift     = $order->get_meta( '_is_gift',     true ) === '1';
        $gift_msg    = esc_html( $order->get_meta( '_gift_message', true ) );
        $recipient   = esc_html( $order->get_meta( '_gift_recipient_name', true ) );
        $hide_prices = $order->get_meta( '_hide_prices',  true ) === '1';

        $track_url  = home_url( '/track-order' );
        $site_name  = esc_html( get_bloginfo( 'name' ) );
        $logo_url   = esc_url( home_url( '/' ) );

        $items_html = '';
        foreach ( $order->get_items() as $item ) {
            $line  = esc_html( $item->get_name() );
            $qty   = (int) $item->get_quantity();
            $total = $hide_prices ? '' : wc_price( $item->get_total() );
            $items_html .= '<tr><td style="padding:6px 12px;font-size:14px;color:#1F1A17;">'
                . $line . ( $qty > 1 ? " &times;{$qty}" : '' ) . '</td>'
                . '<td style="padding:6px 12px;font-size:14px;color:#8A8178;text-align:right;">'
                . $total . '</td></tr>';
        }

        ob_start();
        ?>
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your order has shipped</title></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAF8F5;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:#7E2B36;padding:24px 32px;border-radius:8px 8px 0 0;" align="center">
          <a href="<?php echo $logo_url; ?>" style="text-decoration:none;">
            <span style="font-family:Georgia,serif;font-size:28px;font-weight:bold;color:#FAF8F5;letter-spacing:0.08em;text-transform:uppercase;"><?php echo $site_name; ?></span>
          </a>
          <!-- Ribbon accent -->
          <div style="margin-top:8px;">
            <table cellpadding="0" cellspacing="0" border="0" align="center"><tr>
              <td style="width:80px;height:2px;background:#FAF8F5;opacity:0.4;"></td>
              <td style="width:8px;height:8px;background:#FAF8F5;transform:rotate(45deg);opacity:0.6;"></td>
              <td style="width:80px;height:2px;background:#FAF8F5;opacity:0.4;"></td>
            </tr></table>
          </div>
        </td>
      </tr>

      <!-- Body card -->
      <tr>
        <td style="background:#FFFFFF;padding:32px;border-radius:0 0 8px 8px;">

          <p style="font-size:22px;font-weight:bold;color:#1F1A17;margin:0 0 8px;">Your order is on its way!</p>
          <p style="font-size:15px;color:#8A8178;margin:0 0 24px;">Hi <?php echo $name; ?>, order #<?php echo $num; ?> has been dispatched.</p>

          <?php if ( $track ) : ?>
          <!-- Tracking card -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:#FAF8F5;border:1px solid #E8E2DA;border-radius:8px;margin-bottom:24px;">
            <tr>
              <td style="padding:16px 20px;">
                <?php if ( $courier ) : ?>
                <p style="margin:0 0 6px;font-size:13px;color:#8A8178;"><strong style="color:#1F1A17;">Courier:</strong> <?php echo $courier; ?></p>
                <?php endif; ?>
                <p style="margin:0;font-size:13px;color:#8A8178;"><strong style="color:#1F1A17;">Tracking #:</strong> <?php echo $track; ?></p>
              </td>
            </tr>
          </table>

          <?php if ( $url ) : ?>
          <!-- CTA button -->
          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
            <tr>
              <td style="background:#7E2B36;border-radius:6px;">
                <a href="<?php echo $url; ?>"
                  style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">
                  Track My Package &rarr;
                </a>
              </td>
            </tr>
          </table>
          <?php endif; ?>
          <?php endif; ?>

          <!-- Items table -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="border:1px solid #E8E2DA;border-radius:8px;margin-bottom:24px;border-collapse:separate;border-spacing:0;">
            <tr style="background:#F6ECEE;">
              <th style="padding:8px 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:#7E2B36;text-align:left;border-radius:8px 0 0 0;">Item</th>
              <th style="padding:8px 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:#7E2B36;text-align:right;border-radius:0 8px 0 0;">
                <?php echo $hide_prices ? '' : 'Total'; ?>
              </th>
            </tr>
            <?php echo $items_html; ?>
          </table>

          <?php if ( $is_gift && $gift_msg ) : ?>
          <!-- Gift message echo -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:#FFF8F0;border:1px solid #E8D5A0;border-radius:8px;margin-bottom:24px;">
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:#C9A24B;font-weight:bold;">
                  Gift Message<?php echo $recipient ? ' for ' . $recipient : ''; ?>
                </p>
                <p style="margin:0;font-size:14px;color:#1F1A17;font-style:italic;">&ldquo;<?php echo $gift_msg; ?>&rdquo;</p>
              </td>
            </tr>
          </table>
          <?php endif; ?>

          <!-- Track order link -->
          <p style="font-size:14px;color:#8A8178;margin:0;">
            You can also track your order anytime at
            <a href="<?php echo esc_url( $track_url ); ?>" style="color:#7E2B36;"><?php echo $track_url; ?></a>.
          </p>

        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:20px 32px 0;text-align:center;">
          <p style="font-size:12px;color:#8A8178;margin:0;">
            &copy; <?php echo gmdate('Y'); ?> <?php echo $site_name; ?>. All rights reserved.<br>
            Questions? <a href="mailto:hello@mygift.pk" style="color:#7E2B36;">hello@mygift.pk</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>
        <?php
        return trim( ob_get_clean() );
    }

    protected static function courier_label( string $slug ): string {
        $map = [
            'tcs'      => 'TCS Express',
            'leopards' => 'Leopards Courier',
            'postex'   => 'PostEx',
            'mp'       => 'M&P Courier',
            'trax'     => 'Trax (TCS Logistic)',
            'other'    => 'Other',
        ];
        return $map[ $slug ] ?? $slug;
    }
}

/* ─────────────────────────────────────────────────────────────────────────
   Packed email (optional — enabled via settings toggle)
───────────────────────────────────────────────────────────────────────── */

class MYGIFT_Email_Order_Packed extends WC_Email {

    public function __construct() {
        $this->id             = 'mygift_order_packed';
        $this->title          = __( 'Order Packed (MYGIFT)', 'mygift-core' );
        $this->description    = __( 'Sent when an order moves to Packed status (optional).', 'mygift-core' );
        $this->template_html  = '';
        $this->template_plain = '';
        $this->customer_email = true;
        $this->heading        = __( 'Your order is being prepared!', 'mygift-core' );
        $this->subject        = __( '[{site_title}] Order #{order_number} is packed and almost on its way', 'mygift-core' );

        add_action( 'woocommerce_order_status_packed_notification', [ $this, 'trigger' ], 10, 2 );

        parent::__construct();
    }

    public function trigger( int $order_id, $order = null ) {
        $this->setup_locale();

        $this->object = $order instanceof WC_Order ? $order : wc_get_order( $order_id );
        if ( ! $this->object ) return;

        $this->recipient = $this->object->get_billing_email();
        $this->placeholders['{order_date}']   = wc_format_datetime( $this->object->get_date_created() );
        $this->placeholders['{order_number}'] = $this->object->get_order_number();

        if ( $this->is_enabled() && $this->get_recipient() ) {
            $this->send(
                $this->get_recipient(),
                $this->get_subject(),
                $this->get_content(),
                $this->get_headers(),
                $this->get_attachments()
            );
        }

        $this->restore_locale();
    }

    public function get_content_html(): string {
        $order = $this->object;
        $name  = esc_html( $order->get_billing_first_name() );
        $num   = esc_html( $order->get_order_number() );
        $site  = esc_html( get_bloginfo( 'name' ) );
        $logo  = esc_url( home_url( '/' ) );

        ob_start();
        ?>
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Your order is packed</title></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAF8F5;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
      <tr>
        <td style="background:#7E2B36;padding:24px 32px;border-radius:8px 8px 0 0;" align="center">
          <a href="<?php echo $logo; ?>" style="text-decoration:none;">
            <span style="font-size:26px;font-weight:bold;color:#FAF8F5;letter-spacing:0.08em;text-transform:uppercase;"><?php echo $site; ?></span>
          </a>
        </td>
      </tr>
      <tr>
        <td style="background:#FFFFFF;padding:32px;border-radius:0 0 8px 8px;">
          <p style="font-size:22px;font-weight:bold;color:#1F1A17;margin:0 0 8px;">Your order is packed!</p>
          <p style="font-size:15px;color:#8A8178;margin:0 0 20px;">
            Hi <?php echo $name; ?>, order #<?php echo $num; ?> is sealed and ready to go.
          </p>
          <p style="font-size:15px;color:#1F1A17;margin:0 0 20px;padding:12px 16px;background:#FAF8F5;border-left:3px solid #7E2B36;border-radius:0 6px 6px 0;">
            Your package will be with a courier soon — you&rsquo;ll receive another email with the tracking number once it ships.
          </p>
          <p style="font-size:14px;color:#8A8178;margin:0;">
            Track your order anytime at
            <a href="<?php echo esc_url( home_url( '/track-order' ) ); ?>" style="color:#7E2B36;"><?php echo esc_url( home_url( '/track-order' ) ); ?></a>.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px 0;text-align:center;">
          <p style="font-size:12px;color:#8A8178;margin:0;">
            &copy; <?php echo gmdate('Y'); ?> <?php echo $site; ?>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>
        <?php
        return trim( ob_get_clean() );
    }

    public function get_content_plain(): string {
        $order = $this->object;
        return sprintf(
            "Hi %s,\n\nYour MYGIFT order #%s is packed and will be dispatched shortly.\n\nTrack at: %s\n",
            $order->get_billing_first_name(),
            $order->get_order_number(),
            home_url( '/track-order' )
        );
    }
}
