const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const files = [
  '02_characters/brokoli_kahraman.png',
  '02_characters/havuc_kiz_arkadas.png',
  '02_characters/domates_dost.png',
  '02_characters/misir_dost.png',
  '02_characters/sogan_dost.png',
  '02_characters/biber_dost.png',
  '02_characters/patlican_dost.png',
  '02_characters/bezelye_dost.png',
  '02_characters/mantar_dost.png',
  '02_characters/salatalik_dost.png',
  '03_enemies_bosses/hamburger_krali.png',
  '03_enemies_bosses/hardal.png',
  '03_enemies_bosses/ketcap.png',
  '03_enemies_bosses/mayonez.png'
];

for (const rel of files) {
  const full = path.join('public/assets/brokoli', rel);
  if (!fs.existsSync(full)) continue;
  const buf = fs.readFileSync(full);
  const png = PNG.sync.read(buf);

  // Check 1: find connected components of transparency (flood fill from borders vs internal holes)
  const W = png.width;
  const H = png.height;
  const visited = new Uint8Array(W * H);
  const isAlpha = (x, y) => png.data[(y * W + x) * 4 + 3] < 128;

  // Flood fill outside from (0,0) and borders
  const queue = [];
  for (let x = 0; x < W; x++) {
    if (isAlpha(x, 0)) { queue.push(x, 0); visited[0 * W + x] = 1; }
    if (isAlpha(x, H - 1)) { queue.push(x, H - 1); visited[(H - 1) * W + x] = 1; }
  }
  for (let y = 0; y < H; y++) {
    if (isAlpha(0, y) && !visited[y * W + 0]) { queue.push(0, y); visited[y * W + 0] = 1; }
    if (isAlpha(W - 1, y) && !visited[y * W + W - 1]) { queue.push(W - 1, y); visited[y * W + W - 1] = 1; }
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];
    const neighbors = [
      [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
    ];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
        const idx = ny * W + nx;
        if (!visited[idx] && isAlpha(nx, ny)) {
          visited[idx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  // Any pixel with alpha < 128 that is NOT visited is an ENCLOSED HOLE inside the character!
  let internalHolePixels = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = y * W + x;
      if (!visited[idx] && isAlpha(x, y)) {
        internalHolePixels++;
      }
    }
  }

  // Check 2: white halo/fringe on outer border
  // Border pixel: opaque or semi-opaque pixel adjacent to visited outer transparent pixel, with high luminance (R>200, G>200, B>200)
  let whiteHaloPixels = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const pIdx = (y * W + x) * 4;
      const a = png.data[pIdx + 3];
      if (a > 10 && a < 255) {
        const r = png.data[pIdx];
        const g = png.data[pIdx + 1];
        const b = png.data[pIdx + 2];
        if (r > 190 && g > 190 && b > 190) {
          whiteHaloPixels++;
        }
      }
    }
  }

  console.log(`${rel}: ${W}x${H} | Internal holes: ${internalHolePixels} px | White fringe: ${whiteHaloPixels} px`);
}
