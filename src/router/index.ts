import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { DrinkDetailPage } from '@/pages/drink-detail'
import { HomePage } from '@/pages/home'
import { drinkViewTransition, popularDrinks } from '@/entities/drink'

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

router.beforeResolve(async (to, from) => {
  const opening = from.name === 'home' && to.name === 'drink-detail'
  const closing = from.name === 'drink-detail' && to.name === 'home'

  if (
    (!opening && !closing) ||
    !document.startViewTransition ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return
  }

  const { drinkId } = (opening ? to : from).params
  if (typeof drinkId !== 'string' || !popularDrinks.some(({ id }) => id === drinkId)) return

  const state = { drinkId, direction: opening ? 'open' : 'close' } as const
  drinkViewTransition.value = state
  document.documentElement.dataset.drinkTransition = state.direction
  await nextTick()

  // Resume routing after capture, and wait for the new route before revealing it.
  await new Promise<void>((resumeNavigation) => {
    const navigationDone = new Promise<void>((resolve) => {
      const removeHook = router.afterEach((target) => {
        if (target !== to) return
        removeHook()
        resolve()
      })
    })

    const transition = document.startViewTransition(async () => {
      resumeNavigation()
      await navigationDone
      await nextTick()
    })

    const clearState = () => {
      if (drinkViewTransition.value !== state) return
      drinkViewTransition.value = undefined
      delete document.documentElement.dataset.drinkTransition
    }
    void transition.finished.then(clearState, clearState)
  })
})

export default router
