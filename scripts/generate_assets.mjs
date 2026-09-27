import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Ensure directories exist
const baseDir = path.resolve('public/assets/brokoli');
const dirs = [
  '01_brand',
  '02_characters',
  '03_enemies_bosses',
  '04_worlds',
  '05_environment',
  '06_levels',
  '07_ui',
  '08_reference',
];

for (const d of dirs) {
  fs.mkdirSync(path.join(baseDir, d), { recursive: true });
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf), 0);
  return Buffer.concat([len, t, data, crc]);
}

class Canvas2D {
  constructor(width, height) {
    this.width = Math.round(width);
    this.height = Math.round(height);
    this.data = new Uint8ClampedArray(this.width * this.height * 4);
  }

  setPixel(x, y, r, g, b, a = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const idx = (y * this.width + x) * 4;
    const srcA = a / 255;
    if (srcA <= 0) return;
    if (srcA >= 1) {
      this.data[idx] = r;
      this.data[idx + 1] = g;
      this.data[idx + 2] = b;
      this.data[idx + 3] = 255;
    } else {
      const dstA = this.data[idx + 3] / 255;
      const outA = srcA + dstA * (1 - srcA);
      this.data[idx] = Math.round((r * srcA + this.data[idx] * dstA * (1 - srcA)) / outA);
      this.data[idx + 1] = Math.round((g * srcA + this.data[idx + 1] * dstA * (1 - srcA)) / outA);
      this.data[idx + 2] = Math.round((b * srcA + this.data[idx + 2] * dstA * (1 - srcA)) / outA);
      this.data[idx + 3] = Math.round(outA * 255);
    }
  }

  fill(r, g, b, a = 255) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setPixel(x, y, r, g, b, a);
      }
    }
  }

  fillLinearGradient(stops, vertical = true) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const t = vertical ? y / (this.height - 1) : x / (this.width - 1);
        const col = interpolateStops(stops, t);
        this.setPixel(x, y, col[0], col[1], col[2], col[3] ?? 255);
      }
    }
  }

  drawCircle(cx, cy, r, color, glow = 0) {
    const minX = Math.max(0, Math.floor(cx - r - glow - 1));
    const maxX = Math.min(this.width - 1, Math.ceil(cx + r + glow + 1));
    const minY = Math.max(0, Math.floor(cy - r - glow - 1));
    const maxY = Math.min(this.height - 1, Math.ceil(cy + r + glow + 1));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= r) {
          const edgeAlpha = Math.min(1, Math.max(0, r - dist + 0.5));
          this.setPixel(x, y, color[0], color[1], color[2], Math.round((color[3] ?? 255) * edgeAlpha));
        } else if (glow > 0 && dist <= r + glow) {
          const factor = (1 - (dist - r) / glow) * 0.4;
          this.setPixel(x, y, color[0], color[1], color[2], Math.round((color[3] ?? 255) * factor));
        }
      }
    }
  }

  drawShadedSphere(cx, cy, r, baseColor, highlightColor = [255, 255, 255], shadowColor = [10, 20, 10]) {
    const minX = Math.max(0, Math.floor(cx - r - 1));
    const maxX = Math.min(this.width - 1, Math.ceil(cx + r + 1));
    const minY = Math.max(0, Math.floor(cy - r - 1));
    const maxY = Math.min(this.height - 1, Math.ceil(cy + r + 1));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = (x - cx) / r;
        const dy = (y - cy) / r;
        const distSq = dx * dx + dy * dy;
        if (distSq <= 1) {
          const dist = Math.sqrt(distSq);
          const edge = Math.min(1, Math.max(0, (1 - dist) * r + 0.5));
          // Light source from top-left (-0.4, -0.4, 0.8)
          const lx = -0.4, ly = -0.4, lz = 0.8;
          const len = Math.sqrt(lx * lx + ly * ly + lz * lz);
          const nz = Math.sqrt(Math.max(0, 1 - distSq));
          const dot = (dx * (lx / len) + dy * (ly / len) + nz * (lz / len));
          
          let col = [...baseColor];
          if (dot > 0.4) {
            // Highlight
            const t = Math.pow((dot - 0.4) / 0.6, 2.5);
            col = lerpColor(col, highlightColor, t);
          } else {
            // Shadow
            const t = Math.min(1, Math.max(0, (0.4 - dot) / 1.2));
            col = lerpColor(col, shadowColor, t * 0.7);
          }
          this.setPixel(x, y, col[0], col[1], col[2], Math.round(255 * edge));
        }
      }
    }
  }

  drawRoundRect(x, y, w, h, radius, color, borderColor = null, borderWidth = 0) {
    const minX = Math.max(0, Math.floor(x));
    const maxX = Math.min(this.width - 1, Math.ceil(x + w));
    const minY = Math.max(0, Math.floor(y));
    const maxY = Math.min(this.height - 1, Math.ceil(y + h));

    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        // Distance to rounded box
        const qx = Math.abs(px - (x + w / 2)) - (w / 2 - radius);
        const qy = Math.abs(py - (y + h / 2)) - (h / 2 - radius);
        const dist = Math.min(Math.max(qx, qy), 0.0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - radius;
        
        if (dist <= 0) {
          if (borderWidth > 0 && borderColor && dist > -borderWidth) {
            this.setPixel(px, py, borderColor[0], borderColor[1], borderColor[2], borderColor[3] ?? 255);
          } else {
            this.setPixel(px, py, color[0], color[1], color[2], color[3] ?? 255);
          }
        }
      }
    }
  }

  drawRect(x, y, w, h, color) {
    const x0 = Math.max(0, Math.floor(x));
    const x1 = Math.min(this.width - 1, Math.ceil(x + w));
    const y0 = Math.max(0, Math.floor(y));
    const y1 = Math.min(this.height - 1, Math.ceil(y + h));
    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        this.setPixel(px, py, color[0], color[1], color[2], color[3] ?? 255);
      }
    }
  }

  drawStar(cx, cy, spikes, outerRadius, innerRadius, color) {
    const points = [];
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;

    for (let i = 0; i < spikes; i++) {
      points.push({ x: cx + Math.cos(rot) * outerRadius, y: cy + Math.sin(rot) * outerRadius });
      rot += step;
      points.push({ x: cx + Math.cos(rot) * innerRadius, y: cy + Math.sin(rot) * innerRadius });
      rot += step;
    }

    const minX = Math.max(0, Math.floor(cx - outerRadius - 1));
    const maxX = Math.min(this.width - 1, Math.ceil(cx + outerRadius + 1));
    const minY = Math.max(0, Math.floor(cy - outerRadius - 1));
    const maxY = Math.min(this.height - 1, Math.ceil(cy + outerRadius + 1));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (isInsidePolygon(x, y, points)) {
          this.setPixel(x, y, color[0], color[1], color[2], color[3] ?? 255);
        }
      }
    }
  }

  toPNG() {
    const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(this.width, 0);
    ihdr.writeUInt32BE(this.height, 4);
    ihdr[8] = 8;
    ihdr[9] = 6; // RGBA
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;

    const raw = Buffer.alloc(this.height * (this.width * 4 + 1));
    let offset = 0;
    for (let y = 0; y < this.height; y++) {
      raw[offset++] = 0; // Filter 0
      const rowStart = y * this.width * 4;
      for (let x = 0; x < this.width * 4; x++) {
        raw[offset++] = this.data[rowStart + x];
      }
    }

    const idat = zlib.deflateSync(raw, { level: 6 });
    return Buffer.concat([
      sig,
      pngChunk('IHDR', ihdr),
      pngChunk('IDAT', idat),
      pngChunk('IEND', Buffer.alloc(0)),
    ]);
  }

  save(relPath) {
    const full = path.join(baseDir, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, this.toPNG());
    console.log(`Generated: ${relPath} (${this.width}x${this.height})`);
  }
}

