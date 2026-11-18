<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'

import PopularDrinks from './PopularDrinks.vue'

const popularDrinks = useTemplateRef<HTMLElement>('popularDrinks')
const scrollOffset = ref(0)
let touchStart: { x: number; y: number; scrollY: number } | null = null

function updateGradient() {
  scrollOffset.value = Math.max(0, window.scrollY)
}

onMounted(() => {
  updateGradient()
  window.addEventListener('scroll', updateGradient, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateGradient)
})

function resetSwipe() {
  touchStart = null
}

function handleTouchStart(event: TouchEvent) {
  resetSwipe()
  const touch = event.touches[0]

  if (event.touches.length === 1 && touch) {
    touchStart = { x: touch.clientX, y: touch.clientY, scrollY: window.scrollY }
  }
}

function handleTouchEnd(event: TouchEvent) {
  const start = touchStart
  resetSwipe()
  const touch = event.changedTouches[0]
  const target = popularDrinks.value

  if (!start || !touch || !target || event.touches.length > 0) {
    return
  }

  const distanceUp = start.y - touch.clientY
  const distanceAcross = Math.abs(touch.clientX - start.x)

  if (Math.abs(distanceUp) <= distanceAcross || target.getBoundingClientRect().top <= 0) {
    return
  }

  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'instant'
    : 'smooth'

  if (distanceUp > 0 && window.scrollY > start.scrollY) {
    target.scrollIntoView({ behavior, block: 'start' })
  } else if (distanceUp < 0 && window.scrollY < start.scrollY) {
    window.scrollTo({ top: 0, behavior })
  }
}
</script>

<template>
  <main
    class="bg-white text-neutral-900"
    @touchstart.passive="handleTouchStart"
    @touchend.passive="handleTouchEnd"
    @touchcancel="resetSwipe"
  >
    <section class="relative h-svh">
      <video
        class="h-full w-full object-cover"
        src="/videos/drink-cat-coffee.mp4"
        autoplay
        muted
        loop
        playsinline
      ></video>
      <div
        :style="{ height: `calc(12rem + ${scrollOffset}px)` }"
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 bottom-0 max-h-full bg-linear-to-t from-white via-white/70 to-transparent"
      ></div>
    </section>

    <div ref="popularDrinks" class="relative -mt-20">
      <PopularDrinks />
    </div>
  </main>
</template>
