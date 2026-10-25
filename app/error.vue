<script setup lang="ts">
import { BookX } from 'lucide-vue-next'
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { t } = useLocale()
const notFound = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: () => (notFound.value ? t('error.notFoundTitle') : t('error.genericTitle')),
  robots: 'noindex',
})

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <NuxtLayout>
    <div class="container-page py-20 md:py-32">
      <p class="eyebrow text-center">{{ error.statusCode }}</p>
      <EmptyState
        class="mx-auto mt-6 max-w-2xl"
        heading-level="h2"
        :icon="BookX"
        :title="notFound ? t('error.notFoundTitle') : t('error.genericTitle')"
        :description="notFound ? t('error.notFoundBody') : t('error.genericBody')"
      >
        <button type="button" class="btn btn-primary" @click="goHome">{{ t('error.home') }}</button>
        <button type="button" class="btn btn-secondary" @click="clearError({ redirect: '/discover' })">{{ t('nav.discover') }}</button>
      </EmptyState>
    </div>
    <ToastRegion />
  </NuxtLayout>
</template>
