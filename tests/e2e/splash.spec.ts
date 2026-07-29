import { test, expect } from '@playwright/test';

test.describe('Splash page', () => {
  test('displays the Pastello wordmark, the Entrar CTA and the fade-in animation', async ({
    page,
  }) => {
    await page.goto('/');

    // The Pastello wordmark should be visible.
    await expect(page.getByText('Pastello', { exact: true })).toBeVisible();

    // The "Entrar" CTA button should be visible.
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();

    // The fade-in animation utility class should be applied to the hero block.
    await expect(page.locator('.animate-fade-in')).toBeVisible();
  });
});
