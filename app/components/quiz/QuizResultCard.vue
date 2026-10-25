<script setup lang="ts">
import { ArrowRight, RotateCcw } from 'lucide-vue-next'
import { personalities } from '~/data/quiz'
import { PERSONALITY_IDS, type QuizResult } from '~/types'

const props = defineProps<{ result: QuizResult }>()
const emit = defineEmits<{ retake: [] }>()

const { t, tn, formatDate } = useLocale()
const { getBook } = useCatalog()

const personality = computed(() => personalities[props.result.personalityId])
const books = computed(() => props.result.recommendedBookIds.flatMap((id) => getBook(id) ?? []))

const topScore = computed(() => Math.max(1, ...PERSONALITY_IDS.map((id) => props.result.scores[id])))
const breakdown = computed(() =>
  PERSONALITY_IDS.map((id) => ({
    id,
    name: personalities[id].name,
    score: props.result.scores[id],
    isResult: id === props.result.personalityId,
  })).sort((a, b) => b.score - a.score),
)

const heading = ref<HTMLElement | null>(null)
onMounted(() => heading.value?.focus())
</script>

<template>
  <article aria-labelledby="quiz-result-title">
    <!-- Masthead -->
    <header class="grid gap-10 border-b border-line pb-14 lg:grid-cols-12">
      <div class="lg:col-span-8">
        <p class="eyebrow rise flex items-center gap-3">
          <span class="h-px w-8 bg-burgundy" aria-hidden="true" />
          {{ t('quiz.resultEyebrow') }}
        </p>
        <h1
          id="quiz-result-title"
          ref="heading"
          tabindex="-1"
          class="display rise mt-6 text-5xl focus:outline-none sm:text-6xl md:text-7xl lg:text-[5.5rem]"
          style="--delay: 80ms"
        >
          {{ personality.name }}
        </h1>
        <p class="rise mt-6 font-serif text-2xl text-burgundy italic md:text-3xl" style="--delay: 160ms">
          {{ personality.tagline }}
        </p>
        <p class="rise mt-6 max-w-2xl text-base leading-relaxed text-muted-strong md:text-lg" style="--delay: 240ms">
          {{ personality.description }}
        </p>
      </div>

      <aside class="rise self-end lg:col-span-4" style="--delay: 320ms">
        <h2 class="eyebrow">{{ t('quiz.traits') }}</h2>
        <ul class="mt-4 divide-y divide-line border-y border-line">
          <li v-for="trait in personality.traits" :key="trait" class="py-3 font-serif text-xl">{{ trait }}</li>
        </ul>
        <h2 class="eyebrow mt-8">{{ t('quiz.genres') }}</h2>
        <ul class="mt-4 flex flex-wrap gap-2">
          <li v-for="genre in personality.genres" :key="genre">
            <NuxtLink :to="{ path: '/discover', query: { genre } }" class="chip">
              {{ t(`genres.${genre}`) }}
              <ArrowRight class="size-3.5" aria-hidden="true" />
            </NuxtLink>
          </li>
        </ul>
      </aside>
    </header>

    <!-- Recommendations -->
    <section class="py-14" aria-labelledby="quiz-books-title">
      <h2 id="quiz-books-title" class="display text-4xl md:text-5xl">{{ t('quiz.books') }}</h2>
      <ul class="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
        <li v-for="book in books" :key="book.id">
          <BookCard :book="book" />
        </li>
      </ul>
    </section>

    <!-- Score breakdown -->
    <section class="grid gap-10 border-t border-line pt-14 lg:grid-cols-12" aria-labelledby="quiz-breakdown-title">
      <div class="lg:col-span-4">
        <h2 id="quiz-breakdown-title" class="font-serif text-3xl">{{ t('quiz.breakdown') }}</h2>
        <p class="mt-3 text-sm text-muted-strong">
          {{ t('quiz.completedOn', { date: formatDate(result.completedAt) }) }}
        </p>
        <button type="button" class="btn btn-primary mt-8" @click="emit('retake')">
          <RotateCcw aria-hidden="true" />
          {{ t('quiz.retake') }}
        </button>
      </div>
      <ul class="space-y-5 lg:col-span-8">
        <li v-for="row in breakdown" :key="row.id">
          <div class="flex items-baseline justify-between gap-4 text-sm">
            <span class="font-serif text-xl" :class="row.isResult ? 'text-burgundy' : 'text-ink'">{{ row.name }}</span>
            <span class="text-muted-strong tabular-nums">{{ tn('quiz.points', row.score) }}</span>
          </div>
          <div class="mt-2 h-[3px] overflow-hidden rounded-full bg-line" aria-hidden="true">
            <div
              class="score-bar h-full origin-left"
              :class="row.isResult ? 'bg-burgundy' : 'bg-sage'"
              :style="{ '--scale': row.score / topScore }"
            />
          </div>
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.score-bar {
  transform: scaleX(var(--scale));
  animation: grow 1.2s var(--ease-editorial) both;
  animation-delay: 400ms;
}

@keyframes grow {
  from {
    transform: scaleX(0);
  }
}
</style>
