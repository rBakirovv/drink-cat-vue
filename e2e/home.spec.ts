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
