import { createRouter, createWebHistory } from 'vue-router'
import { DrinkDetailPage } from '@/pages/drink-detail'
import { HomePage } from '@/pages/home'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    return savedPosition ?? (to.hash === '#popular-drinks' ? { el: to.hash } : { top: 0 })
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/drinks/:drinkId',
      name: 'drink-detail',
      component: DrinkDetailPage,
      props: true,
    },
  ],
})

export default router
