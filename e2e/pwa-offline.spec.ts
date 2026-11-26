import process from 'node:process'
import { expect, test } from '@playwright/test'

// eslint-disable-next-line playwright/no-skipped-test -- The service worker runs in the production preview.
test.skip(!process.env.CI, 'Требуется сборка и запуск теста с CI=1')

test('воспроизводит фоновое видео при первом открытии главной офлайн', async ({
  context,
  page,
}) => {
  await page.goto('/drinks/cappuccino')
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)

  await context.setOffline(true)
  await page.goto('/')

  const video = page.locator('video')
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeGreaterThan(0)

  const rangeStatus = await video.evaluate(async (element: HTMLVideoElement) => {
    const response = await fetch(element.currentSrc, { headers: { Range: 'bytes=0-99' } })
    return response.status
  })
  expect(rangeStatus).toBe(206)
})
