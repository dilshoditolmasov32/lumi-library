<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import { READING_STATUSES, type ShelfEntry } from '~/types'

const props = defineProps<{ entry: ShelfEntry }>()

const { t, formatDate } = useLocale()
const { show } = useToast()
const { setStatus, setProgress, setRating, setNote, removeWithFeedback } = useBookshelf()

const uid = useId()
const book = computed(() => props.entry.book)

// ---- Progress: a live draft while dragging/typing, committed on change ----
// An emptied number input yields '' rather than a number.
const pagesDraft = ref<number | string>(props.entry.pagesRead)
const draftPages = computed(() => (typeof pagesDraft.value === 'number' ? pagesDraft.value : props.entry.pagesRead))
watch(
  () => props.entry.pagesRead,
  (value) => (pagesDraft.value = value),
)

function commitPages() {
  const value = pagesDraft.value
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    pagesDraft.value = props.entry.pagesRead
    return
  }
  setProgress(book.value.id, value)
  // Reflect clamping (e.g. typing 9999) back into the input.
  pagesDraft.value = Math.min(book.value.pages, Math.max(0, Math.round(value)))
}

// ---- Rating ----
const rating = computed({
  get: () => props.entry.rating,
  set: (value: number | null) => setRating(book.value.id, value),
})

// ---- Private note ----
const noteMax = NOTE_MAX_LENGTH
const noteDraft = ref(props.entry.note)
watch(
  () => props.entry.note,
  (value) => (noteDraft.value = value),
)
const noteChanged = computed(() => noteDraft.value.trim() !== props.entry.note)
const noteTooLong = computed(() => noteDraft.value.length > noteMax)

function saveNote() {
  if (noteTooLong.value || !noteChanged.value) return
  setNote(book.value.id, noteDraft.value.trim())
  show(t('bookshelf.noteSaved'), { tone: 'success' })
}
</script>

<template>
  <article class="sheet grid gap-6 p-5 sm:grid-cols-[7rem_1fr] sm:p-7 md:gap-8">
    <div class="w-24 sm:w-28">
      <BookCover :book="book" />
    </div>

    <div class="min-w-0">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="eyebrow">{{ t(`genres.${book.genre}`) }}<span class="mx-1.5" aria-hidden="true">·</span>{{ book.year }}</p>
          <h3 class="mt-2 font-serif text-[1.75rem] leading-tight">{{ book.title }}</h3>
          <p class="mt-1 text-sm text-muted-strong">{{ book.author }}</p>
          <ReadButton :book="book" class="mt-4" />
        </div>
        <button
          type="button"
          class="btn btn-danger btn-sm shrink-0"
          :aria-label="t('book.removeAria', { title: book.title })"
          @click="removeWithFeedback(book.id)"
        >
          <Trash2 aria-hidden="true" />
          <span class="hidden sm:inline">{{ t('common.remove') }}</span>
        </button>
      </div>

      <!-- Status -->
      <fieldset class="mt-6">
        <legend class="label">{{ t('bookshelf.status') }}</legend>
        <div class="inline-flex flex-wrap rounded-xs border border-line-strong p-0.5">
          <label v-for="status in READING_STATUSES" :key="status" class="segment">
            <input
              type="radio"
              class="sr-only"
              :name="`${uid}-status`"
              :value="status"
              :checked="entry.status === status"
              @change="setStatus(book.id, status)"
            />
            <span>{{ t(`statuses.${status}`) }}</span>
          </label>
        </div>
      </fieldset>

      <!-- Progress -->
      <div class="mt-6">
        <label :for="`${uid}-pages`" class="label">{{ t('bookshelf.pagesRead') }}</label>
        <div class="flex flex-wrap items-center gap-4">
          <input
            :id="`${uid}-range`"
            v-model.number="pagesDraft"
            type="range"
            min="0"
            :max="book.pages"
            step="1"
            class="range min-w-40 flex-1"
            :aria-label="t('bookshelf.pagesRead')"
            :aria-valuetext="t('progress.summary', { percent: Math.round((draftPages / book.pages) * 100), read: draftPages, total: book.pages })"
            @change="commitPages"
          />
          <div class="flex items-center gap-2 text-sm text-muted-strong">
            <input
              :id="`${uid}-pages`"
              v-model.number="pagesDraft"
              type="number"
              inputmode="numeric"
              min="0"
              :max="book.pages"
              class="field w-24 text-center tabular-nums"
              @change="commitPages"
              @keydown.enter.prevent="commitPages"
            />
            <span>{{ t('bookshelf.pagesOf', { total: book.pages }) }}</span>
          </div>
        </div>
        <ReadingProgress class="mt-4" :read="entry.pagesRead" :total="book.pages" :title="book.title" />
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-[auto_1fr]">
        <StarRating v-model="rating" />

        <!-- Private note -->
        <div>
          <label :for="`${uid}-note`" class="label">{{ t('bookshelf.note') }}</label>
          <textarea
            :id="`${uid}-note`"
            v-model="noteDraft"
            rows="2"
            class="field min-h-20"
            :placeholder="t('bookshelf.notePlaceholder')"
            :aria-invalid="noteTooLong"
            :aria-describedby="`${uid}-note-help`"
            @keydown.ctrl.enter="saveNote"
            @keydown.meta.enter="saveNote"
          />
          <div class="mt-2 flex items-center justify-between gap-3">
            <p
              :id="`${uid}-note-help`"
              class="text-xs tabular-nums"
              :class="noteTooLong ? 'text-danger' : 'text-muted-strong'"
            >
              {{ noteTooLong ? t('bookshelf.noteTooLong', { max: noteMax }) : t('bookshelf.noteCount', { count: noteDraft.length, max: noteMax }) }}
            </p>
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              :disabled="!noteChanged || noteTooLong"
              @click="saveNote"
            >
              {{ t('bookshelf.saveNote') }}
            </button>
          </div>
        </div>
      </div>

      <p class="mt-5 text-xs text-muted-strong">{{ t('bookshelf.added', { date: formatDate(entry.addedAt) }) }}</p>
    </div>
  </article>
</template>

<style scoped>
.segment {
  position: relative;
  cursor: pointer;
}

.segment span {
  display: inline-flex;
  align-items: center;
  min-height: 2.25rem;
  padding: 0 0.875rem;
  border-radius: 1px;
  font-size: 0.8125rem;
  color: var(--color-ink-soft);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.segment:hover span {
  color: var(--color-ink);
}

.segment input:checked + span {
  background-color: var(--color-ink);
  color: var(--color-paper);
}

.segment input:focus-visible + span {
  outline: 2px solid var(--color-burgundy);
  outline-offset: 2px;
}

.range {
  accent-color: var(--color-burgundy);
  height: 1.5rem;
}
</style>