function lerpColor(c1, c2, t) {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
    Math.round((c1[3] ?? 255) + ((c2[3] ?? 255) - (c1[3] ?? 255)) * t),
  ];
}

function interpolateStops(stops, t) {
  if (t <= stops[0][0]) return stops[0][1];
  if (t >= stops[stops.length - 1][0]) return stops[stops.length - 1][1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) {
      const localT = (t - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
      return lerpColor(stops[i][1], stops[i + 1][1], localT);
    }
  }
  return stops[0][1];
}

function isInsidePolygon(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x, yi = pts[i].y;
    const xj = pts[j].x, yj = pts[j].y;
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// -------------------------------------------------------------
// 1. CHARACTERS
// -------------------------------------------------------------

// Brokoli Kahraman
function generateBrokoliHero() {
  const c = new Canvas2D(128, 128);
  // Red Superhero Cape behind
  c.drawRoundRect(32, 54, 64, 60, 14, [210, 30, 45], [140, 10, 25], 3);
  c.drawRoundRect(28, 80, 72, 34, 10, [190, 20, 35]);

  // Green Hero Body
  c.drawRoundRect(46, 56, 36, 44, 12, [76, 175, 80], [38, 120, 45], 2);

  // Brown superhero belt
  c.drawRoundRect(44, 78, 40, 12, [115, 60, 25], [70, 35, 15], 2);
  // Gold Belt Buckle with 'B'
  c.drawRoundRect(58, 77, 14, 14, 3, [255, 215, 0], [180, 140, 0], 2);
  c.drawCircle(64, 84, 3, [240, 180, 0]);

  // Red superhero boots
  c.drawRoundRect(44, 98, 16, 22, 6, [220, 35, 45], [140, 20, 30], 2);
  c.drawRoundRect(68, 98, 16, 22, 6, [220, 35, 45], [140, 20, 30], 2);

  // Hero Gloves
  c.drawCircle(36, 72, 10, [220, 35, 45]);
  c.drawCircle(92, 72, 10, [220, 35, 45]);

  // Big green broccoli florets head (Multiple fluffy 3D spheres)
  c.drawShadedSphere(42, 34, 22, [56, 155, 60], [120, 220, 100], [25, 80, 30]);
  c.drawShadedSphere(86, 34, 22, [56, 155, 60], [120, 220, 100], [25, 80, 30]);
  c.drawShadedSphere(64, 22, 24, [68, 175, 72], [140, 235, 110], [30, 95, 35]);
  c.drawShadedSphere(32, 46, 16, [48, 145, 52], [110, 210, 90], [20, 70, 25]);
  c.drawShadedSphere(96, 46, 16, [48, 145, 52], [110, 210, 90], [20, 70, 25]);

  // Head center / face plate
  c.drawRoundRect(42, 32, 44, 38, 14, [100, 200, 105], [50, 130, 55], 2);

  // Determined cute superhero eyes
  c.drawCircle(52, 46, 7, [255, 255, 255]);
  c.drawCircle(76, 46, 7, [255, 255, 255]);
  c.drawCircle(53, 46, 4, [20, 30, 40]);
  c.drawCircle(77, 46, 4, [20, 30, 40]);
  c.drawCircle(55, 44, 2, [255, 255, 255]); // Catchlight
  c.drawCircle(79, 44, 2, [255, 255, 255]);

  // Confident smiling mouth
  c.drawRoundRect(58, 56, 14, 5, 2, [240, 240, 240]);
  c.drawRoundRect(57, 55, 16, 2, 1, [150, 30, 30]);

  // Golden cape clasp
  c.drawCircle(50, 60, 4, [255, 215, 0]);
  c.drawCircle(78, 60, 4, [255, 215, 0]);

  c.save('02_characters/brokoli_kahraman.png');
}

// Havuc Kiz Arkadas
function generateHavucGirlfriend() {
  const c = new Canvas2D(128, 128);
  // Leafy ponytail / green top
  c.drawRoundRect(58, 8, 12, 28, 5, [65, 180, 70], [30, 110, 40], 2);
  c.drawRoundRect(46, 14, 16, 22, 6, [75, 195, 80], [35, 120, 45], 2);
  c.drawRoundRect(68, 14, 16, 22, 6, [75, 195, 80], [35, 120, 45], 2);

  // Cute pink bow
  c.drawCircle(54, 30, 7, [245, 90, 150]);
  c.drawCircle(74, 30, 7, [245, 90, 150]);
  c.drawCircle(64, 30, 5, [255, 160, 200]);

  // Carrot body (tapering downwards)
  for (let y = 30; y <= 112; y++) {
    const t = (y - 30) / 82;
    const width = 46 * (1 - t * 0.65);
    const x = 64 - width / 2;
    const col = lerpColor([255, 145, 30], [235, 95, 15], t);
    c.drawRoundRect(x, y, width, 2, 1, col);
  }

  // Carrot horizontal skin marks
  c.drawRoundRect(50, 52, 14, 2, 1, [210, 85, 10]);
  c.drawRoundRect(66, 68, 18, 2, 1, [210, 85, 10]);
  c.drawRoundRect(54, 86, 16, 2, 1, [210, 85, 10]);

  // Sweet eyes with long eyelashes
  c.drawCircle(54, 52, 6, [255, 255, 255]);
  c.drawCircle(74, 52, 6, [255, 255, 255]);
  c.drawCircle(55, 52, 3.5, [40, 25, 20]);
  c.drawCircle(75, 52, 3.5, [40, 25, 20]);
  c.drawCircle(56, 50, 1.5, [255, 255, 255]);
  c.drawCircle(76, 50, 1.5, [255, 255, 255]);

  // Pink blush cheeks
  c.drawCircle(46, 58, 4, [255, 130, 150, 180]);
  c.drawCircle(82, 58, 4, [255, 130, 150, 180]);

  // Cute happy smile
  c.drawCircle(64, 62, 4, [160, 40, 20]);
  c.drawRoundRect(60, 58, 8, 4, 1, [255, 130, 20]);

  // Little shoes
  c.drawRoundRect(50, 110, 12, 12, 4, [245, 90, 150]);
  c.drawRoundRect(66, 110, 12, 12, 4, [245, 90, 150]);

  c.save('02_characters/havuc_kiz_arkadas.png');
}

// Other vegetable friends
function generateVegetable(filename, type) {
  const c = new Canvas2D(96, 96);
  if (type === 'domates') {
    // Tomato
    c.drawShadedSphere(48, 52, 34, [235, 45, 40], [255, 140, 120], [130, 20, 20]);
    // Green stem
    c.drawRoundRect(44, 14, 8, 14, 3, [60, 175, 65]);
    c.drawStar(48, 24, 5, 16, 7, [70, 190, 75]);
    // Eyes
    c.drawCircle(40, 48, 5, [255, 255, 255]);
    c.drawCircle(56, 48, 5, [255, 255, 255]);
    c.drawCircle(40, 48, 3, [30, 20, 20]);
    c.drawCircle(56, 48, 3, [30, 20, 20]);
    c.drawCircle(48, 58, 4, [140, 20, 20]);
  } else if (type === 'misir') {
    // Corn
    c.drawRoundRect(36, 26, 24, 50, 10, [255, 215, 40], [200, 150, 20], 2);
    // Green husks
    c.drawRoundRect(24, 46, 16, 36, 8, [90, 195, 80]);
    c.drawRoundRect(56, 46, 16, 36, 8, [90, 195, 80]);
    // Kernels pattern
    for (let y = 30; y < 66; y += 6) {
      for (let x = 38; x < 58; x += 6) {
        c.drawCircle(x, y, 2, [255, 235, 110]);
      }
    }
    // Eyes
    c.drawCircle(44, 46, 4, [30, 30, 30]);
    c.drawCircle(52, 46, 4, [30, 30, 30]);
  } else if (type === 'sogan') {
    // Onion
    c.drawShadedSphere(48, 52, 32, [180, 60, 140], [235, 130, 200], [90, 25, 75]);
    c.drawRoundRect(45, 12, 6, 16, 2, [100, 200, 90]);
    c.drawCircle(42, 50, 4, [255, 255, 255]);
    c.drawCircle(54, 50, 4, [255, 255, 255]);
    c.drawCircle(42, 50, 2.5, [20, 20, 20]);
    c.drawCircle(54, 50, 2.5, [20, 20, 20]);
  } else if (type === 'biber') {
    // Bell Pepper
    c.drawRoundRect(30, 28, 36, 48, 14, [230, 50, 40], [150, 25, 20], 3);
    c.drawRoundRect(44, 14, 8, 16, 3, [60, 175, 65]);
    c.drawCircle(42, 46, 5, [255, 255, 255]);
    c.drawCircle(54, 46, 5, [255, 255, 255]);
    c.drawCircle(42, 46, 3, [30, 20, 20]);
    c.drawCircle(54, 46, 3, [30, 20, 20]);
  } else if (type === 'patlican') {
    // Eggplant
    c.drawShadedSphere(48, 56, 30, [95, 30, 135], [175, 90, 220], [40, 10, 60]);
    c.drawStar(48, 26, 5, 18, 8, [70, 180, 80]);
    c.drawRoundRect(45, 10, 6, 16, 2, [55, 150, 65]);
    c.drawCircle(42, 50, 4, [255, 255, 255]);
    c.drawCircle(54, 50, 4, [255, 255, 255]);
    c.drawCircle(42, 50, 2.5, [20, 20, 20]);
    c.drawCircle(54, 50, 2.5, [20, 20, 20]);
  } else if (type === 'bezelye') {
    // Pea pod
    c.drawRoundRect(18, 36, 60, 26, 12, [75, 190, 70], [40, 130, 45], 3);
    c.drawShadedSphere(32, 48, 10, [110, 220, 95], [170, 250, 150], [50, 140, 40]);
    c.drawShadedSphere(48, 48, 10, [110, 220, 95], [170, 250, 150], [50, 140, 40]);
    c.drawShadedSphere(64, 48, 10, [110, 220, 95], [170, 250, 150], [50, 140, 40]);
    c.drawCircle(48, 46, 2, [30, 50, 30]);
  } else if (type === 'mantar') {
    // Mushroom
    c.drawRoundRect(36, 48, 24, 36, 8, [240, 230, 210]);
    c.drawShadedSphere(48, 40, 32, [225, 45, 40], [255, 135, 125], [125, 20, 20]);
    c.drawCircle(36, 32, 6, [255, 255, 255]);
    c.drawCircle(60, 30, 7, [255, 255, 255]);
    c.drawCircle(48, 44, 5, [255, 255, 255]);
    c.drawCircle(43, 62, 3, [30, 30, 30]);
    c.drawCircle(53, 62, 3, [30, 30, 30]);
  } else if (type === 'salatalik') {
    // Cucumber
    c.drawRoundRect(30, 20, 36, 62, 16, [65, 185, 90], [35, 125, 55], 3);
    // Cool sunglasses!
    c.drawRoundRect(32, 40, 14, 10, 2, [20, 20, 20]);
    c.drawRoundRect(50, 40, 14, 10, 2, [20, 20, 20]);
    c.drawRect(44, 43, 8, 3, [20, 20, 20]);
    c.drawRoundRect(44, 60, 8, 4, 1, [240, 240, 240]);
  }
  c.save(`02_characters/${filename}`);
}

// -------------------------------------------------------------
// 2. BOSSES & ENEMIES
// -------------------------------------------------------------

// Hamburger Kral
function generateHamburgerKing() {
  const c = new Canvas2D(192, 192);
  // Red Royal Ermine Cape
  c.drawRoundRect(36, 70, 120, 105, 20, [195, 25, 35], [120, 15, 20], 4);
  c.drawRoundRect(30, 130, 132, 50, 14, [170, 20, 30]);
  // White ermine fur trim with black spots
  c.drawRoundRect(32, 165, 128, 16, 6, [245, 245, 245]);
  c.drawCircle(48, 173, 3, [20, 20, 20]);
  c.drawCircle(72, 173, 3, [20, 20, 20]);
  c.drawCircle(96, 173, 3, [20, 20, 20]);
  c.drawCircle(120, 173, 3, [20, 20, 20]);
  c.drawCircle(144, 173, 3, [20, 20, 20]);

  // Bottom bun
  c.drawRoundRect(52, 142, 88, 22, 10, [225, 160, 75], [160, 100, 40], 3);

  // Melted cheese dripping
  c.drawRoundRect(46, 128, 100, 16, 4, [255, 195, 0], [210, 150, 0], 2);
  c.drawRoundRect(54, 140, 12, 14, 4, [255, 195, 0]);
  c.drawRoundRect(118, 140, 14, 12, 4, [255, 195, 0]);

  // Juicy beef patty
  c.drawRoundRect(48, 112, 96, 22, 9, [110, 55, 25], [70, 35, 15], 3);

  // Green lettuce frills
  c.drawRoundRect(44, 100, 104, 16, 6, [80, 195, 70], [45, 135, 40], 2);
  for (let x = 48; x < 144; x += 12) {
    c.drawCircle(x, 108, 6, [95, 215, 80]);
  }

  // Sliced red tomato
  c.drawRoundRect(52, 88, 88, 14, 5, [225, 45, 40], [150, 25, 25], 2);

  // Top bun (giant dome)
  c.drawShadedSphere(96, 68, 48, [235, 170, 85], [255, 220, 145], [170, 110, 45]);

  // Sesame seeds
  const seeds = [
    [76, 42], [96, 38], [116, 42], [64, 54], [86, 50], [108, 50], [128, 54],
    [74, 66], [96, 62], [118, 66], [84, 76], [106, 76]
  ];
  for (const [sx, sy] of seeds) {
    c.drawRoundRect(sx, sy, 7, 4, 2, [255, 245, 205], [210, 190, 150], 1);
  }

  // Golden imperial crown with red rubies
  c.drawRoundRect(68, 14, 56, 12, 3, [255, 215, 0], [180, 140, 0], 2);
  c.drawStar(96, 18, 5, 22, 10, [255, 215, 0]);
  c.drawCircle(74, 10, 5, [255, 215, 0]);
  c.drawCircle(96, 4, 6, [255, 215, 0]);
  c.drawCircle(118, 10, 5, [255, 215, 0]);
  // Rubies
  c.drawCircle(74, 18, 3, [220, 30, 30]);
  c.drawCircle(96, 18, 4, [220, 30, 30]);
  c.drawCircle(118, 18, 3, [220, 30, 30]);

  // Authoritarian, funny angry boss eyes
  c.drawCircle(80, 68, 9, [255, 255, 255]);
  c.drawCircle(112, 68, 9, [255, 255, 255]);
  c.drawCircle(82, 68, 5, [180, 20, 20]);
  c.drawCircle(110, 68, 5, [180, 20, 20]);
  c.drawCircle(84, 66, 2, [255, 255, 255]);
  c.drawCircle(112, 66, 2, [255, 255, 255]);
  // Angry eyebrows
  c.drawRoundRect(72, 54, 18, 4, 2, [120, 60, 20]);
  c.drawRoundRect(102, 54, 18, 4, 2, [120, 60, 20]);

  // Booming evil grin with sharp cartoon teeth
  c.drawRoundRect(82, 82, 28, 12, 4, [60, 20, 20]);
  c.drawRoundRect(84, 82, 8, 5, 1, [255, 255, 255]);
  c.drawRoundRect(94, 82, 8, 5, 1, [255, 255, 255]);
  c.drawRoundRect(102, 82, 6, 5, 1, [255, 255, 255]);

  c.save('03_enemies_bosses/hamburger_krali.png');
}

// Ketcap
function generateKetcap() {
  const c = new Canvas2D(128, 128);
  // Red bottle body
  c.drawRoundRect(42, 38, 44, 76, 14, [225, 30, 35], [145, 15, 20], 3);
  // Neck
  c.drawRoundRect(52, 20, 24, 22, 6, [215, 25, 30], [140, 15, 20], 2);
  // White/yellow squeeze cap
  c.drawRoundRect(54, 8, 20, 14, 4, [255, 240, 210], [190, 170, 140], 2);
  c.drawRoundRect(60, 2, 8, 8, 2, [245, 215, 0]);

  // Label
  c.drawRoundRect(46, 56, 36, 32, 6, [255, 250, 240], [210, 180, 50], 2);
  c.drawCircle(64, 70, 9, [220, 30, 35]); // Tomato insignia

  // Aggressive villain eyes
  c.drawCircle(54, 46, 6, [255, 255, 255]);
  c.drawCircle(74, 46, 6, [255, 255, 255]);
  c.drawCircle(56, 46, 3.5, [180, 20, 20]);
  c.drawCircle(72, 46, 3.5, [180, 20, 20]);

  // Evil grin
  c.drawRoundRect(56, 92, 16, 6, 2, [70, 20, 20]);

  // Splashing sauce drops
  c.drawCircle(30, 50, 5, [220, 30, 35]);
  c.drawCircle(98, 54, 6, [220, 30, 35]);
  c.drawCircle(26, 75, 4, [220, 30, 35]);
  c.drawCircle(102, 80, 5, [220, 30, 35]);

  // Boots
  c.drawRoundRect(44, 112, 14, 12, 4, [40, 40, 45]);
  c.drawRoundRect(70, 112, 14, 12, 4, [40, 40, 45]);

  c.save('03_enemies_bosses/ketcap.png');
}

// Hardal
function generateHardal() {
  const c = new Canvas2D(128, 128);
  // Yellow mustard squeeze bottle
  c.drawRoundRect(42, 38, 44, 76, 14, [245, 200, 25], [175, 135, 15], 3);
  // Neck
  c.drawRoundRect(52, 20, 24, 22, 6, [240, 190, 20], [170, 130, 10], 2);
  // Yellow cone cap
  c.drawRoundRect(56, 8, 16, 14, 3, [235, 175, 15], [160, 115, 10], 2);
  c.drawRoundRect(61, 2, 6, 8, 2, [215, 150, 10]);

  // Label
  c.drawRoundRect(46, 56, 36, 32, 6, [255, 250, 240], [190, 140, 30], 2);
  c.drawRoundRect(50, 64, 28, 16, 4, [225, 165, 20]);

  // Slippery mischievous eyes
  c.drawCircle(54, 46, 6, [255, 255, 255]);
  c.drawCircle(74, 46, 6, [255, 255, 255]);
  c.drawCircle(56, 46, 3.5, [140, 100, 10]);
  c.drawCircle(72, 46, 3.5, [140, 100, 10]);

  // Smirk
  c.drawRoundRect(56, 92, 16, 5, 2, [100, 60, 10]);

  // Mustard slime splash
  c.drawRoundRect(28, 96, 20, 8, 4, [245, 205, 30]);
  c.drawRoundRect(80, 98, 22, 8, 4, [245, 205, 30]);

  // Boots
  c.drawRoundRect(44, 112, 14, 12, 4, [40, 40, 45]);
  c.drawRoundRect(70, 112, 14, 12, 4, [40, 40, 45]);

  c.save('03_enemies_bosses/hardal.png');
}

// Mayonez
function generateMayonez() {
  const c = new Canvas2D(128, 128);
  // Chubby white/creamy jar
  c.drawRoundRect(38, 38, 52, 74, 18, [250, 248, 240], [190, 185, 175], 3);
  // Blue twist lid
  c.drawRoundRect(44, 22, 40, 18, 5, [45, 120, 215], [25, 80, 160], 2);
  // Creamy dollop swirl on top
  c.drawShadedSphere(64, 18, 12, [255, 255, 250], [255, 255, 255], [210, 205, 195]);

  // Label with mayonnaise swirl
  c.drawRoundRect(44, 58, 40, 30, 6, [230, 240, 255], [70, 130, 210], 2);
  c.drawCircle(64, 73, 8, [255, 255, 230]);

  // Smug sleepy villain eyes
  c.drawCircle(54, 48, 6, [255, 255, 255]);
  c.drawCircle(74, 48, 6, [255, 255, 255]);
  c.drawCircle(55, 48, 3.5, [30, 60, 100]);
  c.drawCircle(73, 48, 3.5, [30, 60, 100]);
  // Eyelids half-closed
  c.drawRoundRect(48, 44, 12, 4, 1, [230, 225, 215]);
  c.drawRoundRect(68, 44, 12, 4, 1, [230, 225, 215]);

  // Boots
  c.drawRoundRect(42, 112, 14, 12, 4, [40, 40, 45]);
  c.drawRoundRect(72, 112, 14, 12, 4, [40, 40, 45]);

  c.save('03_enemies_bosses/mayonez.png');
}

// Sos Fabrikasi Muhafizi (Combo Mech Boss for Level 40)
function generateSosMuhafizi() {
  const c = new Canvas2D(192, 192);
  // Heavy industrial mechanical frame
  c.drawRoundRect(46, 52, 100, 96, 16, [100, 110, 120], [60, 70, 80], 4);
  // Hazard stripes across chest
  for (let x = 50; x < 140; x += 16) {
    c.drawRoundRect(x, 90, 8, 20, 2, [255, 215, 0]);
  }

  // Three pressurized sauce tanks on shoulders
  // Ketchup tank (left)
  c.drawRoundRect(24, 38, 22, 54, 8, [220, 35, 40], [140, 20, 25], 2);
  c.drawRoundRect(28, 28, 14, 12, 3, [180, 180, 180]);
  // Mustard tank (center-top)
  c.drawRoundRect(84, 16, 24, 38, 8, [245, 200, 25], [175, 135, 15], 2);
  // Mayo tank (right)
  c.drawRoundRect(146, 38, 22, 54, 8, [250, 248, 240], [180, 180, 180], 2);
  c.drawRoundRect(150, 28, 14, 12, 3, [180, 180, 180]);

  // Glowing glowing mechanical steam eyes
  c.drawCircle(74, 72, 10, [255, 60, 60], 6);
  c.drawCircle(118, 72, 10, [255, 60, 60], 6);
  c.drawCircle(74, 72, 6, [255, 240, 200]);
  c.drawCircle(118, 72, 6, [255, 240, 200]);

  // Iron teeth grill
  c.drawRoundRect(76, 118, 40, 14, 3, [40, 45, 50]);
  for (let x = 80; x < 114; x += 6) {
    c.drawRoundRect(x, 120, 3, 10, 1, [200, 205, 210]);
  }

  // Giant steel treads / feet
  c.drawRoundRect(36, 146, 38, 30, 8, [55, 60, 65], [30, 35, 40], 3);
  c.drawRoundRect(118, 146, 38, 30, 8, [55, 60, 65], [30, 35, 40], 3);

  c.save('03_enemies_bosses/sos_fabrikasi_muhafizi.png');
}

// Minions
function generateMinions() {
  // Sauce blob minion
  const c1 = new Canvas2D(64, 64);
  c1.drawShadedSphere(32, 36, 20, [225, 45, 40], [255, 145, 135], [130, 20, 20]);
  c1.drawCircle(26, 32, 4, [255, 255, 255]);
  c1.drawCircle(38, 32, 4, [255, 255, 255]);
  c1.drawCircle(27, 32, 2, [30, 20, 20]);
  c1.drawCircle(39, 32, 2, [30, 20, 20]);
  c1.save('03_enemies_bosses/minion_sauce.png');

  // French fry minion
  const c2 = new Canvas2D(64, 64);
  c2.drawRoundRect(16, 24, 32, 34, 4, [220, 35, 40], [140, 20, 25], 2);
  c2.drawRoundRect(20, 8, 6, 22, 2, [255, 215, 50]);
  c2.drawRoundRect(28, 4, 6, 26, 2, [255, 215, 50]);
  c2.drawRoundRect(36, 10, 6, 20, 2, [255, 215, 50]);
  c2.drawCircle(28, 36, 3, [30, 30, 30]);
  c2.drawCircle(36, 36, 3, [30, 30, 30]);
  c2.save('03_enemies_bosses/minion_fry.png');
}

// -------------------------------------------------------------
// 3. WORLDS & BACKGROUNDS
// -------------------------------------------------------------

function generateWorldBackground(filename, worldNum) {
  const c = new Canvas2D(1280, 720);
  if (worldNum === 1) {
    // World 1: Green Valley / Forest
    c.fillLinearGradient([
      [0, [125, 205, 255]],
      [0.55, [195, 240, 255]],
      [0.6, [140, 220, 110]],
      [1.0, [45, 125, 45]],
    ]);
    // Distant mountain ranges
    c.drawRoundRect(100, 300, 350, 260, 120, [105, 195, 115, 160]);
    c.drawRoundRect(500, 260, 420, 300, 150, [85, 175, 95, 180]);
    c.drawRoundRect(880, 280, 380, 280, 140, [95, 185, 105, 170]);
    // Whimsical broccoli giant trees
    c.drawRoundRect(140, 380, 28, 180, 8, [130, 80, 40]);
    c.drawShadedSphere(154, 360, 60, [50, 155, 55], [110, 225, 90], [25, 80, 30]);
    c.drawRoundRect(1040, 360, 32, 200, 10, [130, 80, 40]);
    c.drawShadedSphere(1056, 340, 70, [50, 155, 55], [110, 225, 90], [25, 80, 30]);
    // Rolling hills in foreground
    c.drawRoundRect(-50, 460, 750, 320, 180, [65, 175, 60]);
    c.drawRoundRect(580, 480, 750, 320, 180, [55, 160, 50]);
  } else if (worldNum === 2) {
    // World 2: Farm & Fields (Sunset glow)
    c.fillLinearGradient([
      [0, [255, 130, 80]],
      [0.45, [255, 205, 110]],
      [0.65, [220, 160, 50]],
      [1.0, [130, 85, 30]],
    ]);
    // Windmill silhouette
    c.drawRoundRect(920, 240, 44, 180, 8, [80, 45, 25]);
    c.drawRoundRect(840, 210, 200, 8, 3, [80, 45, 25]);
    c.drawRoundRect(938, 120, 8, 190, 3, [80, 45, 25]);
    // Distant farm fences & fields
    c.drawRoundRect(0, 420, 1280, 300, 100, [195, 135, 45]);
    c.drawRoundRect(100, 490, 1180, 250, 80, [160, 105, 35]);
  } else if (worldNum === 3) {
    // World 3: Sauce Factory
    c.fillLinearGradient([
      [0, [45, 35, 55]],
      [0.6, [70, 55, 80]],
      [1.0, [30, 25, 35]],
    ]);
    // Giant industrial pipes glowing red/yellow/white
    c.drawRoundRect(80, 0, 50, 500, 10, [210, 40, 45], [140, 20, 25], 4);
    c.drawRoundRect(350, 120, 500, 40, 8, [240, 195, 25], [170, 130, 15], 3);
    c.drawRoundRect(780, 0, 44, 460, 8, [245, 245, 240], [180, 180, 180], 3);
    // Factory gears
    c.drawCircle(280, 220, 70, [90, 95, 110]);
    c.drawCircle(280, 220, 35, [45, 35, 55]);
    c.drawCircle(980, 260, 90, [80, 85, 95]);
    c.drawCircle(980, 260, 45, [45, 35, 55]);
    // Metallic walkways
    c.drawRoundRect(0, 460, 1280, 260, 20, [50, 55, 65], [30, 35, 40], 4);
  } else if (worldNum === 4) {
    // World 4: Freezer Zone
    c.fillLinearGradient([
      [0, [25, 40, 75]],
      [0.5, [75, 125, 185]],
      [0.75, [180, 230, 255]],
      [1.0, [215, 245, 255]],
    ]);
    // Icicles from ceiling
    for (let x = 60; x < 1240; x += 110) {
      c.drawRoundRect(x, 0, 22, 120 + ((x * 17) % 90), 8, [210, 240, 255], [140, 190, 225], 2);
    }
    // Crystal glacier peaks
    c.drawRoundRect(150, 320, 380, 340, 40, [150, 205, 240, 190]);
    c.drawRoundRect(680, 280, 460, 380, 50, [130, 190, 230, 200]);
    c.drawRoundRect(0, 480, 1280, 240, 60, [195, 235, 255]);
  } else if (worldNum === 5) {
    // World 5: Hamburger Castle
    c.fillLinearGradient([
      [0, [35, 15, 45]],
      [0.45, [85, 25, 75]],
      [0.7, [135, 45, 65]],
      [1.0, [45, 20, 35]],
    ]);
    // Burger castle ramparts and towers
    c.drawRoundRect(120, 180, 160, 450, 14, [75, 40, 65], [45, 20, 40], 4);
    c.drawRoundRect(960, 180, 160, 450, 14, [75, 40, 65], [45, 20, 40], 4);
    // Castle battlements
    for (let x = 120; x < 280; x += 36) {
      c.drawRoundRect(x, 150, 24, 40, 4, [90, 48, 78]);
    }
    for (let x = 960; x < 1120; x += 36) {
      c.drawRoundRect(x, 150, 24, 40, 4, [90, 48, 78]);
    }
    // Central fortress burger dome
    c.drawRoundRect(360, 240, 540, 380, 50, [65, 35, 55], [35, 15, 30], 4);
    c.drawShadedSphere(630, 210, 80, [215, 150, 70], [255, 200, 110], [130, 80, 30]);
    // Golden crown on tower
    c.drawStar(630, 120, 5, 35, 18, [255, 215, 0]);
  }
  c.save(`04_worlds/${filename}`);
}

// World Map Overview
function generateWorldMap() {
  const c = new Canvas2D(1280, 720);
  c.fillLinearGradient([
    [0, [65, 160, 235]],
    [0.4, [115, 200, 250]],
    [1.0, [40, 130, 200]],
  ]);
  // 5 Islands representing the 5 worlds
  // 1: Forest Island
  c.drawRoundRect(80, 380, 240, 180, 50, [85, 185, 75], [50, 135, 45], 5);
  // 2: Farm Island
  c.drawRoundRect(300, 220, 240, 170, 50, [215, 165, 60], [150, 105, 35], 5);
  // 3: Factory Island
  c.drawRoundRect(520, 390, 240, 180, 50, [110, 115, 130], [65, 70, 80], 5);
  // 4: Ice Island
  c.drawRoundRect(740, 190, 240, 170, 50, [180, 230, 255], [115, 175, 215], 5);
  // 5: Castle Island
  c.drawRoundRect(950, 340, 260, 220, 50, [125, 45, 75], [75, 25, 45], 5);

  // Dotted pathway connecting islands
  for (let t = 0; t <= 1; t += 0.02) {
    const px = 200 + t * 850;
    const py = 450 - Math.sin(t * Math.PI * 3) * 120;
    c.drawCircle(px, py, 6, [255, 240, 170], 2);
  }

  c.save('04_worlds/world_map.png');
  c.save('06_levels/level_select_bg.png');
}

// -------------------------------------------------------------
// 4. ENVIRONMENT & TILES
// -------------------------------------------------------------

function generatePlatforms() {
  // Grass platform
  const c1 = new Canvas2D(192, 64);
  c1.drawRoundRect(0, 16, 192, 48, 8, [135, 85, 45], [85, 50, 25], 3);
  c1.drawRoundRect(0, 0, 192, 22, 6, [85, 190, 70], [45, 130, 40], 2);
  for (let x = 8; x < 188; x += 12) {
    c1.drawCircle(x, 20, 5, [95, 210, 80]);
  }
  c1.save('05_environment/platform_grass.png');

  // Wood platform
  const c2 = new Canvas2D(192, 64);
  c2.drawRoundRect(0, 4, 192, 56, 8, [180, 120, 60], [115, 70, 30], 3);
  c2.drawRoundRect(4, 8, 184, 14, 3, [205, 145, 80]);
  c2.drawRoundRect(4, 26, 184, 14, 3, [195, 135, 70]);
  c2.drawRoundRect(4, 44, 184, 12, 3, [185, 125, 65]);
  c2.save('05_environment/platform_wood.png');

  // Factory platform
  const c3 = new Canvas2D(192, 64);
  c3.drawRoundRect(0, 6, 192, 52, 6, [95, 105, 115], [55, 60, 70], 4);
  for (let x = 6; x < 186; x += 18) {
    c3.drawRoundRect(x, 10, 9, 44, 2, [255, 215, 0]);
  }
  c3.save('05_environment/platform_factory.png');

  // Ice platform
  const c4 = new Canvas2D(192, 64);
  c4.drawRoundRect(0, 4, 192, 56, 10, [195, 235, 255, 230], [120, 180, 220], 3);
  c4.drawRoundRect(6, 8, 180, 16, 6, [240, 250, 255]);
  c4.save('05_environment/platform_ice.png');

  // Castle platform
  const c5 = new Canvas2D(192, 64);
  c5.drawRoundRect(0, 4, 192, 56, 8, [95, 45, 75], [55, 25, 45], 3);
  c5.drawRoundRect(2, 4, 188, 8, 2, [255, 215, 0]); // Gold trim
  c5.save('05_environment/platform_castle.png');
}

function generateInteractiveObjects() {
  // Rescue Cage (closed)
  const cageClosed = new Canvas2D(96, 112);
  cageClosed.drawRoundRect(8, 8, 80, 96, 8, [100, 105, 115, 160], [60, 65, 75], 4);
  for (let x = 20; x < 84; x += 14) {
    cageClosed.drawRoundRect(x, 12, 6, 88, 2, [190, 195, 205], [80, 85, 95], 1);
  }
  // Big golden padlock
  cageClosed.drawRoundRect(40, 52, 16, 18, 4, [255, 215, 0], [180, 140, 0], 2);
  cageClosed.drawCircle(48, 60, 3, [30, 30, 30]);
  cageClosed.save('05_environment/cage.png');

  // Cage (open)
  const cageOpen = new Canvas2D(96, 112);
  cageOpen.drawRoundRect(8, 8, 80, 96, 8, [100, 105, 115, 100], [60, 65, 75], 3);
  cageOpen.drawRoundRect(14, 12, 6, 88, 2, [190, 195, 205]);
  cageOpen.drawRoundRect(76, 12, 6, 88, 2, [190, 195, 205]);
  // Broken lock
  cageOpen.drawRoundRect(40, 78, 16, 14, 3, [220, 180, 0]);
  // Confetti particles
  cageOpen.drawCircle(32, 38, 4, [255, 80, 80]);
  cageOpen.drawCircle(64, 34, 4, [80, 220, 80]);
  cageOpen.drawCircle(48, 22, 5, [255, 220, 50]);
  cageOpen.save('05_environment/cage_open.png');

  // Doors
  const doorClosed = new Canvas2D(80, 120);
  doorClosed.drawRoundRect(4, 4, 72, 112, 12, [95, 60, 35], [55, 30, 15], 4);
  doorClosed.drawRoundRect(14, 14, 52, 92, 8, [130, 85, 50], [80, 45, 25], 2);
  doorClosed.drawCircle(54, 62, 5, [255, 215, 0]); // Golden knob
  doorClosed.save('05_environment/door_closed.png');

  const doorOpen = new Canvas2D(80, 120);
  doorOpen.drawRoundRect(4, 4, 72, 112, 12, [55, 30, 15], [30, 15, 5], 4);
  // Radiant magical portal
  doorOpen.drawRoundRect(12, 12, 56, 96, 8, [110, 235, 255], [255, 255, 255], 3);
  doorOpen.drawShadedSphere(40, 60, 24, [220, 255, 255], [255, 255, 255], [140, 230, 255]);
  doorOpen.save('05_environment/door_open.png');

  // Keys & Collectibles
  const key = new Canvas2D(48, 48);
  key.drawCircle(18, 18, 12, [255, 215, 0], 3);
  key.drawCircle(18, 18, 6, [0, 0, 0, 0]);
  key.drawRoundRect(18, 15, 24, 7, 2, [255, 215, 0]);
  key.drawRoundRect(32, 21, 5, 8, 1, [255, 215, 0]);
  key.drawRoundRect(38, 21, 5, 6, 1, [255, 215, 0]);
  key.save('05_environment/key.png');

  const coin = new Canvas2D(40, 40);
  coin.drawCircle(20, 20, 18, [255, 215, 0], 2);
  coin.drawCircle(20, 20, 14, [240, 185, 0]);
  // Vegetable star imprint
  coin.drawStar(20, 20, 5, 8, 4, [255, 245, 170]);
  coin.save('05_environment/coin.png');

  const star = new Canvas2D(48, 48);
  star.drawStar(24, 24, 5, 22, 10, [255, 215, 0]);
  star.drawStar(24, 24, 5, 16, 7, [255, 240, 120]);
  star.save('05_environment/star.png');

  const starEmpty = new Canvas2D(48, 48);
  starEmpty.drawStar(24, 24, 5, 22, 10, [100, 110, 120, 180]);
  starEmpty.save('05_environment/star_empty.png');

  // Pushable Crate
  const crate = new Canvas2D(64, 64);
  crate.drawRoundRect(4, 4, 56, 56, 4, [190, 130, 70], [120, 75, 35], 3);
  crate.drawRect(8, 8, 48, 48, [170, 115, 60]);
  crate.drawRoundRect(8, 28, 48, 8, 1, [140, 90, 45]);
  crate.drawRoundRect(28, 8, 8, 48, 1, [140, 90, 45]);
  crate.save('05_environment/crate.png');

  // Buttons
  const btn = new Canvas2D(64, 48);
  btn.drawRoundRect(8, 28, 48, 16, 4, [100, 105, 110], [60, 65, 70], 2);
  btn.drawRoundRect(16, 12, 32, 20, 6, [235, 45, 40], [160, 25, 20], 2);
  btn.save('05_environment/button.png');

  const btnPressed = new Canvas2D(64, 48);
  btnPressed.drawRoundRect(8, 28, 48, 16, 4, [100, 105, 110], [60, 65, 70], 2);
  btnPressed.drawRoundRect(16, 22, 32, 10, 3, [80, 215, 70], [40, 140, 35], 2);
  btnPressed.save('05_environment/button_pressed.png');

  // Hazards: Spikes & Sauce Puddle
  const spikes = new Canvas2D(64, 64);
  for (let x = 8; x < 60; x += 16) {
    spikes.drawStar(x, 48, 3, 20, 6, [210, 215, 220]);
  }
  spikes.save('05_environment/spikes.png');

  const saucePuddle = new Canvas2D(96, 32);
  saucePuddle.drawRoundRect(8, 12, 80, 16, 8, [225, 45, 40], [160, 25, 20], 2);
  saucePuddle.drawCircle(24, 16, 10, [225, 45, 40]);
  saucePuddle.drawCircle(68, 18, 8, [225, 45, 40]);
  saucePuddle.save('05_environment/sauce_puddle.png');
}

// -------------------------------------------------------------
// 5. UI ELEMENTS & BRANDING
// -------------------------------------------------------------

function generateUIAndBrand() {
  // Heart
  const heart = new Canvas2D(48, 48);
  heart.drawCircle(17, 18, 12, [240, 40, 60]);
  heart.drawCircle(31, 18, 12, [240, 40, 60]);
  heart.drawStar(24, 32, 3, 16, 8, [240, 40, 60]);
  heart.drawCircle(15, 14, 4, [255, 160, 180]); // Highlight
  heart.save('07_ui/heart.png');

  const heartEmpty = new Canvas2D(48, 48);
  heartEmpty.drawCircle(17, 18, 12, [100, 105, 115, 180]);
  heartEmpty.drawCircle(31, 18, 12, [100, 105, 115, 180]);
  heartEmpty.drawStar(24, 32, 3, 16, 8, [100, 105, 115, 180]);
  heartEmpty.save('07_ui/heart_empty.png');

  // Touch action buttons
  const btnJump = new Canvas2D(80, 80);
  btnJump.drawShadedSphere(40, 40, 36, [80, 205, 75], [140, 245, 120], [35, 125, 35]);
  btnJump.drawStar(40, 36, 3, 16, 8, [255, 255, 255]); // Arrow Up
  btnJump.save('07_ui/btn_jump.png');

  const btnDash = new Canvas2D(80, 80);
  btnDash.drawShadedSphere(40, 40, 36, [245, 150, 35], [255, 205, 105], [160, 85, 15]);
  btnDash.drawRoundRect(24, 36, 32, 8, 4, [255, 255, 255]);
  btnDash.save('07_ui/btn_dash.png');

  const btnInteract = new Canvas2D(80, 80);
  btnInteract.drawShadedSphere(40, 40, 36, [50, 145, 245], [125, 195, 255], [20, 80, 160]);
  btnInteract.drawCircle(40, 40, 12, [255, 255, 255]);
  btnInteract.save('07_ui/btn_interact.png');

  // Brand Feature Banner (800x450)
  const banner = new Canvas2D(800, 450);
  banner.fillLinearGradient([
    [0, [45, 140, 230]],
    [0.6, [140, 220, 255]],
    [0.65, [110, 210, 80]],
    [1.0, [45, 130, 40]],
  ]);
  // Title plate
  banner.drawRoundRect(150, 40, 500, 100, 24, [255, 215, 0], [180, 135, 0], 5);
  banner.drawRoundRect(165, 52, 470, 76, 16, [240, 45, 55]);
  // Broccoli hero on the left
  banner.drawShadedSphere(260, 280, 60, [68, 175, 72], [140, 235, 110], [30, 95, 35]);
  banner.drawRoundRect(220, 320, 80, 90, 20, [210, 30, 45]);
  // Carrot girlfriend
  banner.drawRoundRect(350, 260, 46, 120, 16, [255, 145, 30], [200, 90, 15], 3);
  banner.drawStar(373, 230, 5, 22, 10, [80, 200, 70]);
  // Giant Burger King on the right
  banner.drawShadedSphere(580, 270, 85, [235, 170, 85], [255, 220, 145], [170, 110, 45]);
  banner.drawStar(580, 185, 5, 36, 16, [255, 215, 0]);
  banner.save('01_brand/feature_banner.png');

  // Master Concept
  banner.save('08_reference/MASTER_CONCEPT.png');

  // App Logo
  const logo = new Canvas2D(400, 160);
  logo.drawRoundRect(10, 10, 380, 140, 24, [255, 215, 0], [180, 135, 0], 6);
  logo.drawRoundRect(20, 20, 360, 120, 18, [76, 175, 80], [38, 120, 45], 4);
  logo.drawShadedSphere(75, 75, 38, [80, 195, 75], [145, 235, 115], [35, 115, 40]);
  logo.drawRoundRect(58, 88, 34, 40, 8, [215, 35, 45]);
  logo.save('01_brand/logo.png');
}

// RUN GENERATION
console.log('--- Generating All Brokoli Game Assets ---');
generateBrokoliHero();
generateHavucGirlfriend();
const friends = ['domates', 'misir', 'sogan', 'biber', 'patlican', 'bezelye', 'mantar', 'salatalik'];
for (const f of friends) {
  generateVegetable(`${f}.png`, f);
}
generateHamburgerKing();
generateKetcap();
generateHardal();
generateMayonez();
generateSosMuhafizi();
generateMinions();

for (let w = 1; w <= 5; w++) {
  const names = ['world1_forest.png', 'world2_farm.png', 'world3_factory.png', 'world4_ice.png', 'world5_castle.png'];
  generateWorldBackground(names[w - 1], w);
}
generateWorldMap();
generatePlatforms();
generateInteractiveObjects();
generateUIAndBrand();

console.log('--- Asset Generation Complete! ---');
