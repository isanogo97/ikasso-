import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads correctly', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Ikasso/)
    await expect(page.locator('text=Logements')).toBeVisible()
  })

  test('search bar is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Destination')).toBeVisible()
  })

  test('navigation links work', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Mon compte')
    await expect(page).toHaveURL(/auth\/login/)
  })
})
