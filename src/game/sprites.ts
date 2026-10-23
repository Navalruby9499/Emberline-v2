/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// High-fidelity pixel-art procedural sprite renderer for Blaze, Captain Alden,
// environmental forge assets, combat visual effects, and enemy units.
// Closely matches the official "BLAZE — Crimson Flame Character Sheet".

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  time: number;
}

/**
 * High-detail pixel-art Blaze sprite renderer:
 * Features:
 * - 19-year-old female proportioned warrior silhouette
 * - Burgundy/dark crimson spiky hair with iconic high ponytail and bangs
 * - Expressive feminine face with determined crimson eyes
 * - Dynamic physics-driven crimson scarf with multi-segment waving
 * - Dark tactical armor, belts with brass buckles, forearm guards
 * - Armored boots with silver-pink greaves
 * - Emberfang crystal blade with inner light core, pulsing pink aura, and dynamic arc slashes
 */
export const drawBlaze = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: 1 | -1,
  state: 'idle' | 'walk' | 'run' | 'jump' | 'fall' | 'slash1' | 'slash2' | 'slash3' | 'dash' | 'cyclone' | 'hurt',
  frameTime: number,
  isOverheated: boolean,
  costume: 'default' | 'crimson_rescuer' = 'default',
  hitFlash = false
) => {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(facing, 1);

  if (hitFlash) {
    ctx.filter = 'brightness(2.5)';
  }

  // Scarf color theme
  const scarfMain = costume === 'crimson_rescuer' ? '#f59e0b' : '#e11d48';
  const scarfLight = costume === 'crimson_rescuer' ? '#fbbf24' : '#f43f5e';
  const scarfHighlight = costume === 'crimson_rescuer' ? '#fef08a' : '#fda4af';
  const scarfShadow = costume === 'crimson_rescuer' ? '#b45309' : '#9f1239';

  // State-based body dynamics
  const isMoving = state === 'walk' || state === 'run';
  const runFreq = state === 'run' ? 16 : 10;
  const bobY = isMoving ? Math.abs(Math.sin(frameTime * runFreq)) * -3 : Math.sin(frameTime * 3) * 0.8;
  const torsoTilt = state === 'run' ? 0.15 : state === 'dash' ? 0.35 : 0;

  // 1. DYNAMIC FLOWING CRIMSON SCARF (Back layer)
  ctx.save();
  const scarfWave1 = Math.sin(frameTime * 12) * 5;
  const scarfWave2 = Math.cos(frameTime * 14 + 1) * 6;
  const baseSpeedOffset = state === 'dash' ? 18 : state === 'run' ? 12 : state === 'jump' ? 6 : 2;
  const verticalLift = state === 'jump' ? 10 : state === 'fall' ? -12 : 0;

  // Multi-segment scarf polygon
  const p0x = -3, p0y = -22 + bobY;
  const p1x = -12 - baseSpeedOffset, p1y = -20 + scarfWave1 + verticalLift * 0.5;
  const p2x = -24 - baseSpeedOffset * 1.5, p2y = -18 + scarfWave2 + verticalLift;
  const p3x = -36 - baseSpeedOffset * 2.0, p3y = -14 + scarfWave1 * 1.3 + verticalLift * 1.2;

  // Scarf shadow/bottom edge
  ctx.fillStyle = scarfShadow;
  ctx.beginPath();
  ctx.moveTo(p0x, p0y + 3);
  ctx.bezierCurveTo(p1x, p1y + 4, p2x, p2y + 4, p3x, p3y + 4);
  ctx.lineTo(p3x + 2, p3y - 3);
  ctx.bezierCurveTo(p2x + 1, p2y - 2, p1x + 1, p1y - 2, p0x, p0y);
  ctx.closePath();
  ctx.fill();

  // Scarf main body
  ctx.fillStyle = scarfMain;
  ctx.beginPath();
  ctx.moveTo(p0x, p0y + 1);
  ctx.bezierCurveTo(p1x, p1y + 2, p2x, p2y + 2, p3x, p3y + 2);
  ctx.lineTo(p3x + 1, p3y - 2);
  ctx.bezierCurveTo(p2x, p2y - 1, p1x, p1y - 1, p0x, p0y - 1);
  ctx.closePath();
  ctx.fill();

  // Scarf top highlight ridge
  ctx.strokeStyle = scarfHighlight;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(p0x, p0y);
  ctx.bezierCurveTo(p1x, p1y, p2x, p2y, p3x, p3y);
  ctx.stroke();
  ctx.restore();

  // 2. LEGS & ARMORED BOOTS
  const legCycle = Math.sin(frameTime * runFreq);
  const backLegX = isMoving ? -legCycle * 7 : -4;
  const backLegY = isMoving ? Math.max(0, legCycle * 3) : 0;
  const frontLegX = isMoving ? legCycle * 7 : 3;
  const frontLegY = isMoving ? Math.max(0, -legCycle * 3) : 0;

  // Back Leg
  ctx.fillStyle = '#181726'; // Dark tactical thigh
  ctx.fillRect(-3 + backLegX, -13 + bobY, 4, 7);
  // Back Knee Guard & Boot
  ctx.fillStyle = '#831843'; // Dark crimson guard
  ctx.fillRect(-4 + backLegX, -7 + bobY - backLegY, 5, 4);
  ctx.fillStyle = '#3f3f46'; // Boot sole
  ctx.fillRect(-5 + backLegX, -3 + bobY - backLegY, 6, 3);
  ctx.fillStyle = '#f43f5e'; // Boot pink trim
  ctx.fillRect(-2 + backLegX, -6 + bobY - backLegY, 2, 4);

  // Front Leg
  ctx.fillStyle = '#27273a';
  ctx.fillRect(1 + frontLegX, -13 + bobY, 4, 7);
  // Front Boot (Silver-pink greaves)
  ctx.fillStyle = '#e11d48';
  ctx.fillRect(0 + frontLegX, -7 + bobY - frontLegY, 5, 4);
  ctx.fillStyle = '#fda4af'; // Silver-pink sheen
  ctx.fillRect(1 + frontLegX, -6 + bobY - frontLegY, 2, 4);
  ctx.fillStyle = '#1e1b2e'; // Boot sole
  ctx.fillRect(-1 + frontLegX, -3 + bobY - frontLegY, 7, 3);

  // 3. TORSO / COMBAT OUTFIT
  ctx.save();
  ctx.rotate(torsoTilt);

  // Hips & shorts
  ctx.fillStyle = '#181824';
  ctx.fillRect(-4, -15 + bobY, 9, 4);

  // Crimson combat belt with brass buckle
  ctx.fillStyle = '#9f1239';
  ctx.fillRect(-5, -16 + bobY, 11, 2);
  ctx.fillStyle = '#fbbf24'; // Brass buckle
  ctx.fillRect(-1, -16 + bobY, 3, 2);

  // Midriff & Feminine Chest Armor (dark vest with light strap)
  ctx.fillStyle = '#fce7f3'; // Skin tone peek
  ctx.fillRect(-2, -19 + bobY, 5, 3);

  // Black combat corset / top
  ctx.fillStyle = '#12111c';
  ctx.fillRect(-4, -22 + bobY, 9, 4);
  // Crimson harness accent
  ctx.fillStyle = '#e11d48';
  ctx.fillRect(-3, -22 + bobY, 2, 4);

  // Scarf Front Knot
  ctx.fillStyle = scarfMain;
  ctx.fillRect(-3, -24 + bobY, 6, 3);
  ctx.fillStyle = scarfHighlight;
  ctx.fillRect(-1, -24 + bobY, 2, 2);

  // 4. HEAD, FACE & BURGUNDY SPIKY HAIR
  // Neck
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(-1, -25 + bobY, 4, 2);

  // Anime Face Silhouette
  ctx.fillStyle = '#ffedd5'; // Soft warm face tone
  ctx.fillRect(-3, -31 + bobY, 7, 7);
  // Chin taper
  ctx.fillRect(-2, -24 + bobY, 5, 1);

  // Determined Crimson Eye
  ctx.fillStyle = '#be123c';
  ctx.fillRect(1, -28 + bobY, 2, 3);
  ctx.fillStyle = '#ffffff'; // Eye reflection glint
  ctx.fillRect(1, -29 + bobY, 1, 1);

  // Soft blush
  ctx.fillStyle = '#fca5a5';
  ctx.fillRect(0, -26 + bobY, 2, 1);

  // Hair Base (Burgundy / Dark Maroon)
  ctx.fillStyle = '#2a111a'; // Deep hair shadow
  ctx.fillRect(-5, -34 + bobY, 10, 5);
  ctx.fillRect(-6, -32 + bobY, 4, 8); // Side bang

  // Forehead bangs
  ctx.fillStyle = '#4c0519'; // Rich burgundy
  ctx.fillRect(-4, -33 + bobY, 8, 4);
  ctx.fillRect(0, -30 + bobY, 3, 2); // Center bang point

  // Signature High Anime Ponytail
  const ponyWave = Math.sin(frameTime * 10) * 3;
  ctx.fillStyle = '#831843'; // Ponytail highlight
  ctx.fillRect(-8, -37 + bobY + ponyWave * 0.4, 5, 5);
  ctx.fillStyle = '#4c0519';
  ctx.fillRect(-11, -38 + bobY + ponyWave * 0.8, 5, 6);
  ctx.fillRect(-14, -36 + bobY + ponyWave * 1.2, 4, 5);
  // Spiky hair tips
  ctx.fillStyle = '#be123c';
  ctx.fillRect(-15, -34 + bobY + ponyWave * 1.4, 3, 3);

  ctx.restore();

  // 5. WEAPON: EMBERFANG (Crystal Hearth Blade)
  ctx.save();
  if (state === 'slash1' || state === 'slash2' || state === 'slash3') {
    // EXPANSIVE GLOWING SWORD SLASHE ARCS
    const combo = state === 'slash1' ? 1 : state === 'slash2' ? 2 : 3;
    const arcRadius = 26 + combo * 6;

    // Glowing outer trail
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    const startA = combo === 2 ? 0.4 * Math.PI : -0.5 * Math.PI;
    const endA = combo === 2 ? -0.6 * Math.PI : 0.5 * Math.PI;
    ctx.arc(8, -16 + bobY, arcRadius, startA, endA, combo === 2);
    ctx.stroke();

    // Vibrant blade arc
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(8, -16 + bobY, arcRadius, startA, endA, combo === 2);
    ctx.stroke();

    // Hot pink/white inner core
    ctx.strokeStyle = '#fbcfe8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(8, -16 + bobY, arcRadius - 1, startA, endA, combo === 2);
    ctx.stroke();

    // Physical sword extended in swing
    ctx.translate(6, -16 + bobY);
    ctx.rotate(combo === 2 ? -0.7 : 0.7);
    ctx.fillStyle = '#334155'; // Hilt
    ctx.fillRect(-3, -2, 5, 4);
    ctx.fillStyle = '#fbcfe8'; // Blade core
    ctx.fillRect(2, -2, 22, 4);
    ctx.fillStyle = '#f43f5e'; // Blade edge
    ctx.fillRect(4, -1, 18, 2);
  } else if (state === 'cyclone') {
    // 360-DEGREE CRIMSON CYCLONE WHIRLWIND
    ctx.rotate(frameTime * 28);
    const rad = 36;
    const grad = ctx.createRadialGradient(0, -16, 10, 0, -16, rad);
    grad.addColorStop(0, 'rgba(251, 113, 133, 0.8)');
    grad.addColorStop(0.5, 'rgba(244, 63, 94, 0.5)');
    grad.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, -16, rad, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -16, rad - 2, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Normal / resting stance holding Emberfang
    ctx.translate(state === 'dash' ? 4 : 2, -14 + bobY);
    const bladeAngle = state === 'dash' ? 1.4 : 0.35 + Math.sin(frameTime * 4) * 0.08;
    ctx.rotate(bladeAngle);

    // Hilt & crossguard
    ctx.fillStyle = '#475569';
    ctx.fillRect(-2, -3, 4, 6);
    ctx.fillStyle = '#94a3b8'; // Pommel
    ctx.fillRect(-4, -1.5, 2, 3);

    // Glowing pink crystal blade
    ctx.fillStyle = isOverheated ? '#64748b' : '#fda4af';
    ctx.fillRect(2, -2.5, 20, 5);
    ctx.fillStyle = isOverheated ? '#475569' : '#f43f5e';
    ctx.fillRect(4, -1.5, 17, 3);
    // Inner pulse core
    if (!isOverheated) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, -0.5, 12, 1);
    }
  }
  ctx.restore();

  // Overheat Steam
  if (isOverheated) {
    ctx.fillStyle = 'rgba(226, 232, 240, 0.65)';
    ctx.beginPath();
    ctx.arc(8 + Math.sin(frameTime * 18) * 3, -18 - ((frameTime * 25) % 18), 2.5 + ((frameTime * 10) % 2.5), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

/**
 * Detailed Pixel-Art Captain Alden:
 * Veteran captain of Forge Gate.
 * Features:
 * - Sturdy veteran build with weathered plate mail armor and gold trims
 * - Navy/royal blue mantle/cloak draping over shoulder
 * - Distinguished silver-white hair and groomed beard
 * - Heavy Forge Guard broadsword and steel buckler
 * - Expressive idle breathing and sparring block poses
 */
export const drawCaptainAlden = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isHushed: boolean,
  facing: 1 | -1 = 1,
  action: 'idle' | 'spar_block' | 'dialogue' = 'idle',
  time = 0
) => {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(facing, 1);

  const bobY = isHushed ? 0 : Math.sin(time * 3) * 0.7;

  // Colors (shift to stone monochrome when hushed)
  const plateDark = isHushed ? '#475569' : '#1e293b';
  const plateMid = isHushed ? '#64748b' : '#334155';
  const plateLight = isHushed ? '#94a3b8' : '#64748b';
  const goldTrim = isHushed ? '#94a3b8' : '#d97706';
  const cloakColor = isHushed ? '#475569' : '#1e3a8a';
  const cloakShadow = isHushed ? '#334155' : '#172554';
  const hairColor = isHushed ? '#cbd5e1' : '#f8fafc';
  const skinColor = isHushed ? '#94a3b8' : '#fed7aa';

  // 1. Cloak / Mantle
  ctx.fillStyle = cloakShadow;
  ctx.beginPath();
  ctx.moveTo(-8, -28 + bobY);
  ctx.lineTo(-18, 0);
  ctx.lineTo(4, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = cloakColor;
  ctx.beginPath();
  ctx.moveTo(-6, -28 + bobY);
  ctx.lineTo(-15, 0);
  ctx.lineTo(2, 0);
  ctx.closePath();
  ctx.fill();

  // 2. Greaves & Armored Sabatons
  ctx.fillStyle = plateDark;
  ctx.fillRect(-6, -12, 5, 12);
  ctx.fillRect(2, -12, 5, 12);
  ctx.fillStyle = plateMid;
  ctx.fillRect(-7, -4, 7, 4);
  ctx.fillRect(1, -4, 7, 4);

  // 3. Breastplate & Faulds
  ctx.fillStyle = plateDark;
  ctx.fillRect(-8, -26 + bobY, 16, 15);
  ctx.fillStyle = plateMid;
  ctx.fillRect(-6, -25 + bobY, 12, 12);
  // Gold Trim on Guard Cuirass
  ctx.fillStyle = goldTrim;
  ctx.fillRect(-7, -26 + bobY, 14, 2);
  ctx.fillRect(-1, -25 + bobY, 2, 12);

  // 4. Head, Silver Beard & Veteran Expression
  ctx.fillStyle = skinColor;
  ctx.fillRect(-5, -35 + bobY, 10, 9);
  // Brow & determined eye
  ctx.fillStyle = isHushed ? '#475569' : '#1e293b';
  ctx.fillRect(1, -32 + bobY, 2, 2);

  // Silver Hair & Full Beard
  ctx.fillStyle = hairColor;
  ctx.fillRect(-6, -37 + bobY, 12, 4); // Hair top
  ctx.fillRect(-7, -35 + bobY, 3, 7); // Sideburn
  ctx.fillRect(-5, -28 + bobY, 10, 4); // Full beard
  ctx.fillRect(-3, -24 + bobY, 6, 2); // Beard tip

  // 5. Arms & Weapon / Iconic Pose
  if (isHushed) {
    // THE ICONIC SACRIFICE POSE: Outstretched arm shoving Blaze away into stasis
    ctx.fillStyle = plateMid;
    ctx.fillRect(6, -24, 18, 5); // Extended forearm
    ctx.fillStyle = goldTrim;
    ctx.fillRect(8, -25, 4, 7); // Gauntlet cuff
    ctx.fillStyle = skinColor;
    ctx.fillRect(24, -25, 5, 7); // Open outstretched palm
    // Dropped sword on ground beside him
    ctx.fillStyle = '#64748b';
    ctx.fillRect(10, -2, 16, 3);
  } else if (action === 'spar_block') {
    // Sparring stance: holding broadsword raised in defensive parry
    ctx.fillStyle = plateMid;
    ctx.fillRect(4, -24 + bobY, 6, 6);
    // Broadsword parrying
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(8, -36 + bobY, 4, 24);
    ctx.fillStyle = goldTrim;
    ctx.fillRect(6, -20 + bobY, 8, 3);
  } else {
    // Standing guard holding broadsword resting
    ctx.fillStyle = plateMid;
    ctx.fillRect(5, -23 + bobY, 5, 8);
    // Sword resting upright
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(7, -18 + bobY, 3, 20);
    ctx.fillStyle = goldTrim;
    ctx.fillRect(5, -19 + bobY, 7, 2);
  }

  ctx.restore();
};

/**
 * Animated Forge Torch:
 * Stone sconce with animated burning amber flame and smoke particles
 */
export const drawTorch = (ctx: CanvasRenderingContext2D, x: number, y: number, time: number) => {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  // Stone Wall Sconce
  ctx.fillStyle = '#334155';
  ctx.fillRect(-2, 0, 4, 8);
  ctx.fillStyle = '#475569';
  ctx.fillRect(-4, -3, 8, 3);

  // Animated Flame
  const flickX = Math.sin(time * 15) * 1.5;
  const flickH = 8 + Math.cos(time * 12) * 3;

  // Outer orange glow
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(-4, -3);
  ctx.quadraticCurveTo(flickX, -3 - flickH, 4, -3);
  ctx.closePath();
  ctx.fill();

  // Hot yellow inner flame
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.moveTo(-2, -3);
  ctx.quadraticCurveTo(flickX * 0.5, -3 - flickH * 0.6, 2, -3);
  ctx.closePath();
  ctx.fill();

  // Subtle ambient light circle
  const grad = ctx.createRadialGradient(0, -6, 2, 0, -6, 24);
  grad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
  grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, -6, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

/**
 * Animated Blacksmith Forge Furnace:
 * Stone chimney furnace with roaring coals, anvil, and bellows.
 */
export const drawForgeFurnace = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  isLit = true,
  hasCrimsonEmber = false
) => {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  // 1. Heavy stone chimney & furnace masonry
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-26, -46, 52, 46);

  // Chimney flues
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-18, -54, 36, 10);
  ctx.fillStyle = '#334155';
  ctx.fillRect(-20, -56, 40, 4); // Chimney rim cap

  // Stone mantelpiece with brick line accents
  ctx.fillStyle = '#334155';
  ctx.fillRect(-28, -44, 56, 6);
  ctx.fillRect(-30, -2, 60, 4); // Hearth base

  // Brick mortaring
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-14, -36, 1, 8);
  ctx.fillRect(8, -36, 1, 8);
  ctx.fillRect(-22, -26, 1, 8);
  ctx.fillRect(0, -26, 1, 8);
  ctx.fillRect(16, -26, 1, 8);

  // 2. Iron Hearth Cavity & Grate
  ctx.fillStyle = '#090a0f';
  ctx.beginPath();
  ctx.arc(0, -18, 16, Math.PI, 0, false);
  ctx.rect(-16, -18, 32, 18);
  ctx.fill();

  // Iron Grate Bars
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-14, -4, 28, 2);
  ctx.fillRect(-10, -10, 2, 8);
  ctx.fillRect(-4, -10, 2, 8);
  ctx.fillRect(2, -10, 2, 8);
  ctx.fillRect(8, -10, 2, 8);

  // 3. Flame & Ember states
  if (hasCrimsonEmber) {
    // SPECIAL DYING HEARTH CRIMSON EMBER
    const pulse = Math.sin(time * 6) * 0.2 + 0.8;
    const emberFloat = Math.sin(time * 4) * 4;

    // Glowing coals beneath
    ctx.fillStyle = `rgba(244, 63, 94, ${pulse * 0.9})`;
    ctx.fillRect(-14, -8, 28, 8);
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(-10, -6, 20, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-5, -4, 10, 2);

    // Hearth cavity pink glow
    const hearthGlow = ctx.createRadialGradient(0, -16, 2, 0, -16, 36);
    hearthGlow.addColorStop(0, 'rgba(244, 63, 94, 0.6)');
    hearthGlow.addColorStop(0.6, 'rgba(244, 63, 94, 0.2)');
    hearthGlow.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = hearthGlow;
    ctx.beginPath();
    ctx.arc(0, -16, 36, 0, Math.PI * 2);
    ctx.fill();

    // Floating Radiant Crimson Ember Crystal
    const emberY = -24 + emberFloat;
    const emberGlow = ctx.createRadialGradient(0, emberY, 2, 0, emberY, 28);
    emberGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    emberGlow.addColorStop(0.3, 'rgba(244, 63, 94, 0.8)');
    emberGlow.addColorStop(0.7, 'rgba(225, 29, 72, 0.3)');
    emberGlow.addColorStop(1, 'rgba(225, 29, 72, 0)');
    ctx.fillStyle = emberGlow;
    ctx.beginPath();
    ctx.arc(0, emberY, 28, 0, Math.PI * 2);
    ctx.fill();

    // Diamond Ember Gem Core
    ctx.save();
    ctx.translate(0, emberY);
    ctx.rotate(time * 1.5);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 0);
    ctx.lineTo(0, 7);
    ctx.lineTo(-5, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Rising pink sparks
    for (let i = 0; i < 4; i++) {
      const sparkY = -18 - ((time * 35 + i * 14) % 40);
      const sparkX = Math.sin(time * 5 + i * 2) * 8;
      ctx.fillStyle = i % 2 === 0 ? '#fda4af' : '#f43f5e';
      ctx.fillRect(sparkX, sparkY, 2, 2);
    }
  } else if (isLit) {
    // Normal roaring forge coals
    const coalPulse = Math.sin(time * 8) * 0.15 + 0.85;
    ctx.fillStyle = `rgba(239, 68, 68, ${coalPulse})`;
    ctx.fillRect(-12, -8, 24, 8);

    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-9, -6, 18, 5);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-5, -4, 10, 2);

    // Floating embers rising up chimney
    for (let i = 0; i < 3; i++) {
      const emberY = -12 - ((time * 30 + i * 15) % 35);
      const emberX = Math.sin(time * 6 + i * 2) * 6;
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(emberX, emberY, 2, 2);
    }

    // Warm radial glow
    const glow = ctx.createRadialGradient(0, -12, 4, 0, -12, 45);
    glow.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
    glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -12, 45, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Blacksmith Anvil next to furnace
  ctx.fillStyle = '#475569';
  ctx.fillRect(28, -12, 16, 12); // Base
  ctx.fillStyle = '#64748b';
  ctx.fillRect(24, -16, 24, 4); // Horn & face
  ctx.fillRect(22, -15, 4, 2); // Anvil beak

  ctx.restore();
};

