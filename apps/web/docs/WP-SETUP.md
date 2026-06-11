# WP-SETUP.md — WordPress Installation Checklist for MYGIFT

Complete this before setting `MOCK_MODE=false` in .env.local.

---

## 1. Hosting & Domain

- [ ] WordPress installed at `admin.mygift.pk` (subdomain)
  - Recommended hosts: Cloudways (DigitalOcean/Vultr), Kinsta, or any cPanel host with PHP 8.1+
  - Allocate at least 2 vCPU, 2 GB RAM for WooGraphQL performance
- [ ] SSL certificate active on `admin.mygift.pk`
- [ ] `mygift.pk` DNS pointing to Vercel (Next.js frontend)
- [ ] `admin.mygift.pk` DNS pointing to WP host

---

## 2. WordPress Settings

- [ ] **Permalinks:** Settings → Permalinks → Post name (`/%postname%/`)
- [ ] **Timezone:** Asia/Karachi
- [ ] **Site Language:** English (US)
- [ ] **Discourage search engines** from indexing this site: Settings → Reading → tick "Discourage search engines..." (WP admin is never indexed)

---

## 3. Required Plugins (install in this order)

| Plugin | Version | Source |
|---|---|---|
| WooCommerce | latest | wordpress.org/plugins |
| WPGraphQL | ^1.x | wpgraphql.com or wp.org |
| WooGraphQL (WPGraphQL WooCommerce) | latest | github.com/wp-graphql/wp-graphql-woocommerce |
| Advanced Custom Fields (ACF) Pro | ≥6.x | acfpro.com (paid) |
| WPGraphQL for ACF | latest | github.com/wp-graphql/wpgraphql-acf |
| Yoast SEO | latest | wp.org |
| Add WPGraphQL SEO (Yoast) | latest | github.com/ashhitch/wp-graphql-yoast-seo |
| WPGraphQL JWT Authentication | latest | github.com/wp-graphql/wp-graphql-jwt-authentication |
| Wordfence Security | latest | wp.org |
| WP Mail SMTP | latest | wp.org |
| Redirection | latest | wp.org |

After installing WPGraphQL JWT Authentication, add to `wp-config.php`:
```php
define('GRAPHQL_JWT_AUTH_SECRET_KEY', 'your-jwt-secret-matching-JWT_SECRET-in-env');
```

---

## 4. WooCommerce Setup

- [ ] **Currency:** Pakistani Rupee (PKR), symbol Rs., thousand separator `,`
- [ ] **Weight unit:** kg · **Dimension unit:** cm
- [ ] **Store address:** Your Pakistan address (used on invoices)
- [ ] **REST API keys:** WooCommerce → Settings → Advanced → REST API
  - Create key with **Read/Write** permissions
  - Copy Consumer Key → `WC_CONSUMER_KEY` in .env.local
  - Copy Consumer Secret → `WC_CONSUMER_SECRET` in .env.local

---

## 5. Category Tree

Create in WooCommerce → Products → Categories (exact slugs required):

```
Clothing (slug: clothing)
  ├── Women (slug: women)
  ├── Men (slug: men)
  └── Kids (slug: kids)

Gifts (slug: gifts)
  ├── Birthday (slug: birthday)
  ├── Anniversary (slug: anniversary)
  ├── Eid (slug: eid)
  ├── Wedding (slug: wedding)
  ├── Valentines (slug: valentines)
  └── Mothers Day (slug: mothers-day)

Gift Components (slug: gift-components)  ← HIDDEN from catalog
  ├── Boxes (slug: gift-boxes)
  ├── Chocolates (slug: gift-chocolates)
  ├── Candies (slug: gift-candies)
  ├── Biscuits (slug: gift-biscuits)
  └── Extras (slug: gift-extras)
```

For **Gift Components** category:
- Visibility: Hidden (not shown in shop, not in search, not in sitemap)

---

## 6. Global Product Attribute

WooCommerce → Products → Attributes → Add attribute:
- **Name:** Type · **Slug:** `pa_type` · **Enable Archives:** yes
- Add terms: `Stitched`, `Unstitched`

---

## 7. Seed Products (minimum for development)

### Clothing (24 products)
- 8× Women products (4 Stitched, 4 Unstitched)
- 8× Men products (4 Stitched, 4 Unstitched)
- 8× Kids products

Each product must have:
- Title, description, price
- At least one image (cream/neutral background)
- Correct category + pa_type attribute
- Stock status: In Stock

