<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

const { t } = useLocale()
const { featuredBooks } = useCatalog()
</script>

<template>
  <section class="container-page py-16 md:py-24" aria-labelledby="featured-title">
    <SectionHeading
      heading-id="featured-title"
      index="01"
      :eyebrow="t('home.featured.eyebrow')"
      :title="t('home.featured.title')"
      :description="t('home.featured.description')"
    >
      <template #action>
        <NuxtLink to="/discover" class="btn btn-secondary">
          {{ t('home.featured.cta') }}
          <ArrowRight aria-hidden="true" />
        </NuxtLink>
      </template>
    </SectionHeading>

    <ul class="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
      <li v-for="book in featuredBooks" :key="book.id">
        <BookCard :book="book" />
      </li>
    </ul>
  </section>
</template>
