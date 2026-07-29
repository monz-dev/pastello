import { test, expect } from '@playwright/test';

/**
 * Guest flow e2e — pastello-guest-admin (B3).
 *
 * Covers:
 * - Guest silent signUp on first visit (no login): the AuthProvider auto-creates
 *   a guest account and surfaces it in the TopNav as an "Invitado" badge.
 *
 * Prerequisites:
 * - `pnpm dev` running on http://localhost:3000
 * - Supabase local running with migrations 00001-00011 applied
 * - "Auto-confirm new users" ON in Auth settings (or the silent signUp returns
 *   a session immediately). If auto-confirm is OFF the guest badge will not
 *   appear and this test will fail — see design `Guest mode` decision row.
 */

test.describe('Guest flow', () => {
  test('a first-time visitor without a session gets authenticated as a guest and sees the Invitado badge', async ({
    page,
    context,
  }) => {
    // Start from a clean context so no prior session leaks in.
    await context.clearCookies();

    // /home is public; the (main) layout renders the TopNav which turns into
    // the guest indicator once the silent signUp resolves.
    await page.goto('/home');

    // The AuthProvider runs the silent guest signUp on mount; once the
    // network round-trip completes, the TopNav swaps the "Iniciar sesión"
    // anchor for the "Invitado" badge + "Crear cuenta" CTA.
    await expect(
      page.getByText('Invitado', { exact: true }),
    ).toBeVisible({ timeout: 15000 });

    await expect(
      page.getByRole('link', { name: /Crear cuenta/ }),
    ).toBeVisible();
  });
});