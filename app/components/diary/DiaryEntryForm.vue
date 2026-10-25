<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next'
import { DIARY_MOODS, type DiaryDraft, type DiaryEntry, type DiaryMood } from '~/types'
import { isISODate, localTodayISO } from '~/utils/dates'

const props = defineProps<{
  /** When provided, the form edits this entry instead of creating one. */
  entry?: DiaryEntry
}>()

const emit = defineEmits<{
  submit: [draft: DiaryDraft]
  cancel: []
}>()

const { t, tn } = useLocale()
const { books } = useCatalog()
const { shelf } = useBookshelf()

const uid = useId()
const ids = {
  book: `${uid}-book`,
  date: `${uid}-date`,
  pages: `${uid}-pages`,
  mood: `${uid}-mood`,
  note: `${uid}-note`,
}

// The form only mounts after a click, so reading the local date here is safe.
const today = localTodayISO()

const form = reactive({
  bookId: props.entry?.bookId ?? shelf.value.find((item) => item.status === 'reading')?.bookId ?? '',
  date: props.entry?.date ?? today,
  // Vue casts number inputs to numbers, but an emptied field stays a string.
  pagesRead: (props.entry?.pagesRead ?? '') as number | string,
  mood: (props.entry?.mood ?? '') as DiaryMood | '',
  note: props.entry?.note ?? '',
})

// Books on the shelf first, then the rest of the catalogue.
const shelfBooks = computed(() => shelf.value.map((item) => item.book))
const otherBooks = computed(() => books.filter((book) => !shelfBooks.value.some((own) => own.id === book.id)))

// ---- Validation ----
type Field = keyof typeof form
const submitted = ref(false)

const errors = computed(() => {
  const result: Partial<Record<Field, string>> = {}
  if (!form.bookId) result.bookId = t('diary.errors.bookRequired')
  if (!form.date) result.date = t('diary.errors.dateRequired')
  else if (!isISODate(form.date)) result.date = t('diary.errors.dateInvalid')
  else if (form.date > today) result.date = t('diary.errors.dateFuture')
  const pages = typeof form.pagesRead === 'number' ? form.pagesRead : Number.NaN
  if (!Number.isInteger(pages) || pages < 1 || pages > DIARY_PAGES_MAX) {
    result.pagesRead = t('diary.errors.pagesRange', { max: DIARY_PAGES_MAX })
  }
  if (!form.mood) result.mood = t('diary.errors.moodRequired')
  if (form.note.length > DIARY_NOTE_MAX) result.note = t('diary.errors.noteTooLong', { max: DIARY_NOTE_MAX })
  return result
})

const visibleErrors = computed(() => (submitted.value ? errors.value : {}))
const errorCount = computed(() => Object.keys(visibleErrors.value).length)

const fieldOrder: Field[] = ['bookId', 'date', 'pagesRead', 'mood', 'note']
const fieldIds: Record<Field, string> = {
  bookId: ids.book,
  date: ids.date,
  pagesRead: ids.pages,
  mood: ids.mood,
  note: ids.note,
}

function onSubmit() {
  submitted.value = true
  const firstInvalid = fieldOrder.find((field) => errors.value[field])
  if (firstInvalid) {
    nextTick(() => {
      const el = document.getElementById(fieldIds[firstInvalid])
      // For the mood fieldset, focus its first radio.
      const target = el?.matches('input, select, textarea') ? el : el?.querySelector<HTMLElement>('input')
      target?.focus()
    })
    return
  }
  if (!form.mood) return
  emit('submit', {
    bookId: form.bookId,
    date: form.date,
    pagesRead: Number(form.pagesRead),
    mood: form.mood,
    note: form.note.trim(),
  })
}

const titleId = `${uid}-title`

// Put the cursor in the first field as soon as the form opens.
onMounted(() => document.getElementById(ids.book)?.focus())
</script>

