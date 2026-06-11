/* Mock data returned when MOCK_MODE=true. Matches the shape returned by real GraphQL queries.
   Expand these as needed while developing without a live WP install. */

export const fixtures: Record<string, unknown> = {
  GetGlobalOptions: {
    globalOptions: {
      announcementBar: {
        enabled: true,
        text: 'Free shipping on orders over Rs. 3,000 🇵🇰',
        link: '/shop',
      },
      freeShippingThreshold: 3000,
      giftWrapPrice: 150,
    },
  },

  GetHomePage: {
    page: {
      homepageBuilder: {
        blocks: [
          {
            fieldGroupName: 'hero_slider',
            slides: [
              {
                desktopImage: { sourceUrl: '/placeholder-hero-desktop.jpg', altText: 'MYGIFT Hero' },
                mobileImage: { sourceUrl: '/placeholder-hero-mobile.jpg', altText: 'MYGIFT Hero' },
                heading: 'GIFTS THAT FEEL LIKE HOME',
                subtext: 'Clothing & custom gift boxes delivered across Pakistan',
                ctaLabel: 'Shop Now',
                ctaLink: '/shop',
              },
            ],
          },
        ],
      },
    },
  },

  GetProducts: {
    products: {
      nodes: Array.from({ length: 8 }, (_, i) => ({
        id: `product-${i + 1}`,
        databaseId: i + 1,
        slug: `mock-product-${i + 1}`,
        name: `Mock Product ${i + 1}`,
        type: 'SIMPLE',
        image: { sourceUrl: '/placeholder-product.jpg', altText: `Mock Product ${i + 1}` },
        galleryImages: { nodes: [] },
        price: `Rs. ${(i + 1) * 1500}`,
        regularPrice: `Rs. ${(i + 1) * 1500}`,
        salePrice: i % 3 === 0 ? `Rs. ${(i + 1) * 1200}` : null,
        onSale: i % 3 === 0,
        stockStatus: 'IN_STOCK',
        productCategories: { nodes: [{ slug: 'women', name: 'Women' }] },
        attributes: { nodes: [] },
      })),
    },
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
