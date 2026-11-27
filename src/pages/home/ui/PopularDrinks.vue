<script lang="ts">
let previousCatalogPosition: { drinkId: string; slideIndex: number } | undefined
</script>

<script setup lang="ts">
import type { Swiper as SwiperInstance } from 'swiper'
import { A11y, Keyboard } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import 'swiper/css'
import 'swiper/css/a11y'

import { DrinkCard, drinkViewTransition, useDrinkCatalog } from '@/entities/drink'

const catalog = useDrinkCatalog()
const popularDrinks = computed(() => catalog.popularDrinks)
const loading = ref(false)
const failed = ref(false)

async function loadCatalog() {
  loading.value = true
  failed.value = false
  try {
    await catalog.loadPopularDrinks()
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

if (!popularDrinks.value) void loadCatalog()

const returningDrinkId = drinkViewTransition.value?.drinkId
const initialSlide =
  previousCatalogPosition && previousCatalogPosition.drinkId === returningDrinkId
    ? previousCatalogPosition.slideIndex
    : Math.max(0, popularDrinks.value?.findIndex(({ id }) => id === returningDrinkId) ?? 0)

let swiper: SwiperInstance | undefined

watch(drinkViewTransition, (transition) => {
  if (transition?.direction === 'open' && swiper) {
    previousCatalogPosition = { drinkId: transition.drinkId, slideIndex: swiper.activeIndex }
  }
})
</script>

<template>
  <section
    id="popular-drinks"
    class="min-h-screen px-0 py-6"
    aria-labelledby="popular-drinks-title"
  >
    <h2 id="popular-drinks-title" class="text-xl font-semibold pl-6">популярные напитки</h2>

    <div
      v-if="loading"
      class="mt-4 flex gap-3 overflow-hidden pl-6 motion-safe:animate-pulse"
      role="status"
      aria-label="Загрузка напитков"
    >
      <div
        v-for="card in 8"
        :key="card"
        data-slot="drink-card-skeleton"
        aria-hidden="true"
        class="w-40 shrink-0 rounded-(--drink-card-radius) bg-white p-3"
      >
        <div class="mb-2 flex h-6 items-center">
          <div class="h-4 w-24 rounded-md bg-neutral-200"></div>
        </div>
        <div class="mb-3 aspect-square rounded-lg bg-neutral-100"></div>
        <div class="flex items-center justify-between">
          <div class="h-4 w-12 rounded-md bg-neutral-200"></div>
          <div class="size-8 rounded-full bg-neutral-100"></div>
        </div>
      </div>
    </div>
    <p v-else-if="failed" class="px-6" role="alert">Не удалось загрузить каталог</p>
    <p v-else-if="!popularDrinks?.length" class="px-6">Пока нет популярных напитков</p>
    <Swiper
      v-else
      class="mt-4 !pl-6"
      :modules="[A11y, Keyboard]"
      :initial-slide="initialSlide"
      slides-per-view="auto"
      :space-between="12"
      :keyboard="{ enabled: true, onlyInViewport: true }"
      :a11y="{
        containerMessage: 'Популярные напитки',
        containerRole: 'region',
        itemRoleDescriptionMessage: 'Напиток',
        slideLabelMessage: '{{index}} из {{slidesLength}}',
      }"
      @swiper="swiper = $event"
    >
      <SwiperSlide v-for="drink in popularDrinks" :key="drink.id" class="w-40!">
        <RouterLink
          :to="{
            name: 'drink-detail',
            params: { drinkId: drink.id },
            state: { fromCatalog: true },
          }"
          :class="{ 'drink-transition-card': drinkViewTransition?.drinkId === drink.id }"
          class="drink-card-link block focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        >
          <DrinkCard class="rounded-none" :drink="drink" />
        </RouterLink>
      </SwiperSlide>
    </Swiper>
  </section>
</template>

<style scoped>
.drink-card-link {
  overflow: hidden;
  border-radius: var(--drink-card-radius);
}

.drink-transition-card {
  view-transition-name: drink-card;
}

.drink-transition-card :deep(img) {
  view-transition-name: drink-image;
}
</style>
