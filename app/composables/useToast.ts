export type ToastTone = 'neutral' | 'success' | 'error'

export interface ToastAction {
  label: string
  run: () => void
}

export interface Toast {
  id: number
  message: string
  tone: ToastTone
  action?: ToastAction
}

interface ToastOptions {
  tone?: ToastTone
  action?: ToastAction
  duration?: number
}

const MAX_VISIBLE = 3
let nextId = 0
const timers = new Map<number, ReturnType<typeof setTimeout>>()

/** Small notification queue rendered by <ToastRegion />. Client-side only. */
export function useToast() {
  const toasts = useState<Toast[]>('lumi:toasts', () => [])

  function dismiss(id: number) {
    const timer = timers.get(id)
    if (timer) clearTimeout(timer)
    timers.delete(id)
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function show(message: string, options: ToastOptions = {}) {
    if (import.meta.server) return
    const id = ++nextId
    const toast: Toast = { id, message, tone: options.tone ?? 'neutral', action: options.action }
    const overflow = toasts.value.slice(0, Math.max(0, toasts.value.length - (MAX_VISIBLE - 1)))
    overflow.forEach((old) => dismiss(old.id))
    toasts.value = [...toasts.value, toast]
    timers.set(id, setTimeout(() => dismiss(id), options.duration ?? (options.action ? 6500 : 3500)))
  }

  /** Runs a toast's action (e.g. Undo) and closes the toast. */
  function runAction(toast: Toast) {
    toast.action?.run()
    dismiss(toast.id)
  }

  return { toasts, show, dismiss, runAction }
}
