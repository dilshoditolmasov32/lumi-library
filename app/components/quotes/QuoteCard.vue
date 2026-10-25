<script setup lang="ts">
import { ArrowUpRight, Bookmark, BookmarkCheck, Check, Copy } from 'lucide-vue-next'
import type { Quote } from '~/types'

const props = withDefaults(
  defineProps<{
    quote: Quote
    variant?: 'card' | 'feature'
    tone?: 'light' | 'dark'
  }>(),
  { variant: 'card', tone: 'light' },
)

const { t } = useLocale()
const { show } = useToast()
const { isSaved, toggle } = useSavedQuotes()
const { getBook } = useCatalog()
const hydrated = useHydrated()

/** Poetry line breaks are stored as " / ". */
const lines = computed(() => props.quote.text.split(' / '))
const saved = computed(() => isSaved(props.quote.id))
const book = computed(() => (props.quote.bookId ? getBook(props.quote.bookId) : undefined))

const popping = ref(false)
function onSave() {
  const nowSaved = toggle(props.quote)
  popping.value = false
  if (nowSaved) requestAnimationFrame(() => (popping.value = true))
}

const copied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | undefined

async function onCopy() {
  const text = `“${lines.value.join('\n')}” — ${props.quote.author}, ${props.quote.work}`
  try {
    await writeToClipboard(text)
    copied.value = true
    show(t('quotes.copiedToast'), { tone: 'success' })
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => (copied.value = false), 2000)
  } catch {
    show(t('quotes.copyError'), { tone: 'error' })
  }
}

onBeforeUnmount(() => clearTimeout(copiedTimer))

const dark = computed(() => props.tone === 'dark')
</script>

<template>
  <figure
    class="flex h-full flex-col"
    :class="[
      variant === 'card' ? 'sheet p-7 transition-shadow duration-300 hover:shadow-soft md:p-8' : '',
      variant === 'feature' ? 'items-center text-center' : '',
    ]"
  >
    <span
      class="font-serif leading-none select-none"
      :class="[
        variant === 'feature' ? 'text-7xl md:text-8xl' : 'text-5xl',
        dark ? 'text-cover-rose' : 'text-burgundy',
      ]"
      aria-hidden="true"
    >“</span>

    <blockquote :class="variant === 'feature' ? 'mt-2 max-w-3xl' : 'mt-1 flex-1'">
      <p
        class="font-serif"
        :class="[
          variant === 'feature' ? 'text-[1.75rem] leading-[1.2] italic sm:text-4xl md:text-[2.75rem]' : 'text-[1.4rem] leading-snug',
          dark ? 'text-paper' : 'text-ink',
        ]"
      >
        <template v-for="(line, i) in lines" :key="i">
          <br v-if="i > 0" />{{ line }}
        </template>
      </p>
    </blockquote>

    <figcaption class="text-sm" :class="[variant === 'feature' ? 'mt-8' : 'mt-6', dark ? 'text-paper/80' : 'text-muted-strong']">
      <span class="font-medium" :class="dark ? 'text-paper' : 'text-ink'">{{ quote.author }}</span>
      <span aria-hidden="true"> — </span>
      <cite class="italic">{{ quote.work }}</cite>, {{ quote.published }}
      <span v-if="quote.translator" class="block text-xs" :class="dark ? 'text-paper/70' : 'text-muted-strong'">
        {{ t('quotes.translatedBy', { name: quote.translator }) }}
      </span>
    </figcaption>

    <div
      class="flex flex-wrap items-center gap-1"
      :class="[variant === 'feature' ? 'mt-8 justify-center' : '-mx-2 mt-6 border-t border-line pt-4', dark ? 'on-dark' : '']"
    >
      <button
        type="button"
        class="btn btn-ghost btn-sm"
        :class="{ 'is-popping': popping, 'text-burgundy': saved && !dark }"
        :disabled="!hydrated"
        :aria-label="saved ? t('quotes.unsaveAria', { author: quote.author }) : t('quotes.saveAria', { author: quote.author })"
        @click="onSave"
        @animationend="popping = false"
      >
        <BookmarkCheck v-if="saved" class="fill-current" aria-hidden="true" />
        <Bookmark v-else aria-hidden="true" />
        {{ saved ? t('quotes.unsave') : t('quotes.save') }}
      </button>
      <button
        type="button"
        class="btn btn-ghost btn-sm"
        :aria-label="t('quotes.copyAria', { author: quote.author })"
        @click="onCopy"
      >
        <Check v-if="copied" aria-hidden="true" />
        <Copy v-else aria-hidden="true" />
        {{ copied ? t('quotes.copied') : t('quotes.copy') }}
      </button>
      <NuxtLink
        v-if="book"
        :to="{ path: '/discover', query: { q: book.title } }"
        class="btn btn-ghost btn-sm"
        :class="variant === 'card' && 'ml-auto'"
      >
        {{ t('quotes.findBook') }}
        <ArrowUpRight aria-hidden="true" />
      </NuxtLink>
    </div>
  </figure>
</template>

<style scoped>
.on-dark .btn-ghost {
  color: var(--color-paper);
}

.on-dark .btn-ghost:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-paper) 12%, transparent);
  color: var(--color-paper);
}
</style>
