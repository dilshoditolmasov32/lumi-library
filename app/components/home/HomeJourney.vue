<script setup lang="ts">
import { ArrowRight, BookOpen } from 'lucide-vue-next'

const { t, formatNumber } = useLocale()
const { shelf, counts, totalPagesRead } = useBookshelf()
const hydrated = useHydrated()

const currentlyReading = computed(() => shelf.value.filter((entry) => entry.status === 'reading').slice(0, 3))

const stats = computed(() => [
  { label: t('stats.shelved'), value: shelf.value.length },
  { label: t('stats.reading'), value: counts.value.reading },
  { label: t('stats.finished'), value: counts.value.finished },
  { label: t('stats.pagesRead'), value: totalPagesRead.value },
])
</script>

<template>
  <section class="container-page py-16 md:py-24" aria-labelledby="journey-title">
    <SectionHeading
      heading-id="journey-title"
      index="02"
      :eyebrow="t('home.journey.eyebrow')"
      :title="t('home.journey.title')"
    >
      <template #action>
        <NuxtLink to="/bookshelf" class="btn btn-secondary">
          {{ t('home.journey.cta') }}
          <ArrowRight aria-hidden="true" />
        </NuxtLink>
      </template>
    </SectionHeading>

    <div class="mt-12 grid gap-10 lg:grid-cols-12">
      <dl class="grid grid-cols-2 self-start border-t border-l border-line lg:col-span-4">
        <div v-for="stat in stats" :key="stat.label" class="border-r border-b border-line p-5 md:p-6">
          <dt class="eyebrow">{{ stat.label }}</dt>
          <dd class="mt-3 font-serif text-4xl text-ink tabular-nums md:text-5xl">
            <span v-if="hydrated">{{ formatNumber(stat.value) }}</span>
            <span v-else class="skeleton inline-block h-9 w-12 align-middle" />
          </dd>
        </div>
      </dl>

      <div class="lg:col-span-8">
        <h3 class="eyebrow">{{ t('home.journey.currently') }}</h3>

        <ul v-if="!hydrated" class="mt-5 space-y-4" aria-busy="true">
          <li v-for="n in 2" :key="n" class="flex gap-5 border-t border-line pt-5">
            <div class="skeleton h-24 w-16 shrink-0" />
            <div class="flex-1 space-y-3 pt-1">
              <div class="skeleton h-5 w-1/2" />
              <div class="skeleton h-3 w-1/3" />
              <div class="skeleton mt-4 h-1 w-full" />
            </div>
          </li>
          <li class="sr-only">{{ t('common.loading') }}</li>
        </ul>

        <ul v-else-if="currentlyReading.length" class="mt-5">
          <li
            v-for="entry in currentlyReading"
            :key="entry.bookId"
            class="flex items-center gap-5 border-t border-line py-5 md:gap-7"
          >
            <div class="w-16 shrink-0 md:w-[4.5rem]">
              <BookCover :book="entry.book" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-serif text-2xl leading-tight text-ink">{{ entry.book.title }}</p>
              <p class="mt-1 text-sm text-muted-strong">{{ entry.book.author }}</p>
              <ReadingProgress class="mt-4 max-w-md" :read="entry.pagesRead" :total="entry.book.pages" :title="entry.book.title" />
              <ReadButton v-if="entry.book.freeEdition" :book="entry.book" class="mt-4 sm:hidden" />
            </div>
            <ReadButton v-if="entry.book.freeEdition" :book="entry.book" class="hidden sm:inline-flex" />
            <NuxtLink v-else to="/bookshelf" class="btn btn-ghost btn-sm hidden sm:inline-flex">
              {{ t('home.journey.update') }}
            </NuxtLink>
          </li>
        </ul>

        <EmptyState
          v-else
          class="mt-5"
          compact
          heading-level="h3"
          :icon="BookOpen"
          :title="t('home.journey.emptyTitle')"
          :description="t('home.journey.emptyBody')"
        >
          <NuxtLink to="/discover" class="btn btn-primary btn-sm">{{ t('home.journey.emptyCta') }}</NuxtLink>
          <NuxtLink to="/bookshelf" class="btn btn-secondary btn-sm">{{ t('home.journey.cta') }}</NuxtLink>
        </EmptyState>
      </div>
    </div>
  </section>
</template>
