import { test, expect } from '@playwright/test'

test('показывает популярные напитки на главной', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'популярные напитки' })).toBeVisible()
})

test('открывает описание и фото напитка из каталога', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /Капучино/ }).click()

  await expect(page.getByRole('heading', { name: 'Капучино' })).toBeVisible()
  await expect(page.getByText(/эспрессо.*молочн/i)).toBeVisible()
  await expect(page.getByRole('img', { name: 'Капучино' })).toBeVisible()
})

test('растягивает карточку и её углы при открытии страницы', async ({ page, browserName }) => {
  // eslint-disable-next-line playwright/no-skipped-test -- The check reads Chromium's animated pseudo-element geometry.
  test.skip(browserName !== 'chromium', 'Проверка геометрии View Transition в Chromium')

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const card = page.getByRole('link', { name: /Капучино/ })
  const cardShape = await card.evaluate((element) => ({
    width: element.getBoundingClientRect().width,
    radius: Number.parseFloat(getComputedStyle(element).borderTopLeftRadius),
  }))

  await Promise.all([
    page.waitForFunction(
      ({ width, radius }) => {
        return document.getAnimations().some(({ effect }) => {
          if (!(effect instanceof KeyframeEffect)) return false

          const group = effect.pseudoElement?.match(/^::view-transition-group\((.+)\)$/)
          if (!group || !effect.pseudoElement) return false

          return (
            effect.getComputedTiming().duration === 420 &&
            effect
              .getKeyframes()
              .some((frame) => Number.parseFloat(String(frame.width)) === width) &&
            Number.parseFloat(
              getComputedStyle(document.documentElement, effect.pseudoElement).width,
            ) > width &&
            Number.parseFloat(
              getComputedStyle(
                document.documentElement,
                `::view-transition-image-pair(${group[1]})`,
              ).borderTopLeftRadius,
            ) >
              radius * 1.5
          )
        })
      },
      cardShape,
      { timeout: 3000 },
    ),
    card.click(),
  ])

  await expect(page.getByRole('heading', { name: 'Капучино' })).toBeVisible()
})

