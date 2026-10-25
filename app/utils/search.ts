/** Lower-cases and strips accents so "garcia" matches "García". */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

/** True when every word of the query appears somewhere in the haystack fields. */
export function matchesQuery(query: string, fields: string[]): boolean {
  const terms = normalizeText(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const haystack = normalizeText(fields.join(' '))
  return terms.every((term) => haystack.includes(term))
}

/** Title used for alphabetical sorting, ignoring a leading article. */
export function sortableTitle(title: string): string {
  return normalizeText(title).replace(/^(the|a|an)\s+/, '')
}

/** Author surname (last word) for sorting. */
export function sortableAuthor(author: string): string {
  const parts = normalizeText(author).split(/\s+/)
  return parts[parts.length - 1] ?? ''
}

/** Reads a single string from a route query value. */
export function queryString(value: unknown): string {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : ''
  return typeof value === 'string' ? value : ''
}
