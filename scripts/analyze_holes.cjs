const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function analyzeHoles(relPath) {
  const full = path.join('public/assets/brokoli', relPath);
  const buf = fs.readFileSync(full);
  const png = PNG.sync.read(buf);
  const W = png.width;
  const H = png.height;

  // Flood fill outside
  const visited = new Uint8Array(W * H);
  const isAlpha = (x, y) => png.data[(y * W + x) * 4 + 3] < 128;
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
    for (const [nx, ny] of [[cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]]) {
      if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
        const idx = ny * W + nx;
        if (!visited[idx] && isAlpha(nx, ny)) {
          visited[idx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  // Find components of internal holes
  const holeVisited = new Uint8Array(W * H);
  const holeComponents = [];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = y * W + x;
      if (!visited[idx] && isAlpha(x, y) && !holeVisited[idx]) {
        // Start new hole component
        const comp = [];
        const hq = [x, y];
        holeVisited[idx] = 1;
        let hHead = 0;
        let minX = x, maxX = x, minY = y, maxY = y;
        while (hHead < hq.length) {
          const hx = hq[hHead++];
          const hy = hq[hHead++];
          comp.push([hx, hy]);
          minX = Math.min(minX, hx); maxX = Math.max(maxX, hx);
          minY = Math.min(minY, hy); maxY = Math.max(maxY, hy);

          for (const [nx, ny] of [[hx+1, hy], [hx-1, hy], [hx, hy+1], [hx, hy-1]]) {
            if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
              const nidx = ny * W + nx;
              if (!visited[nidx] && isAlpha(nx, ny) && !holeVisited[nidx]) {
                holeVisited[nidx] = 1;
                hq.push(nx, ny);
              }
            }
          }
        }
        holeComponents.push({ count: comp.length, bbox: [minX, minY, maxX, maxY], pixels: comp });
      }
    }
  }

  console.log(`${relPath}: Found ${holeComponents.length} internal holes:`);
  holeComponents.forEach((h, i) => {
    // Check what is in the RGB channels of this hole!
    let avgR = 0, avgG = 0, avgB = 0, avgA = 0;
    for (const [px, py] of h.pixels) {
      const pIdx = (py * W + px) * 4;
      avgR += png.data[pIdx];
      avgG += png.data[pIdx + 1];
      avgB += png.data[pIdx + 2];
      avgA += png.data[pIdx + 3];
    }
    avgR = Math.round(avgR / h.pixels.length);
    avgG = Math.round(avgG / h.pixels.length);
    avgB = Math.round(avgB / h.pixels.length);
    avgA = Math.round(avgA / h.pixels.length);
    console.log(`  Hole ${i+1}: ${h.count}px, bbox [${h.bbox.join(',')}], current RGB=(${avgR},${avgG},${avgB}), Alpha=${avgA}`);
  });
}

analyzeHoles('02_characters/brokoli_kahraman.png');
analyzeHoles('02_characters/domates_dost.png');
analyzeHoles('03_enemies_bosses/ketcap.png');
analyzeHoles('03_enemies_bosses/mayonez.png');
