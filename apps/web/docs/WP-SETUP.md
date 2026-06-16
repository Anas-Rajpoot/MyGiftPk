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
| Yoast SEO | latest | wp.org |
| Add WPGraphQL SEO (Yoast) | latest | github.com/ashhitch/wp-graphql-yoast-seo |
| WPGraphQL JWT Authentication | latest | github.com/wp-graphql/wp-graphql-jwt-authentication |
| Wordfence Security | latest | wp.org |
| WP Mail SMTP | latest | wp.org |
| Redirection | latest | wp.org |

**No paid plugins.** All editor-managed content (homepage, global settings, gift
builder, FAQs, careers, category intros) is handled natively by the **MYGIFT Core**
plugin (§10) via branded admin screens + REST endpoints — there is no ACF, no SCF,
and no WPGraphQL-for-ACF bridge. WPGraphQL/WooGraphQL is used only for the product
catalogue; Yoast (+ its WPGraphQL addon) only for SEO meta.

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

## 8. Editor-Managed Content (MYGIFT Control Center — native, no ACF)

All frontend content is managed by the **MYGIFT Core** plugin (install in §10), not
ACF. After activating the plugin, a top-level **MYGIFT** menu appears with these
screens — each self-seeds sensible defaults on activation, so there is **nothing to
configure by hand** to get a working site:

| MYGIFT menu screen | Controls | REST endpoint (Next.js reads) |
|---|---|---|
| **Homepage Builder** | Announcement bar; ordered/toggleable blocks: hero slider, category tiles, featured tabs, gift banner, occasion chips, from-abroad, trust row | `/wp-json/mygift/v1/home-content` |
| **Global Settings** | Free-shipping threshold, gift-wrap price, footer columns, socials, contact | `/wp-json/mygift/v1/global` |
| **Gift Builder** | Boxes, add-ons, component category slugs, message limit, ribbon colours, occasions (component products read live from WooCommerce) | `/wp-json/mygift/v1/gift-builder` |
| **FAQs** | Question/answer/category repeater | `/wp-json/mygift/v1/faqs` |
| **Careers** | Job listings repeater | `/wp-json/mygift/v1/careers` |
| **Connection & Emails** | Revalidate secret, Next.js URL, packed-email toggle | — |

**Category intros:** edit a product category (Products → Categories → a category) and
fill the **Storefront Intro** field — served at `/wp-json/mygift/v1/category-intro?slug=…`.

There are no field groups to recreate by clicking. The structure is version-controlled
as plain PHP in `wp-plugin/mygift-core/includes/` — to rebuild the WP install from
scratch, just install the plugin (§10). Saving any screen fires the revalidation
webhook so the storefront updates within ~60 seconds.

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

Activate via WP Admin → Plugins → "MYGIFT Core". This adds the top-level **MYGIFT**
menu (Control Center) with all content screens above.

Configure **MYGIFT → Connection & Emails**:
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
