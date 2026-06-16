import { unstable_cache } from 'next/cache'
import { fixtures } from './fixtures'

const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL
const MOCK_MODE = process.env.MOCK_MODE === 'true'

export type FetchOptions = {
  tags?: string[]
  revalidate?: number
}

export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: FetchOptions = {}
): Promise<T> {
  const { tags = [], revalidate = 3600 } = options

  if (MOCK_MODE) {
    console.warn('[fetchGraphQL] MOCK_MODE=true — returning fixture data. Set MOCK_MODE=false once WP is live.')
    return getMockData<T>(query)
  }

  if (!WP_GRAPHQL_URL) {
    throw new Error('WP_GRAPHQL_URL is not set. Check your .env.local file.')
  }

  const cacheKey = [query.trim().slice(0, 100), JSON.stringify(variables ?? {})]

  const cached = unstable_cache(
    async () => {
      const res = await fetch(WP_GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      })

      if (!res.ok) {
        throw new Error(`[fetchGraphQL] HTTP ${res.status} from WP_GRAPHQL_URL`)
      }

      const json = await res.json()

      if (json.errors?.length) {
        const msg = json.errors.map((e: { message: string }) => e.message).join(', ')
        throw new Error(`[fetchGraphQL] GraphQL errors: ${msg}`)
      }

      return json.data as T
    },
    cacheKey,
    { tags, revalidate }
  )

  return cached()
}

/**
 * Resilient variant: returns null instead of throwing when the GraphQL request
 * fails (network, HTTP, or schema errors such as an optional Yoast `seo` field
 * being absent because the WPGraphQL-SEO addon isn't installed). Callers fall
 * back to their built-in defaults — a missing optional field must never 500 a
 * page (see CLAUDE.md resilience rule).
 */
export async function fetchGraphQLSafe<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: FetchOptions = {}
): Promise<T | null> {
  try {
    return await fetchGraphQL<T>(query, variables, options)
  } catch (err) {
    console.warn(`[fetchGraphQLSafe] falling back to defaults: ${(err as Error).message}`)
    return null
  }
}

function getMockData<T>(query: string): T {
  const queryName = query.match(/(?:query|mutation)\s+(\w+)/)?.[1] ?? 'unknown'
  const mock = (fixtures as Record<string, unknown>)[queryName]
  if (mock) return mock as T
  console.warn(`[fetchGraphQL] No fixture found for query "${queryName}" — returning empty object`)
  return {} as T
}
