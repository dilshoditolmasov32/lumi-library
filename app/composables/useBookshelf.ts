import { seedShelf } from '~/data/seed'
import { isUserBookArray } from '~/utils/guards'
import { READING_STATUSES, type Book, type ReadingStatus, type ShelfEntry, type UserBook } from '~/types'

export const NOTE_MAX_LENGTH = 280

/**
 * The reader's personal shelf. Entries reference the catalog by id and carry
 * the reader's own progress, rating and note.
 */
export function useBookshelf() {
  const entries = usePersistedState<UserBook[]>(
    'bookshelf',
    () => seedShelf.map((entry) => ({ ...entry })),
    isUserBookArray,
  )
  const { getBook } = useCatalog()
  const { show } = useToast()
  const { t } = useLocale()

  /** Shelf entries joined with catalog data, most recently added first. */
  const shelf = computed<ShelfEntry[]>(() =>
    entries.value
      .flatMap((entry) => {
        const book = getBook(entry.bookId)
        return book ? [{ ...entry, book }] : []
      })
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt)),
  )

  const counts = computed(() => {
    const result = Object.fromEntries(READING_STATUSES.map((status) => [status, 0])) as Record<ReadingStatus, number>
    for (const entry of shelf.value) result[entry.status] += 1
    return result
  })

  const totalPagesRead = computed(() => shelf.value.reduce((sum, entry) => sum + entry.pagesRead, 0))

  function find(bookId: string) {
    return entries.value.find((entry) => entry.bookId === bookId)
  }

  function has(bookId: string) {
    return entries.value.some((entry) => entry.bookId === bookId)
  }

  function add(bookId: string, status: ReadingStatus = 'to-read') {
    const book = getBook(bookId)
    if (!book || has(bookId)) return
    const now = new Date().toISOString()
    entries.value = [
      ...entries.value,
      {
        bookId,
        status,
        pagesRead: status === 'finished' ? book.pages : 0,
        rating: null,
        note: '',
        addedAt: now,
        updatedAt: now,
      },
    ]
  }

  function remove(bookId: string) {
    entries.value = entries.value.filter((entry) => entry.bookId !== bookId)
  }

  function restore(entry: UserBook) {
    if (!has(entry.bookId)) entries.value = [...entries.value, entry]
  }

  function update(bookId: string, patch: Partial<Pick<UserBook, 'status' | 'pagesRead' | 'rating' | 'note'>>) {
    entries.value = entries.value.map((entry) =>
      entry.bookId === bookId ? { ...entry, ...patch, updatedAt: new Date().toISOString() } : entry,
    )
  }

  function announceFinished(book: Book) {
    show(t('bookshelf.finishedToast', { title: book.title }), { tone: 'success' })
  }

  /** Changing status keeps progress consistent: finished means every page read. */
  function setStatus(bookId: string, status: ReadingStatus) {
    const book = getBook(bookId)
    const entry = find(bookId)
    if (!book || !entry || entry.status === status) return
    if (status === 'finished') {
      update(bookId, { status, pagesRead: book.pages })
      announceFinished(book)
    } else {
      if (status === 'to-read') update(bookId, { status, pagesRead: 0 })
      else update(bookId, { status, pagesRead: entry.pagesRead >= book.pages ? 0 : entry.pagesRead })
      show(t('bookshelf.movedToast', { title: book.title, status: t(`statuses.${status}`) }))
    }
  }

  /** Progress moves the status along automatically (to read → reading → finished). */
  function setProgress(bookId: string, pagesRead: number) {
    const book = getBook(bookId)
    const entry = find(bookId)
    if (!book || !entry || !Number.isFinite(pagesRead)) return
    const pages = Math.min(book.pages, Math.max(0, Math.round(pagesRead)))
    let status: ReadingStatus = entry.status
    if (pages >= book.pages) status = 'finished'
    else if (pages > 0) status = 'reading'
    else if (entry.status === 'finished') status = 'reading'
    if (pages === entry.pagesRead && status === entry.status) return
    update(bookId, { pagesRead: pages, status })
    if (status === entry.status) return
    if (status === 'finished') announceFinished(book)
    else show(t('bookshelf.movedToast', { title: book.title, status: t(`statuses.${status}`) }))
  }

  function setRating(bookId: string, rating: number | null) {
    update(bookId, { rating: rating === null ? null : Math.min(5, Math.max(1, Math.round(rating))) })
  }

  function setNote(bookId: string, note: string) {
    update(bookId, { note: note.slice(0, NOTE_MAX_LENGTH) })
  }

  /** Adds or removes a book with toast feedback and an Undo action. Returns the new saved state. */
  function toggleWithFeedback(book: Book): boolean {
    const existing = find(book.id)
    if (existing) {
      remove(book.id)
      show(t('book.removed', { title: book.title }), {
        action: { label: t('common.undo'), run: () => restore(existing) },
      })
      return false
    }
    add(book.id)
    show(t('book.added', { title: book.title }), {
      tone: 'success',
      action: { label: t('common.undo'), run: () => remove(book.id) },
    })
    return true
  }

  function removeWithFeedback(bookId: string) {
    const existing = find(bookId)
    const book = getBook(bookId)
    if (!existing || !book) return
    remove(bookId)
    show(t('book.removed', { title: book.title }), {
      action: { label: t('common.undo'), run: () => restore(existing) },
    })
  }

  return {
    entries,
    shelf,
    counts,
    totalPagesRead,
    find,
    has,
    add,
    remove,
    restore,
    setStatus,
    setProgress,
    setRating,
    setNote,
    toggleWithFeedback,
    removeWithFeedback,
  }
}
