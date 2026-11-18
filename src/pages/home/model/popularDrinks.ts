import type { Drink } from '@/entities/drink'

export const popularDrinks: Drink[] = [
  { id: 'latte', name: 'Латте', price: 280, image: '/images/drinks/latte.png' },
  { id: 'cappuccino', name: 'Капучино', price: 250, image: '/images/drinks/cappuccino.png' },
  { id: 'iced-coffee', name: 'Айс-кофе', price: 320, image: '/images/drinks/iced-coffee.png' },
  { id: 'flat-white', name: 'Флэт уайт', price: 290, image: '/images/drinks/flat-white.png' },
]
