import { expect, test } from '@playwright/test'

test('позволяет выбрать другой размер напитка', async ({ page }) => {
  await page.goto('/drinks/cappuccino')

  const sizes = page.getByRole('group', { name: 'Размер' })
  await expect(sizes.getByRole('radio', { name: 'M, 350 мл' })).toBeChecked()

  const large = sizes.getByRole('radio', { name: 'L, 450 мл' })
  await large.click()
  await expect(large).toBeChecked()
  await expect(page.getByRole('button', { name: /250\s*₽/ })).toBeVisible()
})
