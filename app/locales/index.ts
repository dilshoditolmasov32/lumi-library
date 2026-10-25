import { en } from './en'

/**
 * Locale registry. To add Uzbek: create `uz.ts` exporting
 * `export const uz: Messages = { … }` (TypeScript then enforces that every
 * key is translated), register it below and add 'uz' to LOCALES.
 */
export type Messages = typeof en

export const LOCALES = ['en'] as const
export type Locale = (typeof LOCALES)[number]

export const messages: Record<Locale, Messages> = { en }

/** BCP 47 tags used for Intl date, number and plural formatting. */
export const intlLocales: Record<Locale, string> = { en: 'en-GB' }

export const DEFAULT_LOCALE: Locale = 'en'

type Join<P extends string, K extends string> = P extends '' ? K : `${P}.${K}`

/** Every dotted path that leads to a string, e.g. "nav.discover". */
export type LeafKeys<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? Join<P, K> : LeafKeys<T[K], Join<P, K>>
}[keyof T & string]

/** Every dotted path that leads to a { one, other } plural group. */
export type PluralKeys<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? never
    : T[K] extends { one: string; other: string }
      ? Join<P, K>
      : PluralKeys<T[K], Join<P, K>>
}[keyof T & string]

export type MessageKey = LeafKeys<Messages>
export type PluralKey = PluralKeys<Messages>
