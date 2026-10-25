<script setup lang="ts">
import { BookOpen, SearchX, X } from 'lucide-vue-next'
import { GENRES, SORT_OPTIONS, type Book, type Genre, type SortOption } from '~/types'
import { matchesQuery, queryString, sortableAuthor, sortableTitle } from '~/utils/search'

const { t, tn } = useLocale()
const { books, genres, getCollection } = useCatalog()
const route = useRoute()
const router = useRouter()

useSeoMeta({
  title: t('discover.metaTitle'),
  description: t('discover.metaDescription'),
})

// ---- Filters, mirrored to the URL so results can be linked and shared ----
const parseGenre = (value: unknown): Genre | 'all' => {
  const genre = queryString(value)
  return (GENRES as readonly string[]).includes(genre) ? (genre as Genre) : 'all'
}
const parseSort = (value: unknown): SortOption => {
  const sort = queryString(value)
  return (SORT_OPTIONS as readonly string[]).includes(sort) ? (sort as SortOption) : 'featured'
}
const parseCollection = (value: unknown) => getCollection(queryString(value))?.id ?? null

const search = ref(queryString(route.query.q))
const genre = ref<Genre | 'all'>(parseGenre(route.query.genre))
const sort = ref<SortOption>(parseSort(route.query.sort))
const collectionId = ref<string | null>(parseCollection(route.query.collection))
const freeOnly = ref(queryString(route.query.free) === '1')

// Back/forward navigation and links from elsewhere update the filters.
watch(
  () => route.query,
  (query) => {
    if (queryString(query.q) !== search.value.trim()) search.value = queryString(query.q)
    genre.value = parseGenre(query.genre)
    sort.value = parseSort(query.sort)
    collectionId.value = parseCollection(query.collection)
    freeOnly.value = queryString(query.free) === '1'
  },
)

let urlTimer: ReturnType<typeof setTimeout> | undefined
watch([search, genre, sort, collectionId, freeOnly], () => {
  clearTimeout(urlTimer)
  urlTimer = setTimeout(() => {
    const query: Record<string, string> = {}
    if (search.value.trim()) query.q = search.value.trim()
    if (genre.value !== 'all') query.genre = genre.value
    if (sort.value !== 'featured') query.sort = sort.value
    if (collectionId.value) query.collection = collectionId.value
    if (freeOnly.value) query.free = '1'
    router.replace({ query })
  }, 250)
})
onBeforeUnmount(() => clearTimeout(urlTimer))

const collection = computed(() => (collectionId.value ? getCollection(collectionId.value) : undefined))

// ---- Results ----
const freeCount = books.filter((book) => book.freeEdition).length

/** Books matching the search, collection and "free" filters (before the genre filter). */
const searched = computed(() =>
  books.filter(
    (book) =>
      (!collection.value || collection.value.bookIds.includes(book.id)) &&
      (!freeOnly.value || Boolean(book.freeEdition)) &&
      matchesQuery(search.value, [book.title, book.author]),
  ),
)

const genreCounts = computed(() => {
  const counts = new Map<Genre, number>()
  for (const book of searched.value) counts.set(book.genre, (counts.get(book.genre) ?? 0) + 1)
  return counts
})

