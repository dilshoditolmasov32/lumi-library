<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

const { t } = useLocale()
const quote = useQuoteOfTheDay()
</script>

<template>
  <section class="surface-dark bg-burgundy text-paper" aria-labelledby="qotd-title">
    <div class="container-page py-20 md:py-28">
      <h2 id="qotd-title" class="eyebrow text-center text-paper/75!">{{ t('home.quote.eyebrow') }}</h2>
      <div class="mt-6">
        <QuoteCard :quote="quote" variant="feature" tone="dark" />
      </div>
      <p class="mt-4 text-center">
        <NuxtLink to="/quotes" class="link-draw inline-flex items-center gap-2 text-sm text-paper/85 hover:text-paper">
          {{ t('home.quote.more') }}
          <ArrowRight class="size-4" aria-hidden="true" />
        </NuxtLink>
      </p>
    </div>
  </section>
</template>
