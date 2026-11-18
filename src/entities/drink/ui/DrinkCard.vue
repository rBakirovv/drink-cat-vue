<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'

import type { Drink } from '../model/types'

import { Card, CardContent, CardFooter } from '@/shared/ui/card'

defineProps<{ drink: Drink }>()

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})
</script>

<template>
  <Card class="gap-0 rounded-2xl border-0 bg-white py-0 text-neutral-900 shadow-none">
    <CardContent class="p-3">
      <h3 class="mb-2 text-base font-medium">{{ drink.name }}</h3>
      <img
        :src="drink.image"
        :alt="drink.name"
        width="384"
        height="384"
        loading="lazy"
        draggable="false"
        class="aspect-square w-full object-contain"
      />
    </CardContent>
    <CardFooter class="justify-between px-3 pt-0 pb-3">
      <span class="text-base font-medium">{{ priceFormatter.format(drink.price) }}</span>
      <span
        aria-hidden="true"
        class="flex size-8 items-center justify-center rounded-full bg-white"
      >
        <ArrowUpRight class="size-4" :stroke-width="1.5" />
      </span>
    </CardFooter>
  </Card>
</template>
