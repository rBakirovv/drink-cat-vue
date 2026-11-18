import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'

import DrinkCard from './DrinkCard.vue'

it('показывает название, фотографию и цену напитка в рублях', () => {
  const wrapper = mount(DrinkCard, {
    props: {
      drink: { id: 'latte', name: 'Латте', price: 280, image: '/images/drinks/latte.png' },
    },
  })

  expect(wrapper.get('h3').text()).toBe('Латте')
  expect(wrapper.get('img[alt="Латте"]').attributes('src')).toBe('/images/drinks/latte.png')
  expect(wrapper.text()).toMatch(/280\s₽/)
})
