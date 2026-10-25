<script setup lang="ts">
import type { QuizQuestion } from '~/types'

const props = defineProps<{ question: QuizQuestion }>()

const model = defineModel<string | undefined>({ required: true })

const legend = ref<HTMLElement | null>(null)
const letters = ['A', 'B', 'C', 'D', 'E', 'F']

// Announce each new question to screen readers by moving focus to it.
onMounted(() => legend.value?.focus())

const name = computed(() => `quiz-${props.question.id}`)
</script>

<template>
  <fieldset>
    <legend ref="legend" tabindex="-1" class="display block text-[2.125rem] focus:outline-none sm:text-5xl">
      {{ question.prompt }}
    </legend>
    <div class="mt-10 grid gap-3 sm:grid-cols-2">
      <label v-for="(option, index) in question.options" :key="option.id" class="option">
        <input v-model="model" type="radio" class="sr-only" :name="name" :value="option.id" />
        <span class="option-body">
          <span class="font-serif text-lg text-burgundy italic" aria-hidden="true">{{ letters[index] }}</span>
          <span class="min-w-0">
            <span class="block font-serif text-[1.375rem] leading-tight">{{ option.label }}</span>
            <span class="mt-1.5 block text-sm text-muted-strong">{{ option.detail }}</span>
          </span>
        </span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
.option {
  display: block;
  cursor: pointer;
}

.option-body {
  display: flex;
  gap: 1rem;
  height: 100%;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--color-line-strong);
  border-radius: 3px;
  background-color: var(--color-surface);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.3s ease,
    transform 0.3s var(--ease-editorial);
}

.option:hover .option-body {
  border-color: var(--color-ink);
  transform: translateY(-2px);
}

.option input:checked + .option-body {
  border-color: var(--color-burgundy);
  background-color: var(--color-burgundy-soft);
  box-shadow: inset 0 0 0 1px var(--color-burgundy);
}

.option input:focus-visible + .option-body {
  outline: 2px solid var(--color-burgundy);
  outline-offset: 3px;
}
</style>
