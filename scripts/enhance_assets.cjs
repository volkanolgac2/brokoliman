const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// 1. Target files to inspect and enhance
const targets = [
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
  '03_enemies_bosses/mayonez.png',
  '05_environment/anahtar.png',
  '05_environment/kilitli_kapi.png',
  '05_environment/ahsap_kutu.png',
  '05_environment/hareketli_platform.png',
  '05_environment/diken.png',
  '05_environment/altin_para.png',
  '05_environment/kontrol_paneli.png',
  '05_environment/yildiz.png',
  '05_environment/kirilabilir_kutu.png',
  '05_environment/buton.png',
  '05_environment/zemin_1.png',
  '05_environment/zemin_2.png',
  '05_environment/zemin_3_buz.png',
  '05_environment/zemin_4_fabrika.png',
  '05_environment/zemin_5_kale.png',
  '05_environment/varil.png',
  '05_environment/yon_oku.png',
  '05_environment/asansor.png',
  '05_environment/kafes.png',
  '05_environment/kaldirac.png',
  '07_ui/can_icon.png',
  '07_ui/anahtar_icon.png',
  '07_ui/yildiz_icon.png',
  '07_ui/para_icon.png',
  '07_ui/duraklat_icon.png',
];

const baseDir = path.resolve('public/assets/brokoli');
const backupDir = path.resolve('public/assets/brokoli_backup');

fs.mkdirSync(backupDir, { recursive: true });

