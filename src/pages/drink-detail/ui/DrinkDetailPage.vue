<script setup lang="ts">
import { ArrowLeft, Plus } from '@lucide/vue'
import { computed, ref, shallowRef, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useDrinkCatalog } from '@/entities/drink'
import { Button } from '@/shared/ui/button'

const props = defineProps<{ drinkId: string }>()
const router = useRouter()
const catalog = useDrinkCatalog()
const drink = computed(() => catalog.details.get(props.drinkId))
const attempt = ref(0)
const status = ref<'loading' | 'missing' | 'error'>('loading')
const title = computed(() => {
  if (drink.value) return drink.value.name
  if (status.value === 'loading') return 'Загрузка напитка…'
  if (status.value === 'error') return 'Не удалось загрузить напиток'
  return 'Напиток не найден'
})

watch(
  [() => props.drinkId, attempt],
  async ([drinkId], _previous, onCleanup) => {
    if (drink.value) return
    let active = true
    onCleanup(() => {
      active = false
    })

    status.value = 'loading'
    try {
      const result = await catalog.loadDrink(drinkId)
      if (active && !result) status.value = 'missing'
    } catch {
      if (active) status.value = 'error'
    }
  },
  { immediate: true },
)

let returningToCatalog = false

function returnToCatalog(event: MouseEvent) {
  if (
    router.options.history.state.fromCatalog !== true ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    event.shiftKey
  ) {
    return
  }

  event.preventDefault()
  if (returningToCatalog) return
  returningToCatalog = true
  router.back()
}

const sizes = [
  { label: 'S', volume: 250 },
  { label: 'M', volume: 350 },
  { label: 'L', volume: 450 },
] as const
const selectedSize = shallowRef<(typeof sizes)[number]>(sizes[1])
const selectedSizeIndex = computed(() => sizes.indexOf(selectedSize.value))
const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})
</script>

<template>
  <main
    class="min-h-svh bg-linear-to-b from-[#271911] via-[#613e2b] to-[#8b5a3d] text-white"
    :class="{ '[view-transition-name:drink-card]': drink }"
  >
    <div
      class="mx-auto flex min-h-svh w-full max-w-lg flex-col px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-8"
    >
      <header class="relative flex min-h-11 items-center justify-center px-12">
        <Button
          as-child
          size="icon-lg"
          class="absolute left-0 rounded-full bg-white text-black hover:bg-neutral-100"
        >
          <RouterLink
            :to="{ name: 'home', hash: '#popular-drinks' }"
            aria-label="К напиткам"
            @click.capture="returnToCatalog"
          >
            <ArrowLeft class="size-5" aria-hidden="true" />
          </RouterLink>
        </Button>
        <h1 class="text-center text-2xl leading-tight font-semibold sm:text-3xl">
          {{ title }}
        </h1>
      </header>

      <div v-if="!drink && status === 'error'" class="mt-4 text-center">
        <Button @click="attempt++">Повторить</Button>
      </div>

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
            class="aspect-square w-full max-w-[min(24rem,53svh)] object-contain drop-shadow-[0_22px_26px_#2b160866] [view-transition-name:drink-image]"
          />
        </div>

        <div class="flex items-center gap-2 rounded-[2rem] bg-black/25 p-2 sm:gap-3">
          <fieldset class="min-w-0 flex-1 rounded-full bg-white/10 p-1">
            <legend class="sr-only">Размер</legend>
            <div class="group relative flex">
              <span
                aria-hidden="true"
                class="pointer-events-none absolute inset-y-0 left-0 z-10 flex flex-col items-center justify-center leading-tight text-[#271911] transition-transform duration-250 ease-out before:absolute before:inset-0 before:-z-10 before:scale-115 before:rounded-full before:bg-white before:shadow-[0_6px_18px_#00000026] group-has-[:focus-visible]:before:outline-2 group-has-[:focus-visible]:before:outline-offset-2 group-has-[:focus-visible]:before:outline-white motion-reduce:transition-none"
                :style="{
                  width: `${100 / sizes.length}%`,
                  transform: `translateX(${selectedSizeIndex * 100}%)`,
                }"
              >
                {{ selectedSize.label }}
                <span class="text-[11px] whitespace-nowrap">{{ selectedSize.volume }} мл</span>
              </span>
              <label
                v-for="size in sizes"
                :key="size.label"
                class="relative flex min-w-0 flex-1 cursor-pointer"
              >
                <input
                  v-model="selectedSize"
                  type="radio"
                  name="drink-size"
                  :value="size"
                  :aria-label="`${size.label}, ${size.volume} мл`"
                  class="peer absolute inset-0 z-20 m-0 size-full cursor-pointer opacity-0"
                />
                <span
                  aria-hidden="true"
                  class="flex aspect-square w-full items-center justify-center leading-tight peer-checked:invisible"
                >
                  {{ size.label }}
                </span>
              </label>
            </div>
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