test('сохраняет фон с видео видимым до конца открытия карточки', async ({ page, browserName }) => {
  // eslint-disable-next-line playwright/no-skipped-test -- The check reads Chromium's animated snapshots.
  test.skip(browserName !== 'chromium', 'Проверка фона View Transition в Chromium')

  await page.setViewportSize({ width: 390, height: 700 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await expect
    .poll(() => page.locator('video').evaluate((video) => video.currentTime))
    .toBeGreaterThan(0)

  await Promise.all([
    page.waitForFunction(
      () =>
        document.getAnimations().some(({ effect, currentTime }) => {
          if (!(effect instanceof KeyframeEffect) || typeof currentTime !== 'number') return false

          const isExpandingCard = effect.pseudoElement === '::view-transition-group(drink-card)'
          return (
            isExpandingCard &&
            currentTime >= 250 &&
            getComputedStyle(document.documentElement, '::view-transition-old(root)').opacity ===
              '1' &&
            getComputedStyle(document.documentElement, '::view-transition-new(root)').opacity ===
              '0'
          )
        }),
      undefined,
      { timeout: 3000 },
    ),
    page.getByRole('link', { name: /Капучино/ }).click(),
  ])

  await expect(page.getByRole('heading', { name: 'Капучино' })).toBeVisible()
})

test('сворачивает страницу обратно в карточку напитка', async ({ page, browserName }) => {
  // eslint-disable-next-line playwright/no-skipped-test -- The check reads animated snapshots in Chromium and WebKit.
  test.skip(browserName === 'firefox', 'Проверка кадров View Transition в Chromium и WebKit')

  await page.setViewportSize({ width: 390, height: 700 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/drinks/flat-white')
  const detailWidth = await page.getByRole('main').evaluate((element) => element.clientWidth)

  await Promise.all([
    page.waitForFunction(
      (width) =>
        document.getAnimations().some(({ effect, currentTime }) => {
          if (!(effect instanceof KeyframeEffect)) return false

          const group = effect.pseudoElement?.match(/^::view-transition-group\((.+)\)$/)
          if (!group || typeof currentTime !== 'number' || currentTime < 140 || currentTime > 205) {
            return false
          }

          const [start, end] = effect.getKeyframes()
          const opacity = Number(
            getComputedStyle(document.documentElement, `::view-transition-new(${group[1]})`)
              .opacity,
          )
          return (
            Number.parseFloat(String(start?.width)) === width &&
            Number.parseFloat(String(end?.width)) < width &&
            opacity > 0.1 &&
            opacity < 0.5
          )
        }),
      detailWidth,
      { timeout: 3000 },
    ),
    page.getByRole('link', { name: 'К напиткам' }).click(),
  ])

  await expect(page.getByRole('link', { name: /Флэт уайт/ })).toBeInViewport({ ratio: 0.5 })
})

test('показывает карточку напитка со скруглением и без рамки', async ({ page }) => {
  await page.goto('/')
  const card = page.getByRole('link', { name: /Капучино/ })
  await expect(card).toHaveCSS('border-top-width', '0px')
  await expect(card).toHaveCSS('border-top-left-radius', '16px')
})

test('возвращает к экрану с видео после открытия карточки с этого экрана', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 })
  await page.goto('/')
  const card = page.getByRole('link', { name: /Капучино/ })
  await expect(card).toBeInViewport({ ratio: 1 })

  await card.click()
  await expect(page.getByRole('heading', { name: 'Капучино' })).toBeVisible()
  await page.getByRole('link', { name: 'К напиткам' }).click()

  await expect(page).toHaveURL(/\/$/)
  await expect
    .poll(() => page.locator('video').evaluate((video) => video.getBoundingClientRect().top))
    .toBe(0)
})

test('возвращает карточку на прежнее место в карусели по кнопке браузера', async ({
  page,
  browserName,
}) => {
  // eslint-disable-next-line playwright/no-skipped-test -- The position is restored for animated navigation.
  test.skip(browserName !== 'chromium', 'Проверка возврата с View Transition в Chromium')

  await page.setViewportSize({ width: 390, height: 700 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const card = page.getByRole('link', { name: /Капучино/ })
  const originalX = await card.evaluate((element) => element.getBoundingClientRect().x)

  await card.click()
  await expect(page.getByRole('heading', { name: 'Капучино' })).toBeVisible()
  await page.getByRole('link', { name: 'К напиткам' }).click({ trial: true })
  await page.goBack()

  await expect
    .poll(() => card.evaluate((element) => element.getBoundingClientRect().x))
    .toBeCloseTo(originalX)
})

test('запрашивает разрешение на уведомления из меню кота', async ({ page }) => {
  await page.addInitScript(() => {
    let permission: NotificationPermission = 'default'

    Object.defineProperty(Notification, 'permission', { get: () => permission })
    Notification.requestPermission = async () => {
      if (!navigator.userActivation.isActive) {
        throw new Error('Разрешение нужно запрашивать по действию пользователя')
      }

      permission = 'granted'
      return permission
    }
  })

  await page.goto('/')
  await page.getByRole('button', { name: 'Открыть меню Drink Cat' }).click()
  const notifications = page.getByRole('menuitemcheckbox', { name: 'Уведомления', exact: true })

  await expect(notifications).toBeEnabled()
  await expect(notifications).not.toBeChecked()
  await notifications.press('Space')
  await expect(notifications).toBeChecked()
})

test('сохраняет выключенные уведомления после перезагрузки', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Notification, 'permission', { value: 'granted' })
  })
  await page.goto('/')

  const menu = page.getByRole('button', { name: 'Открыть меню Drink Cat' })
  const notifications = page.getByRole('menuitemcheckbox', { name: 'Уведомления', exact: true })

  await menu.click()
  await expect(notifications).toBeChecked()
  await notifications.click()
  await expect(notifications).not.toBeChecked()

  await page.reload()
  await menu.click()
  await expect(notifications).toBeEnabled()
  await expect(notifications).not.toBeChecked()
})
