<script setup lang="ts">
import { ArrowRight, LockKeyhole } from 'lucide-vue-next'

const { t, tn, formatDate } = useLocale()
const { timeline } = useDiary()
const { getBook } = useCatalog()
const hydrated = useHydrated()

const latest = computed(() => timeline.value.slice(0, 2))
</script>

<template>
  <section class="border-y border-line bg-paper-deep/60" aria-labelledby="diary-preview-title">
    <div class="container-page grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-16">
      <div class="lg:col-span-5">
        <SectionHeading
          heading-id="diary-preview-title"
          index="03"
          :eyebrow="t('home.diary.eyebrow')"
          :title="t('home.diary.title')"
          :description="t('home.diary.body')"
        />
        <NuxtLink to="/diary" class="btn btn-primary mt-9">
          {{ t('home.diary.cta') }}
          <ArrowRight aria-hidden="true" />
        </NuxtLink>
      </div>

      <div class="lg:col-span-7">
        <div class="sheet relative p-6 shadow-soft md:p-10">
          <div class="flex items-center justify-between border-b border-line pb-4">
            <h3 class="eyebrow">{{ t('home.diary.latest') }}</h3>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3 py-1 text-xs text-sage-deep">
              <LockKeyhole class="size-3" aria-hidden="true" />
              {{ t('common.private') }}
            </span>
          </div>

          <div v-if="!hydrated" class="space-y-6 pt-6" aria-busy="true">
            <span class="sr-only">{{ t('common.loading') }}</span>
            <div v-for="n in 2" :key="n" class="space-y-3">
              <div class="skeleton h-3 w-1/4" />
              <div class="skeleton h-5 w-2/3" />
              <div class="skeleton h-3 w-full" />
            </div>
          </div>

          <ol v-else-if="latest.length" class="divide-y divide-line">
            <li v-for="entry in latest" :key="entry.id" class="py-6 last:pb-0">
              <p class="eyebrow">
                <time :datetime="entry.date">{{ formatDate(entry.date) }}</time>
                <span class="mx-1.5" aria-hidden="true">·</span>{{ t(`moods.${entry.mood}`) }}
              </p>
              <p class="mt-2 font-serif text-2xl leading-tight">
                {{ getBook(entry.bookId)?.title ?? t('diary.unknownBook') }}
                <span class="text-base text-muted-strong">— {{ tn('units.pages', entry.pagesRead) }}</span>
              </p>
              <p v-if="entry.note" class="mt-2 line-clamp-2 font-serif text-lg leading-snug text-ink-soft italic">
                {{ entry.note }}
              </p>
            </li>
          </ol>

          <p v-else class="pt-6 font-serif text-xl text-muted-strong italic">{{ t('home.diary.empty') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
