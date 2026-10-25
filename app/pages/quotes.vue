<script setup lang="ts">
import { BookmarkX, RefreshCw, SearchX } from 'lucide-vue-next'
import { QUOTE_THEMES, type QuoteTheme } from '~/types'
import { matchesQuery, queryString } from '~/utils/search'

const { t, tn } = useLocale()
const { quotes, savedQuotes } = useSavedQuotes()
const quoteOfTheDay = useQuoteOfTheDay()
const hydrated = useHydrated()
const route = useRoute()
const router = useRouter()

useSeoMeta({
  title: t('quotes.metaTitle'),
  description: t('quotes.metaDescription'),
})

// ---- Featured passage: starts on today's quote, steps through the rest ----
const featuredIndex = ref(Math.max(0, quotes.findIndex((quote) => quote.id === quoteOfTheDay.value.id)))
const featured = computed(() => quotes[featuredIndex.value] ?? quotes[0]!)
function nextFeatured() {
  featuredIndex.value = (featuredIndex.value + 1) % quotes.length
}

// ---- View, search and theme (view is kept in the URL: ?view=saved) ----
type View = 'all' | 'saved'
const view = computed<View>({
  get: () => (queryString(route.query.view) === 'saved' ? 'saved' : 'all'),
  set: (value) => router.replace({ query: value === 'saved' ? { view: 'saved' } : {} }),
})
const search = ref('')
const theme = ref<QuoteTheme | 'all'>('all')

const source = computed(() => (view.value === 'saved' ? savedQuotes.value : quotes))
const results = computed(() =>
  source.value.filter(
    (quote) =>
      (theme.value === 'all' || quote.themes.includes(theme.value)) &&
      matchesQuery(search.value, [quote.text, quote.author, quote.work]),
  ),
)

const filtersActive = computed(() => Boolean(search.value.trim()) || theme.value !== 'all')
function clearFilters() {
  search.value = ''
  theme.value = 'all'
}
</script>

<template>
  <div class="container-page pt-12 md:pt-20">
    <SectionHeading
      :level="1"
      :eyebrow="t('quotes.eyebrow')"
      :title="t('quotes.title')"
      :description="t('quotes.lede')"
    />

    <!-- Featured passage -->
    <section class="mt-14 rounded-[3px] border border-line bg-paper-deep/70 px-6 py-14 md:px-16 md:py-20" aria-labelledby="featured-quote">
      <h2 id="featured-quote" class="eyebrow text-center">{{ t('quotes.featured') }}</h2>
      <div class="mt-4 grid">
        <Transition name="swap" mode="out-in">
          <QuoteCard :key="featured.id" :quote="featured" variant="feature" />
        </Transition>
      </div>
      <div class="mt-6 flex justify-center">
        <button type="button" class="btn btn-secondary btn-sm" @click="nextFeatured">
          <RefreshCw aria-hidden="true" />
          {{ t('quotes.next') }}
        </button>
      </div>
    </section>

    <!-- Controls -->
    <div class="mt-16 space-y-5 border-y border-line py-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-center">
        <div role="group" :aria-label="t('quotes.tabsLabel')" class="flex gap-2">
          <button type="button" class="chip" :aria-pressed="view === 'all'" @click="view = 'all'">
            {{ t('quotes.all') }} <span class="chip-count">{{ quotes.length }}</span>
          </button>
          <button type="button" class="chip" :aria-pressed="view === 'saved'" @click="view = 'saved'">
            {{ t('quotes.saved') }}
            <span class="chip-count">{{ hydrated ? savedQuotes.length : '–' }}</span>
          </button>
        </div>
        <div class="md:ml-auto md:w-80">
          <SearchField v-model="search" :label="t('quotes.searchLabel')" :placeholder="t('quotes.searchPlaceholder')" />
        </div>
      </div>

      <div role="group" :aria-label="t('quotes.themeLabel')" class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap">
        <button type="button" class="chip shrink-0" :aria-pressed="theme === 'all'" @click="theme = 'all'">
          {{ t('quotes.allThemes') }}
        </button>
        <button
          v-for="option in QUOTE_THEMES"
          :key="option"
          type="button"
          class="chip shrink-0"
          :aria-pressed="theme === option"
          @click="theme = option"
        >
          {{ t(`themes.${option}`) }}
        </button>
      </div>
    </div>

    <!-- Results -->
    <div v-if="view === 'saved' && !hydrated" class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      <span class="sr-only">{{ t('common.loading') }}</span>
      <div v-for="n in 3" :key="n" class="skeleton h-64" />
    </div>

    <template v-else>
      <p class="mt-8 text-sm text-muted-strong" aria-live="polite" aria-atomic="true">
        {{ tn('units.quotes', results.length) }}
      </p>

      <TransitionGroup
        v-if="results.length"
        tag="ul"
        name="grid-fade"
        class="mt-6 grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <li v-for="quote in results" :key="quote.id" class="h-full">
          <QuoteCard :quote="quote" />
        </li>
      </TransitionGroup>

      <EmptyState
        v-else-if="view === 'saved' && savedQuotes.length === 0"
        class="mt-6"
        :icon="BookmarkX"
        :title="t('quotes.emptySavedTitle')"
        :description="t('quotes.emptySavedBody')"
      >
        <button type="button" class="btn btn-primary" @click="view = 'all'">{{ t('quotes.emptySavedCta') }}</button>
      </EmptyState>

      <EmptyState
        v-else
        class="mt-6"
        :icon="SearchX"
        :title="t('quotes.emptySearchTitle')"
        :description="t('quotes.emptySearchBody')"
      >
        <button v-if="filtersActive" type="button" class="btn btn-primary" @click="clearFilters">
          {{ t('quotes.emptySearchCta') }}
        </button>
      </EmptyState>
    </template>

    <p class="mt-16 max-w-2xl text-xs leading-relaxed text-muted-strong">{{ t('quotes.sourceNote') }}</p>
  </div>
</template>
