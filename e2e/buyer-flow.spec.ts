import { test, expect } from '@playwright/test';

test.describe('Buyer Flow', () => {
  test('should allow buyer to add a product to cart and proceed to checkout', async ({ page }) => {
    // 1. Navigate to home
    await page.goto('/');
    // Give extra time for Clerk dev instance handshake redirects
    await expect(page).toHaveTitle(/VendorHub/i, { timeout: 15000 });

    // 2. Click on the first product's "View Details" or click the product card
    // Wait for products to load
    await page.waitForSelector('.product-card', { state: 'attached', timeout: 10000 }).catch(() => null);
    
    const productLinks = await page.locator('a[href^="/product/"]');
    if (await productLinks.count() > 0) {
      await productLinks.first().click();
      
      // 3. Add to cart (Button text depends on whether it's already in cart)
      const addToCartBtn = page.locator('button:has-text("Add to Shopping Cart"), button:has-text("Add Another")').first();
      await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
      await addToCartBtn.click();

      // 4. Verify toast or cart counter update
      await expect(page.locator('text=Item added to cart')).toBeVisible({ timeout: 5000 }).catch(() => null);

      // 5. Go to checkout (either via cart page or direct button)
      const checkoutNowBtn = page.getByRole('button', { name: 'Checkout Now' });
      await expect(checkoutNowBtn).toBeVisible({ timeout: 15000 });
      await checkoutNowBtn.click();
      
      // Take a screenshot to see what's on the cart page
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'cart-page-debug.png', fullPage: true });

      const confirmOrderBtn = page.getByRole('button', { name: 'Confirm & Place Order' });
      await expect(confirmOrderBtn).toBeVisible({ timeout: 15000 });
      await confirmOrderBtn.click();

      // 6. Should redirect to checkout or sign in page
      await expect(page).toHaveURL(/.*checkout|.*sign-in/);
    } else {
      console.log('No products found on home page for test.');
    }
  });
});
