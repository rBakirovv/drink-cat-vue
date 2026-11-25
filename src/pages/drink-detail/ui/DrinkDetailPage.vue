<script setup lang="ts">
import { ChevronLeft, Plus } from '@lucide/vue'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { popularDrinks } from '@/entities/drink'
import { Button } from '@/shared/ui/button'

const props = defineProps<{ drinkId: string }>()
const drink = computed(() => popularDrinks.find(({ id }) => id === props.drinkId))

const sizes = [
  { label: 'S', volume: 250 },
  { label: 'M', volume: 350 },
  { label: 'L', volume: 450 },
]
const selectedSize = ref('M')
const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})
</script>

<template>
  <main class="min-h-svh bg-linear-to-b from-[#271911] via-[#613e2b] to-[#8b5a3d] text-white">
    <div
      class="mx-auto flex min-h-svh w-full max-w-lg flex-col px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-8"
    >
      <header class="relative flex min-h-11 items-center justify-center px-12">
        <Button
          as-child
          size="icon-lg"
          class="absolute left-0 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
        >
          <RouterLink :to="{ name: 'home', hash: '#popular-drinks' }" aria-label="К напиткам">
            <ChevronLeft class="size-5" aria-hidden="true" />
          </RouterLink>
        </Button>
        <h1 class="text-center text-2xl leading-tight font-semibold sm:text-3xl">
          {{ drink?.name ?? 'Напиток не найден' }}
        </h1>
      </header>

      <template v-if="drink">
        <p class="mx-auto mt-4 max-w-xs text-center text-base text-[#f5dfce]">
          {{ drink.description }}
        </p>

        <div class="flex flex-1 items-center justify-center py-8">
          <img
            :src="drink.image"
            :alt="drink.name"
            width="384"
            height="384"
            class="aspect-square w-full max-w-[min(24rem,53svh)] object-contain drop-shadow-[0_22px_26px_#2b160866]"
          />
        </div>

        <div class="flex items-center gap-2 rounded-[2rem] bg-black/25 p-2 sm:gap-3">
          <fieldset class="flex min-w-0 flex-1 rounded-full bg-white/10 p-1">
            <legend class="sr-only">Размер</legend>
            <label
              v-for="size in sizes"
              :key="size.label"
              class="relative flex min-w-0 flex-1 cursor-pointer"
            >
              <input
                v-model="selectedSize"
                type="radio"
                name="drink-size"
                :value="size.label"
                :aria-label="`${size.label}, ${size.volume} мл`"
                class="peer absolute inset-0 z-10 m-0 size-full cursor-pointer opacity-0"
              />
              <span
                class="flex h-12 w-full flex-col items-center justify-center rounded-full leading-tight peer-checked:bg-white peer-checked:text-[#271911] peer-focus-visible:ring-2 peer-focus-visible:ring-white peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#613e2b]"
              >
                {{ size.label }}
                <span v-if="selectedSize === size.label" class="text-[11px] whitespace-nowrap">
                  {{ size.volume }} мл
                </span>
              </span>
            </label>
          </fieldset>

          <Button
            type="button"
            disabled
            class="h-14 flex-1 rounded-full bg-[#3049dc] px-3 text-lg text-white disabled:opacity-100"
            :aria-label="`Добавить за ${priceFormatter.format(drink.price)}`"
          >
            <Plus class="size-5" aria-hidden="true" />
            {{ priceFormatter.format(drink.price) }}
          </Button>
        </div>
      </template>
    </div>
  </main>
</template>
