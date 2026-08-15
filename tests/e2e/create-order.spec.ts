import { expect, test } from '@playwright/test';

test('walks through the cake wizard to delivery confirmation', async ({ page }) => {
  await page.goto('/create');
  await expect(page.getByText('Crear pastel')).toBeVisible();
  await expect(page.getByText('Paso 1: Tamaño')).toBeVisible();

  // Step 0 — Tamaño
  await page.getByRole('button').filter({ hasText: 'Mini' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  // Step 1 — Pan (select Chocolate, the first fallback)
  await page.getByRole('button', { name: /Chocolate/ }).first().click();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  // Step 2 — Relleno (select Nutella, the first fallback)
  await page.getByRole('button', { name: /Nutella/ }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  // Step 3 — Cobertura (select Chocolate, the first fallback)
  await page.getByRole('button', { name: /Chocolate/ }).first().click();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  // Step 4 — Entrega
  await expect(page.getByText('Paso 5: Entrega')).toBeVisible();

  // Compute the earliest valid delivery date: 24h from now in local time.
  const minDate = await page.evaluate(() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  await page.getByLabel('Fecha de entrega').fill(minDate);
  await page.getByLabel('Hora de entrega').selectOption('15:00');
  await page.getByRole('button', { name: /Recoger en tienda/i }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  // Step 5 — Resumen
  await expect(page.getByText('Paso 6: Resumen')).toBeVisible();
  await expect(page.getByText('¡Casi listo!')).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();

  await expect(page.getByText('¡Pedido confirmado!')).toBeVisible();
});
