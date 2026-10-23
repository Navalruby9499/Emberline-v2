/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const bossSheetPath = 'public/assets/aistudio/ChatGPT_Image_Oct_22__2026__02_01_47_AM-2_9cef080a.png';
const srcPng = PNG.sync.read(fs.readFileSync(bossSheetPath));

// Each boss has 4 action sub-boxes on the right + 1 hero portrait area on the left
const BOSS_PANELS = [
  {
    id: 'great_mope',
    folder: 'public/assets/bosses/great-mope',
    col: 'left',
    row: 0,
    heroBox: { x1: 18, y1: 162, x2: 388, y2: 342 },
  },
  {
    id: 'rolling_gloom',
    folder: 'public/assets/bosses/rolling-gloom',
    col: 'right',
    row: 0,
    heroBox: { x1: 744, y1: 162, x2: 1112, y2: 342 },
  },
  {
    id: 'thornmother',
    folder: 'public/assets/bosses/thornmother',
    col: 'left',
    row: 1,
    heroBox: { x1: 18, y1: 520, x2: 388, y2: 706 },
  },
  {
    id: 'echo_maw',
    folder: 'public/assets/bosses/echo-maw',
    col: 'right',
    row: 1,
    heroBox: { x1: 744, y1: 520, x2: 1112, y2: 706 },
  },
  {
    id: 'undertow',
    folder: 'public/assets/bosses/undertow',
    col: 'left',
    row: 2,
    heroBox: { x1: 18, y1: 882, x2: 388, y2: 1068 },
  },
  {
    id: 'blaze_shadow',
    folder: 'public/assets/bosses/blazes-shadow',
    col: 'right',
    row: 2,
    heroBox: { x1: 744, y1: 882, x2: 1112, y2: 1068 },
  },
];

const COL_X = {
  left: {
    tl: [400, 534],
    tr: [550, 705],
    bl: [400, 534],
    br: [550, 705],
  },
  right: {
    tl: [1125, 1250],
    tr: [1276, 1433],
    bl: [1125, 1250],
    br: [1276, 1433],
  },
};

const ROW_Y = [
  { top: [124, 211], bot: [250, 337] },
  { top: [484, 569], bot: [609, 706] },
  { top: [850, 919], bot: [959, 1068] },
];

/**
 * Extracts a rectangular region using exterior BFS flood-fill background removal
 * so that dark interior details of bosses remain 100% solid and intact.
 */
function extractCleanRegion(x1, y1, x2, y2, outFile) {
  const w = x2 - x1 + 1;
  const h = y2 - y1 + 1;

  // Estimate background color from top/side perimeter pixels
  const isBgColor = (r, g, b) => {
    // Dark slate/navy/violet background of the reference sheet boxes
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    const maxCh = Math.max(r, g, b);
    return luma < 28 && maxCh < 44;
  };

  // Flood fill from border to mark exterior background
  const visited = new Uint8Array(w * h);
  const isExteriorBg = new Uint8Array(w * h);
  const queue = [];

  const pushIfBg = (lx, ly) => {
    if (lx < 0 || lx >= w || ly < 0 || ly >= h) return;
    const p = ly * w + lx;
    if (visited[p]) return;
    visited[p] = 1;
    const idx = (srcPng.width * (y1 + ly) + (x1 + lx)) << 2;
    const r = srcPng.data[idx],
      g = srcPng.data[idx + 1],
      b = srcPng.data[idx + 2];
    if (isBgColor(r, g, b)) {
      isExteriorBg[p] = 1;
      queue.push(p);
    }
  };

  for (let lx = 0; lx < w; lx++) {
    pushIfBg(lx, 0);
    pushIfBg(lx, h - 1);
  }
  for (let ly = 0; ly < h; ly++) {
    pushIfBg(0, ly);
    pushIfBg(w - 1, ly);
  }

  let head = 0;
  while (head < queue.length) {
    const p = queue[head++];
    const lx = p % w;
    const ly = (p - lx) / w;
    pushIfBg(lx - 1, ly);
    pushIfBg(lx + 1, ly);
    pushIfBg(lx, ly - 1);
    pushIfBg(lx, ly + 1);
  }

  // Find tight bounding box of non-exterior pixels
  let minX = w - 1,
    maxX = 0,
    minY = h - 1,
    maxY = 0,
    found = false;
  for (let ly = 0; ly < h; ly++) {
    for (let lx = 0; lx < w; lx++) {
      const p = ly * w + lx;
      if (!isExteriorBg[p]) {
        found = true;
        if (lx < minX) minX = lx;
        if (lx > maxX) maxX = lx;
        if (ly < minY) minY = ly;
        if (ly > maxY) maxY = ly;
      }
    }
  }

  if (!found) {
    minX = 0;
    maxX = w - 1;
    minY = 0;
    maxY = h - 1;
  }

  const pad = 4;
  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;
  const outW = contentW + pad * 2;
  const outH = contentH + pad * 2;
  const outPng = new PNG({ width: outW, height: outH });

  for (let cy = 0; cy < contentH; cy++) {
    for (let cx = 0; cx < contentW; cx++) {
      const lx = minX + cx;
      const ly = minY + cy;
      const p = ly * w + lx;
      if (isExteriorBg[p]) continue;

      const srcIdx = (srcPng.width * (y1 + ly) + (x1 + lx)) << 2;
      const r = srcPng.data[srcIdx];
      const g = srcPng.data[srcIdx + 1];
      const b = srcPng.data[srcIdx + 2];

      // Soften 1px edge touching exterior background
      let touchingBg = 0;
      if (lx > 0 && isExteriorBg[p - 1]) touchingBg++;
      if (lx < w - 1 && isExteriorBg[p + 1]) touchingBg++;
      if (ly > 0 && isExteriorBg[p - w]) touchingBg++;
      if (ly < h - 1 && isExteriorBg[p + w]) touchingBg++;

      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      const alpha = touchingBg >= 2 && luma < 42 ? 150 : 255;

      const destIdx = (outW * (cy + pad) + (cx + pad)) << 2;
      outPng.data[destIdx] = r;
      outPng.data[destIdx + 1] = g;
      outPng.data[destIdx + 2] = b;
      outPng.data[destIdx + 3] = alpha;
    }
  }

  fs.writeFileSync(outFile, PNG.sync.write(outPng));
  return {
    width: outW,
    height: outH,
    contentWidth: contentW,
    contentHeight: contentH,
    anchorX: Math.round(outW / 2),
    anchorY: outH - pad,
  };
}

