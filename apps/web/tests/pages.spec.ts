import { test, expect } from '@playwright/test'

test.describe('Public Pages', () => {
  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('text=Politique de Confidentialit')).toBeVisible()
  })

  test('terms page loads', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.locator('text=Conditions')).toBeVisible()
  })

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.locator('text=Contact')).toBeVisible()
  })

  test('help page loads', async ({ page }) => {
    await page.goto('/help')
    await expect(page.locator('text=aide')).toBeVisible()
  })

  test('search page loads', async ({ page }) => {
    await page.goto('/search')
    await expect(page).toHaveURL(/search/)
  })
})
