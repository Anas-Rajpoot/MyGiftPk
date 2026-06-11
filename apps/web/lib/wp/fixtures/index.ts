/* Mock data returned when MOCK_MODE=true. Matches the shape returned by real GraphQL queries.
   Expand these as needed while developing without a live WP install. */

const MOCK_PRODUCTS = Array.from({ length: 8 }, (_, i) => ({
  id: `product-${i + 1}`,
  databaseId: i + 1,
  slug: `mock-product-${i + 1}`,
  name: [
    'Red Lawn 3-Piece Unstitched',
    'Ivory Embroidered Kurta',
    'Navy Blue Chiffon Suit',
    'Rose Pink Lawn Dupatta Set',
    'Teal Linen 2-Piece',
    'Classic White Kurta Shalwar',
    'Mustard Printed Shirt',
    'Charcoal Khaddar 3-Piece',
  ][i],
  type: 'SIMPLE',
  image: null,
  galleryImages: { nodes: [] },
  price: `Rs. ${(i + 1) * 1500}`,
  regularPrice: `Rs. ${(i + 1) * 1500}`,
  salePrice: i % 3 === 0 ? `Rs. ${Math.round((i + 1) * 1200)}` : null,
  onSale: i % 3 === 0,
  stockStatus: 'IN_STOCK',
  productCategories: { nodes: [{ slug: 'women', name: 'Women' }] },
  attributes: { nodes: [] },
}))

