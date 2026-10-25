<script setup lang="ts">
import type { ReaderChapter, ReaderFontSize } from '~/types'

defineProps<{ chapter: ReaderChapter; fontSize: ReaderFontSize }>()

/* Rendering note: block.html comes from our own import script, which escapes
   all text and only keeps <em> and <br>, so v-html is safe here. */
</script>

<template>
  <div class="reader-text" :class="`reader-fs-${fontSize}`">
    <template v-for="(block, index) in chapter.blocks" :key="index">
      <hr v-if="block.t === 'break'" class="scene-break" />
      <h3 v-else-if="block.t === 'h'" class="subheading" v-html="block.html" />
      <blockquote v-else-if="block.t === 'quote'">
        <p v-html="block.html" />
      </blockquote>
      <p v-else v-html="block.html" />
    </template>
  </div>
</template>

<style scoped>
.reader-text {
  font-family: var(--font-serif);
  color: var(--color-ink);
  line-height: 1.65;
  hyphens: auto;
  font-variant-numeric: oldstyle-nums;
}

.reader-fs-0 {
  font-size: 1.0625rem;
}
.reader-fs-1 {
  font-size: 1.1875rem;
}
.reader-fs-2 {
  font-size: 1.3125rem;
}
.reader-fs-3 {
  font-size: 1.4375rem;
}
.reader-fs-4 {
  font-size: 1.625rem;
}

@media (min-width: 768px) {
  .reader-text {
    text-align: justify;
  }
}

.reader-text > p {
  margin: 0;
  text-indent: 1.5em;
}

/* No indent after a heading, quote or scene break, nor on the first paragraph. */
.reader-text > p:first-child,
.reader-text > hr + p,
.reader-text > h3 + p,
.reader-text > blockquote + p {
  text-indent: 0;
}

/* Drop cap on the opening paragraph. */
.reader-text > p:first-child::first-letter {
  float: left;
  font-size: 3.4em;
  line-height: 0.82;
  padding: 0.06em 0.08em 0 0;
  color: var(--color-burgundy);
}

.reader-text blockquote {
  margin: 1em 0 1em 1.5em;
  font-size: 0.94em;
  color: var(--color-ink-soft);
}

.reader-text blockquote p {
  margin: 0;
}

.reader-text blockquote p + p {
  margin-top: 0.4em;
}

.subheading {
  margin: 1.6em 0 0.6em;
  text-align: center;
  font-size: 1.05em;
  font-style: italic;
  font-weight: 500;
}

.scene-break {
  margin: 1.4em 0;
  border: 0;
  text-align: center;
  overflow: visible;
}

.scene-break::after {
  content: '⁂';
  color: var(--color-muted);
}
</style>
