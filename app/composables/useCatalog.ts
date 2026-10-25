import { books } from '~/data/books'
import { collections } from '~/data/collections'
import { GENRES, type Book, type Collection, type Genre } from '~/types'

const booksById = new Map(books.map((book) => [book.id, book]))

/** Read-only access to the global book catalog. */
export function useCatalog() {
  const featuredBooks = books.filter((book) => book.featured)
  const genres: Genre[] = GENRES.filter((genre) => books.some((book) => book.genre === genre))

  function getBook(id: string): Book | undefined {
    return booksById.get(id)
  }

  function getCollection(id: string): Collection | undefined {
    return collections.find((collection) => collection.id === id)
  }

  function booksIn(collection: Collection): Book[] {
    return collection.bookIds.flatMap((id) => booksById.get(id) ?? [])
  }

  return { books, collections, featuredBooks, genres, getBook, getCollection, booksIn }
}
