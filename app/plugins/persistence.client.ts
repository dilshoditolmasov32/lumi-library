/**
 * Loads saved reader data from localStorage once hydration has finished.
 * Until then every page renders the same default state as the server,
 * which keeps hydration free of mismatches.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const hydrated = useHydrated()

  const finish = () => {
    if (hydrated.value) return
    flushPendingLoads()
    hydrated.value = true
  }

  nuxtApp.hooks.hookOnce('app:suspense:resolve', finish)
  // Fallback for error pages, which can render without the root suspense resolving.
  nuxtApp.hooks.hookOnce('app:error', () => nextTick(finish))
})
