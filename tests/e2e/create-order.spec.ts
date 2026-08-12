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

  // Step 4 — Resumen → advance to scheduling
  await expect(page.getByText('¡Casi listo!')).toBeVisible();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  // Step 5 — Entrega
  await expect(page.getByText('Paso 6: Entrega')).toBeVisible();

  // Compute tomorrow in local date (match fixed getTomorrowDate)
  const tomorrow = await page.evaluate(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  await page.getByLabel('Fecha de entrega').fill(tomorrow);
  await page.getByLabel('Hora de entrega').selectOption('15:00');
  await page.getByRole('button', { name: /Recoger en tienda/i }).click();
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();

  await expect(page.getByText('¡Pedido confirmado!')).toBeVisible();
});
