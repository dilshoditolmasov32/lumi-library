<script setup lang="ts">
const { locale } = useLocale()

useHead({
  htmlAttrs: { lang: locale },
  titleTemplate: (title) => (title && title !== 'LUMI' ? `${title} · LUMI` : 'LUMI'),
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastRegion />
  </div>
</template>
