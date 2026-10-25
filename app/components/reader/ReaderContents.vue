<script setup lang="ts">
import { X } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  chapters: Array<{ title: string }>
  current: number
}>()

const emit = defineEmits<{ close: []; select: [index: number] }>()

const { t } = useLocale()
const dialog = ref<HTMLDialogElement | null>(null)

// A native <dialog> gives us focus trapping and Escape-to-close for free.
watch(
  () => props.open,
  async (open) => {
    const el = dialog.value
    if (!el) return
    if (open && !el.open) {
      el.showModal()
      await nextTick()
      el.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView({ block: 'center' })
      el.querySelector<HTMLElement>('[aria-current="true"]')?.focus()
    } else if (!open && el.open) {
      el.close()
    }
  },
)

// Clicking the dimmed backdrop (the dialog element itself) closes it.
function onClick(event: MouseEvent) {
  if (event.target === dialog.value) emit('close')
}
</script>

<template>
  <dialog
    ref="dialog"
    class="contents-dialog"
    aria-labelledby="contents-title"
    @close="emit('close')"
    @click="onClick"
  >
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 id="contents-title" class="font-serif text-2xl">{{ t('reader.contents') }}</h2>
        <button type="button" class="btn btn-ghost btn-icon" :aria-label="t('reader.closeContents')" @click="emit('close')">
          <X aria-hidden="true" />
        </button>
      </div>
      <ol class="flex-1 overflow-y-auto py-2">
        <li v-for="(chapter, index) in chapters" :key="index">
          <button
            type="button"
            class="chapter-link"
            :aria-current="index === current ? 'true' : undefined"
            @click="emit('select', index)"
          >
            <span class="w-8 shrink-0 font-serif text-sm text-muted-strong italic tabular-nums">{{ index + 1 }}</span>
            <span class="min-w-0">{{ chapter.title }}</span>
          </button>
        </li>
      </ol>
    </div>
  </dialog>
</template>

<style scoped>
.contents-dialog {
  margin: 0 0 0 auto;
  width: min(26rem, 100vw);
  max-width: 100vw;
  height: 100dvh;
  max-height: 100dvh;
  padding: 0;
  border: 0;
  border-left: 1px solid var(--color-line);
  background-color: var(--color-surface);
  color: var(--color-ink);
  box-shadow: var(--shadow-lift);
}

.contents-dialog[open] {
  animation: slide-in 0.35s var(--ease-editorial);
}

.contents-dialog::backdrop {
  background-color: color-mix(in srgb, var(--color-ink) 35%, transparent);
}

@keyframes slide-in {
  from {
    transform: translateX(24px);
    opacity: 0;
  }
}

.chapter-link {
  display: flex;
  width: 100%;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  text-align: left;
  font-size: 0.9375rem;
  color: var(--color-ink-soft);
  transition: background-color 0.2s ease;
}

.chapter-link:hover {
  background-color: var(--color-paper-deep);
  color: var(--color-ink);
}

.chapter-link[aria-current='true'] {
  background-color: var(--color-burgundy-soft);
  color: var(--color-burgundy-deep);
  font-weight: 500;
}
</style>
