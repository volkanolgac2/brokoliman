const fs = require('fs');
const { PNG } = require('pngjs');

const atlasBuf = fs.readFileSync('public/assets/brokoli/08_reference/MASTER_ASSET_ATLAS.png');
const atlas = PNG.sync.read(atlasBuf);

// Let's find non-transparent regions in the atlas
const W = atlas.width;
const H = atlas.height;
console.log(`Atlas size: ${W}x${H}`);

// Sample a grid across the atlas to find where characters are located
const blockSize = 64;
for (let by = 0; by < H; by += blockSize) {
  let line = '';
  for (let bx = 0; bx < W; bx += blockSize) {
    let opaque = 0;
    for (let dy = 0; dy < blockSize; dy += 4) {
      for (let dx = 0; dx < blockSize; dx += 4) {
        if (atlas.data[((by + dy) * W + (bx + dx)) * 4 + 3] > 128) opaque++;
      }
    }
    line += opaque > 50 ? '#' : '.';
  }
  console.log(line);
}
