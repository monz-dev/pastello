import { test, expect } from '@playwright/test';

test.describe('Root redirect', () => {
  test('redirects / straight to /home', async ({ page }) => {
    await page.goto('/');

    // Should land on the home page, not a splash screen.
    await expect(page).toHaveURL(/\/home/);
  });
});
