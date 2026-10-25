import type { PersonalityId, QuizQuestion, ReadingPersonality } from '~/types'

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'sunday',
    prompt: 'It’s a free Sunday afternoon. Where do we find you?',
    options: [
      {
        id: 'window',
        label: 'By a rain-streaked window',
        detail: 'A pot of tea, a blanket, no plans at all.',
        weights: { contemplative: 2, romantic: 1 },
        moods: ['reflective', 'melancholic'],
      },
      {
        id: 'dinner',
        label: 'At a long dinner party',
        detail: 'Watching who sits beside whom, and why.',
        weights: { romantic: 2, sleuth: 1 },
        moods: ['romantic', 'whimsical'],
      },
      {
        id: 'trail',
        label: 'On an unfamiliar trail',
        detail: 'Somewhere you have never been, map optional.',
        weights: { dreamer: 2, seeker: 1 },
        moods: ['adventurous'],
      },
      {
        id: 'museum',
        label: 'Deep inside a museum',
        detail: 'Reading every single placard.',
        weights: { seeker: 2, sleuth: 1 },
        moods: ['curious'],
      },
    ],
  },
  {
    id: 'first-page',
    prompt: 'Which kind of first page pulls you in?',
    options: [
      {
        id: 'locked-room',
        label: 'A locked room and an unreliable narrator',
        detail: 'Someone is not telling the whole truth.',
        weights: { sleuth: 3 },
        moods: ['suspenseful', 'dark'],
      },
      {
        id: 'map',
        label: 'A map of a place that doesn’t exist',
        detail: 'Yet.',
        weights: { dreamer: 3 },
        moods: ['adventurous', 'whimsical'],
      },
      {
        id: 'ballroom',
        label: 'Two strangers and a misunderstanding',
        detail: 'Preferably in a ballroom.',
        weights: { romantic: 3 },
        moods: ['romantic'],
      },
      {
        id: 'morning',
        label: 'A single quiet morning',
        detail: 'Described in exquisite, unhurried detail.',
        weights: { contemplative: 3 },
        moods: ['reflective'],
      },
    ],
  },
  {
    id: 'closing',
    prompt: 'How do you want to feel when you close a book?',
    options: [
      {
        id: 'elsewhere',
        label: 'As if I’ve been far away',
        detail: 'And came back a slightly different person.',
        weights: { dreamer: 2, contemplative: 1 },
        moods: ['adventurous'],
      },
      {
        id: 'questions',
        label: 'Full of new questions',
        detail: 'With a list of things to look up.',
        weights: { seeker: 3 },
        moods: ['curious'],
      },
      {
        id: 'bruised',
        label: 'Warm, heart a little bruised',
        detail: 'The best kind of ache.',
        weights: { romantic: 2, contemplative: 1 },
        moods: ['romantic', 'melancholic'],
      },
      {
        id: 'unsettled',
        label: 'Unsettled',
        detail: 'Already turning back to page one for clues.',
        weights: { sleuth: 2, contemplative: 1 },
        moods: ['suspenseful', 'dark'],
      },
    ],
  },
  {
    id: 'setting',
    prompt: 'Choose a setting to disappear into.',
    options: [
      {
        id: 'moors',
        label: 'A house on the windswept moors',
        detail: 'With one room nobody enters.',
        weights: { sleuth: 2, romantic: 1 },
        moods: ['dark', 'romantic'],
      },
      {
        id: 'desert',
        label: 'A desert planet',
        detail: 'Where water is worth more than gold.',
        weights: { dreamer: 3 },
        moods: ['adventurous'],
      },
      {
        id: 'city',
        label: 'A city street in June',
        detail: 'Bells, flower stalls, passing thoughts.',
        weights: { contemplative: 2, romantic: 1 },
        moods: ['reflective'],
      },
      {
        id: 'library',
        label: 'A library at closing time',
        detail: 'Just you and the stacks.',
        weights: { seeker: 2, sleuth: 1 },
        moods: ['curious'],
      },
    ],
  },
  {
    id: 'hero',
    prompt: 'What kind of protagonist do you follow anywhere?',
    options: [
      {
        id: 'brilliant',
        label: 'Brilliant and prickly',
        detail: 'Always three steps ahead of everyone.',
        weights: { sleuth: 3 },
        moods: ['suspenseful'],
      },
      {
        id: 'ordinary',
        label: 'Ordinary, then extraordinary',
        detail: 'Someone asked to be braver than they feel.',
        weights: { dreamer: 2, romantic: 1 },
        moods: ['adventurous', 'whimsical'],
      },
      {
        id: 'proud',
        label: 'Proud, stubborn, capable of change',
        detail: 'Especially of changing their mind about someone.',
        weights: { romantic: 3 },
        moods: ['romantic'],
      },
      {
        id: 'real',
        label: 'A real voice',
        detail: 'The essayist, the memoirist, the poet.',
        weights: { seeker: 2, contemplative: 2 },
        moods: ['curious', 'reflective'],
      },
    ],
  },
  {
    id: 'pace',
    prompt: 'And your ideal reading pace?',
    options: [
      {
        id: 'one-sitting',
        label: 'One sitting',
        detail: 'I cannot sleep until I know.',
        weights: { sleuth: 2, dreamer: 1 },
        moods: ['suspenseful'],
      },
      {
        id: 'underlining',
        label: 'Slowly, pencil in hand',
        detail: 'Underlining as I go.',
        weights: { contemplative: 2, seeker: 1 },
        moods: ['reflective'],
      },
      {
        id: 'saga',
        label: 'A saga to live inside',
        detail: 'Weeks in the same world.',
        weights: { dreamer: 2, romantic: 1 },
        moods: ['adventurous'],
      },
      {
        id: 'chapter',
        label: 'A chapter a night',
        detail: 'Savoured, like dessert.',
        weights: { romantic: 2, contemplative: 1 },
        moods: ['romantic', 'whimsical'],
      },
    ],
  },
]

