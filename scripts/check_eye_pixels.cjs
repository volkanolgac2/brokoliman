const fs = require('fs');
const { PNG } = require('pngjs');

const buf = fs.readFileSync('public/assets/brokoli/02_characters/brokoli_kahraman.png');
const png = PNG.sync.read(buf);

console.log('Sample pixels inside Brokoli left eye hole (X:250..270, Y:300..310):');
for (let y = 300; y <= 308; y += 2) {
  const row = [];
  for (let x = 250; x <= 270; x += 3) {
    const idx = (y * png.width + x) * 4;
    const r = png.data[idx];
    const g = png.data[idx+1];
    const b = png.data[idx+2];
    const a = png.data[idx+3];
    row.push(`(${r},${g},${b},a=${a})`);
  }
  console.log(row.join(' '));
}
