import { test, expect } from '@playwright/test'

test('показывает популярные напитки на главной', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'популярные напитки' })).toBeVisible()
})
