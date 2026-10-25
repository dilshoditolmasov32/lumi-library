<script setup lang="ts">
import { RotateCcw } from 'lucide-vue-next'

const { t } = useLocale()
const { show } = useToast()

const year = useState('lumi:footer-year', () => new Date().getFullYear())

const exploreLinks = [
  { to: '/discover', label: 'nav.discover' },
  { to: '/quotes', label: 'nav.quotes' },
  { to: '/quiz', label: 'nav.quiz' },
] as const

const libraryLinks = [
  { to: '/bookshelf', label: 'nav.bookshelf' },
  { to: '/diary', label: 'nav.diary' },
] as const

// Two-step reset: the first click arms the button, the second confirms.
const confirming = ref(false)
let confirmTimer: ReturnType<typeof setTimeout> | undefined

function onReset() {
  if (!confirming.value) {
    confirming.value = true
    confirmTimer = setTimeout(() => (confirming.value = false), 4000)
    return
  }
  clearTimeout(confirmTimer)
  confirming.value = false
  resetPersistedState()
  show(t('footer.resetDone'), { tone: 'success' })
}

onBeforeUnmount(() => clearTimeout(confirmTimer))
</script>

<template>
  <footer class="mt-24 border-t border-line bg-paper-deep/60">
    <div class="container-page grid gap-12 py-14 md:grid-cols-12 md:py-20">
      <div class="md:col-span-5">
        <NuxtLink to="/" class="font-serif text-3xl font-semibold tracking-[0.3em]" :aria-label="t('nav.home')">LUMI</NuxtLink>
        <p class="mt-4 max-w-sm font-serif text-xl leading-snug text-ink-soft italic">
          {{ t('footer.tagline') }}
        </p>
      </div>

      <nav class="grid grid-cols-2 gap-8 md:col-span-4" :aria-label="t('footer.navLabel')">
        <div>
          <h2 class="eyebrow">{{ t('footer.explore') }}</h2>
          <ul class="mt-4 space-y-3 text-sm">
            <li v-for="link in exploreLinks" :key="link.to">
              <NuxtLink :to="link.to" class="link-draw text-ink-soft hover:text-ink">{{ t(link.label) }}</NuxtLink>
            </li>
          </ul>
        </div>
        <div>
          <h2 class="eyebrow">{{ t('footer.library') }}</h2>
          <ul class="mt-4 space-y-3 text-sm">
            <li v-for="link in libraryLinks" :key="link.to">
              <NuxtLink :to="link.to" class="link-draw text-ink-soft hover:text-ink">{{ t(link.label) }}</NuxtLink>
            </li>
          </ul>
        </div>
      </nav>

      <div class="md:col-span-3">
        <p class="text-sm leading-relaxed text-muted-strong">{{ t('footer.note') }}</p>
        <button type="button" class="btn btn-ghost btn-sm mt-3 -ml-3" @click="onReset">
          <RotateCcw aria-hidden="true" />
          <span aria-live="polite">{{ confirming ? t('footer.resetConfirm') : t('footer.reset') }}</span>
        </button>
      </div>
    </div>
    <div class="border-t border-line">
      <p class="container-page py-6 text-xs text-muted-strong">{{ t('footer.rights', { year }) }}</p>
    </div>
  </footer>
</template>
