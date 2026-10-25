<script setup lang="ts">
import { Search, X } from 'lucide-vue-next'

const model = defineModel<string>({ required: true })
defineProps<{ label: string; placeholder?: string }>()

const { t } = useLocale()
const id = useId()
const input = ref<HTMLInputElement | null>(null)

function clear() {
  model.value = ''
  input.value?.focus()
}

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <div class="relative">
    <label :for="id" class="sr-only">{{ label }}</label>
    <Search class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-strong" aria-hidden="true" />
    <input
      :id="id"
      ref="input"
      v-model="model"
      type="search"
      class="field search-input pr-10 pl-10"
      :placeholder="placeholder"
      autocomplete="off"
      spellcheck="false"
      @keydown.escape="model ? clear() : undefined"
    />
    <button
      v-if="model"
      type="button"
      class="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-xs text-muted-strong hover:bg-paper-deep hover:text-ink"
      :aria-label="t('discover.clearSearch')"
      @click="clear"
    >
      <X class="size-4" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
/* Hide the browser's own clear button; we provide an accessible one. */
.search-input::-webkit-search-cancel-button {
  appearance: none;
}
</style>
