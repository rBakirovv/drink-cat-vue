import type { Drink } from './types'

export const popularDrinks = [
  {
    id: 'latte',
    name: 'Латте',
    price: 280,
    image: '/images/drinks/latte.png',
    description: 'Эспрессо с большим количеством молока и тонким слоем пены.',
  },
  {
    id: 'cappuccino',
    name: 'Капучино',
    price: 250,
    image: '/images/drinks/cappuccino.png',
    description: 'Эспрессо с тёплым молоком и густой молочной пеной.',
  },
  {
    id: 'iced-coffee',
    name: 'Айс-кофе',
    price: 320,
    image: '/images/drinks/iced-coffee.png',
    description: 'Охлаждённый кофе со льдом.',
  },
  {
    id: 'flat-white',
    name: 'Флэт уайт',
    price: 290,
    image: '/images/drinks/flat-white.png',
    description: 'Двойной эспрессо с прогретым молоком и тонким слоем пены.',
  },
] satisfies (Drink & { description: string })[]
