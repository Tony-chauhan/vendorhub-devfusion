import { test, expect } from '@playwright/test';

test.describe('Vendor Registration Flow', () => {
  test('should allow a user to navigate to vendor registration', async ({ page }) => {
    await page.goto('/');
    
    // Look for a link to register as a seller
    const sellerLink = page.locator('text=Sell on VendorHub').first();
    if (await sellerLink.isVisible()) {
      await sellerLink.click();
      await expect(page).toHaveURL(/.*store\/register|.*sign-in/);
    }
  });

  test('should require authentication for adding products', async ({ page }) => {
    // Attempting to go directly to add product page
    await page.goto('/store/add-product');
    
    // Should be redirected to sign in because of Clerk middleware
    await expect(page).toHaveURL(/.*sign-in/);
  });
});
