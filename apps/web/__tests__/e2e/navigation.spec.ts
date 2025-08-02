import { test, expect } from '@playwright/test'

test.describe('Navigation and Routing', () => {
  test('should display homepage', async ({ page }) => {
    await page.goto('/')
    
    // Check if the main elements are present
    await expect(page.locator('text=Crops.AI')).toBeVisible()
    await expect(page.locator('text=Sign In')).toBeVisible()
    await expect(page.locator('text=Sign Up')).toBeVisible()
  })

  test('should navigate to login page from homepage', async ({ page }) => {
    await page.goto('/')
    
    // Click sign in button
    await page.click('text=Sign In')
    
    // Should be on login page
    await expect(page).toHaveURL('/login')
  })

  test('should navigate to register page from homepage', async ({ page }) => {
    await page.goto('/')
    
    // Click sign up button
    await page.click('text=Sign Up')
    
    // Should be on register page
    await expect(page).toHaveURL('/register')
  })

  test('should redirect to login when accessing protected routes', async ({ page }) => {
    // Try to access dashboard without being logged in
    await page.goto('/dashboard')
    
    // Should be redirected to login
    await expect(page).toHaveURL('/login')
  })

  test('should redirect to login when accessing farms page', async ({ page }) => {
    // Try to access farms without being logged in
    await page.goto('/farms')
    
    // Should be redirected to login
    await expect(page).toHaveURL('/login')
  })

  test('should redirect to login when accessing fields page', async ({ page }) => {
    // Try to access fields without being logged in
    await page.goto('/fields')
    
    // Should be redirected to login
    await expect(page).toHaveURL('/login')
  })

  test('should redirect to login when accessing weather page', async ({ page }) => {
    // Try to access weather without being logged in
    await page.goto('/weather')
    
    // Should be redirected to login
    await expect(page).toHaveURL('/login')
  })

  test('should handle 404 for non-existent routes', async ({ page }) => {
    // Go to a non-existent route
    const response = await page.goto('/non-existent-route')
    
    // Should return 404 status
    expect(response?.status()).toBe(404)
  })

  test('should have responsive navbar', async ({ page }) => {
    await page.goto('/')
    
    // Test different viewport sizes
    await page.setViewportSize({ width: 375, height: 667 }) // Mobile
    await expect(page.locator('text=Crops.AI')).toBeVisible()
    
    await page.setViewportSize({ width: 768, height: 1024 }) // Tablet
    await expect(page.locator('text=Crops.AI')).toBeVisible()
    
    await page.setViewportSize({ width: 1280, height: 720 }) // Desktop
    await expect(page.locator('text=Crops.AI')).toBeVisible()
  })
})

test.describe('Authenticated Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // This is a placeholder for setting up authenticated state
    // In a real scenario, you'd log in or set auth cookies/tokens
    await page.goto('/login')
  })

  test('should show navigation menu for authenticated users', async ({ page }) => {
    // Note: This test assumes we can somehow get to an authenticated state
    // In reality, you'd need to either:
    // 1. Actually log in with valid credentials
    // 2. Mock authentication state
    // 3. Use test user accounts
    
    // For now, just test that the login page has the expected elements
    await expect(page.locator('text=Sign In')).toBeVisible()
    
    // Future implementation would test:
    // - Navigation to dashboard after login
    // - Presence of nav links (Dashboard, Farms, Fields, Weather)
    // - User profile menu
    // - Sign out functionality
  })
})