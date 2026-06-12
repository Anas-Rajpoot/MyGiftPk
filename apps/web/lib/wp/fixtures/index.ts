/* Mock data returned when MOCK_MODE=true. Matches the shape returned by real GraphQL queries.
   Expand these as needed while developing without a live WP install. */

const MOCK_VARIATION_NODES = ['Stitched', 'Unstitched'].flatMap((type, ti) =>
  ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size, si) => ({
    databaseId: ti * 100 + si + 1,
    price: `Rs. ${type === 'Stitched' ? 3200 + si * 200 : 2800 + si * 200}`,
    regularPrice: `Rs. ${type === 'Stitched' ? 3200 + si * 200 : 2800 + si * 200}`,
    salePrice: type === 'Stitched' && si === 0 ? 'Rs. 2,800' : null,
    stockStatus: type === 'Stitched' && size === 'XXL' ? 'OUT_OF_STOCK' : 'IN_STOCK',
    stockQuantity: type === 'Stitched' && size === 'XXL' ? 0 : 5,
    attributes: {
      nodes: [
        { name: 'attribute_pa_type', value: type },
        { name: 'attribute_pa_size', value: size },
      ],
    },
  }))
)

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
        text: 'Free shipping on orders over Rs. 3,000 · Nationwide delivery',
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
              { slug: 'birthday', name: 'Birthday', image: null },
              { slug: 'gifts', name: 'Gifts', image: null, link: '/gifts' },
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
              { label: 'Birthday', slug: 'birthday' },
              { label: 'Anniversary', slug: 'anniversary' },
              { label: 'Eid', slug: 'eid' },
              { label: 'Wedding', slug: 'wedding' },
              { label: 'Baby Shower', slug: 'baby-shower' },
              { label: 'Graduation', slug: 'graduation' },
              { label: "Mother's Day", slug: 'mothers-day' },
              { label: "Father's Day", slug: 'fathers-day' },
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

  GetShopProducts: {
    products: {
      found: 8,
      pageInfo: { hasNextPage: false },
      nodes: MOCK_PRODUCTS,
    },
  },

  GetCategoryWithProducts: {
    productCategory: {
      id: 'cat-1',
      slug: 'women',
      name: 'Women',
      description: 'Explore our curated women\'s collection — stitched and unstitched lawn, chiffon, and khaddar.',
      count: 24,
      image: null,
      acfCategoryIntro: {
        intro: 'Our women\'s collection blends traditional Pakistani fashion with everyday wearability. From vibrant summer lawns to elegant chiffon dupattas, each piece is crafted for the modern Pakistani woman.',
      },
      seo: {
        title: 'Women\'s Clothing — Stitched & Unstitched | MYGIFT',
        metaDesc: 'Shop women\'s stitched and unstitched clothing. Lawn, chiffon, khaddar and more. Nationwide delivery across Pakistan.',
        canonical: 'https://mygift.pk/category/women',
        opengraphTitle: 'Women\'s Clothing | MYGIFT',
        opengraphDescription: 'Stitched & unstitched clothing for women delivered across Pakistan.',
        opengraphImage: null,
      },
    },
    products: {
      found: 8,
      pageInfo: { hasNextPage: false },
      nodes: MOCK_PRODUCTS,
    },
  },

  GetProduct: {
    product: {
      id: 'product-1',
      databaseId: 1,
      slug: 'mock-product-1',
      name: 'Red Lawn 3-Piece Unstitched',
      type: 'VARIABLE',
      sku: 'MOCK-RED-LAWN-001',
      description: '<p>A stunning 3-piece unstitched lawn suit in vibrant red. Features an embroidered shirt front, printed dupatta, and dyed trouser fabric.</p><ul><li>3-piece: shirt + dupatta + trouser</li><li>Premium lawn fabric</li><li>Machine embroidered front</li><li>Digital printed dupatta</li></ul>',
      shortDescription: 'Premium red lawn 3-piece unstitched with embroidered front and printed dupatta.',
      image: null,
      galleryImages: { nodes: [] },
      price: 'Rs. 2,800 – Rs. 3,200',
      regularPrice: 'Rs. 2,800 – Rs. 3,200',
      salePrice: null,
      onSale: false,
      stockStatus: 'IN_STOCK',
      productCategories: { nodes: [{ slug: 'women', name: 'Women' }] },
      attributes: {
        nodes: [
          {
            name: 'pa_type',
            label: 'Type',
            options: ['Stitched', 'Unstitched'],
            variation: true,
          },
          {
            name: 'pa_size',
            label: 'Size',
            options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            variation: true,
          },
        ],
      },
      variations: {
        nodes: MOCK_VARIATION_NODES,
      },
      related: {
        nodes: MOCK_PRODUCTS.slice(1, 5).map((p) => ({
          id: p.id,
          databaseId: p.databaseId,
          slug: p.slug,
          name: p.name,
          image: p.image,
          price: p.price,
          regularPrice: p.regularPrice,
          salePrice: p.salePrice,
          onSale: p.onSale,
          stockStatus: p.stockStatus,
        })),
      },
      seo: {
        title: 'Red Lawn 3-Piece Unstitched | MYGIFT',
        metaDesc: 'Shop the Red Lawn 3-Piece Unstitched suit. Premium lawn fabric with embroidered front. Available stitched or unstitched in sizes XS–XXL.',
        canonical: 'https://mygift.pk/product/mock-product-1',
        opengraphTitle: 'Red Lawn 3-Piece Unstitched | MYGIFT',
        opengraphDescription: 'Premium red lawn 3-piece unstitched with embroidered front and printed dupatta.',
        opengraphImage: null,
      },
    },
  },

  GetProductSlugs: {
    products: {
      nodes: MOCK_PRODUCTS.map((p) => ({ slug: p.slug })),
    },
  },

  GetCategorySlugs: {
    productCategories: {
      nodes: [
        { slug: 'women' },
        { slug: 'men' },
        { slug: 'kids' },
        { slug: 'gifts' },
      ],
    },
  },

  GetGiftBuilderOptions: {
    giftBuilderOptions: {
      boxes: [
        { id: 1, name: 'Small Gift Box', image: null, basePrice: 500, capacity: 3 },
        { id: 2, name: 'Medium Gift Box', image: null, basePrice: 800, capacity: 5 },
        { id: 3, name: 'Large Gift Box', image: null, basePrice: 1200, capacity: 8 },
      ],
      components: [
        { productId: 101, name: 'Ferrero Rocher 3pc', image: null, price: 850, category: 'Chocolates', stockStatus: 'IN_STOCK', stockQuantity: 20 },
        { productId: 102, name: 'Galaxy Chocolate Bar', image: null, price: 300, category: 'Chocolates', stockStatus: 'IN_STOCK', stockQuantity: 30 },
        { productId: 103, name: 'Cadbury Dairy Milk', image: null, price: 250, category: 'Chocolates', stockStatus: 'IN_STOCK', stockQuantity: 25 },
        { productId: 104, name: 'Toblerone 100g', image: null, price: 600, category: 'Chocolates', stockStatus: 'IN_STOCK', stockQuantity: 15 },
        { productId: 201, name: 'Jolly Rancher Pack', image: null, price: 450, category: 'Candies', stockStatus: 'IN_STOCK', stockQuantity: 20 },
        { productId: 202, name: 'Candy Cane Pack', image: null, price: 200, category: 'Candies', stockStatus: 'IN_STOCK', stockQuantity: 30 },
        { productId: 203, name: 'Gummy Bears 100g', image: null, price: 350, category: 'Candies', stockStatus: 'IN_STOCK', stockQuantity: 20 },
        { productId: 301, name: 'Oreo Pack', image: null, price: 300, category: 'Biscuits', stockStatus: 'IN_STOCK', stockQuantity: 25 },
        { productId: 302, name: 'Lotus Biscoff Pack', image: null, price: 600, category: 'Biscuits', stockStatus: 'IN_STOCK', stockQuantity: 10 },
        { productId: 303, name: 'Digestive Biscuits', image: null, price: 250, category: 'Biscuits', stockStatus: 'IN_STOCK', stockQuantity: 30 },
        { productId: 401, name: 'Rose Petals Pack', image: null, price: 200, category: 'Extras', stockStatus: 'IN_STOCK', stockQuantity: 20 },
        { productId: 402, name: 'Confetti Pack', image: null, price: 150, category: 'Extras', stockStatus: 'IN_STOCK', stockQuantity: 30 },
        { productId: 403, name: 'Mini Plush Bear', image: null, price: 400, category: 'Extras', stockStatus: 'IN_STOCK', stockQuantity: 15 },
      ],
      addOns: [
        { id: 1, name: 'Photo Print', price: 500 },
        { id: 2, name: 'Premium Ribbon', price: 300 },
      ],
      categories: ['Chocolates', 'Candies', 'Biscuits', 'Extras'],
      messageCharLimit: 200,
      ribbonColors: ['Wine Red', 'Gold', 'Ivory', 'Navy', 'Blush Pink', 'Sage Green'],
      occasions: ['Birthday', 'Anniversary', 'Eid', "Mother's Day", 'Baby Shower', 'Wedding', 'Just Because'],
    },
  },
}
