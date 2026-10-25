<script setup lang="ts">
import { ArrowRight, Users } from 'lucide-vue-next'

const { t, tn } = useLocale()
const { collections, booksIn } = useCatalog()

const cards = collections.map((collection) => ({ collection, books: booksIn(collection) }))
</script>

<template>
  <section class="container-page py-16 md:py-24" aria-labelledby="community-title">
    <SectionHeading
      heading-id="community-title"
      index="05"
      :eyebrow="t('home.community.eyebrow')"
      :title="t('home.community.title')"
      :description="t('home.community.body')"
    >
      <template #action>
        <p class="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-xs text-muted-strong">
          <Users class="size-3.5" aria-hidden="true" />
          {{ t('home.community.soon') }}
        </p>
      </template>
    </SectionHeading>

    <ul class="mt-14 grid gap-6 md:grid-cols-3">
      <li v-for="{ collection, books } in cards" :key="collection.id">
        <NuxtLink
          :to="{ path: '/discover', query: { collection: collection.id } }"
          class="collection-card sheet group flex h-full flex-col p-6 md:p-7"
        >
          <div class="relative h-40" aria-hidden="true">
            <div
              v-for="(book, index) in books.slice(0, 3)"
              :key="book.id"
              class="fan-book absolute bottom-0 w-[30%]"
              :style="{ left: `${8 + index * 26}%`, '--tilt': `${(index - 1) * 5}deg`, zIndex: index === 1 ? 2 : 1 }"
            >
              <BookCover :book="book" />
            </div>
          </div>
          <h3 class="mt-8 font-serif text-[1.75rem] leading-tight">{{ collection.title }}</h3>
          <p class="mt-2 flex-1 text-sm leading-relaxed text-muted-strong">{{ collection.description }}</p>
          <p class="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm">
            <span class="text-muted-strong">{{ tn('units.books', books.length) }}</span>
            <span class="inline-flex items-center gap-1.5 font-medium text-burgundy">
              {{ t('home.community.explore') }}
              <ArrowRight class="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </p>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.collection-card {
  transition:
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}

.collection-card:hover {
  box-shadow: var(--shadow-soft);
  border-color: var(--color-line-strong);
}

.fan-book {
  transform: rotate(var(--tilt));
  transform-origin: bottom center;
  transition: transform 0.6s var(--ease-editorial);
}

.collection-card:hover .fan-book,
.collection-card:focus-visible .fan-book {
  transform: rotate(calc(var(--tilt) * 1.8)) translateY(-6px);
}
</style>
