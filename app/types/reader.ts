/** Shape of public/books/<id>/manifest.json (see scripts/import-free-books.mjs). */
export interface ReaderManifest {
  bookId: string
  source: string
  sourceUrl: string
  license: string
  totalWords: number
  chapters: Array<{ title: string; words: number }>
}

/** A block of chapter text. `html` only ever contains <em> and <br>. */
export type ReaderBlock =
  | { t: 'p' | 'quote' | 'h'; html: string }
  | { t: 'break' }

/** Shape of public/books/<id>/<n>.json. */
export interface ReaderChapter {
  title: string
  blocks: ReaderBlock[]
}

/** Where the reader stopped in a book. */
export interface ReadingPosition {
  chapter: number
  /** How far down the chapter, from 0 to 1. */
  offset: number
  updatedAt: string
}

export const READER_FONT_SIZES = [0, 1, 2, 3, 4] as const
export type ReaderFontSize = (typeof READER_FONT_SIZES)[number]
