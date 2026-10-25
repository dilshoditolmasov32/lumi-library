<script setup lang="ts">
import type { CoverMotif } from '~/types'

defineProps<{ motif: CoverMotif }>()

// Twelve short rays around the sun motif.
const rays = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * Math.PI) / 6
  const round = (n: number) => Math.round(n * 100) / 100
  return {
    x1: round(50 + Math.cos(angle) * 29),
    y1: round(50 + Math.sin(angle) * 29),
    x2: round(50 + Math.cos(angle) * 40),
    y2: round(50 + Math.sin(angle) * 40),
  }
})

const dots = Array.from({ length: 25 }, (_, i) => ({ cx: 18 + (i % 5) * 16, cy: 18 + Math.floor(i / 5) * 16 }))
</script>

<template>
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    stroke-width="1.2"
    stroke-linecap="round"
    aria-hidden="true"
    focusable="false"
  >
    <g v-if="motif === 'arch'" vector-effect="non-scaling-stroke">
      <path d="M22 94V50a28 28 0 0 1 56 0v44" vector-effect="non-scaling-stroke" />
      <path d="M33 94V52a17 17 0 0 1 34 0v42" vector-effect="non-scaling-stroke" />
      <path d="M12 94h76" vector-effect="non-scaling-stroke" />
    </g>

    <g v-else-if="motif === 'sun'">
      <circle cx="50" cy="50" r="20" vector-effect="non-scaling-stroke" />
      <circle cx="50" cy="50" r="12" fill="currentColor" stroke="none" opacity="0.85" />
      <line
        v-for="(ray, i) in rays"
        :key="i"
        v-bind="ray"
        vector-effect="non-scaling-stroke"
      />
    </g>

    <g v-else-if="motif === 'lines'">
      <path
        v-for="(width, i) in [70, 56, 70, 42, 70, 56, 70]"
        :key="i"
        :d="`M${50 - width / 2} ${20 + i * 10}h${width}`"
        vector-effect="non-scaling-stroke"
      />
    </g>

    <g v-else-if="motif === 'frame'">
      <rect x="12" y="12" width="76" height="76" vector-effect="non-scaling-stroke" />
      <rect x="20" y="20" width="60" height="60" vector-effect="non-scaling-stroke" />
      <path d="M50 38l12 12-12 12-12-12z" fill="currentColor" stroke="none" />
    </g>

    <g v-else-if="motif === 'wave'">
      <path
        v-for="y in [32, 46, 60, 74]"
        :key="y"
        :d="`M6 ${y}q11 -9 22 0t22 0t22 0t22 0`"
        vector-effect="non-scaling-stroke"
      />
    </g>

    <g v-else-if="motif === 'grid'" fill="currentColor" stroke="none">
      <circle v-for="(dot, i) in dots" :key="i" :cx="dot.cx" :cy="dot.cy" :r="i === 12 ? 4 : 1.8" />
    </g>

    <g v-else-if="motif === 'diamond'">
      <path d="M50 8l42 42-42 42L8 50z" vector-effect="non-scaling-stroke" />
      <path d="M50 24l26 26-26 26-26-26z" vector-effect="non-scaling-stroke" />
      <path d="M50 40l10 10-10 10-10-10z" fill="currentColor" stroke="none" />
    </g>

    <g v-else-if="motif === 'moon'" stroke="none">
      <circle cx="46" cy="52" r="26" fill="currentColor" />
      <circle cx="58" cy="44" r="24" style="fill: var(--cover-bg)" />
      <circle cx="80" cy="22" r="1.6" fill="currentColor" />
      <circle cx="70" cy="80" r="1.2" fill="currentColor" />
      <circle cx="20" cy="24" r="1" fill="currentColor" />
    </g>
  </svg>
</template>
