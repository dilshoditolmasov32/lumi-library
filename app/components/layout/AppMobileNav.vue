<script setup lang="ts">
import { primaryNav } from '~/utils/navigation'

const props = defineProps<{
  open: boolean
  shelfCount: number
}>()

const emit = defineEmits<{ close: [] }>()

const { t } = useLocale()
const panel = ref<HTMLElement | null>(null)

// Move focus into the menu when it opens so keyboard users land on the links.
watch(
  () => props.open,
  async (open) => {
    if (!open) return
    await nextTick()
    panel.value?.querySelector<HTMLElement>('a')?.focus()
  },
)
</script>

<template>
  <Transition name="reveal">
    <div
      v-if="open"
      ref="panel"
      class="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-paper md:hidden"
    >
      <nav :aria-label="t('nav.mobile')" class="container-page py-8">
        <ul class="divide-y divide-line border-y border-line">
          <li v-for="(item, index) in primaryNav" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="mobile-link flex items-baseline gap-5 py-5"
              :style="{ '--delay': `${index * 40}ms` }"
              @click="emit('close')"
            >
              <span class="w-6 font-serif text-sm text-muted-strong italic tabular-nums">0{{ index + 1 }}</span>
              <span class="font-serif text-3xl">{{ t(item.label) }}</span>
              <span v-if="item.to === '/bookshelf'" class="ml-auto text-sm text-muted-strong tabular-nums">
                {{ shelfCount }}
              </span>
            </NuxtLink>
          </li>
        </ul>
        <p class="mt-8 max-w-xs text-sm leading-relaxed text-muted-strong">
          {{ t('footer.tagline') }}
        </p>
      </nav>
    </div>
  </Transition>
</template>

<style scoped>
.mobile-link {
  animation: var(--animate-rise);
  animation-duration: 0.6s;
  animation-delay: var(--delay, 0ms);
  color: var(--color-ink);
}

.mobile-link[aria-current='page'] {
  color: var(--color-burgundy);
}
</style>
