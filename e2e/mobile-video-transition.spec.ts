import { devices, expect, test } from '@playwright/test'

const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = devices['iPhone 13']
test.use({ viewport, userAgent, deviceScaleFactor, isMobile, hasTouch })

// eslint-disable-next-line playwright/no-skipped-test -- The workaround targets mobile WebKit.
test.skip(({ browserName }) => browserName !== 'webkit', 'Проверка видеослоя iOS в WebKit')

test('готовит неподвижный кадр до открытия карточки в мобильном WebKit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await expect
    .poll(() => page.locator('video').evaluate((video) => video.currentTime))
    .toBeGreaterThan(0)

  const capture = await page.evaluateHandle(() => {
    const observation = { videoHidden: false, decodedFrameVisible: false }
    const startViewTransition = document.startViewTransition.bind(document)

    document.startViewTransition = (update) => {
      const video = document.querySelector('video')
      const frame = video?.parentElement?.querySelector(':scope > img')
      observation.videoHidden = !!video && video.getBoundingClientRect().width === 0
      observation.decodedFrameVisible =
        !!frame && frame.naturalWidth > 0 && frame.getBoundingClientRect().width > 0
      return startViewTransition(update)
    }

    return observation
  })

  await page.getByRole('link', { name: /Капучино/ }).tap()
  await expect(page.getByRole('heading', { name: 'Капучино' })).toBeVisible()
  expect(await capture.jsonValue()).toEqual({ videoHidden: true, decodedFrameVisible: true })
})

test('при возврате показывает сохранённый фон до возобновления видео', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await expect
    .poll(() => page.locator('video').evaluate((video) => video.currentTime))
    .toBeGreaterThan(0)
  await page.getByRole('link', { name: /Капучино/ }).tap()
  const back = page.getByRole('link', { name: 'К напиткам' })
  await back.tap({ trial: true })

  const capture = await page.evaluateHandle(() => {
    const observation: { decodedFrameVisible: boolean; releaseFrame?: () => void } = {
      decodedFrameVisible: false,
    }
    const startViewTransition = document.startViewTransition.bind(document)
    const requestFrame = HTMLVideoElement.prototype.requestVideoFrameCallback

    HTMLVideoElement.prototype.requestVideoFrameCallback = function (callback) {
      return requestFrame.call(this, (time, metadata) => {
        observation.releaseFrame = () => callback(time, metadata)
      })
    }

    document.startViewTransition = (update) =>
      startViewTransition(async () => {
        if (typeof update === 'function') await update()
        const frame = document.querySelector('video')?.parentElement?.querySelector(':scope > img')
        observation.decodedFrameVisible =
          !!frame && frame.naturalWidth > 0 && frame.getBoundingClientRect().width > 0
      })

    return observation
  })

  await back.tap()
  await expect(page.getByRole('heading', { name: 'популярные напитки' })).toBeVisible()
  expect(await capture.evaluate((observation) => observation.decodedFrameVisible)).toBe(true)

  const video = page.locator('video')
  const frame = page.locator('video + img')
  await expect(video).toBeVisible()
  await expect.poll(() => capture.evaluate((observation) => !!observation.releaseFrame)).toBe(true)
  await expect(frame).toBeVisible()
  await capture.evaluate((observation) => observation.releaseFrame?.())
  await expect(frame).toBeHidden()
})
