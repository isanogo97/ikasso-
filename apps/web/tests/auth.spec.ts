import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.locator('text=Se connecter')).toBeVisible()
    await expect(page.locator('text=Continuer avec Apple')).toBeVisible()
    await expect(page.locator('text=Continuer avec Google')).toBeVisible()
  })

  test('register page loads', async ({ page }) => {
    await page.goto('/auth/register-new')
    await expect(page.locator('text=Creer un compte')).toBeVisible()
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'invalid@test.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    // Should show error or stay on login page
    await expect(page).toHaveURL(/auth\/login/)
  })

  test('forgot password page loads', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    await expect(page.locator('text=mot de passe')).toBeVisible()
  })
})
