const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/** True for a real calendar date written as YYYY-MM-DD. */
export function isISODate(value: string): boolean {
  const match = ISO_DATE.exec(value)
  if (!match) return false
  const [, y, m, d] = match
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)))
  return (
    date.getUTCFullYear() === Number(y) &&
    date.getUTCMonth() === Number(m) - 1 &&
    date.getUTCDate() === Number(d)
  )
}

/**
 * Converts YYYY-MM-DD to a Date at UTC midnight. Formatting it with
 * `timeZone: 'UTC'` gives the same output on the server and in the browser.
 */
export function isoDateToUTC(value: string): Date {
  const match = ISO_DATE.exec(value)
  if (!match) return new Date(Number.NaN)
  const [, y, m, d] = match
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)))
}

/** Today's date in the reader's own timezone, as YYYY-MM-DD. Browser use only. */
export function localTodayISO(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Whole days since 1 January 1970 (UTC). Used to pick a daily quote. */
export function daysSinceEpoch(now: Date = new Date()): number {
  return Math.floor(now.getTime() / 86_400_000)
}

/** "2026-10" style key used to group diary entries by month. */
export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7)
}
