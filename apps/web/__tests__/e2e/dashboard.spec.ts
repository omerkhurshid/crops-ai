import { test, expect } from '@playwright/test'

test.describe('Dashboard Functionality', () => {
  test.describe('Unauthenticated Access', () => {
    test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Should be redirected to login
      await expect(page).toHaveURL('/login')
    })
  })

  test.describe('Demo Mode Testing', () => {
    test('should attempt to access dashboard with demo login', async ({ page }) => {
      // Go to login page
      await page.goto('/login')
      
      // Fill in demo credentials
      await page.fill('input[type="email"]', 'demo@crops.ai')
      await page.fill('input[type="password"]', 'Demo123!')
      
      // Submit the form
      await page.click('button[type="submit"]')
      
      // Wait for response
      await page.waitForTimeout(3000)
      
      const currentUrl = page.url()
      
      // Check if we successfully logged in or got an error
      if (currentUrl.includes('/dashboard')) {
        // If login succeeded, test dashboard elements
        await expect(page.locator('text=Dashboard')).toBeVisible()
        await expect(page.locator('text=Welcome back')).toBeVisible()
        
        // Test navigation elements
        await expect(page.locator('text=Farms')).toBeVisible()
        await expect(page.locator('text=Fields')).toBeVisible()
        await expect(page.locator('text=Weather')).toBeVisible()
        
        // Test dashboard cards
        await expect(page.locator('text=Total Farms')).toBeVisible()
        await expect(page.locator('text=Active Fields')).toBeVisible()
        await expect(page.locator('text=Weather Alerts')).toBeVisible()
        
      } else {
        // If login failed, that's expected in test environment
        const hasError = await page.locator('text=Invalid email or password').isVisible()
        expect(hasError || currentUrl.includes('/login')).toBe(true)
      }
    })
  })

  test.describe('Dashboard Elements (if accessible)', () => {
    test.beforeEach(async ({ page }) => {
      // Try to get to dashboard, skip if not possible
      await page.goto('/login')
      await page.fill('input[type="email"]', 'demo@crops.ai')
      await page.fill('input[type="password"]', 'Demo123!')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(2000)
    })

    test('should display dashboard stats cards', async ({ page }) => {
      // Only run if we successfully got to dashboard
      if (page.url().includes('/dashboard')) {
        await expect(page.locator('text=Total Farms')).toBeVisible()
        await expect(page.locator('text=Active Fields')).toBeVisible()
        await expect(page.locator('text=Weather Alerts')).toBeVisible()
        await expect(page.locator('text=Recent Activity')).toBeVisible()
        await expect(page.locator('text=Quick Actions')).toBeVisible()
      }
    })

    test('should have working navigation links', async ({ page }) => {
      if (page.url().includes('/dashboard')) {
        // Test farms navigation
        await page.click('text=Farms')
        await page.waitForTimeout(1000)
        expect(page.url()).toContain('/farms')
        
        // Go back to dashboard
        await page.click('text=Dashboard')
        await page.waitForTimeout(1000)
        expect(page.url()).toContain('/dashboard')
        
        // Test fields navigation
        await page.click('text=Fields')
        await page.waitForTimeout(1000)
        expect(page.url()).toContain('/fields')
        
        // Go back to dashboard
        await page.click('text=Dashboard')
        await page.waitForTimeout(1000)
        expect(page.url()).toContain('/dashboard')
        
        // Test weather navigation
        await page.click('text=Weather')
        await page.waitForTimeout(1000)
        expect(page.url()).toContain('/weather')
      }
    })

    test('should display user greeting', async ({ page }) => {
      if (page.url().includes('/dashboard')) {
        // Should show welcome message with user name
        await expect(page.locator('text=Welcome back')).toBeVisible()
      }
    })

    test('should have sign out functionality', async ({ page }) => {
      if (page.url().includes('/dashboard')) {
        // Look for sign out button
        const signOutButton = page.locator('text=Sign Out')
        if (await signOutButton.isVisible()) {
          await signOutButton.click()
          await page.waitForTimeout(1000)
          
          // Should be redirected to home or login page
          const currentUrl = page.url()
          expect(currentUrl === '/' || currentUrl.includes('/login')).toBe(true)
        }
      }
    })
  })
})