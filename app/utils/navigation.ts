import type { MessageKey } from '~/locales'

export interface NavItem {
  to: string
  label: MessageKey
}

export const primaryNav: NavItem[] = [
  { to: '/discover', label: 'nav.discover' },
  { to: '/bookshelf', label: 'nav.bookshelf' },
  { to: '/quotes', label: 'nav.quotes' },
  { to: '/diary', label: 'nav.diary' },
  { to: '/quiz', label: 'nav.quiz' },
]
