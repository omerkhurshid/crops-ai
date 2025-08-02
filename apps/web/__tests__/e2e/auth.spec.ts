import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting page before each test
    await page.goto('/')
  })

  test('should display login page', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
    
    // Check if the login form is present
    await expect(page.locator('text=Sign In')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should display demo credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Check if demo credentials are shown
    await expect(page.locator('text=Demo Credentials')).toBeVisible()
    await expect(page.locator('text=demo@crops.ai')).toBeVisible()
    await expect(page.locator('text=admin@crops.ai')).toBeVisible()
  })

  test('should show validation error for empty email', async ({ page }) => {
    await page.goto('/login')
    
    // Try to submit without email
    await page.fill('input[type="password"]', 'Demo123!')
    await page.click('button[type="submit"]')
    
    // Check if HTML5 validation prevents submission
    const emailInput = page.locator('input[type="email"]')
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('should attempt login with demo credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in demo credentials
    await page.fill('input[type="email"]', 'demo@crops.ai')
    await page.fill('input[type="password"]', 'Demo123!')
    
    // Submit the form
    await page.click('button[type="submit"]')
    
    // Wait for either success (redirect to dashboard) or error message
    await page.waitForTimeout(2000) // Give time for login attempt
    
    // Check if we're redirected to dashboard or if there's an error message
    const currentUrl = page.url()
    const hasError = await page.locator('text=Invalid email or password').isVisible().catch(() => false)
    
    // Either we should be redirected to dashboard or see an error
    expect(currentUrl.includes('/dashboard') || hasError).toBe(true)
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')
    
    // Click on sign up link
    await page.click('text=Sign Up')
    
    // Should be on register page
    await expect(page).toHaveURL('/register')
    await expect(page.locator('text=Create Account')).toBeVisible()
  })

  test('should display register form', async ({ page }) => {
    await page.goto('/register')
    
    // Check if all registration fields are present
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show password requirements', async ({ page }) => {
    await page.goto('/register')
    
    // Check if password requirements are shown
    await expect(page.locator('text=At least 8 characters')).toBeVisible()
    await expect(page.locator('text=One uppercase letter')).toBeVisible()
    await expect(page.locator('text=One special character')).toBeVisible()
  })
})