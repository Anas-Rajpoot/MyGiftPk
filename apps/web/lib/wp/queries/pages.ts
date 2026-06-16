export const GET_WP_PAGE = `
  query GetWpPage($slug: ID!) {
    page(id: $slug, idType: URI) {
      id
      title
      content
      date
      modified
      seo { title metaDesc opengraphTitle opengraphDescription opengraphImage { sourceUrl } }
    }
  }
`

/**
 * FAQs and job listings are now served by native mygift-core REST endpoints
 * (`/wp-json/mygift/v1/faqs`, `/careers`) via lib/wp/home-content.ts. The
 * FaqItem / JobListing interfaces below remain the shared shape. Careers page
 * intro copy is a normal WP page read with GET_WP_PAGE('careers').
 */

export const GET_BLOG_POSTS = `
  query GetBlogPosts($first: Int!) {
    posts(first: $first) {
      nodes {
        id
        slug
        title
        excerpt
        date
        featuredImage { node { sourceUrl altText } }
        categories { nodes { slug name } }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`

export const GET_BLOG_POST = `
  query GetBlogPost($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      slug
      title
      content
      excerpt
      date
      modified
      author { node { name } }
      featuredImage { node { sourceUrl altText } }
      categories { nodes { slug name } }
      seo { title metaDesc opengraphTitle opengraphDescription opengraphImage { sourceUrl } }
    }
  }
`

export const GET_BLOG_SLUGS = `
  query GetBlogSlugs {
    posts(first: 100) {
      nodes { slug }
    }
  }
`

// TypeScript interfaces
export interface WpPage {
  id: string
  title: string
  content: string
  date: string
  modified: string
  seo: WpPageSeo
}

export interface WpPageSeo {
  title?: string
  metaDesc?: string
  opengraphTitle?: string
  opengraphDescription?: string
  opengraphImage?: { sourceUrl: string }
}

export interface FaqItem {
  question: string
  answer: string
  category: string
}

export interface JobListing {
  jobTitle: string
  location: string
  jobType: string
  description: string
  applyEmail: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  date: string
  featuredImage: { node: { sourceUrl: string; altText: string } } | null
  categories: { nodes: { slug: string; name: string }[] }
}

export interface BlogPostFull extends BlogPost {
  content: string
  modified: string
  author: { node: { name: string } } | null
  seo: WpPageSeo
}