/**
 * Hanging Festival Banners:
 * Fabric banners celebrating the Festival of Embers.
 */
export const drawFestivalBanner = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number
) => {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  const wave = Math.sin(time * 4) * 2;

  // Wooden crossbeam
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-10, 0, 20, 2);

  // Crimson/Gold Banner Cloth
  ctx.fillStyle = '#9f1239';
  ctx.beginPath();
  ctx.moveTo(-8, 2);
  ctx.lineTo(8, 2);
  ctx.lineTo(8 + wave * 0.5, 26);
  ctx.lineTo(wave * 0.8, 32);
  ctx.lineTo(-8 + wave * 0.5, 26);
  ctx.closePath();
  ctx.fill();

  // Gold Forge Gate Crest
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(-2 + wave * 0.4, 8, 4, 8);
  ctx.fillRect(-4 + wave * 0.4, 10, 8, 2);

  ctx.restore();
};

/**
 * Sparring Training Dummy:
 * Wooden target post with straw padding and shield.
 */
export const drawTrainingDummy = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  hitReaction = 0
) => {
  ctx.save();
  ctx.translate(Math.round(x) + hitReaction, Math.round(y));

  // Wooden Post
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-3, -26, 6, 26);
  ctx.fillRect(-8, -2, 16, 2); // Stand

  // Straw torso
  ctx.fillStyle = '#d97706';
  ctx.fillRect(-7, -22, 14, 14);

  // Crossarm & Wooden Shield Target
  ctx.fillStyle = '#b45309';
  ctx.fillRect(-12, -18, 24, 4);

  // Bullseye target
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(8, -16, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(8, -16, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

/**
 * Animated Mopes (Fragments of the Hush):
 */
import { EnemyType } from '../types/game';

/**
 * Animated Mopes (Fragments of the Hush):
 */
export const drawMope = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size = 14,
  frameTime = 0,
  isAttacking = false
) => {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  const floatY = Math.sin(frameTime * 6) * 3;
  ctx.translate(0, floatY);

  // Outer purple/magenta smoke wisps (matching Forgotten Meadow sheet)
  const wispGlow = ctx.createRadialGradient(0, -2, size * 0.3, 0, -2, size * 1.6);
  wispGlow.addColorStop(0, 'rgba(192, 38, 211, 0.55)');
  wispGlow.addColorStop(0.6, 'rgba(126, 34, 206, 0.25)');
  wispGlow.addColorStop(1, 'rgba(88, 28, 135, 0)');
  ctx.fillStyle = wispGlow;
  ctx.beginPath();
  ctx.arc(0, -2, size * 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Trailing smoke tendrils behind & above
  for (let i = 0; i < 4; i++) {
    const wx = -size * 0.7 + i * (size * 0.45) + Math.sin(frameTime * 8 + i) * 2;
    const wy = -size * 0.8 - Math.abs(Math.cos(frameTime * 6 + i)) * 6;
    ctx.fillStyle = i % 2 === 0 ? '#a855f7' : '#e879f9';
    ctx.beginPath();
    ctx.arc(wx, wy, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dark obsidian-violet blob body
  ctx.fillStyle = '#1e1035';
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();

  // Inner shadowy highlight
  ctx.fillStyle = '#3b0764';
  ctx.beginPath();
  ctx.arc(-2, -2, size * 0.78, 0, Math.PI * 2);
  ctx.fill();

  // Glowing pink-white oval eyes
  ctx.fillStyle = '#f5d0fe';
  ctx.beginPath();
  ctx.ellipse(-size * 0.32, -1, 2.5, 3.5, -0.15, 0, Math.PI * 2);
  ctx.ellipse(size * 0.28, -1, 2.5, 3.5, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Attack (Dark Orb) charge visual in front
  if (isAttacking) {
    ctx.strokeStyle = '#f0abfc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(size + 6, -1, 6 + Math.sin(frameTime * 20) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#2e1065';
    ctx.beginPath();
    ctx.arc(size + 6, -1, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

/**
 * Universal Minion Enemy Sprite Dispatcher
 * Renders all 18 minion types based on their specific visual designs from the official reference sheets.
 */
export const drawEnemy = (
  ctx: CanvasRenderingContext2D,
  type: EnemyType,
  x: number,
  y: number,
  frameTime: number,
  facing: 1 | -1 = -1,
  isAttacking = false,
  healthPercent = 1.0
) => {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(facing, 1);

  const bobY = Math.sin(frameTime * 6) * 2.5;

  switch (type) {
    // --- ZONE 1: FORGOTTEN MEADOW ---
    case 'mope': {
      drawMope(ctx, 0, 0, 13, frameTime, isAttacking);
      break;
    }
    case 'split_mope': {
      const pulse = Math.sin(frameTime * 6) * 2;
      ctx.translate(0, bobY * 0.7);

      // Purple-magenta aura
      const aura = ctx.createRadialGradient(0, -6, 6, 0, -6, 28);
      aura.addColorStop(0, 'rgba(217, 70, 239, 0.5)');
      aura.addColorStop(1, 'rgba(88, 28, 135, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, -6, 28, 0, Math.PI * 2);
      ctx.fill();

      // Rising violet flame wisps on top
      for (let i = -2; i <= 2; i++) {
        const fy = -22 - Math.abs(Math.sin(frameTime * 8 + i)) * 7;
        ctx.fillStyle = i % 2 === 0 ? '#c084fc' : '#e879f9';
        ctx.beginPath();
        ctx.arc(i * 5, fy, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Double-lobed dividing body (ready to split)
      const splitOffset = isAttacking ? 5 : 2;
      ctx.fillStyle = '#1e1035';
      ctx.beginPath();
      ctx.arc(-splitOffset, -5, 16 + pulse * 0.5, 0, Math.PI * 2);
      ctx.arc(splitOffset, -5, 16 + pulse * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4c1d95';
      ctx.beginPath();
      ctx.arc(-splitOffset, -6, 12, 0, Math.PI * 2);
      ctx.arc(splitOffset, -6, 12, 0, Math.PI * 2);
      ctx.fill();

      // Glowing division seam down center
      ctx.strokeStyle = '#f0abfc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(-2, -10);
      ctx.lineTo(2, 4);
      ctx.stroke();

      // Glowing magenta-white eyes
      ctx.fillStyle = '#fae8ff';
      ctx.beginPath();
      ctx.ellipse(-7, -5, 3, 4, -0.2, 0, Math.PI * 2);
      ctx.ellipse(7, -5, 3, 4, 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'briar_bud': {
      const walkStep = Math.sin(frameTime * 10) * 3;
      // Twisted woody root legs (WALK state)
      ctx.fillStyle = '#3f2e21';
      ctx.fillRect(-7, -8, 4, 8 + walkStep * 0.5);
      ctx.fillRect(3, -8, 4, 8 - walkStep * 0.5);

      // Thorny root torso & green leaf collar
      ctx.fillStyle = '#4d3828';
      ctx.fillRect(-6, -18, 12, 11);
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(-11, -16);
      ctx.lineTo(0, -11);
      ctx.lineTo(11, -16);
      ctx.lineTo(0, -20);
      ctx.closePath();
      ctx.fill();

      // Shadowed face under flower petals
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(0, -21, 7, 0, Math.PI * 2);
      ctx.fill();

      // Glowing amber-gold eyes
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-4, -22, 2.5, 3);
      ctx.fillRect(2, -22, 2.5, 3);

      // Vibrant Crimson-Magenta Blossom Crest (5 spiky petals on top)
      const petalBob = Math.sin(frameTime * 7) * 1.5;
      ctx.fillStyle = '#e11d48';
      for (let p = -2; p <= 2; p++) {
        ctx.beginPath();
        ctx.moveTo(p * 4, -25);
        ctx.lineTo(p * 6, -35 + Math.abs(p) * 2 + petalBob);
        ctx.lineTo(p * 4 + 3, -25);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.moveTo(-3, -26);
      ctx.lineTo(0, -37 + petalBob);
      ctx.lineTo(3, -26);
      ctx.closePath();
      ctx.fill();

      // ATTACK (THORN): Lashing barbed crimson-thorn vine whip
      if (isAttacking) {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(6, -15);
        ctx.quadraticCurveTo(18, -26, 30, -14 + Math.sin(frameTime * 24) * 6);
        ctx.stroke();

        // Barbs along whip
        ctx.fillStyle = '#fda4af';
        ctx.fillRect(14, -22, 3, 3);
        ctx.fillRect(22, -19, 3, 3);
      }
      break;
    }

    // --- ZONE 2: HOLLOW HILLS ---
    case 'gust_bat': {
      const wingFlap = Math.sin(frameTime * 14) * 10;
      ctx.translate(0, -12 + bobY * 1.5);
      // Bat Body
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-5, -6, 10, 12);
      // Glowing Eyes
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-3, -4, 2, 2);
      ctx.fillRect(1, -4, 2, 2);
      // Wing Left
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.moveTo(-5, -2);
      ctx.lineTo(-20, -10 + wingFlap);
      ctx.lineTo(-12, 4);
      ctx.closePath();
      ctx.fill();
      // Wing Right
      ctx.beginPath();
      ctx.moveTo(5, -2);
      ctx.lineTo(20, -10 + wingFlap);
      ctx.lineTo(12, 4);
      ctx.closePath();
      ctx.fill();
      // Wind streaks
      if (isAttacking) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(15, 0, 16, -0.4, 0.4);
        ctx.stroke();
      }
      break;
    }
    case 'cliff_scrabbler': {
      // Rocky crab crawler
      ctx.fillStyle = '#334155';
      ctx.fillRect(-12, -10, 24, 10);
      ctx.fillStyle = '#475569';
      ctx.fillRect(-9, -14, 18, 5); // Shell plate
      // Legs
      const legWave = Math.sin(frameTime * 12) * 3;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-14, 0, 3, 4 + legWave);
      ctx.fillRect(-6, 0, 3, 4 - legWave);
      ctx.fillRect(3, 0, 3, 4 + legWave);
      ctx.fillRect(11, 0, 3, 4 - legWave);
      // Eyes
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-8, -9, 2, 2);
      ctx.fillRect(6, -9, 2, 2);
      break;
    }
    case 'gloom_runner': {
      // Shadow wolf
      const runCycle = Math.sin(frameTime * 14) * 4;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-16, -14, 32, 12); // Torso
      ctx.fillStyle = '#312e81';
      ctx.fillRect(8, -18, 10, 10); // Head
      // Ears
      ctx.fillRect(12, -22, 3, 5);
      // Glowing eye
      ctx.fillStyle = '#818cf8';
      ctx.fillRect(14, -15, 3, 2);
      // Legs
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-12, -2, 4, 8 + runCycle);
      ctx.fillRect(-4, -2, 4, 8 - runCycle);
      ctx.fillRect(4, -2, 4, 8 + runCycle);
      ctx.fillRect(12, -2, 4, 8 - runCycle);
      // Shadow mane aura
      ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.fillRect(-18, -16, 20, 6);
      break;
    }

    // --- ZONE 3: WEEPING WOODS ---
    case 'thornling': {
      // Small vine goblin
      ctx.fillStyle = '#14532d';
      ctx.fillRect(-6, -14, 12, 14);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(-5, -20, 10, 8); // Head
      // Rose thorn crown
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-7, -24, 4, 5);
      ctx.fillRect(3, -24, 4, 5);
      // Glowing emerald eyes
      ctx.fillStyle = '#86efac';
      ctx.fillRect(-3, -18, 2, 2);
      ctx.fillRect(2, -18, 2, 2);
      // Thorn whip arm
      if (isAttacking) {
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(6, -10);
        ctx.lineTo(24, -8);
        ctx.stroke();
      }
      break;
    }
    case 'root_hound': {
      // Plant beast
      const legRun = Math.sin(frameTime * 10) * 3;
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-14, -12, 28, 12); // Wood body
      ctx.fillStyle = '#78350f';
      ctx.fillRect(8, -16, 8, 8); // Snout
      // Magenta thorns on back
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(-10, -18, 4, 6);
      ctx.fillRect(-2, -19, 4, 7);
      ctx.fillRect(4, -17, 3, 5);
      // Eyes
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(11, -14, 3, 2);
      // Roots legs
      ctx.fillStyle = '#292524';
      ctx.fillRect(-12, 0, 4, 6 + legRun);
      ctx.fillRect(8, 0, 4, 6 - legRun);
      break;
    }
    case 'spore_wisp': {
      // Floating green spirit
      ctx.translate(0, bobY * 1.5);
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.arc(0, -10, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(0, -10, 7, 0, Math.PI * 2);
      ctx.fill();
      // Glowing eyes
      ctx.fillStyle = '#a7f3d0';
      ctx.fillRect(-4, -12, 2, 3);
      ctx.fillRect(2, -12, 2, 3);
      // Floating spore dust
      for (let i = 0; i < 4; i++) {
        const sx = Math.sin(frameTime * 5 + i * 2) * 14;
        const sy = -10 + Math.cos(frameTime * 4 + i) * 8;
        ctx.fillStyle = '#34d399';
        ctx.fillRect(sx, sy, 2, 2);
      }
      break;
    }

    // --- ZONE 4: ECHOING CAVES ---
    case 'echo_bat': {
      const batFlap = Math.sin(frameTime * 14) * 10;
      ctx.translate(0, -14 + bobY * 1.2);
      ctx.fillStyle = '#4c1d95';
      ctx.fillRect(-6, -6, 12, 12);
      // Amethyst crystal wings
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.moveTo(-6, -2);
      ctx.lineTo(-22, -12 + batFlap);
      ctx.lineTo(-14, 6);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(6, -2);
      ctx.lineTo(22, -12 + batFlap);
      ctx.lineTo(14, 6);
      ctx.closePath();
      ctx.fill();
      // Sonic cry ripples
      if (isAttacking) {
        ctx.strokeStyle = 'rgba(216, 180, 254, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(14, 0, 12, -0.6, 0.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(18, 0, 18, -0.6, 0.6);
        ctx.stroke();
      }
      break;
    }
    case 'spike_crawler': {
      // Amethyst spike crawler
      ctx.fillStyle = '#2e1065';
      ctx.fillRect(-12, -8, 24, 8);
      // Upward crystal spikes
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(-10, -18, 3, 10);
      ctx.fillRect(-4, -22, 4, 14);
      ctx.fillRect(3, -20, 3, 12);
      ctx.fillRect(8, -16, 3, 8);
      // Legs
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-12, 0, 3, 4);
      ctx.fillRect(-4, 0, 3, 4);
      ctx.fillRect(4, 0, 3, 4);
      ctx.fillRect(10, 0, 3, 4);
      break;
    }
    case 'hollow_drifter': {
      // Lost hooded phantom
      ctx.translate(0, bobY * 1.6);
      ctx.fillStyle = '#3b0764';
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(12, 4);
      ctx.lineTo(-12, 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#9333ea';
      ctx.fillRect(-6, -18, 12, 12);
      // Glowing eerie eyes
      ctx.fillStyle = '#e9d5ff';
      ctx.fillRect(-3, -15, 2, 2);
      ctx.fillRect(2, -15, 2, 2);
      // Ethereal robes
      ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.fillRect(-10, 4, 20, 8 + bobY);
      break;
    }

    // --- ZONE 5: BROKEN RIVER ---
    case 'raft_leech': {
      // Sinuous crimson/cyan leech
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(-14, -6, 28, 6);
      ctx.fillStyle = '#be123c';
      ctx.fillRect(8, -8, 8, 8);
      // Sucker teeth
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(14, -6, 2, 2);
      ctx.fillRect(14, -3, 2, 2);
      break;
    }
    case 'undertow_fry': {
      // Shadow eel
      const wave = Math.sin(frameTime * 8) * 3;
      ctx.translate(0, bobY);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.quadraticCurveTo(0, wave * 2, 16, 0);
      ctx.lineTo(14, -6);
      ctx.lineTo(-14, -4);
      ctx.closePath();
      ctx.fill();
      // Glowing crimson dorsal fin
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-8, -7 + wave * 0.5, 14, 3);
      // Eye
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(10, -3, 2, 2);
      break;
    }
    case 'splash_mope': {
      // Water-touched mope
      ctx.translate(0, bobY);
      ctx.fillStyle = '#0369a1';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(-5, -3, 3, 3);
      ctx.fillRect(3, -3, 3, 3);
      // Water splash bubbles
      for (let i = 0; i < 3; i++) {
        const bx = Math.sin(frameTime * 6 + i * 2) * 16;
        const by = -8 + Math.cos(frameTime * 6 + i) * 6;
        ctx.fillStyle = 'rgba(186, 230, 253, 0.6)';
        ctx.fillRect(bx, by, 3, 3);
      }
      break;
    }

    // --- ZONE 6: BEACON SUMMIT ---
    case 'shadow_sentry': {
      // Armored corrupted knight
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-6, -26, 12, 14); // Plate chest
      ctx.fillStyle = '#090a0f';
      ctx.fillRect(-5, -36, 10, 10); // Helmet
      // Crimson eye slit
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-2, -32, 6, 2);
      // Pauldrons
      ctx.fillStyle = '#312e81';
      ctx.fillRect(-10, -28, 5, 6);
      ctx.fillRect(5, -28, 5, 6);
      // Legs
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-5, -12, 4, 12);
      ctx.fillRect(1, -12, 4, 12);
      // Greatsword
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(8, -32, 3, 24);
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(7, -30, 5, 3);
      break;
    }
    case 'ash_wisp': {
      // Burning ash skull
      ctx.translate(0, bobY * 1.5);
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.arc(0, -10, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(0, -10, 8, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-4, -12, 3, 3);
      ctx.fillRect(2, -12, 3, 3);
      // Fire plume
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-3, -22, 6, 8);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-1, -25, 2, 4);
      break;
    }
    case 'beacon_husk': {
      // Fallen stone pilgrim golem
      ctx.fillStyle = '#334155';
      ctx.fillRect(-12, -28, 24, 18); // Heavy stone chest
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-8, -38, 16, 10); // Head
      // Glowing red fissures
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-4, -34, 8, 2); // Eye band
      ctx.fillRect(-2, -26, 4, 14); // Core fissure
      // Massive stone club fist
      ctx.fillStyle = '#475569';
      ctx.fillRect(10, -22, 10, 12);
      // Legs
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-10, -10, 8, 10);
      ctx.fillRect(2, -10, 8, 10);
      break;
    }

    default: {
      drawMope(ctx, 0, 0, 14, frameTime);
      break;
    }
  }

  ctx.restore();
};

