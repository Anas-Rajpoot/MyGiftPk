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

const MOCK_PRODUCT_NAMES = [
  'Red Lawn 3-Piece Unstitched',
  'Ivory Embroidered Kurta',
  'Navy Blue Chiffon Suit',
  'Rose Pink Lawn Dupatta Set',
  'Teal Linen 2-Piece',
  'Classic White Kurta Shalwar',
  'Mustard Printed Shirt',
  'Charcoal Khaddar 3-Piece',
  'Sage Green Silk Dupatta',
  'Burgundy Embroidered Shirt',
  'Sky Blue Cotton Shalwar Set',
  'Peach Chiffon Formal Suit',
  'Forest Green Block Print Kurta',
  'Lavender Organza 3-Piece',
  'Camel Brown Linen Coordinate',
  'Midnight Black Party Wear',
]

const MOCK_PRODUCTS = Array.from({ length: 16 }, (_, i) => ({
  id: `product-${i + 1}`,
  databaseId: i + 1,
  slug: `mock-product-${i + 1}`,
  name: MOCK_PRODUCT_NAMES[i],
  type: 'SIMPLE',
  image: null,
  galleryImages: { nodes: [] },
  price: `Rs. ${(i + 1) * 1200}`,
  regularPrice: `Rs. ${(i + 1) * 1200}`,
  salePrice: i % 4 === 0 ? `Rs. ${Math.round((i + 1) * 950)}` : null,
  onSale: i % 4 === 0,
  stockStatus: 'IN_STOCK',
  productCategories: { nodes: [{ slug: i < 8 ? 'women' : 'men', name: i < 8 ? 'Women' : 'Men' }] },
  attributes: { nodes: [] },
}))

export const fixtures: Record<string, unknown> = {
  GetHomeSeo: {
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

  GetShopProducts: {
    products: {
      found: 16,
      pageInfo: { hasNextPage: true },
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
      nodes: MOCK_PRODUCTS.slice(0, 8),
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

  // ── Content pages ────────────────────────────────────────────────────────────

  GetWpPage: {
    page: {
      id: 'page-about',
      title: 'About MYGIFT',
      content: '<p>Placeholder content for this page. In production this will be managed from WordPress.</p>',
      date: '2024-01-01T00:00:00',
      modified: '2025-01-01T00:00:00',
      seo: {},
    },
  },

  GetBlogPosts: {
    posts: {
      nodes: [
        {
          id: 'post-1',
          slug: 'gift-ideas-for-eid',
          title: '10 Thoughtful Gift Ideas for Eid',
          excerpt: '<p>Eid is around the corner. Here are our top 10 gift ideas that work for every budget — from personalised gift boxes to premium lawn suits.</p>',
          date: '2025-03-15T10:00:00',
          featuredImage: null,
          categories: { nodes: [{ slug: 'gift-ideas', name: 'Gift Ideas' }] },
        },
        {
          id: 'post-2',
          slug: 'how-to-measure-yourself',
          title: 'How to Measure Yourself for a Perfect Fit',
          excerpt: '<p>Getting the perfect fit for stitched clothing starts with accurate measurements. Follow our simple guide to measure bust, waist, hip and length at home.</p>',
          date: '2025-02-20T09:00:00',
          featuredImage: null,
          categories: { nodes: [{ slug: 'style-tips', name: 'Style Tips' }] },
        },
      ],
      pageInfo: { hasNextPage: false, endCursor: null },
    },
  },

  GetBlogPost: {
    post: {
      id: 'post-1',
      slug: 'gift-ideas-for-eid',
      title: '10 Thoughtful Gift Ideas for Eid',
      content: '<p>Eid is a time of joy, family and giving. Whether you are shopping for parents, siblings or friends, we have put together a list of our most loved gift options.</p><h2>1. Personalised Gift Box</h2><p>Our Gift Builder lets you create a completely custom gift box filled with chocolates, candies, and a personal message card. Perfect for near and far.</p><h2>2. Premium Lawn 3-Piece Suit</h2><p>Give the gift of beautiful clothing — our embroidered lawn suits make a thoughtful and practical gift that any woman would love.</p>',
      excerpt: '<p>Eid is around the corner. Here are our top 10 gift ideas that work for every budget.</p>',
      date: '2025-03-15T10:00:00',
      modified: '2025-03-15T10:00:00',
      author: { node: { name: 'MYGIFT Team' } },
      featuredImage: null,
      categories: { nodes: [{ slug: 'gift-ideas', name: 'Gift Ideas' }] },
      seo: {
        title: '10 Thoughtful Gift Ideas for Eid | MYGIFT Blog',
        metaDesc: 'Discover 10 thoughtful Eid gift ideas from MYGIFT — from personalised gift boxes to premium lawn suits.',
      },
    },
  },

  GetBlogSlugs: {
    posts: {
      nodes: [
        { slug: 'gift-ideas-for-eid' },
        { slug: 'how-to-measure-yourself' },
      ],
    },
  },
}
