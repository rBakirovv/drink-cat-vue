import { expect, test } from '@playwright/test'

const endpoint = 'https://web.push.apple.com/test-subscription'

test('регистрирует Web Push по нажатию и удаляет подписку при выключении', async ({ page }) => {
  await page.addInitScript((endpoint) => {
    let permission: NotificationPermission = 'default'
    let subscribed = false
    const subscription = {
      endpoint,
      toJSON: () => ({ endpoint, keys: { p256dh: 'browser-key', auth: 'browser-auth' } }),
      unsubscribe: async () => {
        subscribed = false
        return true
      },
    }
    Object.defineProperty(Notification, 'permission', { get: () => permission })
    Object.defineProperty(navigator.serviceWorker, 'getRegistration', {
      value: async () => ({
        active: {},
        pushManager: {
          getSubscription: async () => (subscribed ? subscription : null),
          subscribe: async (options: PushSubscriptionOptionsInit) => {
            if (
              !navigator.userActivation.isActive ||
              !options.userVisibleOnly ||
              !(options.applicationServerKey instanceof Uint8Array) ||
              options.applicationServerKey.length !== 65
            ) {
              throw new Error('Подписка должна использовать ключ VAPID по действию пользователя')
            }
            permission = 'granted'
            subscribed = true
            return subscription
          },
        },
      }),
    })
  }, endpoint)
  await page.route('**/api/push/public-key', (route) =>
    route.fulfill({ json: { publicKey: 'B' + 'A'.repeat(86) } }),
  )
  await page.route('**/api/push/subscriptions', (route) => route.fulfill({ status: 204 }))

  await page.goto('/')
  await page.getByRole('button', { name: 'Открыть меню Drink Cat' }).click()
  const notifications = page.getByRole('menuitemcheckbox', { name: 'Уведомления', exact: true })
  await expect(notifications).toBeEnabled()
  await expect(notifications).not.toBeChecked()

  const [registered] = await Promise.all([
    page.waitForRequest(
      (request) =>
        new URL(request.url()).pathname === '/api/push/subscriptions' &&
        request.method() === 'POST',
      { timeout: 5000 },
    ),
    notifications.click(),
  ])
  expect(registered.postDataJSON()).toEqual({
    endpoint,
    keys: { p256dh: 'browser-key', auth: 'browser-auth' },
  })
  await expect(notifications).toBeChecked()

  const [removed] = await Promise.all([
    page.waitForRequest(
      (request) =>
        new URL(request.url()).pathname === '/api/push/subscriptions' &&
        request.method() === 'DELETE',
      { timeout: 5000 },
    ),
    notifications.click(),
  ])
  expect(removed.postDataJSON()).toEqual({ endpoint })
  await expect(notifications).not.toBeChecked()
})
