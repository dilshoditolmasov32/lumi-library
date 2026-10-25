export const GENRES = [
  'classic',
  'literary',
  'romance',
  'mystery',
  'fantasy',
  'science-fiction',
  'nonfiction',
  'poetry',
] as const
export type Genre = (typeof GENRES)[number]

export const READING_MOODS = [
  'reflective',
  'romantic',
  'suspenseful',
  'adventurous',
  'melancholic',
  'curious',
  'whimsical',
  'dark',
] as const
export type ReadingMood = (typeof READING_MOODS)[number]

export type CoverPalette =
  | 'burgundy'
  | 'sage'
  | 'ink'
  | 'sand'
  | 'clay'
  | 'moss'
  | 'dusk'
  | 'rose'
  | 'cream'
  | 'ochre'

export type CoverMotif = 'arch' | 'sun' | 'lines' | 'frame' | 'wave' | 'grid' | 'diamond' | 'moon'

export interface BookCover {
  palette: CoverPalette
  motif: CoverMotif
}

/** An entry in the global, read-only catalog. Shared by every reader. */
export interface Book {
  id: string
  title: string
  author: string
  /** Year of first publication. */
  year: number
  genre: Genre
  /** Approximate page count — varies by edition. */
  pages: number
  synopsis: string
  moods: ReadingMood[]
  cover: BookCover
  featured?: boolean
  /** Set when a free, public-domain edition can be read inside LUMI. */
  freeEdition?: FreeEdition
}

export interface FreeEdition {
  source: string
  /** Page of the edition on the source's website. */
  url: string
}

export const READING_STATUSES = ['to-read', 'reading', 'finished'] as const
export type ReadingStatus = (typeof READING_STATUSES)[number]

/**
 * A book on one reader's personal shelf. It only references the catalog by
 * `bookId`; progress, rating and notes belong to the reader, not the book.
 */
export interface UserBook {
  bookId: string
  status: ReadingStatus
  pagesRead: number
  /** 1–5, or null when unrated. */
  rating: number | null
  note: string
  addedAt: string
  updatedAt: string
}

/** A shelf entry joined with its catalog record, for display. */
export interface ShelfEntry extends UserBook {
  book: Book
}

/** An editor-curated themed list of catalog books. */
export interface Collection {
  id: string
  title: string
  description: string
  bookIds: string[]
}

export const SORT_OPTIONS = ['featured', 'title', 'author', 'year-desc', 'year-asc', 'pages-asc'] as const
export type SortOption = (typeof SORT_OPTIONS)[number]
