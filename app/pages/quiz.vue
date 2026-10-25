<script setup lang="ts">
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-vue-next'
import { personalities, quizQuestions } from '~/data/quiz'
import { PERSONALITY_IDS } from '~/types'
import { calculateQuizResult } from '~/utils/quiz'

const { t } = useLocale()
const { result, personality: lastPersonality, save } = useQuizResult()
const hydrated = useHydrated()

useSeoMeta({
  title: t('quiz.metaTitle'),
  description: t('quiz.metaDescription'),
})

type Phase = 'intro' | 'questions' | 'result'
const phase = ref<Phase>('intro')
const step = ref(0)
const answers = ref<Record<string, string>>({})
const direction = ref<'forward' | 'back'>('forward')

const total = quizQuestions.length
const question = computed(() => quizQuestions[step.value]!)
const isLast = computed(() => step.value === total - 1)

const currentAnswer = computed({
  get: () => answers.value[question.value.id],
  set: (value: string | undefined) => {
    if (value) answers.value = { ...answers.value, [question.value.id]: value }
  },
})

const readers = PERSONALITY_IDS.map((id) => personalities[id])

function start() {
  answers.value = {}
  step.value = 0
  direction.value = 'forward'
  phase.value = 'questions'
}

function next() {
  if (!currentAnswer.value) return
  if (isLast.value) {
    save(calculateQuizResult(answers.value, new Date().toISOString()))
    phase.value = 'result'
    window.scrollTo({ top: 0 })
    return
  }
  direction.value = 'forward'
  step.value += 1
}

function back() {
  if (step.value === 0) {
    phase.value = 'intro'
    return
  }
  direction.value = 'back'
  step.value -= 1
}

// If the saved result disappears (e.g. data reset), fall back to the intro.
watch(result, (value) => {
  if (!value && phase.value === 'result') phase.value = 'intro'
})

function retake() {
  start()
  window.scrollTo({ top: 0 })
}
</script>

<template>
  <div class="container-page pt-12 md:pt-20">
    <Transition name="fade" mode="out-in">
      <!-- Intro -->
      <section v-if="phase === 'intro'" key="intro" class="grid gap-14 lg:grid-cols-12" aria-labelledby="quiz-title">
        <div class="lg:col-span-7">
          <SectionHeading
            :level="1"
            heading-id="quiz-title"
            :eyebrow="t('quiz.eyebrow')"
            :title="t('quiz.title')"
            :description="t('quiz.lede')"
          />
          <div class="mt-10 flex flex-wrap items-center gap-4">
            <button type="button" class="btn btn-primary" @click="start">
              <Sparkles aria-hidden="true" />
              {{ t('quiz.start') }}
            </button>
            <span class="text-sm text-muted-strong">{{ t('quiz.duration') }}</span>
          </div>

          <Transition name="fade">
            <p v-if="hydrated && result && lastPersonality" class="mt-10 border-t border-line pt-6 text-sm text-ink-soft">
              {{ t('quiz.lastResult', { name: lastPersonality.name }) }}
              <button type="button" class="link-draw ml-1 font-medium text-burgundy" @click="phase = 'result'">
                {{ t('quiz.viewLast') }}
              </button>
            </p>
          </Transition>
        </div>

        <aside class="self-end lg:col-span-5" aria-labelledby="quiz-readers">
          <h2 id="quiz-readers" class="eyebrow">{{ t('quiz.readers') }}</h2>
          <ol class="mt-4 border-t border-line">
            <li v-for="(reader, index) in readers" :key="reader.id" class="flex items-baseline gap-4 border-b border-line py-4">
              <span class="w-6 font-serif text-sm text-burgundy italic tabular-nums">0{{ index + 1 }}</span>
              <span>
                <span class="block font-serif text-2xl leading-tight">{{ reader.name }}</span>
                <span class="mt-1 block text-sm text-muted-strong">{{ reader.tagline }}</span>
              </span>
            </li>
          </ol>
        </aside>
      </section>

      <!-- Questions -->
      <section v-else-if="phase === 'questions'" key="questions" class="mx-auto max-w-4xl" :aria-label="t('quiz.title')">
        <div class="flex items-center justify-between gap-4">
          <p class="eyebrow">{{ t('quiz.progress', { current: step + 1, total }) }}</p>
          <p class="font-serif text-sm text-muted-strong italic tabular-nums" aria-hidden="true">
            {{ String(step + 1).padStart(2, '0') }} / {{ String(total).padStart(2, '0') }}
          </p>
        </div>
        <div
          class="mt-4 grid gap-1.5"
          :style="{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }"
          role="progressbar"
          aria-valuemin="1"
          :aria-valuemax="total"
          :aria-valuenow="step + 1"
          :aria-valuetext="t('quiz.progress', { current: step + 1, total })"
        >
          <span
            v-for="n in total"
            :key="n"
            class="h-[3px] rounded-full transition-colors duration-500"
            :class="n <= step + 1 ? 'bg-burgundy' : 'bg-line'"
          />
        </div>

        <form class="mt-12" @submit.prevent="next">
          <div class="min-h-[26rem] overflow-hidden">
            <Transition :name="direction === 'forward' ? 'slide' : 'slide-back'" mode="out-in">
              <QuizQuestionStep :key="question.id" v-model="currentAnswer" :question="question" />
            </Transition>
          </div>

          <div class="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
            <button type="button" class="btn btn-ghost" @click="back">
              <ArrowLeft aria-hidden="true" />
              {{ t('quiz.back') }}
            </button>
            <div class="flex items-center gap-4">
              <p v-if="!currentAnswer" class="hidden text-sm text-muted-strong sm:block">{{ t('quiz.chooseHint') }}</p>
              <button type="submit" class="btn btn-primary" :disabled="!currentAnswer">
                {{ isLast ? t('quiz.finish') : t('quiz.next') }}
                <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </form>
      </section>

      <!-- Result -->
      <QuizResultCard v-else-if="result" key="result" :result="result" @retake="retake" />
    </Transition>
  </div>
</template>
