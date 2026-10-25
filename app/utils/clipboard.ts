/**
 * Copies text to the clipboard. Uses the async Clipboard API where available
 * and falls back to a hidden textarea for older browsers and non-HTTPS pages.
 * Throws when neither method works.
 */
export async function writeToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return
    }
  } catch {
    // Fall through to the legacy method below.
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  textarea.select()
  // execCommand is deprecated but remains the only fallback without the Clipboard API.
  const ok = document.execCommand('copy')
  textarea.remove()
  previousFocus?.focus()
  if (!ok) throw new Error('Copy command was rejected')
}
