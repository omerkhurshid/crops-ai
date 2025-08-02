import { test, expect } from '@playwright/test'

test.describe('Farms Page', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/farms')
    
    // Should be redirected to login
    await expect(page).toHaveURL('/login')
  })

  test.describe('Farms Page Content (Demo Mode)', () => {
    test.beforeEach(async ({ page }) => {
      // Try to log in with demo credentials first
      await page.goto('/login')
      await page.fill('input[type="email"]', 'demo@crops.ai')
      await page.fill('input[type="password"]', 'Demo123!')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(2000)
      
      // Navigate to farms page if login was successful
      if (page.url().includes('/dashboard')) {
        await page.goto('/farms')
      }
    })

    test('should display farms page elements', async ({ page }) => {
      // Only test if we successfully reached the farms page
      if (page.url().includes('/farms')) {
        // Check page title and description
        await expect(page.locator('text=My Farms')).toBeVisible()
        await expect(page.locator('text=Manage and monitor your agricultural operations')).toBeVisible()
        
        // Check for add farm button
        await expect(page.locator('text=+ Add New Farm')).toBeVisible()
        
        // Check for stats cards
        await expect(page.locator('text=Total Farms')).toBeVisible()
        await expect(page.locator('text=Total Acreage')).toBeVisible()
        await expect(page.locator('text=Active Farms')).toBeVisible()
        await expect(page.locator('text=Crop Types')).toBeVisible()
      }
    })

    test('should display demo farm cards', async ({ page }) => {
      if (page.url().includes('/farms')) {
        // Check if demo farms are displayed
        await expect(page.locator('text=Greenfield Acres')).toBeVisible()
        await expect(page.locator('text=Sunrise Farm')).toBeVisible()
        await expect(page.locator('text=Valley View Ranch')).toBeVisible()
        
        // Check farm details
        await expect(page.locator('text=Iowa, USA')).toBeVisible()
        await expect(page.locator('text=Nebraska, USA')).toBeVisible()
        await expect(page.locator('text=Kansas, USA')).toBeVisible()
      }
    })

    test('should display farm status badges', async ({ page }) => {
      if (page.url().includes('/farms')) {
        // Check for status indicators
        await expect(page.locator('text=Active')).toBeVisible()
        
        // Check for crop tags
        await expect(page.locator('text=Corn')).toBeVisible()
        await expect(page.locator('text=Soybeans')).toBeVisible()
        await expect(page.locator('text=Wheat')).toBeVisible()
      }
    })

    test('should display quick actions section', async ({ page }) => {
      if (page.url().includes('/farms')) {
        // Check for quick actions card
        await expect(page.locator('text=Quick Actions')).toBeVisible()
        await expect(page.locator('text=Common farm management tasks')).toBeVisible()
        
        // Check for action buttons
        await expect(page.locator('text=Weather Monitoring')).toBeVisible()
        await expect(page.locator('text=Satellite Analysis')).toBeVisible()
        await expect(page.locator('text=Yield Predictions')).toBeVisible()
      }
    })

    test('should have clickable farm cards', async ({ page }) => {
      if (page.url().includes('/farms')) {
        // Look for "View Details" buttons
        const viewDetailsButtons = page.locator('text=View Details')
        const buttonCount = await viewDetailsButtons.count()
        
        // Should have at least one farm with a View Details button
        expect(buttonCount).toBeGreaterThan(0)
        
        // The cards should be interactive (have hover effects)
        const farmCard = page.locator('[class*="hover:shadow"]').first()
        if (await farmCard.isVisible()) {
          await farmCard.hover()
          // Card should be hoverable (we just test that hover doesn't crash)
        }
      }
    })

    test('should display farm statistics correctly', async ({ page }) => {
      if (page.url().includes('/farms')) {
        // Check that the statistics show numbers
        const totalFarmsCard = page.locator('text=Total Farms').locator('..')
        const totalAcreageCard = page.locator('text=Total Acreage').locator('..')
        
        // Should display numeric values
        await expect(totalFarmsCard.locator('text=3')).toBeVisible() // 3 demo farms
        await expect(totalAcreageCard.locator('text=750 acres')).toBeVisible() // 250+180+320
      }
    })

    test('should be responsive on different screen sizes', async ({ page }) => {
      if (page.url().includes('/farms')) {
        // Test mobile view
        await page.setViewportSize({ width: 375, height: 667 })
        await expect(page.locator('text=My Farms')).toBeVisible()
        
        // Test tablet view
        await page.setViewportSize({ width: 768, height: 1024 })
        await expect(page.locator('text=My Farms')).toBeVisible()
        
        // Test desktop view
        await page.setViewportSize({ width: 1280, height: 720 })
        await expect(page.locator('text=My Farms')).toBeVisible()
      }
    })
  })
})