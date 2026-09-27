const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function detailHoles(rel) {
  const full = path.join('public/assets/brokoli', rel);
  const buf = fs.readFileSync(full);
  const png = PNG.sync.read(buf);
  const W = png.width;
  const H = png.height;
  const visited = new Uint8Array(W * H);
  const isAlpha = (idx) => png.data[idx * 4 + 3] < 128;

  const q = new Int32Array(W * H);
  let qStart = 0, qEnd = 0;

  for (let x = 0; x < W; x++) {
    const top = 0 * W + x, btm = (H - 1) * W + x;
    if (isAlpha(top)) { visited[top] = 1; q[qEnd++] = top; }
    if (isAlpha(btm)) { visited[btm] = 1; q[qEnd++] = btm; }
  }
  for (let y = 0; y < H; y++) {
    const left = y * W, right = y * W + W - 1;
    if (!visited[left] && isAlpha(left)) { visited[left] = 1; q[qEnd++] = left; }
    if (!visited[right] && isAlpha(right)) { visited[right] = 1; q[qEnd++] = right; }
  }

  while (qStart < qEnd) {
    const idx = q[qStart++];
    const cx = idx % W;
    const cy = (idx / W) | 0;

    if (cx > 0) { const n = idx - 1; if (!visited[n] && isAlpha(n)) { visited[n] = 1; q[qEnd++] = n; } }
    if (cx < W - 1) { const n = idx + 1; if (!visited[n] && isAlpha(n)) { visited[n] = 1; q[qEnd++] = n; } }
    if (cy > 0) { const n = idx - W; if (!visited[n] && isAlpha(n)) { visited[n] = 1; q[qEnd++] = n; } }
    if (cy < H - 1) { const n = idx + W; if (!visited[n] && isAlpha(n)) { visited[n] = 1; q[qEnd++] = n; } }
  }

  // Group connected hole components
  const holeVisited = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    if (!visited[i] && isAlpha(i) && !holeVisited[i]) {
      let count = 0;
      let minX = W, maxX = 0, minY = H, maxY = 0;
      const hq = new Int32Array(W * H);
      let hStart = 0, hEnd = 0;
      holeVisited[i] = 1;
      hq[hEnd++] = i;

      while (hStart < hEnd) {
        const hIdx = hq[hStart++];
        count++;
        const x = hIdx % W;
        const y = (hIdx / W) | 0;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);

        for (const n of [hIdx - 1, hIdx + 1, hIdx - W, hIdx + W]) {
          if (n >= 0 && n < W * H && !visited[n] && isAlpha(n) && !holeVisited[n]) {
            holeVisited[n] = 1;
            hq[hEnd++] = n;
          }
        }
      }
      console.log(`  Hole: ${count}px, bounds X:[${minX}..${maxX}], Y:[${minY}..${maxY}] (Image size: ${W}x${H})`);
    }
  }
}

console.log('--- Brokoli ---');
detailHoles('02_characters/brokoli_kahraman.png');
console.log('--- Domates ---');
detailHoles('02_characters/domates_dost.png');
console.log('--- Ketcap ---');
detailHoles('03_enemies_bosses/ketcap.png');
console.log('--- Mayonez ---');
detailHoles('03_enemies_bosses/mayonez.png');
