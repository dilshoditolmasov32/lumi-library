import { seedDiary } from '~/data/seed'
import { isDiaryEntryArray } from '~/utils/guards'
import { createId } from '~/utils/ids'
import { DIARY_MOODS, type DiaryDraft, type DiaryEntry, type DiaryMood } from '~/types'

export const DIARY_NOTE_MAX = 1000
export const DIARY_PAGES_MAX = 2000

/** The reader's private diary. Stored only in this browser. */
export function useDiary() {
  const entries = usePersistedState<DiaryEntry[]>(
    'diary',
    () => seedDiary.map((entry) => ({ ...entry })),
    isDiaryEntryArray,
  )

  /** Newest reading date first; entries on the same day by creation time. */
  const timeline = computed(() =>
    [...entries.value].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
  )

  const totalPages = computed(() => entries.value.reduce((sum, entry) => sum + entry.pagesRead, 0))

  const topMood = computed<DiaryMood | null>(() => {
    const counts = new Map<DiaryMood, number>()
    for (const entry of entries.value) counts.set(entry.mood, (counts.get(entry.mood) ?? 0) + 1)
    // Ties resolve in the fixed DIARY_MOODS order, so the result is stable.
    let best: DiaryMood | null = null
    for (const mood of DIARY_MOODS) {
      if ((counts.get(mood) ?? 0) > (best ? (counts.get(best) ?? 0) : 0)) best = mood
    }
    return best
  })

  function create(draft: DiaryDraft): DiaryEntry {
    const now = new Date().toISOString()
    const entry: DiaryEntry = { ...draft, id: createId('entry'), createdAt: now, updatedAt: now }
    entries.value = [...entries.value, entry]
    return entry
  }

  function update(id: string, draft: DiaryDraft) {
    entries.value = entries.value.map((entry) =>
      entry.id === id ? { ...entry, ...draft, updatedAt: new Date().toISOString() } : entry,
    )
  }

  function remove(id: string): DiaryEntry | undefined {
    const entry = entries.value.find((item) => item.id === id)
    entries.value = entries.value.filter((item) => item.id !== id)
    return entry
  }

  function restore(entry: DiaryEntry) {
    if (!entries.value.some((item) => item.id === entry.id)) entries.value = [...entries.value, entry]
  }

  return { entries, timeline, totalPages, topMood, create, update, remove, restore }
}
