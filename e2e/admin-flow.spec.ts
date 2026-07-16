import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test('should protect admin routes from unauthenticated users', async ({ page }) => {
    // Attempt to access admin dashboard directly
    await page.goto('/admin');
    
    // Expect redirect to clerk sign-in or a 404/unauthorized depending on setup
    await expect(page).toHaveURL(/.*sign-in|.*unauthorized|.*404/);
  });
  
  test('should protect store approval routes', async ({ page }) => {
    await page.goto('/admin/stores');
    await expect(page).toHaveURL(/.*sign-in|.*unauthorized|.*404/);
  });
});
