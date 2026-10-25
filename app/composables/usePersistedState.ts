import { effectScope, type Ref } from 'vue'

const STORAGE_PREFIX = 'lumi:v1:'

interface Registration {
  load: () => void
  reset: () => void
}

/*
 * Client-only bookkeeping. Server renders always use the default state;
 * saved data is read only after hydration, so the first client render
 * matches the server HTML exactly (no hydration mismatch).
 */
const registrations = new Map<string, Registration>()
const pendingLoads: Array<() => void> = []

/** True once the app has hydrated and saved data has been loaded. */
export function useHydrated() {
  return useState<boolean>('lumi:hydrated', () => false)
}

/**
 * A `useState` that is mirrored to localStorage under `lumi:v1:<key>`.
 * `isValid` guards against corrupt or outdated stored data.
 */
export function usePersistedState<T>(key: string, init: () => T, isValid: (value: unknown) => value is T): Ref<T> {
  const state = useState<T>(`lumi:${key}`, init)

  if (import.meta.client && !registrations.has(key)) {
    const hydrated = useHydrated()
    const toast = useToast()
    const { t } = useLocale()
    const storageKey = STORAGE_PREFIX + key
    let warned = false

    const load = () => {
      try {
        const raw = window.localStorage.getItem(storageKey)
        if (raw !== null) {
          const parsed: unknown = JSON.parse(raw)
          if (isValid(parsed)) state.value = parsed
        }
      } catch {
        // Storage blocked or data corrupt: keep the default state.
      }
      // A detached scope keeps the watcher alive after the calling component unmounts.
      effectScope(true).run(() => {
        watch(
          state,
          (value) => {
            try {
              window.localStorage.setItem(storageKey, JSON.stringify(value))
            } catch {
              if (!warned) toast.show(t('toast.storageFailed'), { tone: 'error' })
              warned = true
            }
          },
          { deep: true },
        )
      })
    }

    registrations.set(key, {
      load,
      reset: () => {
        try {
          window.localStorage.removeItem(storageKey)
        } catch {
          // Ignore: nothing to clear.
        }
        state.value = init()
      },
    })

    if (hydrated.value) load()
    else pendingLoads.push(load)
  }

  return state
}

/** Called once by the persistence plugin after hydration. */
export function flushPendingLoads() {
  pendingLoads.splice(0).forEach((load) => load())
}

/** Restores every persisted state to its default value. */
export function resetPersistedState() {
  registrations.forEach((registration) => registration.reset())
  // Also clear keys for data that hasn't been opened in this visit.
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => window.localStorage.removeItem(key))
  } catch {
    // Storage unavailable: nothing to clear.
  }
}
