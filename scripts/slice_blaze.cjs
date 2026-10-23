/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const inputPath = 'public/assets/aistudio/Blaze_Crimson_Swordfighter_Sprite_Sheet_b242f298.png';
const outputDir = 'public/assets/blaze_sprites';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const data = fs.readFileSync(inputPath);
const srcPng = PNG.sync.read(data);

console.log('Source image loaded:', srcPng.width, 'x', srcPng.height);

// Explicit verified frame definitions for rows with wide/overlapping VFX
const EXPLICIT_FRAMES = {
  attack1: [
    { minX: 110, maxX: 188, bodyX: 162 },
    { minX: 189, maxX: 318, bodyX: 248 },
    { minX: 319, maxX: 453, bodyX: 368 },
    { minX: 454, maxX: 655, bodyX: 505 },
    { minX: 656, maxX: 867, bodyX: 702 },
    { minX: 868, maxX: 993, bodyX: 938 },
    { minX: 994, maxX: 1137, bodyX: 1042 },
    { minX: 1138, maxX: 1305, bodyX: 1185 },
    { minX: 1306, maxX: 1399, bodyX: 1348 },
  ],
  attack2: [
    { minX: 107, maxX: 192, bodyX: 162 },
    { minX: 193, maxX: 324, bodyX: 252 },
    { minX: 325, maxX: 436, bodyX: 362 },
    { minX: 437, maxX: 555, bodyX: 492 },
    { minX: 556, maxX: 641, bodyX: 602 },
    { minX: 642, maxX: 852, bodyX: 734 },
    { minX: 853, maxX: 1031, bodyX: 912 },
    { minX: 1032, maxX: 1197, bodyX: 1122 },
    { minX: 1318, maxX: 1413, bodyX: 1380 },
  ],
  dash: [
    { minX: 90, maxX: 194, bodyX: 155 },
    { minX: 195, maxX: 304, bodyX: 274 },
    { minX: 305, maxX: 432, bodyX: 396 },
    { minX: 433, maxX: 582, bodyX: 546 },
    { minX: 583, maxX: 709, bodyX: 672 },
    { minX: 710, maxX: 848, bodyX: 812 },
    { minX: 849, maxX: 991, bodyX: 958 },
    { minX: 992, maxX: 1132, bodyX: 1098 },
    { minX: 1133, maxX: 1238, bodyX: 1204 },
  ],
  skill: [
    {
      minX: 96,
      maxX: 212,
      bodyX: 141,
      maskFn: (sx, sy) => !(sx > 183 && sy < 1014),
    },
    {
      minX: 184,
      maxX: 271,
      bodyX: 242,
      maskFn: (sx, sy) => !(sx < 213 && sy >= 1014),
    },
    { minX: 280, maxX: 436, bodyX: 398 },
    { minX: 437, maxX: 594, bodyX: 513 },
    { minX: 595, maxX: 745, bodyX: 659 },
    { minX: 746, maxX: 865, bodyX: 782 },
    {
      minX: 866,
      maxX: 1072,
      bodyX: 1002,
      maskFn: (sx, sy) => !(sx > 1032 && sy < 1014),
    },
    {
      minX: 1033,
      maxX: 1344,
      bodyX: 1164,
      maskFn: (sx, sy) => !(sx < 1073 && sy >= 1014),
    },
    { minX: 1353, maxX: 1430, bodyX: 1402 },
  ],
};

// Row boundaries strictly safe from divider lines
const ROW_DEFS = [
  { name: 'idle', y1: 8, y2: 95, canvasW: 96, canvasH: 96, anchorX: 48, feetYOffset: 12 },
  { name: 'walk', y1: 106, y2: 191, canvasW: 96, canvasH: 96, anchorX: 48, feetYOffset: 12 },
  { name: 'run', y1: 201, y2: 284, canvasW: 112, canvasH: 96, anchorX: 56, feetYOffset: 12 },
  { name: 'jump', y1: 295, y2: 389, canvasW: 96, canvasH: 104, anchorX: 48, feetYOffset: 14 },
  { name: 'fall', y1: 400, y2: 491, canvasW: 96, canvasH: 104, anchorX: 48, feetYOffset: 14 },
  { name: 'attack1', y1: 502, y2: 587, canvasW: 240, canvasH: 104, anchorX: 96, feetYOffset: 14 },
  { name: 'attack2', y1: 598, y2: 678, canvasW: 240, canvasH: 104, anchorX: 96, feetYOffset: 14 },
  { name: 'dash', y1: 688, y2: 760, canvasW: 176, canvasH: 96, anchorX: 112, feetYOffset: 12 },
  { name: 'hurt', y1: 772, y2: 835, canvasW: 96, canvasH: 96, anchorX: 48, feetYOffset: 12 },
  { name: 'death', y1: 846, y2: 911, canvasW: 128, canvasH: 96, anchorX: 64, feetYOffset: 12 },
  { name: 'skill', y1: 924, y2: 1066, canvasW: 336, canvasH: 160, anchorX: 144, feetYOffset: 16 },
];

function processPixel(r, g, b, a) {
  const dr = r - 19;
  const dg = g - 22;
  const db = b - 27;
  const dist = Math.sqrt(dr * dr + dg * dg + db * db);

  const isDivider =
    r > 25 &&
    r < 95 &&
    g > 25 &&
    g < 95 &&
    b > 30 &&
    b < 105 &&
    Math.abs(r - g) < 10 &&
    Math.abs(r - b) < 16;
  if (isDivider) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  if (dist < 15) {
    return { r: 0, g: 0, b: 0, a: 0 };
  } else if (dist < 26) {
    const alphaFactor = (dist - 15) / 11;
    return { r, g, b, a: Math.round(255 * alphaFactor) };
  } else {
    return { r, g, b, a: 255 };
  }
}

