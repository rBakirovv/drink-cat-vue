import type { Drink, DrinkDetails } from '../model/types'

export async function fetchPopularDrinks(): Promise<Drink[]> {
  const response = await fetch('/api/drinks?popular=true', { signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error(`Не удалось загрузить каталог (${response.status})`)
  return response.json()
}

export async function fetchDrink(drinkId: string): Promise<DrinkDetails | null> {
  const response = await fetch(`/api/drinks/${encodeURIComponent(drinkId)}`, {
    signal: AbortSignal.timeout(8000),
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Не удалось загрузить напиток (${response.status})`)
  return response.json()
}
