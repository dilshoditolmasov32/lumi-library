<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next'
import type { DiaryEntry } from '~/types'

const props = defineProps<{ entry: DiaryEntry }>()
const emit = defineEmits<{ edit: []; delete: [] }>()

const { t, tn, formatDate } = useLocale()
const { getBook } = useCatalog()

const book = computed(() => getBook(props.entry.bookId))
const title = computed(() => book.value?.title ?? t('diary.unknownBook'))
const longDate = computed(() => formatDate(props.entry.date))
</script>

<template>
  <article class="grid grid-cols-[3.25rem_1fr] gap-5 md:grid-cols-[5rem_1fr] md:gap-8">
    <!-- Date column -->
    <div class="relative text-center">
      <time :datetime="entry.date" class="block">
        <span class="block font-serif text-4xl leading-none md:text-5xl">{{ formatDate(entry.date, { day: 'numeric' }) }}</span>
        <span class="eyebrow mt-1 block">{{ formatDate(entry.date, { weekday: 'short' }) }}</span>
        <span class="sr-only">{{ longDate }}</span>
      </time>
    </div>

    <div class="sheet min-w-0 p-5 transition-shadow duration-300 hover:shadow-soft md:p-7">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-4">
          <div v-if="book" class="w-10 shrink-0">
            <BookCover :book="book" />
          </div>
          <div class="min-w-0">
            <h3 class="font-serif text-2xl leading-tight">{{ title }}</h3>
            <p class="mt-1 text-sm text-muted-strong">
              {{ tn('units.pages', entry.pagesRead) }}
            </p>
          </div>
        </div>
        <span class="rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-sage-deep">
          {{ t(`moods.${entry.mood}`) }}
        </span>
      </div>

      <p v-if="entry.note" class="mt-5 font-serif text-xl leading-snug whitespace-pre-line text-ink-soft italic">
        {{ entry.note }}
      </p>

      <div class="-mx-2 mt-5 flex gap-1 border-t border-line pt-3">
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          :aria-label="t('diary.editAria', { title, date: longDate })"
          @click="emit('edit')"
        >
          <Pencil aria-hidden="true" />
          {{ t('common.edit') }}
        </button>
        <button
          type="button"
          class="btn btn-danger btn-sm"
          :aria-label="t('diary.deleteAria', { title, date: longDate })"
          @click="emit('delete')"
        >
          <Trash2 aria-hidden="true" />
          {{ t('common.delete') }}
        </button>
      </div>
    </div>
  </article>
</template>