const manifest = {};

for (const row of ROW_DEFS) {
  const rowDir = path.join(outputDir, row.name);
  if (!fs.existsSync(rowDir)) {
    fs.mkdirSync(rowDir, { recursive: true });
  } else {
    for (const file of fs.readdirSync(rowDir)) {
      if (file.endsWith('.png')) {
        fs.unlinkSync(path.join(rowDir, file));
      }
    }
  }

  let finalFrames = [];

  if (EXPLICIT_FRAMES[row.name]) {
    finalFrames = EXPLICIT_FRAMES[row.name];
  } else {
    const colActivity = [];
    for (let x = 85; x < srcPng.width; x++) {
      let nonBgCount = 0;
      for (let y = row.y1 + 4; y < row.y2 - 4; y++) {
        const idx = (srcPng.width * y + x) << 2;
        const r = srcPng.data[idx],
          g = srcPng.data[idx + 1],
          b = srcPng.data[idx + 2];
        const dist = Math.sqrt((r - 19) ** 2 + (g - 22) ** 2 + (b - 27) ** 2);
        if (dist > 30) nonBgCount++;
      }
      colActivity.push({ x, nonBgCount });
    }

    let current = null;
    for (const c of colActivity) {
      if (c.nonBgCount > 4) {
        if (!current) {
          current = { minX: c.x, maxX: c.x };
        } else {
          current.maxX = c.x;
        }
      } else {
        if (current) {
          if (current.maxX - current.minX >= 18) {
            finalFrames.push(current);
          }
          current = null;
        }
      }
    }
    if (current && current.maxX - current.minX >= 18) {
      finalFrames.push(current);
    }
  }

  console.log(`Row ${row.name}: generated ${finalFrames.length} clean single-pose frames.`);

  manifest[row.name] = {
    canvasWidth: row.canvasW,
    canvasHeight: row.canvasH,
    frameCount: finalFrames.length,
    frames: [],
  };

  finalFrames.forEach((frameBox, fIndex) => {
    const framePng = new PNG({ width: row.canvasW, height: row.canvasH });

    let frameMinY = row.y2,
      frameMaxY = row.y1;
    for (let x = frameBox.minX; x <= frameBox.maxX; x++) {
      for (let y = row.y1; y <= row.y2; y++) {
        if (frameBox.maskFn && !frameBox.maskFn(x, y)) continue;
        const idx = (srcPng.width * y + x) << 2;
        const r = srcPng.data[idx],
          g = srcPng.data[idx + 1],
          b = srcPng.data[idx + 2];
        const dist = Math.sqrt((r - 19) ** 2 + (g - 22) ** 2 + (b - 27) ** 2);
        if (dist > 30) {
          if (y < frameMinY) frameMinY = y;
          if (y > frameMaxY) frameMaxY = y;
        }
      }
    }

    const srcW = frameBox.maxX - frameBox.minX + 1;
    const srcH = frameMaxY - frameMinY + 1;

    const destFeetY = row.canvasH - row.feetYOffset;
    const destStartX =
      typeof frameBox.bodyX === 'number'
        ? Math.round(row.anchorX - (frameBox.bodyX - frameBox.minX))
        : Math.round(row.anchorX - srcW / 2);
    const destStartY = Math.max(0, destFeetY - srcH);

    for (let sy = 0; sy < srcH; sy++) {
      for (let sx = 0; sx < srcW; sx++) {
        const srcX = frameBox.minX + sx;
        const srcY = frameMinY + sy;
        if (srcX >= srcPng.width || srcY >= srcPng.height) continue;
        if (frameBox.maskFn && !frameBox.maskFn(srcX, srcY)) continue;

        const srcIdx = (srcPng.width * srcY + srcX) << 2;
        const r = srcPng.data[srcIdx];
        const g = srcPng.data[srcIdx + 1];
        const b = srcPng.data[srcIdx + 2];
        const a = srcPng.data[srcIdx + 3];

        const processed = processPixel(r, g, b, a);

        const destX = destStartX + sx;
        const destY = destStartY + sy;
        if (destX >= 0 && destX < row.canvasW && destY >= 0 && destY < row.canvasH) {
          const destIdx = (row.canvasW * destY + destX) << 2;
          framePng.data[destIdx] = processed.r;
          framePng.data[destIdx + 1] = processed.g;
          framePng.data[destIdx + 2] = processed.b;
          framePng.data[destIdx + 3] = processed.a;
        }
      }
    }

    const frameFilename = `frame_${fIndex}.png`;
    const frameFilePath = path.join(rowDir, frameFilename);
    const frameBuffer = PNG.sync.write(framePng);
    fs.writeFileSync(frameFilePath, frameBuffer);

    manifest[row.name].frames.push({
      index: fIndex,
      file: `/assets/blaze_sprites/${row.name}/${frameFilename}`,
      width: row.canvasW,
      height: row.canvasH,
      anchorX: row.anchorX,
      anchorY: destFeetY,
    });
  });
}

fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log('Sprite extraction completed! Manifest written to /assets/blaze_sprites/manifest.json');
