const fs = require('fs');
const { PNG } = require('pngjs');

const buf = fs.readFileSync('public/assets/brokoli/08_reference/MASTER_ASSET_ATLAS.png');
const png = PNG.sync.read(buf);
console.log('MASTER_ASSET_ATLAS dimensions:', png.width, 'x', png.height);

// Check if it has opaque pixels in eye areas
// Let's see if the master concept has Brokoli and characters
console.log('Master atlas size:', buf.length, 'bytes');