/**
 * Universal Boss Enemy Sprite Dispatcher
 * Renders all 6 zone bosses based on the official Boss Reference Sheet.
 */
export const drawBoss = (
  ctx: CanvasRenderingContext2D,
  type: 'great_mope' | 'rolling_gloom' | 'thornmother' | 'echo_maw' | 'undertow' | 'blaze_shadow',
  x: number,
  y: number,
  healthPercent: number,
  frameTime: number,
  isAttacking: boolean,
  facing: 1 | -1 = -1
) => {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(facing, 1);

  if (type === 'great_mope') {
    // 01: THE GREAT MOPE (Colossal sorrowful mass wreathed in neon magenta/violet Hush flames)
    const pulse = Math.sin(frameTime * 4) * 4;

    // Massive outer magenta/purple flame corona
    const corona = ctx.createRadialGradient(0, -26, 12, 0, -26, 56 + pulse);
    corona.addColorStop(0, 'rgba(236, 72, 153, 0.75)');
    corona.addColorStop(0.5, 'rgba(168, 85, 247, 0.45)');
    corona.addColorStop(1, 'rgba(88, 28, 135, 0)');
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(0, -26, 56 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Roaring shadow-flame plumes rising from crown
    for (let i = -3; i <= 3; i++) {
      const fx = i * 9 + Math.sin(frameTime * 7 + i) * 3;
      const fy = -54 - Math.abs(Math.cos(frameTime * 5 + i)) * 12;
      ctx.fillStyle = i % 2 === 0 ? '#e879f9' : '#a855f7';
      ctx.beginPath();
      ctx.arc(fx, fy, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Colossal dark-violet spherical body
    ctx.fillStyle = '#190b28';
    ctx.beginPath();
    ctx.arc(0, -24, 36 + pulse * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Inner bruised purple-magenta shading
    ctx.fillStyle = isAttacking ? '#86198f' : '#3b0764';
    ctx.beginPath();
    ctx.arc(-4, -26, 28 + pulse * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Large glowing pink-white slanted eyes (matching Boss Sheet)
    ctx.fillStyle = '#fdf4ff';
    ctx.beginPath();
    ctx.ellipse(-11, -24, 5, 7, -0.25, 0, Math.PI * 2);
    ctx.ellipse(11, -24, 5, 7, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Glowing magenta eye aura
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Grimacing jagged shadow mouth
    ctx.fillStyle = '#fae8ff';
    ctx.beginPath();
    ctx.moveTo(-8, -11);
    ctx.lineTo(-4, -14);
    ctx.lineTo(0, -11);
    ctx.lineTo(4, -14);
    ctx.lineTo(8, -11);
    ctx.lineTo(4, -8);
    ctx.lineTo(0, -10);
    ctx.lineTo(-4, -8);
    ctx.closePath();
    ctx.fill();

    // Orbiting mini-Mope satellites (IDLE / SPLIT / ORB ATTACK)
    for (let i = 0; i < 3; i++) {
      const angle = frameTime * 2.8 + (i * Math.PI * 2) / 3;
      const ox = Math.cos(angle) * 46;
      const oy = -26 + Math.sin(angle) * 18;
      ctx.fillStyle = '#2e1065';
      ctx.beginPath();
      ctx.arc(ox, oy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f0abfc';
      ctx.fillRect(ox - 3, oy - 1, 2, 2);
      ctx.fillRect(ox + 1, oy - 1, 2, 2);
    }
  } else if (type === 'rolling_gloom') {
    // 02: THE ROLLING GLOOM (Wall of shadow & cursed wind)
    const spin = frameTime * 5;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -24, 38, 0, Math.PI * 2);
    ctx.fill();

    // Whirling gale bands
    for (let i = 0; i < 4; i++) {
      const a = spin + (i * Math.PI) / 2;
      ctx.fillStyle = i % 2 === 0 ? '#312e81' : '#4338ca';
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 12, -24 + Math.sin(a) * 12, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    // Piercing shadow eye
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, -24, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.fillRect(-2, -28, 4, 8);
  } else if (type === 'thornmother') {
    // 03: THORNMOTHER (Corrupted ancient root-beast)
    // Wood root base
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-28, -32, 56, 32);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-22, -48, 44, 20); // Head/mask

    // Blooming rose thorn crown
    const bloom = Math.sin(frameTime * 6) * 3;
    ctx.fillStyle = '#be123c';
    ctx.beginPath();
    ctx.arc(0, -56, 20 + bloom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(0, -56, 12, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-10, -42, 6, 4);
    ctx.fillRect(4, -42, 6, 4);

    // Root sweeping vines
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(-26, -10, 24, 0.4, 2.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(26, -10, 24, 0.3, 2.7, true);
    ctx.stroke();
  } else if (type === 'echo_maw') {
    // 04: ECHO MAW (Cavernous horror with crystal jaws)
    // Rocky crystal body
    ctx.fillStyle = '#3b0764';
    ctx.beginPath();
    ctx.arc(0, -18, 40, Math.PI, 0);
    ctx.lineTo(36, 0);
    ctx.lineTo(-36, 0);
    ctx.closePath();
    ctx.fill();

    // Spiky amethyst crystal back
    ctx.fillStyle = '#c084fc';
    for (let i = -3; i <= 3; i++) {
      ctx.fillRect(i * 10 - 2, -42 - Math.abs(i) * 2, 5, 16);
    }

    // Enormous gaping jaw
    ctx.fillStyle = '#090a0f';
    ctx.beginPath();
    ctx.arc(0, -16, 24, 0, Math.PI);
    ctx.fill();

    // Crystal teeth
    ctx.fillStyle = '#e9d5ff';
    for (let tx = -18; tx <= 18; tx += 6) {
      ctx.fillRect(tx, -18, 3, 8);
    }

    // Sonic shock rings
    if (isAttacking) {
      ctx.strokeStyle = '#d8b4fe';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -12, 34 + Math.sin(frameTime * 15) * 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (type === 'undertow') {
    // 05: UNDERTOW (Shadowed river serpent)
    const undulate = Math.sin(frameTime * 8) * 8;
    // Serpent body coils
    ctx.fillStyle = '#0c4a6e';
    ctx.beginPath();
    ctx.arc(-24, -14 + undulate, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, -20 - undulate * 0.5, 20, 0, Math.PI * 2);
    ctx.fill();

    // Serpent head
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.arc(26, -26 + undulate, 20, 0, Math.PI * 2);
    ctx.fill();

    // Glowing crimson throat & frills
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(18, -38 + undulate, 8, 12);
    ctx.fillStyle = '#fb7185';
    ctx.fillRect(34, -28 + undulate, 6, 6); // Eye

    // Foaming river water base
    ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
    for (let w = -40; w <= 40; w += 10) {
      ctx.fillRect(w, -4 + Math.sin(frameTime * 12 + w) * 3, 8, 6);
    }
  } else if (type === 'blaze_shadow') {
    // 06: BLAZE'S SHADOW (Fallen reflection with corrupted Emberfang)
    const shadowBob = Math.sin(frameTime * 8) * 2;
    // Silhouette Body
    ctx.fillStyle = '#090a0f';
    ctx.fillRect(-6, -26 + shadowBob, 12, 16);
    // Head & dark hair
    ctx.fillRect(-5, -36 + shadowBob, 10, 10);
    ctx.fillRect(-8, -38 + shadowBob, 6, 8); // Ponytail
    // Piercing crimson eyes
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(0, -32 + shadowBob, 3, 2);
    // Dark corrupted scarf
    ctx.fillStyle = '#881337';
    ctx.fillRect(-12, -26 + shadowBob + Math.sin(frameTime * 10) * 4, 10, 4);

    // Corrupted Flaming Blade
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, -20 + shadowBob);
    ctx.lineTo(32, -28 + shadowBob);
    ctx.stroke();

    // Dark flame aura
    ctx.fillStyle = 'rgba(225, 29, 72, 0.35)';
    ctx.beginPath();
    ctx.arc(0, -22 + shadowBob, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

/**
 * Waystation Beacon:
 */
export const drawWaystationBeacon = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isLit: boolean,
  time: number
) => {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  // Stone Pillar with Carved Hearth Runes
  ctx.fillStyle = '#334155';
  ctx.fillRect(-8, -26, 16, 26);
  ctx.fillStyle = '#475569';
  ctx.fillRect(-11, -30, 22, 5); // Brazier bowl
  ctx.fillRect(-12, -4, 24, 4); // Base plinth

  if (isLit) {
    const flameH = 18 + Math.cos(time * 9) * 4;
    const flicker = Math.sin(time * 14) * 2;

    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.moveTo(-6, -30);
    ctx.quadraticCurveTo(0, -30 - flameH, 6, -30);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(-4, -30);
    ctx.quadraticCurveTo(flicker, -28 - flameH * 0.7, 4, -30);
    ctx.closePath();
    ctx.fill();

    const gradient = ctx.createRadialGradient(0, -34, 2, 0, -34, 40);
    gradient.addColorStop(0, 'rgba(244, 63, 94, 0.45)');
    gradient.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, -34, 40, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-6, -31, 12, 3);
  }

  ctx.restore();
};
