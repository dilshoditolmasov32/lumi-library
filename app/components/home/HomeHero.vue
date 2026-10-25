<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

const { t } = useLocale()
const { featuredBooks } = useCatalog()

const [first, second, third] = featuredBooks
</script>

<template>
  <section class="relative overflow-hidden" aria-labelledby="hero-title">
    <div class="container-page grid items-center gap-14 pt-12 pb-20 md:grid-cols-12 md:gap-10 md:pt-20 md:pb-28">
      <div class="md:col-span-7">
        <p class="eyebrow rise flex items-center gap-3">
          <span class="h-px w-8 bg-burgundy" aria-hidden="true" />
          {{ t('home.hero.eyebrow') }}
        </p>
        <h1
          id="hero-title"
          class="display rise mt-7 text-[2.875rem] sm:text-6xl lg:text-[5.25rem]"
          style="--delay: 90ms"
        >
          {{ t('home.hero.titleStart') }}
          <em class="text-burgundy">{{ t('home.hero.titleAccent') }}</em>
        </h1>
        <p class="rise mt-7 max-w-xl text-base leading-relaxed text-muted-strong md:text-lg" style="--delay: 180ms">
          {{ t('home.hero.lede') }}
        </p>
        <div class="rise mt-10 flex flex-wrap items-center gap-3" style="--delay: 270ms">
          <NuxtLink to="/discover" class="btn btn-primary">
            {{ t('home.hero.primary') }}
            <ArrowRight aria-hidden="true" />
          </NuxtLink>
          <NuxtLink to="/quiz" class="btn btn-secondary">
            {{ t('home.hero.secondary') }}
          </NuxtLink>
        </div>
      </div>

      <figure class="relative mx-auto w-full max-w-sm md:col-span-5 md:max-w-none" aria-hidden="true">
        <div class="relative aspect-[3/4]">
          <div class="absolute top-1/2 left-1/2 aspect-square w-[88%] -translate-1/2 rounded-full border border-sage" />
          <div
            v-if="first"
            class="hero-book absolute top-0 left-0 w-[46%]"
            style="--delay: 250ms; --tilt: -6deg"
          >
            <BookCover :book="first" />
          </div>
          <div
            v-if="second"
            class="hero-book absolute top-[6%] right-0 z-10 w-[46%]"
            style="--delay: 380ms; --tilt: 4deg"
          >
            <BookCover :book="second" />
          </div>
          <div
            v-if="third"
            class="hero-book absolute bottom-0 left-[14%] z-20 w-[42%]"
            style="--delay: 510ms; --tilt: -1.5deg"
          >
            <BookCover :book="third" />
          </div>
        </div>
        <figcaption class="eyebrow mt-6 text-center">{{ t('home.hero.caption') }}</figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.hero-book {
  transform: rotate(var(--tilt));
  animation: hero-book-in 1.1s var(--ease-editorial) both;
  animation-delay: var(--delay, 0ms);
}

@keyframes hero-book-in {
  from {
    opacity: 0;
    transform: translateY(28px) rotate(0deg);
  }
  to {
    opacity: 1;
    transform: rotate(var(--tilt));
  }
}
</style>