<template>
  <form
    class="sheet p-6 shadow-soft md:p-9"
    :aria-labelledby="titleId"
    novalidate
    @submit.prevent="onSubmit"
    @keydown.escape="emit('cancel')"
  >
    <h2 :id="titleId" class="font-serif text-3xl">{{ entry ? t('diary.editTitle') : t('diary.createTitle') }}</h2>

    <div
      v-if="errorCount"
      role="alert"
      class="mt-5 flex items-start gap-2 rounded-xs border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
    >
      <CircleAlert class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {{ tn('diary.errors.summary', errorCount) }}
    </div>

    <div class="mt-7 grid gap-6 md:grid-cols-2">
      <div class="md:col-span-2">
        <label :for="ids.book" class="label">{{ t('diary.book') }}</label>
        <select
          :id="ids.book"
          v-model="form.bookId"
          class="field"
          :aria-invalid="Boolean(visibleErrors.bookId)"
          :aria-describedby="visibleErrors.bookId ? `${ids.book}-error` : undefined"
        >
          <option value="" disabled>{{ t('diary.bookPlaceholder') }}</option>
          <optgroup v-if="shelfBooks.length" :label="t('diary.shelfGroup')">
            <option v-for="book in shelfBooks" :key="book.id" :value="book.id">{{ book.title }} — {{ book.author }}</option>
          </optgroup>
          <optgroup :label="t('diary.catalogGroup')">
            <option v-for="book in otherBooks" :key="book.id" :value="book.id">{{ book.title }} — {{ book.author }}</option>
          </optgroup>
        </select>
        <p v-if="visibleErrors.bookId" :id="`${ids.book}-error`" class="field-error">{{ visibleErrors.bookId }}</p>
      </div>

      <div>
        <label :for="ids.date" class="label">{{ t('diary.date') }}</label>
        <input
          :id="ids.date"
          v-model="form.date"
          type="date"
          class="field"
          :max="today"
          :aria-invalid="Boolean(visibleErrors.date)"
          :aria-describedby="visibleErrors.date ? `${ids.date}-error` : undefined"
        />
        <p v-if="visibleErrors.date" :id="`${ids.date}-error`" class="field-error">{{ visibleErrors.date }}</p>
      </div>

      <div>
        <label :for="ids.pages" class="label">{{ t('diary.pagesRead') }}</label>
        <input
          :id="ids.pages"
          v-model="form.pagesRead"
          type="number"
          inputmode="numeric"
          min="1"
          :max="DIARY_PAGES_MAX"
          step="1"
          class="field tabular-nums"
          :aria-invalid="Boolean(visibleErrors.pagesRead)"
          :aria-describedby="visibleErrors.pagesRead ? `${ids.pages}-error` : undefined"
        />
        <p v-if="visibleErrors.pagesRead" :id="`${ids.pages}-error`" class="field-error">{{ visibleErrors.pagesRead }}</p>
      </div>

      <fieldset
        :id="ids.mood"
        class="md:col-span-2"
        :aria-describedby="visibleErrors.mood ? `${ids.mood}-error` : undefined"
      >
        <legend class="label">{{ t('diary.mood') }}</legend>
        <div class="flex flex-wrap gap-2">
          <label v-for="mood in DIARY_MOODS" :key="mood" class="mood-option">
            <input v-model="form.mood" type="radio" class="sr-only" :name="`${uid}-mood`" :value="mood" />
            <span class="chip">{{ t(`moods.${mood}`) }}</span>
          </label>
        </div>
        <p v-if="visibleErrors.mood" :id="`${ids.mood}-error`" class="field-error">{{ visibleErrors.mood }}</p>
      </fieldset>

      <div class="md:col-span-2">
        <label :for="ids.note" class="label">
          {{ t('diary.note') }} <span class="font-normal text-muted-strong">({{ t('diary.noteOptional') }})</span>
        </label>
        <textarea
          :id="ids.note"
          v-model="form.note"
          rows="4"
          class="field"
          :placeholder="t('diary.notePlaceholder')"
          :aria-invalid="Boolean(visibleErrors.note)"
          :aria-describedby="`${ids.note}-count`"
        />
        <p
          :id="`${ids.note}-count`"
          class="mt-1.5 text-xs tabular-nums"
          :class="visibleErrors.note || form.note.length > DIARY_NOTE_MAX ? 'text-danger' : 'text-muted-strong'"
        >
          {{ visibleErrors.note ?? t('diary.noteCount', { count: form.note.length, max: DIARY_NOTE_MAX }) }}
        </p>
      </div>
    </div>

    <div class="mt-8 flex flex-wrap justify-end gap-3 border-t border-line pt-6">
      <button type="button" class="btn btn-ghost" @click="emit('cancel')">{{ t('common.cancel') }}</button>
      <button type="submit" class="btn btn-primary">{{ entry ? t('diary.update') : t('diary.save') }}</button>
    </div>
  </form>
</template>

<style scoped>
.mood-option {
  cursor: pointer;
}

.mood-option input:checked + .chip {
  background-color: var(--color-burgundy);
  border-color: var(--color-burgundy);
  color: var(--color-paper);
}

.mood-option input:focus-visible + .chip {
  outline: 2px solid var(--color-burgundy);
  outline-offset: 2px;
}
</style>
