export type RawSearchParams = Record<string, string | string[] | undefined>

export interface ShopFilters {
  type?: string
  size?: string
  min_price?: string
  max_price?: string
  on_sale?: string
  sort?: string
  page?: string
  category?: string
}

export function parseFilters(raw: RawSearchParams): ShopFilters {
  const str = (key: string) => {
    const v = raw[key]
    return Array.isArray(v) ? v[0] : v
  }
  return {
    type: str('type'),
    size: str('size'),
    min_price: str('min_price'),
    max_price: str('max_price'),
    on_sale: str('on_sale'),
    sort: str('sort'),
    page: str('page'),
    category: str('category'),
  }
}

export function buildFilterUrl(
  basePath: string,
  current: ShopFilters,
  updates: Partial<Record<keyof ShopFilters, string | null>>
): string {
  const params = new URLSearchParams()

  // Copy current (excluding page — always reset on filter change)
  for (const [k, v] of Object.entries(current) as [keyof ShopFilters, string | undefined][]) {
    if (v && k !== 'page') params.set(k, v)
  }

  // Apply updates
  for (const [k, v] of Object.entries(updates)) {
    if (v === null) {
      params.delete(k)
    } else if (v !== undefined) {
      params.set(k, v)
    }
  }

  const str = params.toString()
  return str ? `${basePath}?${str}` : basePath
}

export function getActiveFilterCount(filters: ShopFilters): number {
  return ['type', 'size', 'min_price', 'max_price', 'on_sale'].filter(
    (k) => Boolean(filters[k as keyof ShopFilters])
  ).length
}

export function clearAllFilters(basePath: string, filters: ShopFilters): string {
  const keepParams = new URLSearchParams()
  if (filters.sort) keepParams.set('sort', filters.sort)
  const str = keepParams.toString()
  return str ? `${basePath}?${str}` : basePath
}
