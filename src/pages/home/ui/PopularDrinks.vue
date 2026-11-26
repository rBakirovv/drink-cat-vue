<script lang="ts">
let previousCatalogPosition: { drinkId: string; slideIndex: number } | undefined
</script>

<script setup lang="ts">
import type { Swiper as SwiperInstance } from 'swiper'
import { A11y, Keyboard } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { watch } from 'vue'
import { RouterLink } from 'vue-router'

import 'swiper/css'
import 'swiper/css/a11y'

import { DrinkCard, drinkViewTransition, popularDrinks } from '@/entities/drink'

const returningDrinkId = drinkViewTransition.value?.drinkId
const initialSlide =
  previousCatalogPosition && previousCatalogPosition.drinkId === returningDrinkId
    ? previousCatalogPosition.slideIndex
    : Math.max(
        0,
        popularDrinks.findIndex(({ id }) => id === returningDrinkId),
      )

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

    <Swiper
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