export const fixtures: Record<string, unknown> = {
  GetGlobalOptions: {
    globalOptions: {
      announcementBar: {
        enabled: true,
        text: 'Free shipping on orders over Rs. 3,000 · Nationwide delivery 🇵🇰',
        link: '/shop',
      },
      freeShippingThreshold: 3000,
      giftWrapPrice: 150,
      headerMenu: [
        {
          label: 'Women',
          link: '/category/women',
          children: [
            { label: 'Stitched', link: '/category/women?type=stitched' },
            { label: 'Unstitched', link: '/category/women?type=unstitched' },
            { label: 'Lawn', link: '/category/women?tag=lawn' },
            { label: 'Chiffon', link: '/category/women?tag=chiffon' },
            { label: 'Khaddar', link: '/category/women?tag=khaddar' },
            { label: 'All Women', link: '/category/women' },
          ],
        },
        {
          label: 'Men',
          link: '/category/men',
          children: [
            { label: 'Stitched', link: '/category/men?type=stitched' },
            { label: 'Unstitched', link: '/category/men?type=unstitched' },
            { label: 'Kurta Shalwar', link: '/category/men?tag=kurta-shalwar' },
            { label: 'All Men', link: '/category/men' },
          ],
        },
        {
          label: 'Kids',
          link: '/category/kids',
          children: [
            { label: 'Girls', link: '/category/kids?tag=girls' },
            { label: 'Boys', link: '/category/kids?tag=boys' },
            { label: 'All Kids', link: '/category/kids' },
          ],
        },
        {
          label: 'Gifts',
          link: '/gifts',
          children: [
            { label: 'Build a Gift', link: '/gift-builder' },
            { label: 'Ready Gifts', link: '/gifts' },
            { label: 'Birthday', link: '/gifts/birthday' },
            { label: 'Eid', link: '/gifts/eid' },
            { label: 'Anniversary', link: '/gifts/anniversary' },
            { label: 'All Occasions', link: '/gifts' },
          ],
        },
      ],
      footer: {
        columns: [
          {
            heading: 'Shop',
            links: [
              { label: 'Women', href: '/category/women' },
              { label: 'Men', href: '/category/men' },
              { label: 'Kids', href: '/category/kids' },
              { label: 'Gifts', href: '/gifts' },
              { label: 'Gift Builder', href: '/gift-builder' },
              { label: 'Sale', href: '/shop?on_sale=1' },
            ],
          },
          {
            heading: 'Help',
            links: [
              { label: 'Track Your Order', href: '/track-order' },
              { label: 'Shipping & Delivery', href: '/shipping' },
              { label: 'Returns & Exchanges', href: '/returns' },
              { label: 'Size Guide', href: '/size-guide' },
              { label: 'FAQs', href: '/faqs' },
              { label: 'Contact Us', href: '/contact' },
            ],
          },
          {
            heading: 'Company',
            links: [
              { label: 'About MYGIFT', href: '/about' },
              { label: 'Blog', href: '/blog' },
              { label: 'Careers', href: '/careers' },
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms & Conditions', href: '/terms' },
            ],
          },
        ],
        socials: {
          instagram: 'https://instagram.com/mygift.pk',
          facebook: 'https://facebook.com/mygift.pk',
          whatsapp: 'https://wa.me/923000000000',
        },
        contact: {
          phone: '+92 300 000 0000',
          email: 'hello@mygift.pk',
        },
        bottomText: '© 2025 MYGIFT. All rights reserved.',
      },
    },
  },

  GetHomePage: {
    page: {
      seo: {
        title: 'MYGIFT — Gifts & Clothing Delivered Across Pakistan',
        metaDesc:
          'Shop stitched & unstitched clothing for Women, Men and Kids. Build custom gift boxes delivered nationwide. Free shipping on orders over Rs. 3,000.',
        canonical: 'https://mygift.pk/',
        opengraphTitle: 'MYGIFT — Gifts & Clothing Delivered Across Pakistan',
        opengraphDescription:
          'Clothing and custom gift boxes delivered across Pakistan.',
        opengraphImage: null,
      },
      homepageBuilder: {
        blocks: [
          {
            fieldGroupName: 'hero_slider',
            slides: [
              {
                desktopImage: { sourceUrl: '/placeholder-hero-desktop.jpg', altText: 'MYGIFT Collection' },
                mobileImage: { sourceUrl: '/placeholder-hero-mobile.jpg', altText: 'MYGIFT Collection' },
                heading: 'GIFTS THAT FEEL LIKE HOME',
                subtext: 'Clothing & custom gift boxes delivered across Pakistan',
                ctaLabel: 'Shop Now',
                ctaLink: '/shop',
              },
              {
                desktopImage: { sourceUrl: '/placeholder-hero-desktop-2.jpg', altText: 'Build a Gift' },
                mobileImage: { sourceUrl: '/placeholder-hero-mobile-2.jpg', altText: 'Build a Gift' },
                heading: 'BUILD A GIFT THEY\'LL TREASURE',
                subtext: 'Choose a box, fill it with love, add a personal message',
                ctaLabel: 'Build a Gift',
                ctaLink: '/gift-builder',
              },
              {
                desktopImage: { sourceUrl: '/placeholder-hero-desktop-3.jpg', altText: 'New Arrivals' },
                mobileImage: { sourceUrl: '/placeholder-hero-mobile-3.jpg', altText: 'New Arrivals' },
                heading: 'NEW SEASON ARRIVALS',
                subtext: 'Fresh lawn, chiffon & embroidered pieces now in store',
                ctaLabel: 'View Collection',
                ctaLink: '/category/women',
              },
            ],
          },
          {
            fieldGroupName: 'category_tiles',
            tiles: [
              { slug: 'women', name: 'Women', image: null },
              { slug: 'men', name: 'Men', image: null },
              { slug: 'kids', name: 'Kids', image: null },
              { slug: 'gifts', name: 'Gifts', image: null },
            ],
          },
          {
            fieldGroupName: 'featured_tabs',
            tabs: [
              { id: 'new-arrivals', title: 'New Arrivals', categorySlug: 'women' },
              { id: 'best-sellers', title: 'Best Sellers', categorySlug: 'men' },
              { id: 'on-sale', title: 'On Sale', categorySlug: 'kids' },
            ],
          },
          {
            fieldGroupName: 'gift_banner',
          },
          {
            fieldGroupName: 'occasion_chips',
            chips: [
              { label: 'Birthday', slug: 'birthday', emoji: '🎂' },
              { label: 'Anniversary', slug: 'anniversary', emoji: '💍' },
              { label: 'Eid', slug: 'eid', emoji: '🌙' },
              { label: 'Wedding', slug: 'wedding', emoji: '💐' },
              { label: 'Baby Shower', slug: 'baby-shower', emoji: '👶' },
              { label: 'Graduation', slug: 'graduation', emoji: '🎓' },
              { label: 'Mother\'s Day', slug: 'mothers-day', emoji: '🌸' },
              { label: 'Father\'s Day', slug: 'fathers-day', emoji: '👔' },
            ],
          },
          {
            fieldGroupName: 'from_abroad_block',
            heading: 'SENDING A GIFT FROM ABROAD?',
            subtext:
              'You\'re overseas. Your family is in Pakistan. We bridge that distance — order online, we deliver with love. Cash on delivery available for family to receive.',
            image: null,
            ctaLabel: 'Send a Gift Home',
            ctaLink: '/gift-builder',
          },
          {
            fieldGroupName: 'trust_row',
            items: [
              { icon: 'truck', heading: 'Free Shipping', subtext: 'On orders over Rs. 3,000 nationwide' },
              { icon: 'gift', heading: 'Gift Wrapping', subtext: 'Premium wrapping for Rs. 150 per item' },
              { icon: 'shield-check', heading: '100% Authentic', subtext: 'Verified clothing & quality guaranteed' },
              { icon: 'map-pin', heading: 'Nationwide Delivery', subtext: 'Delivered to all cities across Pakistan' },
            ],
          },
        ],
      },
    },
  },

  GetProducts: {
    products: { nodes: MOCK_PRODUCTS },
  },

  GetFeaturedProducts: {
    products: { nodes: MOCK_PRODUCTS },
  },

  GetCategories: {
    productCategories: {
      nodes: [
        { id: 'cat-1', slug: 'women', name: 'Women', count: 24, image: null },
        { id: 'cat-2', slug: 'men', name: 'Men', count: 12, image: null },
        { id: 'cat-3', slug: 'kids', name: 'Kids', count: 8, image: null },
        { id: 'cat-4', slug: 'gifts', name: 'Gifts', count: 16, image: null },
      ],
    },
  },

  GetGiftBuilderConfig: {
    giftBuilderOptions: {
      boxes: [
        { id: 1, name: 'Small Box', image: null, basePrice: 500, capacity: 4 },
        { id: 2, name: 'Medium Box', image: null, basePrice: 800, capacity: 6 },
        { id: 3, name: 'Large Box', image: null, basePrice: 1200, capacity: 10 },
      ],
      allowedCategories: ['chocolates', 'candies', 'biscuits', 'extras'],
      addOns: [
        { id: 1, name: 'Gift Card', price: 100 },
        { id: 2, name: 'Ribbon Wrap', price: 150 },
      ],
      messageCharLimit: 200,
    },
  },
}
