<script setup lang="ts">
const { t } = useLocale()
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <a
      href="#main"
      class="sr-only-focusable fixed top-3 left-3 z-[60] bg-ink px-4 py-2 text-sm text-paper"
    >
      {{ t('common.skipToContent') }}
    </a>
    <AppHeader />
    <main id="main" tabindex="-1" class="flex-1 focus:outline-none">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
