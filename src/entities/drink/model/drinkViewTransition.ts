import { shallowRef } from 'vue'

export const drinkViewTransition = shallowRef<{
  drinkId: string
  direction: 'open' | 'close'
}>()
