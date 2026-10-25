import type { Genre, ReadingMood } from './book'

export const PERSONALITY_IDS = ['romantic', 'sleuth', 'dreamer', 'contemplative', 'seeker'] as const
export type PersonalityId = (typeof PERSONALITY_IDS)[number]

export interface QuizOption {
  id: string
  label: string
  detail: string
  /** Points this answer adds to each personality. */
  weights: Partial<Record<PersonalityId, number>>
  /** Moods used to rank book recommendations. */
  moods: ReadingMood[]
}

export interface QuizQuestion {
  id: string
  prompt: string
  options: QuizOption[]
}

export interface ReadingPersonality {
  id: PersonalityId
  name: string
  tagline: string
  description: string
  traits: string[]
  genres: Genre[]
}

export interface QuizResult {
  personalityId: PersonalityId
  scores: Record<PersonalityId, number>
  /** questionId → optionId */
  answers: Record<string, string>
  recommendedBookIds: string[]
  completedAt: string
}
