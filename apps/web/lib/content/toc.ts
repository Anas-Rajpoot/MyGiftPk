/**
 * Extracts h2 headings from HTML string and returns TOC items.
 * Mutates the HTML to add id attributes to h2 elements.
 */
export interface TocItem {
  id: string
  text: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '') // strip inner tags
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function extractToc(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = []

  const mutated = html.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (match, attrs: string, inner: string) => {
    // Skip if already has id
    if (/id\s*=/i.test(attrs)) {
      const existingId = attrs.match(/id\s*=\s*["']([^"']+)["']/i)?.[1]
      if (existingId) {
        toc.push({ id: existingId, text: inner.replace(/<[^>]*>/g, '') })
      }
      return match
    }

    const text = inner.replace(/<[^>]*>/g, '')
    const id = slugify(text)
    toc.push({ id, text })
    return `<h2${attrs} id="${id}">${inner}</h2>`
  })

  return { html: mutated, toc }
}
