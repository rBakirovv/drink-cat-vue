<script setup lang="ts">
import { A11y, Keyboard } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'

import 'swiper/css'
import 'swiper/css/a11y'

import { popularDrinks } from '../model/popularDrinks'

import { DrinkCard } from '@/entities/drink'
</script>

<template>
  <section class="min-h-screen px-4 py-6 pr-0" aria-labelledby="popular-drinks-title">
    <h2 id="popular-drinks-title" class="text-xl font-semibold">популярные напитки</h2>

    <Swiper
      class="mt-4"
      :modules="[A11y, Keyboard]"
      slides-per-view="auto"
      :space-between="12"
      :keyboard="{ enabled: true, onlyInViewport: true }"
      :a11y="{
        containerMessage: 'Популярные напитки',
        containerRole: 'region',
        itemRoleDescriptionMessage: 'Напиток',
        slideLabelMessage: '{{index}} из {{slidesLength}}',
      }"
    >
      <SwiperSlide v-for="drink in popularDrinks" :key="drink.id" class="w-40!">
        <DrinkCard :drink="drink" />
      </SwiperSlide>
    </Swiper>
  </section>
</template>
