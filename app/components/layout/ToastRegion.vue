<script setup lang="ts">
import { CircleAlert, CircleCheck, X } from 'lucide-vue-next'

const { t } = useLocale()
const { toasts, dismiss, runAction } = useToast()
</script>

<template>
  <section
    :aria-label="t('toast.region')"
    class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 sm:justify-end sm:p-6"
  >
    <TransitionGroup
      tag="ol"
      name="toast"
      aria-live="polite"
      aria-relevant="additions text"
      class="flex w-full max-w-sm flex-col gap-2"
    >
      <li
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-center gap-3 rounded-[3px] bg-ink py-3 pr-2 pl-4 text-sm text-paper shadow-lift"
        :role="toast.tone === 'error' ? 'alert' : undefined"
      >
        <CircleCheck v-if="toast.tone === 'success'" class="size-4 shrink-0 text-sage" aria-hidden="true" />
        <CircleAlert v-else-if="toast.tone === 'error'" class="size-4 shrink-0 text-cover-rose" aria-hidden="true" />
        <p class="flex-1 leading-snug">{{ toast.message }}</p>
        <button
          v-if="toast.action"
          type="button"
          class="shrink-0 rounded-xs px-2 py-1.5 font-medium text-cover-sand underline underline-offset-4 hover:text-paper"
          @click="runAction(toast)"
        >
          {{ toast.action.label }}
        </button>
        <button
          type="button"
          class="grid size-8 shrink-0 place-items-center rounded-xs text-paper/70 hover:bg-paper/10 hover:text-paper"
          :aria-label="t('toast.dismiss')"
          @click="dismiss(toast.id)"
        >
          <X class="size-4" aria-hidden="true" />
        </button>
      </li>
    </TransitionGroup>
  </section>
</template>
