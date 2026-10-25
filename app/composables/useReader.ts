import { isReaderFontSize, isReadingPositions } from '~/utils/guards'
import type { ReaderFontSize, ReadingPosition } from '~/types'

/** Where the reader stopped in each free book, saved in this browser. */
export function useReadingPositions() {
  const positions = usePersistedState<Record<string, ReadingPosition>>(
    'reading-positions',
    () => ({}),
    isReadingPositions,
  )

  function get(bookId: string): ReadingPosition | undefined {
    return positions.value[bookId]
  }

  function set(bookId: string, chapter: number, offset: number) {
    const current = positions.value[bookId]
    const next = Math.round(Math.min(1, Math.max(0, offset)) * 1000) / 1000
    if (current && current.chapter === chapter && current.offset === next) return
    positions.value = {
      ...positions.value,
      [bookId]: { chapter, offset: next, updatedAt: new Date().toISOString() },
    }
  }

  return { positions, get, set }
}

/** Reader text size, remembered between visits. */
export function useReaderFontSize() {
  return usePersistedState<ReaderFontSize>('reader-font-size', () => 2, isReaderFontSize)
}