### Gift Components (8 products, hidden)
Create in Gift Components category with **Catalog visibility: Hidden**:
- 2× Chocolates (e.g., Dairy Milk 100g Rs. 350, Ferrero Rocher 3pc Rs. 800)
- 2× Candies (e.g., Candy Jar Rs. 250, Gummy Pack Rs. 180)
- 2× Biscuits (e.g., Oreo Pack Rs. 200, Florentine Rs. 350)
- 2× Extras (e.g., Gift Card Rs. 100, Ribbon Set Rs. 150)

---

## 8. ACF Options Pages

WooCommerce → (ACF Pro must be active) → Custom Fields → Options Pages:

### Global Options
Create Options page: **title** "Global Settings", **menu_slug** "global-settings"

Fields:
| Field Label | Field Name | Type | Notes |
|---|---|---|---|
| Announcement Bar | announcement_bar | Group | |
| → Enabled | enabled | True/False | |
| → Text | text | Text | max 80 chars |
| → Link URL | link | URL | |
| Free Shipping Threshold | free_shipping_threshold | Number | in PKR, e.g. 3000 |
| Gift Wrap Price | gift_wrap_price | Number | in PKR, e.g. 150 |

### Homepage Builder
Create Options page: **title** "Homepage", **menu_slug** "homepage-builder"

Add a Flexible Content field named `homepage_builder` with these layouts:

| Layout | Fields |
|---|---|
| `hero_slider` | slides[] (desktop_image, mobile_image, heading, subtext, cta_label, cta_link) |
| `category_tiles` | tiles[] (image, label, link) |
| `featured_tabs` | tabs[] (title, source_category, source_tag) |
| `gift_banner` | heading, subtext, cta_label, cta_link |
| `occasion_chips` | chips[] (label, link) |
| `from_abroad_block` | heading, body, cta_label, cta_link |
| `trust_row` | items[] (icon, label) |
| `instagram_toggle` | enabled (True/False) |

### Gift Builder Options
Create Options page: **title** "Gift Builder", **menu_slug** "gift-builder-settings"

Fields:
| Field Label | Field Name | Type |
|---|---|---|
| Boxes | boxes | Repeater |
| → Name | name | Text |
| → Image | image | Image |
| → Base Price (Rs.) | base_price | Number |
| → Capacity (items) | capacity | Number |
| Allowed Component Categories | allowed_categories | Checkbox (select from gift-components subcategories) |
| Add-ons | add_ons | Repeater |
| → Name | name | Text |
| → Price (Rs.) | price | Number |
| Message Character Limit | message_char_limit | Number (default: 200) |

---

## 9. WPGraphQL Configuration

WPGraphQL → Settings:
- Enable public introspection: **ON** (needed for development)
- Disable introspection in production after launch

Verify GraphQL endpoint works:
```
POST https://admin.mygift.pk/graphql
{"query": "{ generalSettings { title } }"}
```
Expected: `{"data":{"generalSettings":{"title":"MYGIFT"}}}`

Update `.env.local`:
```
WP_GRAPHQL_URL=https://admin.mygift.pk/graphql
MOCK_MODE=false
```

---

## 10. Custom Plugin Installation

Copy `wp-plugin/mygift-core/` from this repo to:
`/wp-content/plugins/mygift-core/`

Activate via WP Admin → Plugins → "MYGIFT Core"

Configure Settings → MYGIFT Core:
- Revalidate Secret: paste the same value as `REVALIDATE_SECRET` in .env.local
- Next.js URL: `https://mygift.pk` (or staging URL)

---

## 11. Security Hardening (pre-launch)

- [ ] Wordfence: Enable firewall, set admin login to email-based 2FA
- [ ] IP-allowlist wp-admin: Wordfence → Firewall → Allowlisted IPs (add your office/VPN IPs)
- [ ] Verify `admin.mygift.pk` returns `X-Robots-Tag: noindex` header
- [ ] WP Mail SMTP: Configure with SendGrid/Mailgun for transactional emails
- [ ] Redirection plugin: import any 301 redirects from the previous site (if migrating)

---

## 12. Verification Checklist

After completing all steps:
- [ ] `https://admin.mygift.pk/graphql` responds to a query
- [ ] WooCommerce REST API: `GET /wp-json/wc/v3/products` returns products
- [ ] POST to `https://mygift.pk/api/revalidate` with correct secret returns 200
- [ ] Set `MOCK_MODE=false` in .env.local, restart dev server, confirm pages load with real data
- [ ] `admin.mygift.pk` is not indexable (check Google Search Console after DNS propagation)
