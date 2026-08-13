// Convierte el logo SVG a los PNG de la PWA, re-escalando el glifo al tamaño correcto.
// Uso: node scripts/convert-icons.mjs
//
// Usa icon-512.svg como fuente maestra (los 3 SVG son el mismo glifo escalado).
// El glifo se re-escala para ocupar `glyphFill` del canvas:
//   - Maskable (Android): 70% — dentro de la safe zone del 80%
//   - Apple (iOS): 88% — iOS no recorta pero redondea esquinas
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = resolve(__dirname, '..', 'public', 'icons');

const BG = '#fcf9f8';
const BG_RGB = [0xfc, 0xf9, 0xf8];
const TOL = 24; // tolerancia de antialiasing al detectar el glifo

const MASTER = 'icon-512.svg';
const RENDER = 2048;

const targets = [
  { out: 'icon-512.png', size: 512, glyphFill: 0.7 },
  { out: 'icon-192.png', size: 192, glyphFill: 0.7 },
  { out: 'apple-touch-icon.png', size: 180, glyphFill: 0.88 },
];

const masterPath = resolve(iconsDir, MASTER);
if (!existsSync(masterPath)) {
  console.error(`✗ Falta ${MASTER} en public/icons/`);
  process.exit(1);
}

// 1. Renderizar el maestro y escanear el bbox del glifo (píxeles no-crema)
const { data, info } = await sharp(masterPath)
  .resize(RENDER, RENDER, { fit: 'fill' })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const w = info.width;
const h = info.height;
let minX = w, minY = h, maxX = -1, maxY = -1;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 3;
    if (
      Math.abs(data[i] - BG_RGB[0]) > TOL ||
      Math.abs(data[i + 1] - BG_RGB[1]) > TOL ||
      Math.abs(data[i + 2] - BG_RGB[2]) > TOL
    ) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

const gw = maxX - minX + 1;
const gh = maxY - minY + 1;
console.log(`Glifo detectado: ${gw}x${gh}px (${((gw / w) * 100).toFixed(1)}% × ${((gh / h) * 100).toFixed(1)}% del canvas)`);

// 2. Extraer el glifo
const glyph = await sharp(masterPath)
  .resize(RENDER, RENDER, { fit: 'fill' })
  .extract({ left: minX, top: minY, width: gw, height: gh })
  .png()
  .toBuffer();

// 3. Re-escalar y componer centrado sobre fondo crema
for (const t of targets) {
  const targetMax = Math.round(t.size * t.glyphFill);
  const scale = targetMax / Math.max(gw, gh);
  const nw = Math.round(gw * scale);
  const nh = Math.round(gh * scale);

  const resized = await sharp(glyph).resize(nw, nh).png().toBuffer();

  await sharp({
    create: { width: t.size, height: t.size, channels: 3, background: BG },
  })
    .composite([{ input: resized, gravity: 'center' }])
    .removeAlpha()
    .png()
    .toFile(resolve(iconsDir, t.out));

  console.log(
    `✓ ${t.out} (${t.size}x${t.size}, glifo al ${(t.glyphFill * 100).toFixed(0)}%)`
  );
}
