<script setup lang="ts">
import { AArrowDown, AArrowUp, ArrowLeft, List } from 'lucide-vue-next'
import type { Book } from '~/types'

defineProps<{
  book: Book
  chapterTitle?: string
  /** Position in the whole book, from 0 to 1. */
  progress: number
  canShrink: boolean
  canGrow: boolean
  showControls: boolean
}>()

const emit = defineEmits<{ back: []; smaller: []; larger: []; contents: [] }>()

const { t } = useLocale()
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-line bg-paper/95">
    <div class="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3 md:h-16 md:px-6">
      <button type="button" class="btn btn-ghost btn-sm shrink-0" :aria-label="t('reader.backAria')" @click="emit('back')">
        <ArrowLeft aria-hidden="true" />
        <span class="hidden sm:inline">{{ t('reader.back') }}</span>
      </button>

      <div class="min-w-0 flex-1 text-center">
        <h1 class="truncate font-serif text-lg leading-tight md:text-xl">{{ book.title }}</h1>
        <p v-if="chapterTitle" class="truncate text-xs text-muted-strong">{{ chapterTitle }}</p>
      </div>

      <div v-if="showControls" class="flex shrink-0 items-center">
        <button
          type="button"
          class="btn btn-ghost btn-icon"
          :disabled="!canShrink"
          :aria-label="t('reader.smaller')"
          @click="emit('smaller')"
        >
          <AArrowDown aria-hidden="true" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-icon"
          :disabled="!canGrow"
          :aria-label="t('reader.larger')"
          @click="emit('larger')"
        >
          <AArrowUp aria-hidden="true" />
        </button>
        <button type="button" class="btn btn-ghost btn-sm" @click="emit('contents')">
          <List aria-hidden="true" />
          <span class="hidden sm:inline">{{ t('reader.contents') }}</span>
          <span class="sr-only sm:hidden">{{ t('reader.contents') }}</span>
        </button>
      </div>
      <div v-else class="w-10 shrink-0 sm:w-20" aria-hidden="true" />
    </div>

    <div v-if="showControls" class="h-[2px] bg-line" aria-hidden="true">
      <div class="h-full origin-left bg-burgundy transition-transform duration-300" :style="{ transform: `scaleX(${progress})` }" />
    </div>
  </header>
</template>
