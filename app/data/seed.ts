import type { DiaryEntry, UserBook } from '~/types'

/**
 * Starting state for a first-time visitor, so the prototype isn't empty.
 * Everything here can be edited or removed, and "Reset prototype data" in
 * the footer restores it.
 */
export const seedShelf: readonly UserBook[] = [
  {
    bookId: 'jane-eyre',
    status: 'reading',
    pagesRead: 214,
    rating: null,
    note: 'Reading slowly — Thornfield is wonderfully eerie.',
    addedAt: '2026-10-02T09:00:00.000Z',
    updatedAt: '2026-10-23T21:10:00.000Z',
  },
  {
    bookId: 'the-great-gatsby',
    status: 'finished',
    pagesRead: 180,
    rating: 4,
    note: 'That final page.',
    addedAt: '2026-09-12T18:30:00.000Z',
    updatedAt: '2026-09-20T22:00:00.000Z',
  },
  {
    bookId: 'dune',
    status: 'to-read',
    pagesRead: 0,
    rating: null,
    note: '',
    addedAt: '2026-10-18T12:00:00.000Z',
    updatedAt: '2026-10-18T12:00:00.000Z',
  },
]

export const seedDiary: readonly DiaryEntry[] = [
  {
    id: 'seed-entry-2',
    bookId: 'jane-eyre',
    date: '2026-10-23',
    pagesRead: 38,
    mood: 'absorbed',
    note: 'The fire in Rochester’s room. Couldn’t put it down until well past midnight.',
    createdAt: '2026-10-23T23:40:00.000Z',
    updatedAt: '2026-10-23T23:40:00.000Z',
  },
  {
    id: 'seed-entry-1',
    bookId: 'jane-eyre',
    date: '2026-10-19',
    pagesRead: 52,
    mood: 'moved',
    note: 'Helen Burns. Lowood is bleak, but the friendship is lovely.',
    createdAt: '2026-10-19T20:15:00.000Z',
    updatedAt: '2026-10-19T20:15:00.000Z',
  },
]

export const seedSavedQuoteIds: readonly string[] = ['q-bronte-bird', 'q-lee-reading']