const sorters: Record<SortOption, (a: Book, b: Book) => number> = {
  featured: (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
  title: (a, b) => sortableTitle(a.title).localeCompare(sortableTitle(b.title)),
  author: (a, b) => sortableAuthor(a.author).localeCompare(sortableAuthor(b.author)) || a.year - b.year,
  'year-desc': (a, b) => b.year - a.year,
  'year-asc': (a, b) => a.year - b.year,
  'pages-asc': (a, b) => a.pages - b.pages,
}

const results = computed(() =>
  searched.value.filter((book) => genre.value === 'all' || book.genre === genre.value).sort(sorters[sort.value]),
)

const hasFilters = computed(
  () => Boolean(search.value.trim()) || genre.value !== 'all' || collectionId.value !== null || freeOnly.value,
)

function resetFilters() {
  search.value = ''
  genre.value = 'all'
  collectionId.value = null
  freeOnly.value = false
}
</script>

<template>
  <div class="container-page pt-12 md:pt-20">
    <SectionHeading
      :level="1"
      :eyebrow="t('discover.eyebrow')"
      :title="t('discover.title')"
      :description="t('discover.lede', { count: books.length })"
    />

    <!-- Controls -->
    <div class="mt-12 space-y-5 border-y border-line py-6" role="search">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div class="flex-1">
          <SearchField
            v-model="search"
            :label="t('discover.searchLabel')"
            :placeholder="t('discover.searchPlaceholder')"
          />
        </div>
        <div class="sm:w-56">
          <label for="sort" class="label">{{ t('discover.sortLabel') }}</label>
          <select id="sort" v-model="sort" class="field">
            <option v-for="option in SORT_OPTIONS" :key="option" :value="option">{{ t(`sort.${option}`) }}</option>
          </select>
        </div>
      </div>

      <div class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap">
        <button type="button" class="chip shrink-0" :aria-pressed="freeOnly" @click="freeOnly = !freeOnly">
          <BookOpen class="size-3.5" aria-hidden="true" />
          {{ t('discover.freeOnly') }}
          <span class="chip-count">{{ freeCount }}</span>
        </button>
        <span class="mx-1 w-px shrink-0 self-stretch bg-line-strong" aria-hidden="true" />
        <div role="group" :aria-label="t('discover.genreLabel')" class="contents">
        <button type="button" class="chip shrink-0" :aria-pressed="genre === 'all'" @click="genre = 'all'">
          {{ t('discover.allGenres') }}
          <span class="chip-count">{{ searched.length }}</span>
        </button>
        <button
          v-for="option in genres"
          :key="option"
          type="button"
          class="chip shrink-0"
          :aria-pressed="genre === option"
          @click="genre = option"
        >
          {{ t(`genres.${option}`) }}
          <span class="chip-count">{{ genreCounts.get(option) ?? 0 }}</span>
        </button>
        </div>
      </div>

      <div v-if="collection" class="flex flex-wrap items-center gap-3 text-sm">
        <span class="eyebrow">{{ t('discover.collection') }}</span>
        <span class="inline-flex items-center gap-1 rounded-full bg-burgundy-soft py-1 pr-1 pl-3 text-burgundy-deep">
          <span class="font-medium">{{ collection.title }}</span>
          <button
            type="button"
            class="grid size-7 place-items-center rounded-full hover:bg-burgundy/10"
            :aria-label="t('discover.clearCollection')"
            @click="collectionId = null"
          >
            <X class="size-3.5" aria-hidden="true" />
          </button>
        </span>
        <span class="text-muted-strong">{{ collection.description }}</span>
      </div>
    </div>

    <div class="mt-8 flex items-center justify-between gap-4">
      <p class="text-sm text-muted-strong" aria-live="polite" aria-atomic="true">
        {{ tn('units.books', results.length) }}
      </p>
      <button v-if="hasFilters" type="button" class="btn btn-ghost btn-sm" @click="resetFilters">
        {{ t('discover.emptyReset') }}
      </button>
    </div>

    <TransitionGroup
      v-if="results.length"
      tag="ul"
      name="grid-fade"
      class="mt-8 grid grid-cols-2 gap-x-5 gap-y-14 sm:gap-x-8 md:grid-cols-3 lg:grid-cols-4"
    >
      <li v-for="book in results" :key="book.id">
        <BookCard :book="book" heading-level="h2" />
      </li>
    </TransitionGroup>

    <EmptyState
      v-else
      class="mt-8"
      :icon="SearchX"
      :title="t('discover.emptyTitle')"
      :description="t('discover.emptyBody')"
    >
      <button type="button" class="btn btn-primary" @click="resetFilters">{{ t('discover.emptyReset') }}</button>
    </EmptyState>

    <p class="mt-16 text-xs text-muted-strong">{{ t('discover.editionNote') }}</p>
  </div>
</template>
