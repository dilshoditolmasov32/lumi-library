<script setup lang="ts">
const { t } = useLocale()
</script>

<!-- A quiet layout for reading: no site header or footer, just the page. -->
<template>
  <div class="min-h-dvh bg-paper">
    <a
      href="#main"
      class="sr-only-focusable fixed top-3 left-3 z-[60] bg-ink px-4 py-2 text-sm text-paper"
    >
      {{ t('common.skipToContent') }}
    </a>
    <slot />
  </div>
</template>
