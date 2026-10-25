<script setup lang="ts">
import { ArrowLeft, ArrowRight, BookCheck, BookLock, CircleAlert, RotateCcw } from 'lucide-vue-next'
import { READER_FONT_SIZES, type ReaderChapter, type ReaderFontSize, type ReaderManifest } from '~/types'

definePageMeta({ layout: 'reader' })

const route = useRoute()
const router = useRouter()
const { t, formatNumber } = useLocale()
const { show } = useToast()
const { getBook } = useCatalog()
const { find, add, setProgress, setStatus, remove } = useBookshelf()
const { get: getPosition, set: setPosition } = useReadingPositions()
const fontSize = useReaderFontSize()
const hydrated = useHydrated()

const bookId = String(route.params.id)
const foundBook = getBook(bookId)
if (!foundBook) {
  throw createError({ statusCode: 404, statusMessage: 'Book not found' })
}
const book = foundBook
const readable = Boolean(book.freeEdition)

useSeoMeta({
  title: book.title,
  description: book.synopsis,
})

// ---------------------------------------------------------------- loading
type Status = 'loading' | 'ready' | 'error'
const status = ref<Status>('loading')
const manifest = ref<ReaderManifest | null>(null)
const chapter = ref<ReaderChapter | null>(null)
const chapterIndex = ref(0)
const chapterCache = new Map<number, ReaderChapter>()

async function fetchChapter(index: number): Promise<ReaderChapter> {
  const cached = chapterCache.get(index)
  if (cached) return cached
  const data = await $fetch<ReaderChapter>(`/books/${bookId}/${index}.json`)
  chapterCache.set(index, data)
  return data
}

/** Opens a chapter and scrolls to `offset` (0 = top, 1 = end). */
async function openChapter(index: number, offset = 0) {
  if (!manifest.value) return
  const target = Math.min(Math.max(0, index), manifest.value.chapters.length - 1)
  status.value = 'loading'
  try {
    chapter.value = await fetchChapter(target)
    chapterIndex.value = target
    status.value = 'ready'
    await nextTick()
    scrollToOffset(offset)
    savePosition()
    // Fetch the next chapter in the background so "Next" feels instant.
    if (target + 1 < manifest.value.chapters.length) fetchChapter(target + 1).catch(() => {})
  } catch {
    status.value = 'error'
  }
}

async function start() {
  if (!readable) return
  status.value = 'loading'
  try {
    manifest.value ??= await $fetch<ReaderManifest>(`/books/${bookId}/manifest.json`)
  } catch {
    status.value = 'error'
    return
  }
  const saved = getPosition(bookId)
  await openChapter(saved?.chapter ?? 0, saved?.offset ?? 0)
  // (status is re-read here: openChapter changed it while we awaited)
  if (saved && (status.value as Status) === 'ready' && chapter.value && (saved.chapter > 0 || saved.offset > 0.02)) {
    show(t('reader.resumed', { chapter: chapter.value.title }))
  }
}

function retry() {
  if (manifest.value) openChapter(chapterIndex.value)
  else start()
}

// Saved positions load after hydration, so wait for that before opening the book.
onMounted(() => {
  if (hydrated.value) start()
  else {
    const stop = watch(hydrated, (ready) => {
      if (!ready) return
      stop()
      start()
    })
  }
})

// ---------------------------------------------------------------- position & progress
const article = ref<HTMLElement | null>(null)
const chapterHeading = ref<HTMLElement | null>(null)
const offset = ref(0)

function currentOffset(): number {
  const el = article.value
  if (!el) return 0
  const top = el.getBoundingClientRect().top + window.scrollY
  const scrollable = el.offsetHeight - window.innerHeight
  if (scrollable <= 0) return 1
  return Math.min(1, Math.max(0, (window.scrollY - top) / scrollable))
}

function scrollToOffset(value: number) {
  const el = article.value
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY
  const scrollable = Math.max(0, el.offsetHeight - window.innerHeight)
  window.scrollTo({ top: value > 0 ? top + value * scrollable : 0, behavior: 'instant' })
  offset.value = value
}

const chapters = computed(() => manifest.value?.chapters ?? [])
const isLast = computed(() => chapterIndex.value === chapters.value.length - 1)

/** Position in the whole book, weighted by word count. */
const bookProgress = computed(() => {
  const m = manifest.value
  if (!m || m.totalWords === 0) return 0
  const before = m.chapters.slice(0, chapterIndex.value).reduce((sum, c) => sum + c.words, 0)
  const here = (m.chapters[chapterIndex.value]?.words ?? 0) * offset.value
  return Math.min(1, (before + here) / m.totalWords)
})

