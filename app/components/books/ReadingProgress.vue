<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    read: number
    total: number
    title: string
    showSummary?: boolean
    tone?: 'burgundy' | 'sage'
  }>(),
  { showSummary: true, tone: 'burgundy' },
)

const { t, formatNumber } = useLocale()

const percent = computed(() => (props.total > 0 ? Math.min(100, Math.round((props.read / props.total) * 100)) : 0))

const summary = computed(() =>
  t('progress.summary', {
    percent: percent.value,
    read: formatNumber(props.read),
    total: formatNumber(props.total),
  }),
)

// Render at 0 on the server and first client paint, then grow into place.
const ready = ref(false)
onMounted(() => requestAnimationFrame(() => (ready.value = true)))
</script>

<template>
  <div>
    <div
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="percent"
      :aria-valuetext="summary"
      :aria-label="t('progress.label', { title })"
      class="relative h-[3px] overflow-hidden rounded-full bg-line"
    >
      <div
        class="absolute inset-0 origin-left transition-transform duration-1000 ease-editorial"
        :class="tone === 'sage' ? 'bg-sage-deep' : 'bg-burgundy'"
        :style="{ transform: `scaleX(${ready ? percent / 100 : 0})` }"
      />
    </div>
    <p v-if="showSummary" class="mt-2 text-xs text-muted-strong tabular-nums">{{ summary }}</p>
  </div>
</template>
