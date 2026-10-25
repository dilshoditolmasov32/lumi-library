<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next'
import type { Book } from '~/types'

/** Opens the in-app reader. Renders nothing for books without a free edition. */
const props = withDefaults(defineProps<{ book: Book; primary?: boolean }>(), { primary: false })

const { t } = useLocale()
const { get } = useReadingPositions()
const hydrated = useHydrated()

const started = computed(() => hydrated.value && Boolean(get(props.book.id)))
</script>

<template>
  <NuxtLink
    v-if="book.freeEdition"
    :to="`/read/${book.id}`"
    class="btn btn-sm"
    :class="primary ? 'btn-primary' : 'btn-secondary'"
    :aria-label="started ? t('book.continueAria', { title: book.title }) : t('book.readAria', { title: book.title })"
  >
    <BookOpen aria-hidden="true" />
    <span>{{ started ? t('book.continueReading') : t('book.readFree') }}</span>
  </NuxtLink>
</template>
