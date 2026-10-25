<script setup lang="ts">
import { Library, Menu, X } from 'lucide-vue-next'
import { primaryNav } from '~/utils/navigation'

const { t } = useLocale()
const { shelf } = useBookshelf()
const route = useRoute()

const menuOpen = ref(false)
const toggleButton = ref<HTMLButtonElement | null>(null)

function closeMenu(returnFocus = true) {
  if (!menuOpen.value) return
  menuOpen.value = false
  if (returnFocus) toggleButton.value?.focus()
}

watch(
  () => route.fullPath,
  () => closeMenu(false),
)

watch(menuOpen, (open) => {
  document.documentElement.classList.toggle('is-locked', open)
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu()
}

// Close the mobile menu if the viewport grows to desktop size.
function onResize() {
  if (window.matchMedia('(min-width: 768px)').matches) closeMenu(false)
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onResize)
  document.documentElement.classList.remove('is-locked')
})
</script>

<template>
  <!-- No backdrop-filter here: it would trap the fixed mobile menu inside the header. -->
  <header class="sticky top-0 z-40 border-b border-line bg-paper/95">
    <div class="container-page flex h-16 items-center justify-between gap-6 md:h-20">
      <NuxtLink to="/" class="flex items-baseline gap-4" :aria-label="t('nav.home')">
        <span class="font-serif text-[1.75rem] leading-none font-semibold tracking-[0.3em] text-ink">LUMI</span>
        <span class="hidden border-l border-line-strong pl-4 text-[0.6875rem] tracking-[0.2em] text-muted-strong uppercase lg:inline">
          {{ t('nav.tagline') }}
        </span>
      </NuxtLink>

      <nav :aria-label="t('nav.main')" class="hidden md:block">
        <ul class="flex items-center gap-1">
          <li v-for="item in primaryNav" :key="item.to">
            <NuxtLink :to="item.to" class="nav-link">
              {{ t(item.label) }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-1">
        <NuxtLink
          to="/bookshelf"
          class="btn btn-secondary btn-sm hidden sm:inline-flex"
          :aria-label="t('nav.shelfCount', { count: shelf.length })"
        >
          <Library aria-hidden="true" />
          <span class="tabular-nums">{{ shelf.length }}</span>
        </NuxtLink>
        <button
          ref="toggleButton"
          type="button"
          class="btn btn-ghost btn-icon md:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-nav"
          @click="menuOpen = !menuOpen"
        >
          <X v-if="menuOpen" aria-hidden="true" />
          <Menu v-else aria-hidden="true" />
          <span class="sr-only">{{ menuOpen ? t('nav.closeMenu') : t('nav.openMenu') }}</span>
        </button>
      </div>
    </div>

    <AppMobileNav id="mobile-nav" :open="menuOpen" :shelf-count="shelf.length" @close="closeMenu(false)" />
  </header>
</template>

<style scoped>
.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 2.5rem;
  padding: 0 0.875rem;
  font-size: 0.875rem;
  color: var(--color-ink-soft);
  transition: color 0.2s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  left: 0.875rem;
  right: 0.875rem;
  bottom: 0.35rem;
  height: 1px;
  background-color: currentColor;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s var(--ease-editorial);
}

.nav-link:hover {
  color: var(--color-ink);
}

.nav-link:hover::after,
.nav-link[aria-current='page']::after {
  transform: scaleX(1);
}

.nav-link[aria-current='page'] {
  color: var(--color-burgundy);
}
</style>
