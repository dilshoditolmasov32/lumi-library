<script setup lang="ts">
import { Plus, X } from 'lucide-vue-next'
import { matchesQuery } from '~/utils/search'

const emit = defineEmits<{ close: [] }>()

const { t } = useLocale()
const { show } = useToast()
const { books } = useCatalog()
const { has, add, remove } = useBookshelf()

const search = ref('')
const searchField = ref<{ focus: () => void } | null>(null)

const available = computed(() => books.filter((book) => !has(book.id)))
const results = computed(() =>
  available.value.filter((book) => matchesQuery(search.value, [book.title, book.author])).slice(0, 8),
)

function addBook(bookId: string, title: string) {
  add(bookId)
  show(t('book.added', { title }), {
    tone: 'success',
    action: { label: t('common.undo'), run: () => remove(bookId) },
  })
}

onMounted(() => searchField.value?.focus())
</script>

<template>
  <section
    class="sheet p-5 shadow-soft md:p-7"
    aria-labelledby="add-book-title"
    @keydown.escape="emit('close')"
  >
    <div class="flex items-center justify-between gap-4">
      <h2 id="add-book-title" class="font-serif text-2xl">{{ t('bookshelf.addTitle') }}</h2>
      <button type="button" class="btn btn-ghost btn-icon" :aria-label="t('common.close')" @click="emit('close')">
        <X aria-hidden="true" />
      </button>
    </div>

    <div class="mt-5">
      <SearchField
        ref="searchField"
        v-model="search"
        :label="t('bookshelf.addSearchLabel')"
        :placeholder="t('bookshelf.addSearchPlaceholder')"
      />
    </div>

    <ul v-if="results.length" class="mt-4 max-h-96 divide-y divide-line overflow-y-auto">
      <li v-for="book in results" :key="book.id" class="flex items-center gap-4 py-3">
        <div class="w-10 shrink-0">
          <BookCover :book="book" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate font-serif text-lg leading-tight">{{ book.title }}</p>
          <p class="truncate text-xs text-muted-strong">{{ book.author }}</p>
        </div>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          :aria-label="t('book.addAria', { title: book.title })"
          @click="addBook(book.id, book.title)"
        >
          <Plus aria-hidden="true" />
          {{ t('bookshelf.add') }}
        </button>
      </li>
    </ul>

    <div v-else class="mt-6 text-sm text-muted-strong">
      <p>{{ available.length ? t('bookshelf.addEmpty') : t('bookshelf.addAllShelved') }}</p>
      <NuxtLink to="/discover" class="link-draw mt-2 inline-block text-burgundy">{{ t('bookshelf.addBrowse') }}</NuxtLink>
    </div>
  </section>
</template>
