<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    title: string
    description: string
    icon?: Component
    headingLevel?: 'h2' | 'h3'
    compact?: boolean
  }>(),
  { icon: undefined, headingLevel: 'h2', compact: false },
)
</script>

<template>
  <div
    class="flex flex-col items-center rounded-[3px] border border-dashed border-line-strong text-center"
    :class="compact ? 'px-6 py-10' : 'px-6 py-16 md:py-20'"
  >
    <div v-if="icon" class="grid size-14 place-items-center rounded-full border border-line-strong text-burgundy">
      <component :is="icon" class="size-5" stroke-width="1.5" aria-hidden="true" />
    </div>
    <component :is="headingLevel" class="mt-5 font-serif text-2xl text-ink md:text-3xl">{{ title }}</component>
    <p class="mt-3 max-w-md text-sm leading-relaxed text-muted-strong">{{ description }}</p>
    <div v-if="$slots.default" class="mt-7 flex flex-wrap justify-center gap-3">
      <slot />
    </div>
  </div>
</template>
