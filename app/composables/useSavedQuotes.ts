import { quotes } from '~/data/quotes'
import { seedSavedQuoteIds } from '~/data/seed'
import { isStringArray } from '~/utils/guards'
import { daysSinceEpoch } from '~/utils/dates'
import type { Quote } from '~/types'

/** The reader's saved quotes, stored as ids into the curated quote list. */
export function useSavedQuotes() {
  const savedIds = usePersistedState<string[]>('saved-quotes', () => [...seedSavedQuoteIds], isStringArray)
  const { show } = useToast()
  const { t } = useLocale()

  const savedQuotes = computed(() => quotes.filter((quote) => savedIds.value.includes(quote.id)))

  function isSaved(id: string) {
    return savedIds.value.includes(id)
  }

  function save(id: string) {
    if (!isSaved(id)) savedIds.value = [...savedIds.value, id]
  }

  /** Toggles a quote with toast feedback and returns whether it is now saved. */
  function toggle(quote: Quote): boolean {
    if (isSaved(quote.id)) {
      savedIds.value = savedIds.value.filter((id) => id !== quote.id)
      show(t('quotes.unsavedToast'), {
        action: { label: t('common.undo'), run: () => save(quote.id) },
      })
      return false
    }
    save(quote.id)
    show(t('quotes.savedToast'), { tone: 'success' })
    return true
  }

  return { quotes, savedIds, savedQuotes, isSaved, toggle }
}

/**
 * One quote per calendar day. The pick is made once during server rendering
 * and shared with the client through useState, so both always agree.
 */
export function useQuoteOfTheDay() {
  const index = useState<number>('lumi:quote-of-the-day', () => daysSinceEpoch() % quotes.length)
  return computed<Quote>(() => quotes[index.value] ?? quotes[0]!)
}
