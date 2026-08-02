import { test, expect } from '@playwright/test';

/**
 * Responsive layout visual tests — verifies the three-tier breakpoint system
 * across the target ranges: 360-430px (mobile), 768-1024px (tablet),
 * 1280-1440px (desktop).
 *
 * Prerequisites:
 * - `pnpm dev` running on http://localhost:3000
 * - Supabase local running with seed data
 */

/* ------------------------------------------------------------------ */
/*  Mobile: 375 px (iPhone SE / small Android)                         */
/* ------------------------------------------------------------------ */
test.describe('Mobile — 375 px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('bottom nav is visible, sidebar is hidden, carousel is snap-scroll', async ({
    page,
  }) => {
    await page.goto('/home');

    // Bottom nav bar visible on mobile.
    const bottomNav = page.getByLabel('Navegación inferior');
    await expect(bottomNav).toBeVisible();

    // Desktop sidebar rail NOT visible on mobile.
    const desktopRail = page.getByLabel('Navegación principal');
    await expect(desktopRail).not.toBeVisible();

    // Carousel uses flex + snap-scroll, NOT grid.
    const catalog = page.getByRole('region', { name: 'Catálogo de pasteles' });
    await expect(catalog).toHaveClass(/flex/);
    await expect(catalog).not.toHaveClass(/lg:grid/);

    // Card wrapper should be close to 85vw (~319 px on a 375 px viewport).
    const firstCard = catalog.locator('> div').first();
    const box = await firstCard.boundingBox();
    expect(box).not.toBeNull();
    // Allow ±20 px tolerance for scrollbar / padding.
    expect(box!.width).toBeGreaterThan(280);
    expect(box!.width).toBeLessThan(340);
  });
});

/* ------------------------------------------------------------------ */
/*  Tablet: 768 px (iPad mini portrait)                                */
/* ------------------------------------------------------------------ */
test.describe('Tablet — 768 px', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('bottom nav still visible, carousel uses sm:w-[45vw]', async ({
    page,
  }) => {
    await page.goto('/home');

    // Bottom nav still present below lg (1024 px).
    const bottomNav = page.getByLabel('Navegación inferior');
    await expect(bottomNav).toBeVisible();

    // Desktop rail still hidden.
    const desktopRail = page.getByLabel('Navegación principal');
    await expect(desktopRail).not.toBeVisible();

    // Carousel still flex snap-scroll.
    const catalog = page.getByRole('region', { name: 'Catálogo de pasteles' });
    await expect(catalog).toHaveClass(/flex/);

    // Card ~45vw on tablet (~346 px).
    const firstCard = catalog.locator('> div').first();
    const box = await firstCard.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(300);
    expect(box!.width).toBeLessThan(380);
  });
});

/* ------------------------------------------------------------------ */
/*  Tablet-Desktop boundary: 1024 px                                   */
/* ------------------------------------------------------------------ */
test.describe('Boundary — 1024 px', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test('sidebar rail replaces bottom nav at lg breakpoint', async ({
    page,
  }) => {
    await page.goto('/home');

    // Bottom nav HIDDEN at lg (1024+).
    const bottomNav = page.getByLabel('Navegación inferior');
    await expect(bottomNav).not.toBeVisible();

    // Desktop sidebar rail VISIBLE at lg.
    const desktopRail = page.getByLabel('Navegación principal');
    await expect(desktopRail).toBeVisible();

    // Sidebar items are present.
    await expect(desktopRail.getByText('Inicio')).toBeVisible();
    await expect(desktopRail.getByText('Crear')).toBeVisible();
    await expect(desktopRail.getByText('Pedidos')).toBeVisible();
    await expect(desktopRail.getByText('Perfil')).toBeVisible();
  });

  test('carousel switches to grid layout at lg', async ({ page }) => {
    await page.goto('/home');

    const catalog = page.getByRole('region', { name: 'Catálogo de pasteles' });
    await expect(catalog).toHaveClass(/lg:grid/);

    // Cards are auto-width in grid, no flex-shrink constraint.
    const cards = catalog.locator('> div');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // First card should NOT have the snap-start or flex-shrink-0 behaviour.
    const firstCard = cards.first();
    await expect(firstCard).not.toHaveClass(/snap-start/);
  });

  test('main content has left margin for sidebar', async ({ page }) => {
    await page.goto('/home');

    const main = page.locator('main');
    await expect(main).toHaveClass(/lg:ml-64/);
  });
});

/* ------------------------------------------------------------------ */
/*  Desktop: 1280 px                                                   */
/* ------------------------------------------------------------------ */
test.describe('Desktop — 1280 px', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('catalog grid has 3 columns', async ({ page }) => {
    await page.goto('/home');

    const catalog = page.getByRole('region', { name: 'Catálogo de pasteles' });
    await expect(catalog).toHaveClass(/lg:grid-cols-3/);
  });

  test('profile page uses 3-column grid', async ({ page }) => {
    await page.goto('/profile');

    // The profile fields should be in a 3-column grid at lg.
    const profileGrid = page.locator('.grid');
    // At least one grid should have lg:grid-cols-3.
    const gridClasses = await profileGrid.evaluateAll((els) =>
      els.map((el) => el.className),
    );
    const hasThreeCols = gridClasses.some((c) =>
      c.includes('lg:grid-cols-3'),
    );
    expect(hasThreeCols).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  Wide desktop: 1440 px                                              */
/* ------------------------------------------------------------------ */
test.describe('Wide desktop — 1440 px', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('catalog grid stays at 3 columns filling the full width', async ({ page }) => {
    await page.goto('/home');

    const catalog = page.getByRole('region', { name: 'Catálogo de pasteles' });
    // 3 columns, no 4-column override at xl.
    await expect(catalog).toHaveClass(/lg:grid-cols-3/);
    await expect(catalog).not.toHaveClass(/xl:grid-cols-4/);
  });

  test('sidebar rail is visible', async ({ page }) => {
    await page.goto('/home');

    const desktopRail = page.getByLabel('Navegación principal');
    await expect(desktopRail).toBeVisible();
  });

  test('orders page uses table layout', async ({ page }) => {
    await page.goto('/orders');

    // Order items should have the lg:grid table-like class.
    const orderItems = page.locator('ul > li');
    const count = await orderItems.count();

    if (count > 0) {
      const firstItem = orderItems.first();
      await expect(firstItem).toHaveClass(/lg:grid/);
      await expect(firstItem).toHaveClass(/lg:grid-cols-\[1fr_auto_auto_auto\]/);
    }
  });
});
