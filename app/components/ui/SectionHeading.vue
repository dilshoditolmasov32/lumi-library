<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    eyebrow?: string
    description?: string
    /** Editorial section number, e.g. "01". */
    index?: string
    level?: 1 | 2
    headingId?: string
    align?: 'start' | 'center'
  }>(),
  { level: 2, align: 'start', eyebrow: undefined, description: undefined, index: undefined, headingId: undefined },
)
</script>

<template>
  <div
    class="flex flex-col gap-6"
    :class="align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'"
  >
    <div class="max-w-2xl">
      <p v-if="eyebrow" class="eyebrow flex items-center gap-3" :class="align === 'center' && 'justify-center'">
        <template v-if="index">
          <span class="font-serif text-sm tracking-normal text-burgundy normal-case italic">{{ index }}</span>
          <span class="h-px w-8 bg-line-strong" aria-hidden="true" />
        </template>
        <span>{{ eyebrow }}</span>
      </p>
      <component
        :is="level === 1 ? 'h1' : 'h2'"
        :id="headingId"
        class="display mt-4"
        :class="level === 1 ? 'text-5xl sm:text-6xl md:text-7xl' : 'text-4xl md:text-5xl'"
      >
        {{ title }}
      </component>
      <p
        v-if="description"
        class="mt-5 text-base leading-relaxed text-muted-strong md:text-lg"
        :class="align === 'center' && 'mx-auto'"
      >
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.action" class="shrink-0">
      <slot name="action" />
    </div>
  </div>
</template>
