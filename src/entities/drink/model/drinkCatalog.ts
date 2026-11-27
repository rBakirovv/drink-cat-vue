import { defineStore } from 'pinia'
import { ref, shallowReactive } from 'vue'

import { fetchDrink, fetchPopularDrinks } from '../api/drinks'
import type { Drink, DrinkDetails } from './types'

export const useDrinkCatalog = defineStore('drink-catalog', () => {
  const popularDrinks = ref<Drink[] | null>(null)
  const details = shallowReactive(new Map<string, DrinkDetails>())
  const pendingDetails = new Map<string, Promise<DrinkDetails | null>>()

  async function loadPopularDrinks() {
    popularDrinks.value = await fetchPopularDrinks()
  }

  async function loadDrink(drinkId: string): Promise<DrinkDetails | null> {
    const cached = details.get(drinkId)
    if (cached) return cached

    const pending = pendingDetails.get(drinkId)
    if (pending) return pending

    const request = fetchDrink(drinkId)
      .then((drink) => {
        if (drink) details.set(drinkId, drink)
        return drink
      })
      .finally(() => pendingDetails.delete(drinkId))
    pendingDetails.set(drinkId, request)
    return request
  }

  return { popularDrinks, details, loadPopularDrinks, loadDrink }
})