for (const boss of BOSS_PANELS) {
  if (!fs.existsSync(boss.folder)) {
    fs.mkdirSync(boss.folder, { recursive: true });
  }
  const cx = COL_X[boss.col];
  const ry = ROW_Y[boss.row];

  // Top-Left -> idle_01
  extractCleanRegion(cx.tl[0], ry.top[0], cx.tl[1], ry.top[1], path.join(boss.folder, `${boss.id}_idle_01.png`));
  extractCleanRegion(cx.tl[0], ry.top[0], cx.tl[1], ry.top[1], path.join(boss.folder, `idle.png`));

  // Top-Right -> move_01 (or attack_01 for thornmother/undertow)
  if (boss.id === 'thornmother' || boss.id === 'undertow') {
    extractCleanRegion(cx.tr[0], ry.top[0], cx.tr[1], ry.top[1], path.join(boss.folder, `${boss.id}_attack_01.png`));
    extractCleanRegion(cx.tr[0], ry.top[0], cx.tr[1], ry.top[1], path.join(boss.folder, `attack.png`));
    extractCleanRegion(cx.bl[0], ry.bot[0], cx.bl[1], ry.bot[1], path.join(boss.folder, `${boss.id}_move_01.png`));
    extractCleanRegion(cx.bl[0], ry.bot[0], cx.bl[1], ry.bot[1], path.join(boss.folder, `move.png`));
  } else {
    extractCleanRegion(cx.tr[0], ry.top[0], cx.tr[1], ry.top[1], path.join(boss.folder, `${boss.id}_move_01.png`));
    extractCleanRegion(cx.tr[0], ry.top[0], cx.tr[1], ry.top[1], path.join(boss.folder, `move.png`));
    extractCleanRegion(cx.bl[0], ry.bot[0], cx.bl[1], ry.bot[1], path.join(boss.folder, `${boss.id}_attack_01.png`));
    extractCleanRegion(cx.bl[0], ry.bot[0], cx.bl[1], ry.bot[1], path.join(boss.folder, `attack.png`));
  }

  // Bottom-Right -> hurt_01 & death_01
  extractCleanRegion(cx.br[0], ry.bot[0], cx.br[1], ry.bot[1], path.join(boss.folder, `${boss.id}_hurt_01.png`));
  extractCleanRegion(cx.br[0], ry.bot[0], cx.br[1], ry.bot[1], path.join(boss.folder, `hurt.png`));
  extractCleanRegion(cx.br[0], ry.bot[0], cx.br[1], ry.bot[1], path.join(boss.folder, `${boss.id}_death_01.png`));
  extractCleanRegion(cx.br[0], ry.bot[0], cx.br[1], ry.bot[1], path.join(boss.folder, `death.png`));

  // Clean Hero Portrait (below title text)
  extractCleanRegion(
    boss.heroBox.x1,
    boss.heroBox.y1,
    boss.heroBox.x2,
    boss.heroBox.y2,
    path.join(boss.folder, `portrait.png`)
  );

  console.log(`Re-extracted clean flood-filled sprites for boss: ${boss.id}`);
}