function processImage(rel) {
  const srcPath = path.join(baseDir, rel);
  if (!fs.existsSync(srcPath)) return;

  // Backup original first
  const bkpPath = path.join(backupDir, rel);
  fs.mkdirSync(path.dirname(bkpPath), { recursive: true });
  if (!fs.existsSync(bkpPath)) {
    fs.copyFileSync(srcPath, bkpPath);
  }

  const buf = fs.readFileSync(srcPath);
  const png = PNG.sync.read(buf);
  const W = png.width;
  const H = png.height;
  const d = png.data;

  // Step A: Flood fill from all outer edges to mark real exterior transparency
  const isExterior = new Uint8Array(W * H);
  const isAlpha = (idx) => d[idx * 4 + 3] < 128;
  const q = new Int32Array(W * H);
  let qStart = 0, qEnd = 0;

  for (let x = 0; x < W; x++) {
    const top = 0 * W + x, btm = (H - 1) * W + x;
    if (isAlpha(top)) { isExterior[top] = 1; q[qEnd++] = top; }
    if (isAlpha(btm)) { isExterior[btm] = 1; q[qEnd++] = btm; }
  }
  for (let y = 0; y < H; y++) {
    const left = y * W + 0, right = y * W + W - 1;
    if (!isExterior[left] && isAlpha(left)) { isExterior[left] = 1; q[qEnd++] = left; }
    if (!isExterior[right] && isAlpha(right)) { isExterior[right] = 1; q[qEnd++] = right; }
  }

  while (qStart < qEnd) {
    const idx = q[qStart++];
    const cx = idx % W, cy = (idx / W) | 0;
    if (cx > 0) { const n = idx - 1; if (!isExterior[n] && isAlpha(n)) { isExterior[n] = 1; q[qEnd++] = n; } }
    if (cx < W - 1) { const n = idx + 1; if (!isExterior[n] && isAlpha(n)) { isExterior[n] = 1; q[qEnd++] = n; } }
    if (cy > 0) { const n = idx - W; if (!isExterior[n] && isAlpha(n)) { isExterior[n] = 1; q[qEnd++] = n; } }
    if (cy < H - 1) { const n = idx + W; if (!isExterior[n] && isAlpha(n)) { isExterior[n] = 1; q[qEnd++] = n; } }
  }

  // Step B: Fix internal holes (delik gözler ve iç delikler)
  let fixedHoles = 0;
  const isBrokoli = rel.includes('brokoli_kahraman');

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = y * W + x;
      if (!isExterior[idx] && isAlpha(idx)) {
        // Enclosed interior hole!
        const p = idx * 4;
        const curR = d[p], curG = d[p + 1], curB = d[p + 2];

        if (isBrokoli) {
          // In Brokoli, left eye is around X:241..288, Y:288..330; right eye around X:324..360, Y:288..327
          // Fill eye sclera with bright cartoon eye white and slight natural gradient
          const isLeftEye = (x >= 238 && x <= 290 && y >= 285 && y <= 335);
          const isRightEye = (x >= 320 && x <= 365 && y >= 285 && y <= 332);
          if (isLeftEye || isRightEye) {
            // Cartoon white sclera: clean bright white with gentle gradient
            d[p] = 248;
            d[p + 1] = 250;
            d[p + 2] = 252;
            d[p + 3] = 255;
          } else {
            // Other internal hole, restore if valid color or fill from neighbor
            d[p + 3] = 255;
          }
        } else {
          // If color is preserved, simply restore opacity to 255!
          if (curR > 0 || curG > 0 || curB > 0) {
            d[p + 3] = 255;
          } else {
            // Fill with neighbor color
            d[p] = 245;
            d[p + 1] = 245;
            d[p + 2] = 245;
            d[p + 3] = 255;
          }
        }
        fixedHoles++;
      }
    }
  }

  // Special enhancement for Brokoli Eyes:
  // Add crisp, beautiful cartoon shine / catchlights to Brokoli's eyes so they never look dull or black!
  if (isBrokoli) {
    // Left eye center is around (266, 308), pupil is slightly right in the eye
    // Right eye center is around (342, 308)
    // Add bright white catchlights (sparkles):
    const catchlights = [
      // Left eye sparkle
      { cx: 274, cy: 300, r: 4 },
      { cx: 280, cy: 306, r: 2 },
      // Right eye sparkle
      { cx: 340, cy: 300, r: 4 },
      { cx: 345, cy: 306, r: 2 },
    ];
    for (const cl of catchlights) {
      for (let dy = -cl.r; dy <= cl.r; dy++) {
        for (let dx = -cl.r; dx <= cl.r; dx++) {
          if (dx * dx + dy * dy <= cl.r * cl.r) {
            const px = cl.cx + dx, py = cl.cy + dy;
            if (px >= 0 && px < W && py >= 0 && py < H) {
              const p = (py * W + px) * 4;
              d[p] = 255;
              d[p + 1] = 255;
              d[p + 2] = 255;
              d[p + 3] = 255;
            }
          }
        }
      }
    }
  }

  // Special enhancement for other friends with dark eyes ("gözlerinin içi siyah kalmış"):
  // Check if character has dark eyes without catchlight and add a bright reflection dot
  const friendsWithCatchlights = [
    { name: 'misir_dost', eyes: [{ x: 45, y: 48 }, { x: 63, y: 48 }] },
    { name: 'domates_dost', eyes: [{ x: 58, y: 74 }, { x: 86, y: 74 }] },
    { name: 'ketcap', eyes: [{ x: 68, y: 84 }, { x: 106, y: 84 }] },
    { name: 'mayonez', eyes: [{ x: 60, y: 87 }, { x: 81, y: 87 }] },
  ];

  const matchedFriend = friendsWithCatchlights.find(f => rel.includes(f.name));
  if (matchedFriend) {
    for (const eye of matchedFriend.eyes) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const px = eye.x + dx, py = eye.y + dy;
          if (px >= 0 && px < W && py >= 0 && py < H) {
            const p = (py * W + px) * 4;
            d[p] = 255;
            d[p + 1] = 255;
            d[p + 2] = 255;
            d[p + 3] = 255;
          }
        }
      }
    }
  }

  // Step C: De-fringe / remove white halos around perimeter borders ("kenarlarında vs beyazlıklar")
  // For any semi-transparent border pixel (0 < alpha < 255):
  // If it's contaminated with white background (R > 180, G > 180, B > 180 while adjacent interior is non-white):
  // Clamping/color bleeding from interior neighbor
  let defringedPixels = 0;

  // Find solid interior reference colors
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = y * W + x;
        const p = idx * 4;
        const a = d[p + 3];

        if (a > 0 && a < 255) {
          const r = d[p], g = d[p + 1], b = d[p + 2];
          const isWhitish = (r > 175 && g > 175 && b > 175);

          if (isWhitish) {
            // Find adjacent fully opaque non-white neighbor
            let sumR = 0, sumG = 0, sumB = 0, count = 0;
            const neighbors = [
              [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
              [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1],
              [x - 2, y], [x + 2, y], [x, y - 2], [x, y + 2]
            ];
            for (const [nx, ny] of neighbors) {
              if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
                const nIdx = (ny * W + nx) * 4;
                const na = d[nIdx + 3];
                if (na >= 240) {
                  const nr = d[nIdx], ng = d[nIdx + 1], nb = d[nIdx + 2];
                  // If neighbor is NOT white
                  if (!(nr > 220 && ng > 220 && nb > 220)) {
                    sumR += nr;
                    sumG += ng;
                    sumB += nb;
                    count++;
                  }
                }
              }
            }

            if (count > 0) {
              // Replace white halo color with true interior edge color, preserving smooth anti-aliased alpha!
              d[p] = Math.round(sumR / count);
              d[p + 1] = Math.round(sumG / count);
              d[p + 2] = Math.round(sumB / count);
              defringedPixels++;
            }
          }
        }
      }
    }
  }

  // Save cleaned and polished PNG
  const outBuf = PNG.sync.write(png);
  fs.writeFileSync(srcPath, outBuf);
  console.log(`[Enhanced] ${rel}: Fixed ${fixedHoles} hole px, defringed ${defringedPixels} border px`);
}

console.log('--- Starting Asset Enhancement ---');
targets.forEach(processImage);
console.log('--- Asset Enhancement Complete! ---');
