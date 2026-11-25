import { devices, test, expect } from '@playwright/test'

test('показывает инструкцию через 25 секунд один раз за сессию вкладки', async ({ page }) => {
  const start = new Date('2026-11-25T12:00:00Z')
  await page.clock.install({ time: start })
  await page.clock.pauseAt(new Date(start.getTime() + 1_000))
  await page.goto('/')

  const dialog = page.getByRole('dialog', { name: 'Установить Drink Cat' })

  await page.clock.runFor(24_999)
  await expect(dialog).toBeHidden()
  await page.clock.runFor(1)
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Закрыть' }).click()
  await expect(dialog).toBeHidden()

  await page.reload()
  await page.clock.runFor(25_000)
  await expect(dialog).toBeHidden()
})

test('не предлагает установку в открытом веб-приложении', async ({ page }) => {
  await page.addInitScript(() => {
    const matchMedia = window.matchMedia.bind(window)
    window.matchMedia = (query) => {
      const media = matchMedia(query)
      if (query === '(display-mode: standalone)') {
        Object.defineProperty(media, 'matches', { value: true })
      }
      return media
    }
  })
  await page.clock.install()
  await page.goto('/')
  await page.clock.fastForward(25_000)

  await expect(page.getByRole('dialog', { name: 'Установить Drink Cat' })).toBeHidden()
})

test('открывает нативный диалог установки по нажатию кнопки', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  await page.clock.fastForward(25_000)

  const dialog = page.getByRole('dialog', { name: 'Установить Drink Cat' })
  await expect(dialog).toBeVisible()
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true })
    window.dispatchEvent(
      Object.assign(event, {
        async prompt() {
          if (!navigator.userActivation.isActive) {
            throw new Error('Нативный диалог должен открываться по действию пользователя')
          }
          return { outcome: 'accepted' }
        },
      }),
    )
  })

  await dialog.getByRole('button', { name: 'Установить', exact: true }).click()
  await expect(dialog).toBeHidden()
})

const manualInstallScenarios = [
  { device: 'Desktop Safari', instruction: 'Добавить в Dock', stepCount: 2 },
  { device: 'iPhone 13', instruction: 'На экран «Домой»', stepCount: 4 },
  { device: 'Desktop Chrome', instruction: 'Установить страницу как приложение', stepCount: 3 },
  { device: 'Pixel 7', instruction: 'Установить и создать ярлык', stepCount: 3 },
]

for (const { device, instruction, stepCount } of manualInstallScenarios) {
  const otherInstructions = manualInstallScenarios
    .filter((scenario) => scenario.device !== device)
    .map((scenario) => scenario.instruction)

  test.describe(device, () => {
    test.use({ userAgent: devices[device].userAgent })

    test('показывает только подходящую инструкцию установки', async ({ page }) => {
      await page.clock.install()
      await page.goto('/')
      await page.clock.fastForward(25_000)

      const dialog = page.getByRole('dialog', { name: 'Установить Drink Cat' })
      await expect(dialog.getByRole('list').getByRole('listitem')).toHaveCount(stepCount)
      await expect(dialog).toContainText(instruction)
      await expect(dialog).not.toContainText(new RegExp(otherInstructions.join('|')))
    })
  })
}
