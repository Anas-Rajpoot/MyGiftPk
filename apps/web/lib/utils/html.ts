const HTML_ENTITY_MAP: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, (m) => HTML_ENTITY_MAP[m] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function sanitizeMetaDescription(html: string, maxLen = 155): string {
  const plain = stripHtml(html)
  if (plain.length <= maxLen) return plain
  return plain.slice(0, maxLen - 1).trimEnd() + '…'
}
