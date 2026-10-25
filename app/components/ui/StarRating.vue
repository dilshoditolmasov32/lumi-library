<script setup lang="ts">
import { Star } from 'lucide-vue-next'

const model = defineModel<number | null>({ required: true })
defineProps<{ legend?: string }>()

const { t, tn } = useLocale()
const name = useId()
const hovered = ref<number | null>(null)

const shown = computed(() => hovered.value ?? model.value ?? 0)
</script>

<template>
  <fieldset>
    <legend class="label">{{ legend ?? t('rating.label') }}</legend>
    <div class="flex items-center gap-0.5" @mouseleave="hovered = null">
      <label v-for="n in 5" :key="n" class="star" @mouseenter="hovered = n">
        <input
          type="radio"
          class="sr-only"
          :name="name"
          :value="n"
          :checked="model === n"
          @change="model = n"
        />
        <Star
          class="size-5 transition-colors duration-150"
          :class="shown >= n ? 'fill-burgundy text-burgundy' : 'text-line-strong'"
          stroke-width="1.5"
          aria-hidden="true"
        />
        <span class="sr-only">{{ tn('rating.star', n) }}</span>
      </label>
      <button
        v-if="model !== null"
        type="button"
        class="ml-2 rounded-xs px-1.5 py-1 text-xs text-muted-strong underline underline-offset-4 hover:text-ink"
        @click="model = null"
      >
        {{ t('rating.clear') }}
      </button>
      <span v-else class="ml-2 text-xs text-muted-strong">{{ t('rating.none') }}</span>
    </div>
  </fieldset>
</template>

<style scoped>
.star {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 2px;
  cursor: pointer;
}

.star:has(input:focus-visible) {
  outline: 2px solid var(--color-burgundy);
  outline-offset: 1px;
}
</style>