export const personalities: Record<PersonalityId, ReadingPersonality> = {
  romantic: {
    id: 'romantic',
    name: 'The Romantic Classicist',
    tagline: 'You read for the spark between people.',
    description:
      'Wit, longing and a well-timed letter are your favourite plot devices. You love stories about people learning to see each other clearly — and you are not ashamed to re-read the proposal scene.',
    traits: ['Re-reads favourite chapters', 'Notices every glance', 'Believes in second chances'],
    genres: ['romance', 'classic'],
  },
  sleuth: {
    id: 'sleuth',
    name: 'The Midnight Sleuth',
    tagline: 'You read with the lamp low and your guard up.',
    description:
      'You like a story that keeps its secrets. Clues, shadows and narrators who can’t quite be trusted keep you turning pages long after you meant to sleep.',
    traits: ['Spots the twist early', 'Reads in one sitting', 'Loves an atmospheric house'],
    genres: ['mystery', 'classic'],
  },
  dreamer: {
    id: 'dreamer',
    name: 'The World-Builder',
    tagline: 'You read to step through a door into somewhere else.',
    description:
      'Maps on the endpapers, invented languages, impossible landscapes — you read to travel, and the further from home the better. You’ll happily spend a month inside a single saga.',
    traits: ['Studies the map first', 'Loves a long series', 'Roots for the unlikely hero'],
    genres: ['fantasy', 'science-fiction'],
  },
  contemplative: {
    id: 'contemplative',
    name: 'The Quiet Observer',
    tagline: 'You read for the sentence that stops you cold.',
    description:
      'You read slowly and underline often. Plot matters less to you than the texture of a life on the page — a passing thought, a quality of light, a line you copy into your notebook.',
    traits: ['Underlines in pencil', 'Collects sentences', 'Lingers over endings'],
    genres: ['literary', 'poetry'],
  },
  seeker: {
    id: 'seeker',
    name: 'The Curious Mind',
    tagline: 'You read to understand how the world works.',
    description:
      'Every book leaves you with a new question. You move easily between essay, memoir and idea-driven fiction, and you are usually reading three things at once.',
    traits: ['Keeps a running reading list', 'Reads the footnotes', 'Recommends books to everyone'],
    genres: ['nonfiction', 'literary'],
  },
}
