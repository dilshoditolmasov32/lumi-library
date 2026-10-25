# LUMI — a reading journal for book lovers

A frontend prototype built with Nuxt 4, Vue 3, TypeScript (strict) and Tailwind CSS 4.
It uses only local mock data: there is no backend, no login and no database.
Your bookshelf, saved quotes, diary and quiz result are saved in this browser's `localStorage`.

## Pages

| Route        | What it does                                                                    |
| ------------ | ------------------------------------------------------------------------------- |
| `/`          | Hero, featured books, quote of the day, reading journey, diary preview, quiz, collections |
| `/discover`  | Search by title or author, filter by genre or collection, sort, add to shelf    |
| `/bookshelf` | Group or filter by status, change progress, status, rating and notes; add and remove books |
| `/quotes`    | Curated quotes with attribution; save, search, filter by theme, copy           |
| `/diary`     | Private reading diary: create, edit and delete entries, with form validation   |
| `/quiz`      | Six-question reading personality quiz with book recommendations                |
| `/read/:id`  | In-app reader for the free (public-domain) books                               |

Filters on Discover, Bookshelf and Quotes are kept in the URL, so filtered views can be linked.

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # vue-tsc via `nuxt typecheck`
npm run build      # production build
npm run preview    # serve the production build
npm run books:import  # re-download the free book texts (see below)
```

## Project structure

```
app/
  assets/css/main.css   Design tokens (@theme), base styles, shared classes, transitions
  components/
    layout/             AppHeader, AppMobileNav, AppFooter, ToastRegion
    ui/                 SectionHeading, EmptyState, StarRating, SearchField
    books/              BookCover (CSS covers), BookCard, ShelfButton, ShelfItem, ReadingProgress, AddBookPanel
    quotes/             QuoteCard
    diary/              DiaryEntryForm, DiaryTimelineEntry
    quiz/               QuizQuestionStep, QuizResultCard
    home/               Homepage sections
  composables/          useBookshelf, useDiary, useSavedQuotes, useQuizResult, useCatalog,
                        usePersistedState, useLocale, useToast
  data/                 books, quotes, collections, quiz, seed (starting state)
  locales/              en.ts (all interface text) + typed locale registry
  pages/                One file per route
  plugins/              persistence.client.ts (loads saved data after hydration)
  types/                Book, UserBook, Quote, DiaryEntry, QuizQuestion, QuizResult, …
  utils/                Type guards, dates, search, quiz scoring, clipboard
```

Components are auto-imported by file name (`<BookCard />`), whatever folder they are in.

## How state works

- **Catalog vs. shelf.** `data/books.ts` is the shared, read-only catalog. A reader's shelf
  (`UserBook`) only stores a `bookId` plus their own progress, rating and note.
- **Persistence.** `usePersistedState` wraps `useState` and saves it to `localStorage` under
  `lumi:v1:*`. The server and the first client render always use the default state.
  Saved data is loaded only after hydration, so there are no hydration mismatches.
  Pages that show personal data display a short loading skeleton until then.
  Stored data is validated before use; invalid data is ignored.
- **Reset.** "Reset prototype data" in the footer restores the starting state.

## Localization

All interface text is in `app/locales/en.ts` and is read with `t('key')` / `tn('key', count)`
from `useLocale()`. Keys are type-checked, so a mistyped key fails `npm run typecheck`.
To add Uzbek:

1. Create `app/locales/uz.ts` with `export const uz: Messages = { … }`. TypeScript reports any missing key.
2. Register it in `app/locales/index.ts` (`LOCALES`, `messages`, `intlLocales` → `'uz-Latn-UZ'`).
3. Add a language switcher that sets `useLocale().locale`.

Catalog content (synopses, quotes, quiz questions) lives in `app/data` and would be translated separately.

## Free books reader

Nine public-domain classics can be read inside LUMI: Pride and Prejudice, Persuasion,
Jane Eyre, Wuthering Heights, Frankenstein, Moby-Dick, The Hound of the Baskervilles,
The Great Gatsby and Mrs Dalloway. They show a **Read free** button, and Discover has a
**Free to read** filter. All other books are still under copyright, so their full text is not offered.

- The texts come from [Standard Ebooks](https://standardebooks.org), which releases its editions under CC0.
  `npm run books:import` downloads them and writes one small JSON file per chapter to `public/books/<id>/`.
  The output is committed, so the reader works without contacting Standard Ebooks.
- The import script escapes all text and keeps only `<em>` and `<br>`. Over-long sections are split into parts.
- The reader saves your chapter and scroll position, and your text size, in this browser.
  It reopens where you stopped and moves your bookshelf progress forward (never backwards).
  Moving past the first chapter adds the book to your shelf as "Reading" (with Undo).
  At the end of the book, "Mark as finished" completes it.
- Keyboard: ← and → turn chapters. The contents list is a native dialog (Escape closes it).

## Content notes

- Book titles, authors and first-publication years are factual. Page counts are approximate.
  Synopses were written for LUMI.
- Quotes are attributed to their published works. Translated works credit the translator.
- Book covers are drawn with CSS and SVG. The app uses no remote images.
- "Reading circles" (community) are marked as coming soon. The homepage shows curated collections instead.