/** Mirrors reading progress onto the bookshelf (never moving it backwards). */
function syncShelf() {
  let entry = find(bookId)
  if (!entry) {
    // Moving past the first chapter means "I'm reading this" — add it to the shelf.
    if (chapterIndex.value < 1) return
    add(bookId, 'reading')
    show(t('reader.addedToShelf', { title: book.title }), {
      tone: 'success',
      action: { label: t('common.undo'), run: () => remove(bookId) },
    })
    entry = find(bookId)
  }
  if (!entry || entry.status === 'finished') return
  // Stop one page short: finishing is marked explicitly at the end of the book.
  const pages = Math.min(book.pages - 1, Math.round(book.pages * bookProgress.value))
  if (pages > entry.pagesRead) setProgress(bookId, pages)
}

function savePosition() {
  offset.value = currentOffset()
  setPosition(bookId, chapterIndex.value, offset.value)
  syncShelf()
}

let scrollTimer: ReturnType<typeof setTimeout> | undefined
function onScroll() {
  offset.value = currentOffset()
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(savePosition, 600)
}

// ---------------------------------------------------------------- navigation
async function goTo(index: number) {
  if (index === chapterIndex.value || index < 0 || index >= chapters.value.length) return
  contentsOpen.value = false
  await openChapter(index)
  // Move focus to the new chapter title for keyboard and screen-reader users.
  chapterHeading.value?.focus({ preventScroll: true })
}

function goBack() {
  if (window.history.state?.back) router.back()
  else navigateTo('/discover')
}

function onKeydown(event: KeyboardEvent) {
  if (contentsOpen.value || event.altKey || event.ctrlKey || event.metaKey) return
  const target = event.target as HTMLElement | null
  if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
  if (event.key === 'ArrowRight') goTo(chapterIndex.value + 1)
  else if (event.key === 'ArrowLeft') goTo(chapterIndex.value - 1)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  clearTimeout(scrollTimer)
  if (status.value === 'ready') savePosition()
})

// ---------------------------------------------------------------- text size
const sizes = READER_FONT_SIZES
const MIN_SIZE = sizes[0]
const MAX_SIZE = sizes[sizes.length - 1] ?? MIN_SIZE
function changeSize(step: 1 | -1) {
  const index = sizes.indexOf(fontSize.value) + step
  const next: ReaderFontSize | undefined = sizes[index]
  if (next === undefined) return
  // Keep the same place in the chapter while the text reflows.
  const keep = currentOffset()
  fontSize.value = next
  nextTick(() => scrollToOffset(keep))
}

// ---------------------------------------------------------------- end of book
const contentsOpen = ref(false)
const finished = computed(() => find(bookId)?.status === 'finished')

function markFinished() {
  if (find(bookId)) setStatus(bookId, 'finished')
  else {
    add(bookId, 'finished')
    show(t('bookshelf.finishedToast', { title: book.title }), { tone: 'success' })
  }
}
</script>

