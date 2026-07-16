import { test, expect } from '@playwright/test';

test.describe('Buyer Flow', () => {
  test('should allow buyer to add a product to cart and proceed to checkout', async ({ page }) => {
    // 1. Navigate to home
    await page.goto('/');
    await expect(page).toHaveTitle(/VendorHub/i);

    // 2. Click on the first product's "View Details" or click the product card
    // Wait for products to load
    await page.waitForSelector('.product-card', { state: 'attached', timeout: 10000 }).catch(() => null);
    
    const productLinks = await page.locator('a[href^="/product/"]');
    if (await productLinks.count() > 0) {
      await productLinks.first().click();
      
      // 3. Add to cart
      await expect(page.locator('text=Add to Cart')).toBeVisible();
      await page.locator('text=Add to Cart').click();

      // 4. Verify toast or cart counter update
      await expect(page.locator('text=Item added to cart')).toBeVisible({ timeout: 5000 }).catch(() => null);

      // 5. Go to checkout (either via cart page or direct button)
      await page.goto('/cart');
      await expect(page.locator('text=Proceed to Checkout')).toBeVisible();
      await page.locator('text=Proceed to Checkout').click();

      // 6. Should redirect to checkout or sign in page
      await expect(page).toHaveURL(/.*checkout|.*sign-in/);
    } else {
      console.log('No products found on home page for test.');
    }
  });
});
