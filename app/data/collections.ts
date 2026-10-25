import type { Collection } from '~/types'

/** Editor-curated collections shown on the home page and in Discover. */
export const collections: Collection[] = [
  {
    id: 'moors-and-manors',
    title: 'Moors & Manors',
    description: 'Wind-scoured houses, locked rooms and the secrets kept inside them.',
    bookIds: ['jane-eyre', 'wuthering-heights', 'rebecca', 'the-hound-of-the-baskervilles'],
  },
  {
    id: 'other-worlds',
    title: 'Other Worlds',
    description: 'Deserts, archipelagos and ice planets — maps for the restless imagination.',
    bookIds: ['dune', 'a-wizard-of-earthsea', 'the-left-hand-of-darkness', 'the-hobbit'],
  },
  {
    id: 'slim-and-luminous',
    title: 'Slim & Luminous',
    description: 'Short books with long afterlives, each one finishable in a weekend.',
    bookIds: ['the-little-prince', 'a-room-of-ones-own', 'the-great-gatsby', 'mrs-dalloway', 'the-waste-land'],
  },
]