<template>
  <div>
    <ReaderToolbar
      :book="book"
      :chapter-title="status === 'ready' ? chapter?.title : undefined"
      :progress="bookProgress"
      :can-shrink="fontSize > MIN_SIZE"
      :can-grow="fontSize < MAX_SIZE"
      :show-controls="readable && Boolean(manifest)"
      @back="goBack"
      @smaller="changeSize(-1)"
      @larger="changeSize(1)"
      @contents="contentsOpen = true"
    />

    <main id="main" tabindex="-1" class="focus:outline-none">
      <!-- Copyrighted books: explain why there's no text -->
      <div v-if="!readable" class="mx-auto max-w-2xl px-5 py-16 md:py-24">
        <div class="mx-auto w-32">
          <BookCover :book="book" />
        </div>
        <EmptyState
          class="mt-10"
          :icon="BookLock"
          :title="t('reader.unavailableTitle')"
          :description="t('reader.unavailableBody', { title: book.title })"
        >
          <NuxtLink :to="{ path: '/discover', query: { free: '1' } }" class="btn btn-primary">
            {{ t('reader.unavailableCta') }}
          </NuxtLink>
          <ShelfButton :book="book" />
        </EmptyState>
      </div>

      <template v-else>
        <!-- Loading -->
        <div v-if="status === 'loading'" class="mx-auto max-w-[38rem] px-5 py-16 md:py-24" aria-busy="true">
          <p class="sr-only" role="status">{{ t('reader.loading') }}</p>
          <div class="skeleton mx-auto h-3 w-20" />
          <div class="skeleton mx-auto mt-5 h-10 w-2/3" />
          <div class="mt-14 space-y-3">
            <div v-for="n in 12" :key="n" class="skeleton h-4" :class="n % 4 === 0 ? 'w-2/3' : 'w-full'" />
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="status === 'error'" class="mx-auto max-w-2xl px-5 py-16 md:py-24">
          <EmptyState :icon="CircleAlert" :title="t('error.genericTitle')" :description="t('reader.loadError')">
            <button type="button" class="btn btn-primary" @click="retry">
              <RotateCcw aria-hidden="true" />
              {{ t('reader.retry') }}
            </button>
          </EmptyState>
        </div>

        <!-- Chapter -->
        <article
          v-else-if="chapter"
          ref="article"
          class="mx-auto max-w-[38rem] px-5 pt-14 pb-10 md:pt-20"
          aria-labelledby="chapter-title"
        >
          <p class="eyebrow text-center">
            {{ t('reader.chapterOf', { current: formatNumber(chapterIndex + 1), total: formatNumber(chapters.length) }) }}
          </p>
          <h2
            id="chapter-title"
            ref="chapterHeading"
            tabindex="-1"
            class="mt-4 text-center font-serif text-[2rem] leading-tight focus:outline-none md:text-[2.75rem]"
          >
            {{ chapter.title }}
          </h2>
          <div class="mx-auto mt-7 mb-12 h-px w-12 bg-burgundy" aria-hidden="true" />

          <ReaderChapterText :chapter="chapter" :font-size="fontSize" />

          <!-- End of the book -->
          <section v-if="isLast" class="mt-20 border-t border-line pt-14 text-center" aria-labelledby="end-title">
            <h2 id="end-title" class="font-serif text-4xl italic">{{ t('reader.endTitle') }}</h2>
            <p class="mt-3 text-sm text-muted-strong">{{ t('reader.endBody', { title: book.title }) }}</p>
            <div class="mt-7 flex flex-wrap justify-center gap-3">
              <button v-if="!finished" type="button" class="btn btn-primary" @click="markFinished">
                <BookCheck aria-hidden="true" />
                {{ t('reader.markFinished') }}
              </button>
              <p v-else class="inline-flex items-center gap-2 text-sm text-sage-deep">
                <BookCheck class="size-4" aria-hidden="true" />
                {{ t('reader.alreadyFinished') }}
              </p>
              <NuxtLink to="/bookshelf" class="btn btn-secondary">{{ t('reader.openShelf') }}</NuxtLink>
            </div>
          </section>

          <!-- Chapter navigation -->
          <nav class="mt-16 grid grid-cols-2 gap-3 border-t border-line pt-8" :aria-label="t('reader.contents')">
            <button
              v-if="chapterIndex > 0"
              type="button"
              class="chapter-nav text-left"
              @click="goTo(chapterIndex - 1)"
            >
              <span class="eyebrow inline-flex items-center gap-1.5"><ArrowLeft class="size-3.5" aria-hidden="true" />{{ t('reader.previous') }}</span>
              <span class="mt-1.5 block truncate font-serif text-lg">{{ chapters[chapterIndex - 1]?.title }}</span>
            </button>
            <span v-else />
            <button
              v-if="!isLast"
              type="button"
              class="chapter-nav text-right"
              @click="goTo(chapterIndex + 1)"
            >
              <span class="eyebrow inline-flex items-center gap-1.5">{{ t('reader.next') }}<ArrowRight class="size-3.5" aria-hidden="true" /></span>
              <span class="mt-1.5 block truncate font-serif text-lg">{{ chapters[chapterIndex + 1]?.title }}</span>
            </button>
          </nav>

          <footer class="mt-14 space-y-1 text-center text-xs text-muted-strong">
            <p class="hidden md:block">{{ t('reader.keyboardHint') }}</p>
            <p>
              {{ t('reader.source', { source: book.freeEdition?.source ?? '' }) }}
              <a
                v-if="book.freeEdition"
                :href="book.freeEdition.url"
                target="_blank"
                rel="noopener noreferrer"
                class="link-draw text-burgundy"
              >{{ t('reader.sourceLink') }}</a>
            </p>
          </footer>
        </article>
      </template>
    </main>

    <ReaderContents
      v-if="manifest"
      :open="contentsOpen"
      :chapters="chapters"
      :current="chapterIndex"
      @close="contentsOpen = false"
      @select="goTo"
    />
  </div>
</template>

<style scoped>
.chapter-nav {
  min-width: 0;
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-line);
  border-radius: 3px;
  background-color: var(--color-surface);
  transition:
    border-color 0.2s ease,
    box-shadow 0.3s ease;
}

.chapter-nav:hover {
  border-color: var(--color-line-strong);
  box-shadow: var(--shadow-soft);
}
</style>
