<script setup lang="ts">
import { LockKeyhole, NotebookPen, Plus } from 'lucide-vue-next'
import type { DiaryDraft, DiaryEntry } from '~/types'
import { monthKey } from '~/utils/dates'

const { t, tn, formatDate, formatNumber } = useLocale()
const { show } = useToast()
const { entries, timeline, totalPages, topMood, create, update, remove, restore } = useDiary()
const hydrated = useHydrated()

useSeoMeta({
  title: t('diary.metaTitle'),
  description: t('diary.metaDescription'),
  robots: 'noindex',
})

/** null = closed, 'new' = creating, otherwise the id being edited. */
const editing = ref<'new' | string | null>(null)
const newButton = ref<HTMLButtonElement | null>(null)

function openNew() {
  editing.value = 'new'
}

function close() {
  const wasNew = editing.value === 'new'
  editing.value = null
  if (wasNew) nextTick(() => newButton.value?.focus())
}

function onCreate(draft: DiaryDraft) {
  create(draft)
  editing.value = null
  show(t('diary.created'), { tone: 'success' })
}

function onUpdate(entry: DiaryEntry, draft: DiaryDraft) {
  update(entry.id, draft)
  editing.value = null
  show(t('diary.updated'), { tone: 'success' })
}

function onDelete(entry: DiaryEntry) {
  const removed = remove(entry.id)
  if (!removed) return
  show(t('diary.deleted'), { action: { label: t('common.undo'), run: () => restore(removed) } })
}

/** Entries grouped by month, newest first. */
const months = computed(() => {
  const groups: Array<{ key: string; label: string; entries: DiaryEntry[] }> = []
  for (const entry of timeline.value) {
    const key = monthKey(entry.date)
    let group = groups.find((item) => item.key === key)
    if (!group) {
      group = { key, label: formatDate(`${key}-01`, { month: 'long', year: 'numeric' }), entries: [] }
      groups.push(group)
    }
    group.entries.push(entry)
  }
  return groups
})

const stats = computed(() => [
  { label: t('diary.statEntries'), value: formatNumber(entries.value.length) },
  { label: t('diary.statPages'), value: formatNumber(totalPages.value) },
  { label: t('diary.statMood'), value: topMood.value ? t(`moods.${topMood.value}`) : t('common.none') },
])
</script>

<template>
  <div class="container-page pt-12 md:pt-20">
    <SectionHeading :level="1" :eyebrow="t('diary.eyebrow')" :title="t('diary.title')" :description="t('diary.lede')">
      <template #action>
        <button
          ref="newButton"
          type="button"
          class="btn btn-primary"
          :disabled="!hydrated || editing === 'new'"
          @click="openNew"
        >
          <Plus aria-hidden="true" />
          {{ t('diary.newEntry') }}
        </button>
      </template>
    </SectionHeading>

    <p class="mt-8 flex max-w-2xl items-start gap-3 rounded-[3px] bg-sage-soft px-4 py-3 text-sm text-sage-deep">
      <LockKeyhole class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {{ t('diary.privacy') }}
    </p>

    <Transition name="reveal">
      <DiaryEntryForm v-if="editing === 'new'" class="mt-10" @submit="onCreate" @cancel="close" />
    </Transition>

    <div v-if="!hydrated" class="mt-12 space-y-6" aria-busy="true">
      <span class="sr-only">{{ t('common.loading') }}</span>
      <div class="skeleton h-20" />
      <div v-for="n in 2" :key="n" class="grid grid-cols-[3.25rem_1fr] gap-5 md:grid-cols-[5rem_1fr] md:gap-8">
        <div class="skeleton h-14" />
        <div class="skeleton h-40" />
      </div>
    </div>

    <EmptyState
      v-else-if="entries.length === 0 && editing !== 'new'"
      class="mt-12"
      :icon="NotebookPen"
      :title="t('diary.emptyTitle')"
      :description="t('diary.emptyBody')"
    >
      <button type="button" class="btn btn-primary" @click="openNew">{{ t('diary.emptyCta') }}</button>
    </EmptyState>

    <template v-else-if="entries.length">
      <dl class="mt-12 grid grid-cols-3 border-t border-l border-line">
        <div v-for="stat in stats" :key="stat.label" class="border-r border-b border-line px-4 py-4 md:px-6">
          <dt class="eyebrow">{{ stat.label }}</dt>
          <dd class="mt-2 font-serif text-2xl md:text-3xl">{{ stat.value }}</dd>
        </div>
      </dl>

      <div class="mt-14 space-y-14">
        <section v-for="month in months" :key="month.key" :aria-labelledby="`month-${month.key}`">
          <h2 :id="`month-${month.key}`" class="flex items-baseline gap-3 border-b border-line pb-3 font-serif text-3xl">
            {{ month.label }}
            <span class="font-sans text-sm text-muted-strong">{{ tn('units.entries', month.entries.length) }}</span>
          </h2>
          <TransitionGroup tag="ol" name="list" class="relative mt-8 space-y-8">
            <li v-for="entry in month.entries" :key="entry.id">
              <DiaryEntryForm
                v-if="editing === entry.id"
                :entry="entry"
                @submit="(draft) => onUpdate(entry, draft)"
                @cancel="close"
              />
              <DiaryTimelineEntry v-else :entry="entry" @edit="editing = entry.id" @delete="onDelete(entry)" />
            </li>
          </TransitionGroup>
        </section>
      </div>
    </template>
  </div>
</template>
