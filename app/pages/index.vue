<script setup lang="ts">
const { t } = useLocale()

useSeoMeta({
  title: t('home.metaTitle'),
  ogTitle: 'LUMI',
  ogDescription: t('home.hero.lede'),
})
</script>

<template>
  <div>
    <HomeHero />
    <div class="container-page"><hr class="hairline" /></div>
    <HomeFeatured />
    <HomeQuoteOfDay />
    <HomeJourney />
    <HomeDiaryPreview />
    <HomeQuizPromo />
    <HomeCommunity />
  </div>
</template>
