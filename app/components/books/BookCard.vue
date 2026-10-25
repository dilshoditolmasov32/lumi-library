<script setup lang="ts">
import type { Book } from '~/types'

withDefaults(
  defineProps<{
    book: Book
    headingLevel?: 'h2' | 'h3'
    showAction?: boolean
  }>(),
  { headingLevel: 'h3', showAction: true },
)

const { t, tn } = useLocale()
</script>

<template>
  <article class="group flex h-full flex-col">
    <div class="relative">
      <div class="cover-lift">
        <BookCover :book="book" />
      </div>
      <!-- Synopsis revealed on hover / keyboard focus -->
      <div class="synopsis pointer-events-none absolute inset-0 flex items-end rounded-[2px_4px_4px_2px] p-4">
        <p class="text-[0.8125rem] leading-relaxed text-paper">{{ book.synopsis }}</p>
      </div>
    </div>

    <div class="mt-5 flex flex-1 flex-col">
      <p class="eyebrow">
        {{ t(`genres.${book.genre}`) }}<span class="mx-1.5" aria-hidden="true">·</span>{{ book.year }}
      </p>
      <component :is="headingLevel" class="mt-2 font-serif text-[1.375rem] leading-tight text-ink">
        {{ book.title }}
      </component>
      <p class="mt-1 text-sm text-muted-strong">{{ book.author }}</p>
      <p class="sr-only">{{ tn('units.pages', book.pages) }}</p>
      <div v-if="showAction" class="mt-auto flex flex-wrap gap-2 pt-4">
        <ShelfButton :book="book" />
        <ReadButton :book="book" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.cover-lift {
  transition:
    transform 0.6s var(--ease-editorial),
    filter 0.6s var(--ease-editorial);
}

.group:hover .cover-lift,
.group:focus-within .cover-lift {
  transform: translateY(-6px) rotate(-0.6deg);
}

.synopsis {
  background: color-mix(in srgb, var(--color-ink) 86%, transparent);
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 0.4s ease,
    transform 0.6s var(--ease-editorial);
}

.group:hover .synopsis,
.group:focus-within .synopsis {
  opacity: 1;
  transform: translateY(-6px) rotate(-0.6deg);
}

@media (hover: none) {
  .synopsis {
    display: none;
  }
}
</style>
