import {
  DIARY_MOODS,
  PERSONALITY_IDS,
  READER_FONT_SIZES,
  READING_STATUSES,
  type DiaryEntry,
  type DiaryMood,
  type PersonalityId,
  type QuizResult,
  type ReaderFontSize,
  type ReadingPosition,
  type ReadingStatus,
  type UserBook,
} from '~/types'

/*
 * Runtime checks for data read back from localStorage. Anything that fails
 * validation is ignored and the default state is used instead.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isOneOf<T extends string>(options: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (options as readonly string[]).includes(value)
}

export function isReadingStatus(value: unknown): value is ReadingStatus {
  return isOneOf(READING_STATUSES, value)
}

export function isDiaryMood(value: unknown): value is DiaryMood {
  return isOneOf(DIARY_MOODS, value)
}

export function isPersonalityId(value: unknown): value is PersonalityId {
  return isOneOf(PERSONALITY_IDS, value)
}

export function isUserBook(value: unknown): value is UserBook {
  return (
    isRecord(value) &&
    typeof value.bookId === 'string' &&
    isReadingStatus(value.status) &&
    isFiniteNumber(value.pagesRead) &&
    (value.rating === null || isFiniteNumber(value.rating)) &&
    typeof value.note === 'string' &&
    typeof value.addedAt === 'string' &&
    typeof value.updatedAt === 'string'
  )
}

export function isUserBookArray(value: unknown): value is UserBook[] {
  return Array.isArray(value) && value.every(isUserBook)
}

export function isDiaryEntry(value: unknown): value is DiaryEntry {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.bookId === 'string' &&
    typeof value.date === 'string' &&
    isFiniteNumber(value.pagesRead) &&
    isDiaryMood(value.mood) &&
    typeof value.note === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  )
}

export function isDiaryEntryArray(value: unknown): value is DiaryEntry[] {
  return Array.isArray(value) && value.every(isDiaryEntry)
}

export function isQuizResult(value: unknown): value is QuizResult {
  if (!isRecord(value)) return false
  const { scores, answers } = value
  return (
    isPersonalityId(value.personalityId) &&
    isRecord(scores) &&
    PERSONALITY_IDS.every((id) => isFiniteNumber(scores[id])) &&
    isRecord(answers) &&
    Object.values(answers).every((answer) => typeof answer === 'string') &&
    isStringArray(value.recommendedBookIds) &&
    typeof value.completedAt === 'string'
  )
}

export function isNullableQuizResult(value: unknown): value is QuizResult | null {
  return value === null || isQuizResult(value)
}

export function isReadingPositions(value: unknown): value is Record<string, ReadingPosition> {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (position) =>
        isRecord(position) &&
        isFiniteNumber(position.chapter) &&
        isFiniteNumber(position.offset) &&
        typeof position.updatedAt === 'string',
    )
  )
}

export function isReaderFontSize(value: unknown): value is ReaderFontSize {
  return typeof value === 'number' && (READER_FONT_SIZES as readonly number[]).includes(value)
}
