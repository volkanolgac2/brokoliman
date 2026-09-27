const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const atlasBuf = fs.readFileSync('public/assets/brokoli/08_reference/MASTER_ASSET_ATLAS.png');
const atlas = PNG.sync.read(atlasBuf);

// Havuc bounds in atlas
const minX = 980, maxX = 1100, minY = 40, maxY = 197;
const pad = 3;
const cropX = minX - pad;
const cropY = minY - pad;
const cropW = (maxX - minX + 1) + pad * 2;
const cropH = (maxY - minY + 1) + pad * 2;

const outPng = new PNG({ width: cropW, height: cropH });

// 1. Copy raw pixels from atlas
for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const ax = cropX + x;
    const ay = cropY + y;
    const aIdx = (ay * atlas.width + ax) * 4;
    const oIdx = (y * cropW + x) * 4;

    outPng.data[oIdx] = atlas.data[aIdx];
    outPng.data[oIdx + 1] = atlas.data[aIdx + 1];
    outPng.data[oIdx + 2] = atlas.data[aIdx + 2];
    outPng.data[oIdx + 3] = 255;
  }
}

// 2. Flood-fill from outer image border to classify exterior white/light background
const isExterior = new Uint8Array(cropW * cropH);
const isBgPixel = (x, y) => {
  if (x < 0 || x >= cropW || y < 0 || y >= cropH) return false;
  // If at bottom line near y >= cropH - 4 and color is dark divider line, treat as background
  if (y >= cropH - 4) {
    const oIdx = (y * cropW + x) * 4;
    const r = outPng.data[oIdx], g = outPng.data[oIdx + 1], b = outPng.data[oIdx + 2];
    if (r < 60 && g < 60 && b < 60) return true; // divider bar
  }
  const oIdx = (y * cropW + x) * 4;
  const r = outPng.data[oIdx], g = outPng.data[oIdx + 1], b = outPng.data[oIdx + 2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max > 0 ? (max - min) / max : 0;
  // White/light background
  return (max > 225 && sat < 0.16) || (max > 240 && sat < 0.25);
};

const q = new Int32Array(cropW * cropH);
let qStart = 0, qEnd = 0;

for (let x = 0; x < cropW; x++) {
  const top = 0 * cropW + x;
  const btm = (cropH - 1) * cropW + x;
  if (isBgPixel(x, 0)) { isExterior[top] = 1; q[qEnd++] = top; }
  if (isBgPixel(x, cropH - 1)) { isExterior[btm] = 1; q[qEnd++] = btm; }
}
for (let y = 0; y < cropH; y++) {
  const left = y * cropW + 0;
  const right = y * cropW + cropW - 1;
  if (!isExterior[left] && isBgPixel(0, y)) { isExterior[left] = 1; q[qEnd++] = left; }
  if (!isExterior[right] && isBgPixel(cropW - 1, y)) { isExterior[right] = 1; q[qEnd++] = right; }
}

while (qStart < qEnd) {
  const idx = q[qStart++];
  const cx = idx % cropW, cy = (idx / cropW) | 0;

  for (const [nx, ny] of [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]]) {
    if (nx >= 0 && nx < cropW && ny >= 0 && ny < cropH) {
      const nIdx = ny * cropW + nx;
      if (!isExterior[nIdx] && isBgPixel(nx, ny)) {
        isExterior[nIdx] = 1;
        q[qEnd++] = nIdx;
      }
    }
  }
}

// 3. Set transparency on exterior
for (let i = 0; i < cropW * cropH; i++) {
  if (isExterior[i]) {
    outPng.data[i * 4 + 3] = 0;
  }
}

// 4. Smooth anti-aliasing & defringe on the perimeter
for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const idx = y * cropW + x;
    const p = idx * 4;
    if (outPng.data[p + 3] > 0) {
      // Check if adjacent to exterior transparent pixel
      let hasTransparentNeighbor = false;
      let sumR = 0, sumG = 0, sumB = 0, interiorCount = 0;

      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < cropW && ny >= 0 && ny < cropH) {
            const nIdx = ny * cropW + nx;
            const np = nIdx * 4;
            if (outPng.data[np + 3] === 0) {
              hasTransparentNeighbor = true;
            } else if (outPng.data[np + 3] === 255) {
              const nr = outPng.data[np], ng = outPng.data[np + 1], nb = outPng.data[np + 2];
              if (!(nr > 220 && ng > 220 && nb > 220)) {
                sumR += nr;
                sumG += ng;
                sumB += nb;
                interiorCount++;
              }
            }
          }
        }
      }

      if (hasTransparentNeighbor) {
        const r = outPng.data[p], g = outPng.data[p + 1], b = outPng.data[p + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const sat = max > 0 ? (max - min) / max : 0;

        // If light edge pixel contaminated with background white
        if (max > 180 && sat < 0.35 && interiorCount > 0) {
          outPng.data[p] = Math.round(sumR / interiorCount);
          outPng.data[p + 1] = Math.round(sumG / interiorCount);
          outPng.data[p + 2] = Math.round(sumB / interiorCount);
          // Set soft alpha for smooth anti-aliased edge
          const brightness = (r + g + b) / 3;
          const alphaFactor = Math.max(0, Math.min(1, (255 - brightness) / 60));
          outPng.data[p + 3] = Math.round(180 + 75 * alphaFactor);
        }
      }
    }
  }
}

// 5. Trim empty transparent border rows/cols to perfectly center the sprite
let finalMinX = cropW, finalMaxX = 0, finalMinY = cropH, finalMaxY = 0;
for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const idx = (y * cropW + x) * 4;
    if (outPng.data[idx + 3] > 10) {
      finalMinX = Math.min(finalMinX, x);
      finalMaxX = Math.max(finalMaxX, x);
      finalMinY = Math.min(finalMinY, y);
      finalMaxY = Math.max(finalMaxY, y);
    }
  }
}

const finalW = finalMaxX - finalMinX + 1;
const finalH = finalMaxY - finalMinY + 1;
const finalPng = new PNG({ width: finalW, height: finalH });

for (let y = 0; y < finalH; y++) {
  for (let x = 0; x < finalW; x++) {
    const srcIdx = ((finalMinY + y) * cropW + (finalMinX + x)) * 4;
    const dstIdx = (y * finalW + x) * 4;
    finalPng.data[dstIdx] = outPng.data[srcIdx];
    finalPng.data[dstIdx + 1] = outPng.data[srcIdx + 1];
    finalPng.data[dstIdx + 2] = outPng.data[srcIdx + 2];
    finalPng.data[dstIdx + 3] = outPng.data[srcIdx + 3];
  }
}

const outPath = 'public/assets/brokoli/02_characters/havuc_kiz_arkadas.png';
fs.writeFileSync(outPath, PNG.sync.write(finalPng));
console.log(`Successfully fixed Havuç! Dimensions: ${finalW}x${finalH} (Full complete feet & zero white fringe)`);
