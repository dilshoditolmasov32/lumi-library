export const QUOTE_THEMES = [
  'love',
  'freedom',
  'memory',
  'reading',
  'nature',
  'courage',
  'time',
  'self',
  'wonder',
] as const
export type QuoteTheme = (typeof QUOTE_THEMES)[number]

export interface Quote {
  id: string
  text: string
  author: string
  /** Title of the published work the passage comes from. */
  work: string
  /** Publication date as displayed, e.g. "1847" or "c. 1611". */
  published: string
  /** Credited translator for works not originally in English. */
  translator?: string
  themes: QuoteTheme[]
  /** Links the quote to a catalog book when the book is in LUMI. */
  bookId?: string
}
