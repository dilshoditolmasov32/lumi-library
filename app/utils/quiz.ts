import { books } from '~/data/books'
import { personalities, quizQuestions } from '~/data/quiz'
import { PERSONALITY_IDS, type Book, type PersonalityId, type QuizResult, type ReadingMood } from '~/types'

const RECOMMENDATION_COUNT = 4

/**
 * Scores a completed quiz. The result is fully deterministic: the same
 * answers always give the same personality and the same books.
 * Ties are broken by the fixed order of PERSONALITY_IDS.
 */
export function calculateQuizResult(answers: Record<string, string>, completedAt: string): QuizResult {
  const scores = Object.fromEntries(PERSONALITY_IDS.map((id) => [id, 0])) as Record<PersonalityId, number>
  const moodCounts = new Map<ReadingMood, number>()

  for (const question of quizQuestions) {
    const option = question.options.find((o) => o.id === answers[question.id])
    if (!option) continue
    for (const id of PERSONALITY_IDS) scores[id] += option.weights[id] ?? 0
    for (const mood of option.moods) moodCounts.set(mood, (moodCounts.get(mood) ?? 0) + 1)
  }

  let personalityId: PersonalityId = PERSONALITY_IDS[0]
  for (const id of PERSONALITY_IDS) {
    if (scores[id] > scores[personalityId]) personalityId = id
  }

  return {
    personalityId,
    scores,
    answers: { ...answers },
    recommendedBookIds: recommendBooks(personalityId, moodCounts).map((book) => book.id),
    completedAt,
  }
}

function recommendBooks(personalityId: PersonalityId, moodCounts: Map<ReadingMood, number>): Book[] {
  const genres = personalities[personalityId].genres
  const score = (book: Book) => {
    const genreIndex = genres.indexOf(book.genre)
    const genreScore = genreIndex === -1 ? 0 : 10 - genreIndex * 3
    const moodScore = book.moods.reduce((sum, mood) => sum + (moodCounts.get(mood) ?? 0), 0)
    return genreScore + moodScore
  }
  return [...books]
    .sort((a, b) => score(b) - score(a) || a.title.localeCompare(b.title))
    .slice(0, RECOMMENDATION_COUNT)
}
