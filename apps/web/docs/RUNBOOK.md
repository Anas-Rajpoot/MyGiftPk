# RUNBOOK — MYGIFT Marketing Team

This guide covers the most common content management tasks.
Backend: **admin.mygift.pk** → WordPress Admin  
Frontend: **mygift.pk** (auto-updates within ~1 min of saving in WP)

---

## 1. Edit the Hero Banner

The hero cycles up to 3 slides. Each slide has a desktop image, mobile image, heading, subtext, and CTA button.

1. Log in to **admin.mygift.pk/wp-admin**
2. In the left menu, click **MYGIFT → Homepage Builder**
3. Open the **Hero Slider** section
4. Tick **Slide 1/2/3 enabled** to show a slide, then edit its heading, subtext, button text/link and images (use **Choose** to pick from the Media Library)
5. Click **Save Changes**
6. The site updates within ~60 seconds via the webhook

**Tips:**
- Desktop image: 1920×800 px recommended (JPEG/WebP)
- Mobile image: 750×940 px recommended (4:5 ratio)
- Heading uses Bebas Neue display font automatically
- Untick a slide's "enabled" box to hide it
- Use each section's **Show on homepage** toggle and **Order** number to hide/reorder whole sections

---

## 2. Add a New Product

1. Go to **Products → Add New**
2. Fill in:
   - **Product Name** — e.g. "Summer Lawn 3-Piece"
   - **Description** — shown in the product detail accordion
   - **Short Description** — shown next to the main image
   - **Product Type** — Simple or Variable
3. Set **Regular Price** (and Sale Price if applicable)
4. Set **Stock Status** — In Stock / Out of Stock
5. Add images: **Product Image** (main) + **Product Gallery** (additional angles)
6. Set **Categories** — Women / Men / Kids, then Stitched / Unstitched
7. For variable products: go to **Attributes** tab, add `pa_type` (Stitched/Unstitched) and `pa_size` values; then **Variations** tab to set price/stock per variation
8. Under **Yoast SEO** (bottom): set Focus Keyphrase, SEO Title, Meta Description
9. Click **Publish**

The product appears on the site within ~60 seconds. It's included in the sitemap automatically.

---

## 3. Configure a Gift Box

Gift boxes are configured in **MYGIFT → Gift Builder**.

1. Go to **MYGIFT → Gift Builder**
2. Under **Gift Boxes**, click **+ Add Box** or edit a box:
   - **Box Name** — shown on the selection card
   - **Base Price** — price of the empty box in PKR
   - **Capacity** — max number of items (chocolates/candies/etc.) this box holds
   - **Image** — product-style photo of the box (Choose from Media Library)
3. Under **Components & Options → Component category slugs**, set which WooCommerce
   categories feed the builder (comma-separated, e.g. `gift-chocolates, gift-candies`).
   Only products in those categories appear in the Gift Builder — manage them under Products.
4. Under **Add-ons**, click **+ Add Add-on** for optional extras (e.g. Greeting Card, Ribbon): name + price
5. Set the **message character limit**, **ribbon colours** (one per line) and **occasion tags** (one per line)
6. Click **Save Changes**

**Hidden category**: Gift component products live in the hidden **"Gift Components"** WooCommerce category. They do NOT appear on the main shop. Add new gift components there via **Products → Add New** and assign that hidden category.

---

## 4. Create an Occasion Landing Page

Occasion pages live at `/gifts/[occasion]` (e.g. `/gifts/birthday`).

1. Go to **Products → Categories**
2. Find the **Gifts** parent category — expand to see occasion sub-categories (Birthday, Anniversary, Eid, Wedding, etc.)
3. To add a new occasion: Click **Add New Category**
   - Parent: **Gifts**
   - Name: "Graduation" (becomes slug `/gifts/graduation`)
4. Edit the category (click its name), then fill in:
   - **Storefront Intro** — 1–2 sentences shown at the top of the page (collapsible on mobile)
   - **SEO Title / Meta Description** (via Yoast)
5. Assign products to this occasion category: edit each relevant product and tick the occasion category

The occasion page appears automatically when the category has at least 1 product.

---

## 5. Change the Announcement Bar

The announcement bar appears at the very top of every page (wine background, white text).

1. Go to **MYGIFT → Homepage Builder**
2. In the **Announcement Bar** section:
   - **Text** — the message shown (e.g. "FREE SHIPPING on orders over Rs. 3,000")
   - **Link** — optional, makes the bar clickable
   - **Enable** — toggle to show/hide the bar without deleting the text
3. Click **Save Changes**

The bar updates within ~60 seconds via the webhook.

---

## 6. Manage Blog Posts

1. Go to **Posts → Add New**
2. Set:
   - **Title** → appears as H1 and in the blog listing
   - **Content** → write in Gutenberg blocks (paragraphs, headings, images)
   - **Featured Image** → shown in the blog listing card
   - **Categories / Tags** → optional
3. Under **Yoast SEO**: set focus keyphrase, SEO title, meta description
4. Set **Status → Published** and click **Publish**

The post appears at `/blog` and `/blog/[slug]` within ~60 seconds.

---

## 7. Manage Order Statuses (Shipping)

Custom order statuses track fulfilment:

| Status | Meaning | Customer gets email? |
|---|---|---|
| **Confirmed** | Staff reviewed + confirmed the order | No (internal only) |
| **Packed** | Box packed, ready for courier handover | Optional (toggle in Settings) |
| **Shipped** | Handed to courier, tracking number added | Yes — tracking email sent |
| **Completed** | Delivered | Yes — standard WooCommerce email |

**To ship an order:**
1. Go to **WooCommerce → Orders** → click the order
2. Find the **Shipment Tracking** meta box (right sidebar)
3. Select the courier (TCS, Leopards, PostEx, M&P, Trax, or Other)
4. Enter the tracking number — the tracking URL auto-builds
5. Click **"Mark as Shipped"** — the order transitions to "Shipped" and the tracking email sends automatically

**To move an order in bulk:**
- Tick orders on the order list, choose "Change status to Packed" (or any status) from the Bulk Actions dropdown

---

## 8. Webhook Revalidation

Every time you save a product, page, or global option in WordPress, the site automatically updates via a webhook. If an update doesn't appear after 2 minutes:

1. Check **WP Admin → Settings → MYGIFT Core** → confirm **Next.js URL** and **Revalidate Secret** are correct
2. Try saving the item again in WP to re-trigger the webhook
3. As a last resort: in Vercel dashboard → the `web` project → **Deployments** → click the latest deployment → **Redeploy** (or trigger a full build)

---

## 9. Quick Contacts for Technical Issues

| Issue | Who to contact |
|---|---|
| Site down (Vercel) | Check Vercel status + developer |
| WP admin issues | Developer |
| Payment gateway issues | JazzCash/Easypaisa merchant support |
| Domain / DNS | Hosting provider |

---

_Last updated: 2026-06-15_
