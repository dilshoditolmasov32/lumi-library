export const DIARY_MOODS = ['absorbed', 'calm', 'moved', 'curious', 'restless', 'delighted'] as const
export type DiaryMood = (typeof DIARY_MOODS)[number]

export interface DiaryEntry {
  id: string
  bookId: string
  /** Calendar date of the reading session, as YYYY-MM-DD. */
  date: string
  pagesRead: number
  mood: DiaryMood
  note: string
  createdAt: string
  updatedAt: string
}

export type DiaryDraft = Pick<DiaryEntry, 'bookId' | 'date' | 'pagesRead' | 'mood' | 'note'>
