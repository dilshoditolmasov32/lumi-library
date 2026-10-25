import { DEFAULT_LOCALE, intlLocales, messages, type Locale, type MessageKey, type PluralKey } from '~/locales'
import { isRecord } from '~/utils/guards'
import { isoDateToUTC } from '~/utils/dates'

type Params = Record<string, string | number>

function lookup(tree: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => (isRecord(node) ? node[part] : undefined), tree)
}

function interpolate(template: string, params?: Params): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name]
    return value === undefined ? match : String(value)
  })
}

/**
 * Tiny, typed translation helper. All interface copy goes through `t` and
 * `tn`, so adding a locale only means adding a messages file.
 */
export function useLocale() {
  const locale = useState<Locale>('lumi:locale', () => DEFAULT_LOCALE)
  const intlLocale = computed(() => intlLocales[locale.value])

  function t(key: MessageKey, params?: Params): string {
    const value = lookup(messages[locale.value], key) ?? lookup(messages[DEFAULT_LOCALE], key)
    return typeof value === 'string' ? interpolate(value, params) : key
  }

  function formatNumber(value: number): string {
    return new Intl.NumberFormat(intlLocale.value).format(value)
  }

  /** Pluralised message, e.g. tn('units.pages', 3) → "3 pages". */
  function tn(key: PluralKey, count: number, params?: Params): string {
    const group = lookup(messages[locale.value], key) ?? lookup(messages[DEFAULT_LOCALE], key)
    if (!isRecord(group)) return key
    const rule = new Intl.PluralRules(intlLocale.value).select(count)
    const template = group[rule] ?? group.other
    return typeof template === 'string' ? interpolate(template, { count: formatNumber(count), ...params }) : key
  }

  /** Formats a YYYY-MM-DD date identically on server and client. */
  function formatDate(
    isoDate: string,
    options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
  ): string {
    const date = isoDateToUTC(isoDate.slice(0, 10))
    if (Number.isNaN(date.getTime())) return isoDate
    return new Intl.DateTimeFormat(intlLocale.value, { ...options, timeZone: 'UTC' }).format(date)
  }

  return { locale, t, tn, formatNumber, formatDate }
}
