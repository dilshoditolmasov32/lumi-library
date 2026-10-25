<script setup lang="ts">
import type { Book } from '~/types'

/**
 * A typographic book cover drawn entirely in CSS and SVG — no remote images.
 * Text sizes use container units, so the cover scales to any width.
 */
const props = withDefaults(defineProps<{ book: Book; decorative?: boolean }>(), { decorative: true })

const { t } = useLocale()
const label = computed(() => t('book.coverAlt', { title: props.book.title, author: props.book.author }))
</script>

<template>
  <div
    class="book-cover"
    :class="`cover-${book.cover.palette}`"
    :role="decorative ? undefined : 'img'"
    :aria-label="decorative ? undefined : label"
    :aria-hidden="decorative ? 'true' : undefined"
  >
    <div class="cover-inner">
      <p class="cover-author">{{ book.author }}</p>
      <div class="cover-art">
        <CoverMotif :motif="book.cover.motif" class="cover-motif" />
      </div>
      <p class="cover-title">{{ book.title }}</p>
    </div>
  </div>
</template>

<style scoped>
.book-cover {
  container-type: inline-size;
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border-radius: 2px 4px 4px 2px;
  background-color: var(--cover-bg);
  color: var(--cover-ink);
  box-shadow: var(--shadow-book);
}

/* Spine shading on the left edge. */
.book-cover::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 7%;
  background: linear-gradient(90deg, rgb(0 0 0 / 0.18), rgb(0 0 0 / 0) 75%, rgb(255 255 255 / 0.14));
  pointer-events: none;
}

/* Fine page-edge highlight. */
.book-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.07),
    inset -1px 0 0 rgb(0 0 0 / 0.1);
  border-radius: inherit;
  pointer-events: none;
}

.cover-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 11cqi 10cqi 11cqi 15cqi;
}

.cover-author {
  font-family: var(--font-sans);
  font-size: max(6px, 5cqi);
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.85;
  line-height: 1.4;
}

.cover-art {
  flex: 1;
  display: grid;
  place-items: center;
  min-height: 0;
  color: var(--cover-accent);
}

.cover-motif {
  width: 58%;
  max-height: 100%;
}

.cover-title {
  font-family: var(--font-serif);
  font-size: max(9px, 11.5cqi);
  font-weight: 500;
  line-height: 1.02;
  letter-spacing: -0.01em;
  text-wrap: balance;
}
</style>
