<script setup lang="ts">
import { BookmarkCheck, BookmarkPlus } from 'lucide-vue-next'
import type { Book } from '~/types'

const props = defineProps<{ book: Book }>()

const { t } = useLocale()
const { has, toggleWithFeedback } = useBookshelf()
const hydrated = useHydrated()

const saved = computed(() => has(props.book.id))
const popping = ref(false)

function onClick() {
  const nowSaved = toggleWithFeedback(props.book)
  popping.value = false
  if (nowSaved) requestAnimationFrame(() => (popping.value = true))
}
</script>

<template>
  <button
    type="button"
    class="btn btn-sm"
    :class="[saved ? 'saved' : 'btn-secondary', { 'is-popping': popping }]"
    :disabled="!hydrated"
    :aria-label="saved ? t('book.removeAria', { title: book.title }) : t('book.addAria', { title: book.title })"
    @click="onClick"
    @animationend="popping = false"
  >
    <BookmarkCheck v-if="saved" aria-hidden="true" />
    <BookmarkPlus v-else aria-hidden="true" />
    <span>{{ saved ? t('book.onShelf') : t('book.addToShelf') }}</span>
  </button>
</template>

<style scoped>
.saved {
  background-color: var(--color-burgundy-soft);
  color: var(--color-burgundy-deep);
  border-color: transparent;
}

.saved:hover {
  background-color: color-mix(in srgb, var(--color-burgundy-soft) 70%, var(--color-burgundy) 12%);
}
</style>
