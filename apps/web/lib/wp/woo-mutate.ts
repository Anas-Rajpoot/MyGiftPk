/* Session-aware WooGraphQL mutation helper.
   Used only in route handlers — never imported client-side. */

const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL

export interface MutateResult<T> {
  data: T
  newSessionToken: string | null
}

export async function wooMutate<T>(
  query: string,
  variables: Record<string, unknown>,
  sessionToken?: string | null
): Promise<MutateResult<T>> {
  if (!WP_GRAPHQL_URL) {
    throw new Error('WP_GRAPHQL_URL is not configured')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (sessionToken) {
    headers['woocommerce-session'] = `Session ${sessionToken}`
  }

  const res = await fetch(WP_GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`WooGraphQL HTTP ${res.status}`)
  }

  const newSessionToken = res.headers.get('woocommerce-session')

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] }

  if (json.errors?.length) {
    throw new Error(json.errors[0].message)
  }

  return { data: json.data as T, newSessionToken }
}
