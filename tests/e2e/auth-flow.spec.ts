import { test, expect } from '@playwright/test';

/**
 * Auth flow e2e (RED for B3).
 *
 * Covers spec scenarios for pastello-auth-home:
 * - REQ-002: successful + invalid login, email preserved on error
 * - REQ-001: signup validation (weak password blocked client-side)
 * - REQ-004: logout from TopNav dropdown
 * - REQ-008: protected route redirect to /login?next=<path>
 *
 * Prerequisites:
 * - `pnpm dev` running on http://localhost:3000
 * - Supabase local running with migrations 00001-00010 applied
 * - A seeded test user: email `test@pastello.dev` / password `password123`
 *   (seed via `pnpm db:seed` or the test user fixture in supabase/seed.sql)
 *
 * Google OAuth scenarios are NOT covered here because the dashboard provider
 * config is not available in CI; graceful degradation is asserted at the unit
 * level. See design `Google OAuth degradation` decision row.
 */

const TEST_USER = {
  email: 'test@pastello.dev',
  password: 'password123',
};

test.describe('Auth flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('login with valid credentials redirects to /home', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Contraseña').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).toHaveURL(/\/home/);
  });

  test('login with invalid credentials shows generic error and preserves email', async ({
    page,
  }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Contraseña').fill('wrong-password-xyz');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page.getByText('Email o contraseña incorrectos')).toBeVisible();
    // Email is preserved for retry.
    await expect(page.getByLabel('Email')).toHaveValue(TEST_USER.email);
    // Still on the login page.
    await expect(page).toHaveURL(/\/login/);
  });

  test('login then `next` param redirects back to the protected route', async ({ page }) => {
    // Visiting a protected route while signed out bounces to /login?next=/orders
    await page.goto('/orders');
    await expect(page).toHaveURL(/\/login\?next=%2Forders/);

    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Contraseña').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).toHaveURL(/\/orders/);
  });

  test('signup blocks weak password client-side without navigating', async ({ page }) => {
    await page.goto('/signup');

    await page.getByLabel('Email').fill(`new-${Date.now()}@pastello.dev`);
    await page.getByLabel('Contraseña').fill('abc');
    await page.getByLabel('Confirmar contraseña').fill('abc');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    await expect(page.getByText('La contraseña debe tener al menos 6 caracteres.')).toBeVisible();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('signup blocks mismatched confirmation password client-side', async ({ page }) => {
    await page.goto('/signup');

    await page.getByLabel('Email').fill(`new-${Date.now()}@pastello.dev`);
    await page.getByLabel('Contraseña').fill('password123');
    await page.getByLabel('Confirmar contraseña').fill('password456');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    await expect(page.getByText('Las contraseñas no coinciden.')).toBeVisible();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('logout from TopNav dropdown redirects to /home', async ({ page }) => {
    // Sign in first to establish the session.
    await page.goto('/login');
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Contraseña').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/home/);

    // Open the account dropdown (avatar pill, labelled "Cuenta").
    await page.getByRole('button', { name: 'Cuenta' }).click();
    await page.getByRole('menuitem', { name: /Cerrar sesión/ }).click();

    await expect(page).toHaveURL(/\/home/);
  });

  test('protected route redirects unauthenticated user to /login', async ({ page, context }) => {
    // Start from a clean (signed-out) context.
    await context.clearCookies();
    await page.goto('/orders');

    await expect(page).toHaveURL(/\/login\?next=%2Forders/);
  });
});