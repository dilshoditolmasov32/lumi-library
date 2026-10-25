<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { personalities } from '~/data/quiz'
import { PERSONALITY_IDS } from '~/types'

const { t } = useLocale()
const { personality } = useQuizResult()
const hydrated = useHydrated()

const readers = PERSONALITY_IDS.map((id) => personalities[id])
</script>

<template>
  <section class="container-page py-16 md:py-24" aria-labelledby="quiz-promo-title">
    <div class="grid overflow-hidden rounded-[3px] border border-line bg-sage-soft lg:grid-cols-2">
      <div class="p-8 md:p-14">
        <SectionHeading
          heading-id="quiz-promo-title"
          index="04"
          :eyebrow="t('home.quiz.eyebrow')"
          :title="t('home.quiz.title')"
          :description="t('home.quiz.body')"
        />
        <div class="mt-9 flex flex-wrap items-center gap-4">
          <NuxtLink to="/quiz" class="btn btn-primary">
            {{ t('home.quiz.cta') }}
            <ArrowRight aria-hidden="true" />
          </NuxtLink>
          <span class="text-sm text-sage-deep">{{ t('home.quiz.duration') }}</span>
        </div>
        <Transition name="fade">
          <p v-if="hydrated && personality" class="mt-8 border-t border-sage/60 pt-5 text-sm text-ink-soft">
            {{ t('home.quiz.resultLabel') }}:
            <NuxtLink to="/quiz" class="link-draw font-serif text-lg text-burgundy italic">{{ personality.name }}</NuxtLink>
          </p>
        </Transition>
      </div>

      <ol class="border-t border-sage/60 bg-paper/50 p-8 md:p-14 lg:border-t-0 lg:border-l">
        <li
          v-for="(reader, index) in readers"
          :key="reader.id"
          class="flex items-baseline gap-5 border-b border-sage/50 py-4 first:pt-0 last:border-b-0 last:pb-0"
        >
          <span class="w-6 font-serif text-sm text-sage-deep italic tabular-nums">0{{ index + 1 }}</span>
          <span>
            <span class="block font-serif text-2xl leading-tight md:text-[1.75rem]">{{ reader.name }}</span>
            <span class="mt-1 block text-sm text-muted-strong">{{ reader.tagline }}</span>
          </span>
        </li>
      </ol>
    </div>
  </section>
</template>
