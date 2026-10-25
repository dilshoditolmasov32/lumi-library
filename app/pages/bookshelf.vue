<script setup lang="ts">
import { Library, ListFilter, Plus } from 'lucide-vue-next'
import { READING_STATUSES, type ReadingStatus } from '~/types'
import { queryString } from '~/utils/search'

const { t, formatNumber } = useLocale()
const { shelf, counts, totalPagesRead } = useBookshelf()
const hydrated = useHydrated()
const route = useRoute()
const router = useRouter()

useSeoMeta({
  title: t('bookshelf.metaTitle'),
  description: t('bookshelf.metaDescription'),
})

// Status filter lives in the URL (?status=reading) so it survives reloads.
type Filter = ReadingStatus | 'all'
const parseFilter = (value: unknown): Filter => {
  const status = queryString(value)
  return (READING_STATUSES as readonly string[]).includes(status) ? (status as ReadingStatus) : 'all'
}
const filter = computed<Filter>({
  get: () => parseFilter(route.query.status),
  set: (value) => router.replace({ query: value === 'all' ? {} : { status: value } }),
})

/** Display order for the grouped "All" view. */
const groupOrder: ReadingStatus[] = ['reading', 'to-read', 'finished']

const groups = computed(() =>
  (filter.value === 'all' ? groupOrder : [filter.value]).map((status) => ({
    status,
    entries: shelf.value.filter((entry) => entry.status === status),
  })),
)

const stats = computed(() => [
  { label: t('stats.shelved'), value: shelf.value.length },
  { label: t('stats.reading'), value: counts.value.reading },
  { label: t('stats.finished'), value: counts.value.finished },
  { label: t('stats.pagesRead'), value: totalPagesRead.value },
])

const adding = ref(false)
const addButton = ref<HTMLButtonElement | null>(null)

function closeAddPanel() {
  adding.value = false
  nextTick(() => addButton.value?.focus())
}
</script>

<template>
  <div class="container-page pt-12 md:pt-20">
    <SectionHeading
      :level="1"
      :eyebrow="t('bookshelf.eyebrow')"
      :title="t('bookshelf.title')"
      :description="t('bookshelf.lede')"
    >
      <template #action>
        <button
          ref="addButton"
          type="button"
          class="btn btn-primary"
          :aria-expanded="adding"
          aria-controls="add-book-panel"
          @click="adding ? closeAddPanel() : (adding = true)"
        >
          <Plus aria-hidden="true" />
          {{ t('bookshelf.addBook') }}
        </button>
      </template>
    </SectionHeading>

    <div id="add-book-panel">
      <Transition name="reveal">
        <AddBookPanel v-if="adding" class="mt-10" @close="closeAddPanel" />
      </Transition>
    </div>

    <!-- Loading: saved data is read from this browser after hydration -->
    <div v-if="!hydrated" class="mt-12 space-y-5" aria-busy="true">
      <span class="sr-only">{{ t('common.loading') }}</span>
      <div class="skeleton h-20 w-full" />
      <div v-for="n in 2" :key="n" class="sheet flex gap-6 p-7">
        <div class="skeleton h-40 w-28 shrink-0" />
        <div class="flex-1 space-y-3">
          <div class="skeleton h-3 w-24" />
          <div class="skeleton h-7 w-1/2" />
          <div class="skeleton h-4 w-1/3" />
          <div class="skeleton mt-6 h-9 w-72" />
        </div>
      </div>
    </div>

    <EmptyState
      v-else-if="shelf.length === 0"
      class="mt-12"
      :icon="Library"
      :title="t('bookshelf.emptyTitle')"
      :description="t('bookshelf.emptyBody')"
    >
      <NuxtLink to="/discover" class="btn btn-primary">{{ t('bookshelf.emptyCta') }}</NuxtLink>
      <button type="button" class="btn btn-secondary" @click="adding = true">{{ t('bookshelf.addBook') }}</button>
    </EmptyState>

    <template v-else>
      <dl class="mt-12 grid grid-cols-2 border-t border-l border-line md:grid-cols-4">
        <div v-for="stat in stats" :key="stat.label" class="border-r border-b border-line px-5 py-4">
          <dt class="eyebrow">{{ stat.label }}</dt>
          <dd class="mt-2 font-serif text-3xl tabular-nums">{{ formatNumber(stat.value) }}</dd>
        </div>
      </dl>

      <div role="group" :aria-label="t('bookshelf.filterLabel')" class="mt-10 flex flex-wrap items-center gap-2">
        <ListFilter class="mr-1 size-4 text-muted-strong" aria-hidden="true" />
        <button type="button" class="chip" :aria-pressed="filter === 'all'" @click="filter = 'all'">
          {{ t('bookshelf.all') }} <span class="chip-count">{{ shelf.length }}</span>
        </button>
        <button
          v-for="status in READING_STATUSES"
          :key="status"
          type="button"
          class="chip"
          :aria-pressed="filter === status"
          @click="filter = status"
        >
          {{ t(`statuses.${status}`) }} <span class="chip-count">{{ counts[status] }}</span>
        </button>
      </div>

      <div class="mt-10 space-y-14">
        <section v-for="group in groups" :key="group.status" :aria-labelledby="`group-${group.status}`">
          <h2 :id="`group-${group.status}`" class="flex items-baseline gap-3 border-b border-line pb-3 font-serif text-3xl">
            {{ t(`statuses.${group.status}`) }}
            <span class="font-sans text-sm text-muted-strong tabular-nums">{{ group.entries.length }}</span>
          </h2>

          <TransitionGroup v-if="group.entries.length" tag="ul" name="list" class="relative mt-6 space-y-5">
            <li v-for="entry in group.entries" :key="entry.bookId">
              <ShelfItem :entry="entry" />
            </li>
          </TransitionGroup>

          <EmptyState
            v-else
            class="mt-6"
            compact
            heading-level="h3"
            :title="t('bookshelf.emptyFilterTitle', { status: t(`statuses.${group.status}`) })"
            :description="t('bookshelf.emptyFilterBody')"
          >
            <button v-if="filter !== 'all'" type="button" class="btn btn-secondary btn-sm" @click="filter = 'all'">
              {{ t('bookshelf.emptyFilterCta') }}
            </button>
            <NuxtLink to="/discover" class="btn btn-ghost btn-sm">{{ t('bookshelf.emptyCta') }}</NuxtLink>
          </EmptyState>
        </section>
      </div>
    </template>
  </div>
</template>
