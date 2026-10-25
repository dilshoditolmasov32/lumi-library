import { personalities } from '~/data/quiz'
import { isNullableQuizResult } from '~/utils/guards'
import type { QuizResult } from '~/types'

/** The reader's most recent quiz result, remembered between visits. */
export function useQuizResult() {
  const result = usePersistedState<QuizResult | null>('quiz-result', () => null, isNullableQuizResult)
  const personality = computed(() => (result.value ? personalities[result.value.personalityId] : null))

  function save(next: QuizResult) {
    result.value = next
  }

  function clear() {
    result.value = null
  }

  return { result, personality, save, clear }
}
