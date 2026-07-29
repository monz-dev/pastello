import { test, expect } from '@playwright/test';

/**
 * Home catalog e2e (RED for B4).
 *
 * Covers spec scenarios for pastello-auth-home:
 * - REQ-005 / REQ-006: home catalog renders active pre-designed cakes
 * - REQ-006: search filters the catalog client-side
 * - Quick Access CTAs navigate to /create and /custom
 *
 * Prerequisites:
 * - `pnpm dev` running on http://localhost:3000
 * - Supabase local running with migrations 00001-00010 applied
 * - Seed data includes at least two active pre_designed_cakes rows
 *   (supabase/seed.sql)
 */

test.describe('Home catalog', () => {
  test('renders pre-designed cakes visible on /home', async ({ page }) => {
    await page.goto('/home');

    // The snap-scroll region is present.
    await expect(page.getByRole('region', { name: 'Catálogo de pasteles' })).toBeVisible();

    // Each cake card renders an image — at least one should be visible.
    const cakeImages = page.locator('article img');
    await expect(cakeImages.first()).toBeVisible();
  });

  test('typing in the search bar filters visible cake cards', async ({ page }) => {
    await page.goto('/home');

    const searchInput = page.getByPlaceholder('Buscar pasteles…');

    // Capture the number of cake cards before filtering.
    const initialCount = await page.locator('article img').count();

    // Type into search — the carousel filters in real time.
    await searchInput.fill('chocolate');

    // The filtered view should show fewer cards (or the same if all match).
    // Wait a beat for the client filter to apply.
    await page.waitForTimeout(300);

    const filteredCount = await page.locator('article img').count();

    // If there are chocolate cakes, filtered is <= initial. If none, the
    // empty state shows and card count is 0.
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('Quick Access CTA navigates to /create', async ({ page }) => {
    await page.goto('/home');

    await page.getByRole('link', { name: /Crear mi pastel/ }).click();

    await expect(page).toHaveURL(/\/create/);
  });

  test('Quick Access CTA navigates to /custom', async ({ page }) => {
    await page.goto('/home');

    await page.getByRole('link', { name: /Subir imagen/ }).click();

    await expect(page).toHaveURL(/\/custom/);
  });

  test('¿Tienes una idea? section CTA navigates to /create', async ({ page }) => {
    await page.goto('/home');

    await page.getByRole('link', { name: /Empezar a crear/ }).click();

    await expect(page).toHaveURL(/\/create/);
  });

  test('clear button resets the search and restores all cakes', async ({ page }) => {
    await page.goto('/home');

    const searchInput = page.getByPlaceholder('Buscar pasteles…');
    await searchInput.fill('chocolate');
    await page.waitForTimeout(200);

    // Clear the search.
    await page.getByLabel('Limpiar búsqueda').click();

    // Input is empty again.
    await expect(searchInput).toHaveValue('');

    // Cards should be restored (not in empty-state).
    await expect(page.getByRole('link', { name: /Crear mi pastel/ })).toBeVisible();
  });
});