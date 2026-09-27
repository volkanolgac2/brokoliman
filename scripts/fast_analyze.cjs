const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function analyzeFile(rel) {
  const full = path.join('public/assets/brokoli', rel);
  const buf = fs.readFileSync(full);
  const png = PNG.sync.read(buf);
  const W = png.width;
  const H = png.height;
  const visited = new Uint8Array(W * H);
  const isAlpha = (idx) => png.data[idx * 4 + 3] < 128;

  // Queue with Int32Array
  const q = new Int32Array(W * H);
  let qStart = 0;
  let qEnd = 0;

  for (let x = 0; x < W; x++) {
    const top = 0 * W + x;
    const btm = (H - 1) * W + x;
    if (isAlpha(top)) { visited[top] = 1; q[qEnd++] = top; }
    if (isAlpha(btm)) { visited[btm] = 1; q[qEnd++] = btm; }
  }
  for (let y = 0; y < H; y++) {
    const left = y * W + 0;
    const right = y * W + W - 1;
    if (!visited[left] && isAlpha(left)) { visited[left] = 1; q[qEnd++] = left; }
    if (!visited[right] && isAlpha(right)) { visited[right] = 1; q[qEnd++] = right; }
  }

  while (qStart < qEnd) {
    const idx = q[qStart++];
    const cx = idx % W;
    const cy = (idx / W) | 0;

    if (cx > 0) {
      const n = idx - 1;
      if (!visited[n] && isAlpha(n)) { visited[n] = 1; q[qEnd++] = n; }
    }
    if (cx < W - 1) {
      const n = idx + 1;
      if (!visited[n] && isAlpha(n)) { visited[n] = 1; q[qEnd++] = n; }
    }
    if (cy > 0) {
      const n = idx - W;
      if (!visited[n] && isAlpha(n)) { visited[n] = 1; q[qEnd++] = n; }
    }
    if (cy < H - 1) {
      const n = idx + W;
      if (!visited[n] && isAlpha(n)) { visited[n] = 1; q[qEnd++] = n; }
    }
  }

  // Any pixel where isAlpha is true but NOT visited by outside is an internal hole!
  let holeCount = 0;
  let avgR = 0, avgG = 0, avgB = 0;
  for (let i = 0; i < W * H; i++) {
    if (!visited[i] && isAlpha(i)) {
      holeCount++;
      avgR += png.data[i * 4];
      avgG += png.data[i * 4 + 1];
      avgB += png.data[i * 4 + 2];
    }
  }
  if (holeCount > 0) {
    avgR = Math.round(avgR / holeCount);
    avgG = Math.round(avgG / holeCount);
    avgB = Math.round(avgB / holeCount);
  }
  console.log(`${rel}: ${holeCount} internal hole px. Original RGB stored in hole pixels: (${avgR}, ${avgG}, ${avgB})`);
}

analyzeFile('02_characters/brokoli_kahraman.png');
analyzeFile('02_characters/domates_dost.png');
analyzeFile('02_characters/misir_dost.png');
analyzeFile('03_enemies_bosses/ketcap.png');
analyzeFile('03_enemies_bosses/mayonez.png');
