import { test, expect } from '@playwright/test';

/**
 * Admin guard e2e — pastello-guest-admin (B3).
 *
 * Covers the middleware admin role guard from a browser perspective:
 * - An unauthenticated visit to /admin/dashboard redirects to /login?next=
 * - An authenticated CUSTOMER visit to /admin/dashboard redirects to
 *   /home?error=unauthorized (admin-only route).
 *
 * Prerequisites:
 * - `pnpm dev` running on http://localhost:3000
 * - Supabase local running with migrations 00001-00011 applied
 * - A seeded test user: email `test@pastello.dev` / password `password123`
 *   with role `customer` (seed via `pnpm db:seed`). An admin user is NOT
 *   required for this suite.
 */

const TEST_USER = {
  email: 'test@pastello.dev',
  password: 'password123',
};

test.describe('Admin route guard', () => {
  test('redirects an unauthenticated request to /admin/dashboard to /login with a next param', async ({
    page,
    context,
  }) => {
    await context.clearCookies();
    await page.goto('/admin/dashboard');

    await expect(page).toHaveURL(/\/login\?next=%2Fadmin%2Fdashboard/);
  });

  test('redirects an authenticated customer from /admin/dashboard to /home?error=unauthorized', async ({
    page,
    context,
  }) => {
    // Start clean, then sign in as the seeded customer.
    await context.clearCookies();
    await page.goto('/login');

    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Contraseña').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/home/);

    // The middleware admin role guard should reject the customer at the edge.
    await page.goto('/admin/dashboard');

    await expect(page).toHaveURL(/\/home\?error=unauthorized/);
  });
});