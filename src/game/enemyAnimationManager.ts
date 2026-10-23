/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnemyType } from '../types/game';
import {
  ENEMY_SPRITE_MANIFEST,
  EnemyAnimState,
  EnemySpriteManifestEntry,
} from './enemySpriteManifest';

// Visual scale calibrated relative to Blaze (~34px tall at 480x270 resolution)
export const ENEMY_VISUAL_SCALE: Record<EnemyType, number> = {
  // Zone 1: Forgotten Meadow
  mope: 0.42,
  split_mope: 0.52,
  briar_bud: 0.48,
  great_mope: 0.72,

  // Zone 2: Hollow Hills
  gust_bat: 0.46,
  cliff_scrabbler: 0.48,
  gloom_runner: 0.50,
  rolling_gloom: 0.78,

  // Zone 3: Weeping Woods
  thornling: 0.46,
  root_hound: 0.54,
  spore_wisp: 0.44,
  thornmother: 0.76,

  // Zone 4: Echoing Caves
  echo_bat: 0.46,
  spike_crawler: 0.48,
  hollow_drifter: 0.50,
  echo_maw: 0.76,

  // Zone 5: Broken River
  raft_leech: 0.46,
  undertow_fry: 0.46,
  splash_mope: 0.45,
  undertow: 0.76,

  // Zone 6: Beacon Summit
  shadow_sentry: 0.52,
  ash_wisp: 0.45,
  beacon_husk: 0.56,
  blaze_shadow: 0.62,
};

class EnemySpriteImageCache {
  private images: Map<string, HTMLImageElement> = new Map();
  private preloaded = false;

  public preloadAll() {
    if (this.preloaded || typeof Image === 'undefined') return;
    this.preloaded = true;

    for (const entry of Object.values(ENEMY_SPRITE_MANIFEST)) {
      if (entry.portrait) {
        this.loadImage(entry.portrait);
      }
      for (const seq of Object.values(entry.animations)) {
        for (const frame of seq.frames) {
          this.loadImage(frame.file);
        }
      }
    }
  }

  private loadImage(src: string): HTMLImageElement {
    const existing = this.images.get(src);
    if (existing) return existing;

    const img = new Image();
    img.src = src;
    this.images.set(src, img);
    return img;
  }

  public getImage(src: string): HTMLImageElement | undefined {
    let img = this.images.get(src);
    if (!img && typeof Image !== 'undefined') {
      img = this.loadImage(src);
    }
    return img;
  }
}

export const enemySpriteCache = new EnemySpriteImageCache();

/**
 * Individual Enemy Animation Controller
 * Connected directly to each enemy instance's AI state machine:
 * - IDLE -> 'idle'
 * - PATROL / CHASE -> 'move'
 * - ATTACK_WINDUP / ATTACK_ACTIVE / ATTACK_RECOVERY -> 'attack'
 * - HURT -> 'hurt'
 * - DEATH -> 'death'
 */
export class EnemyAnimationController {
  public readonly type: EnemyType;
  public readonly manifest: EnemySpriteManifestEntry;
  public currentState: EnemyAnimState = 'idle';
  public currentFrame = 0;
  private frameTimer = 0;
  private hoverPhase = 0;
  public isComplete = false;

  constructor(type: EnemyType, initialHoverPhase = 0) {
    this.type = type;
    this.manifest = ENEMY_SPRITE_MANIFEST[type];
    this.hoverPhase = initialHoverPhase;
    enemySpriteCache.preloadAll();
  }

  /**
   * Transitions to a new animation state ONLY if different from current state.
   * Never restarts the same animation on every update frame.
   */
  public play(state: EnemyAnimState) {
    if (this.currentState === state) {
      return;
    }
    this.currentState = state;
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.isComplete = false;
  }

  public update(dt: number): { isComplete: boolean; currentFrame: number } {
    this.hoverPhase += dt;
    const seq = this.manifest?.animations[this.currentState];
    if (!seq || seq.frameCount <= 0) {
      return { isComplete: true, currentFrame: 0 };
    }

    const frameDuration = 1 / Math.max(1, seq.fps);
    this.frameTimer += dt;

    if (this.frameTimer >= frameDuration) {
      this.frameTimer -= frameDuration;
      if (this.currentFrame < seq.frameCount - 1) {
        this.currentFrame++;
      } else if (seq.loop) {
        this.currentFrame = 0;
      } else {
        this.isComplete = true;
      }
    }

    return { isComplete: this.isComplete, currentFrame: this.currentFrame };
  }

  /**
   * Renders the current extracted official sprite frame at (x, y).
   * - Ground enemies: feet-aligned at y with zero vertical drift.
   * - Flying enemies: controlled visual hover offset that never alters physics coordinates.
   * - All source sprites face RIGHT (+1); facing = -1 flips horizontally around anchorX.
   */
  public render(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: 1 | -1,
    hitFlash = false,
    alpha = 1
  ): boolean {
    const seq = this.manifest?.animations[this.currentState];
    if (!seq || seq.frames.length === 0) return false;

    const frameIdx = Math.min(this.currentFrame, seq.frames.length - 1);
    const frameMeta = seq.frames[frameIdx];
    const img = enemySpriteCache.getImage(frameMeta.file);

    if (!img || !img.complete || img.naturalWidth === 0) {
      return false;
    }

    const scale = ENEMY_VISUAL_SCALE[this.type] ?? 0.48;
    const isFlying = Boolean(this.manifest.isFlying);
    const isBoss = Boolean(this.manifest.isBoss);

    // Purely visual hover oscillation for flying enemies; never modifies physics body y
    const visualHoverY =
      isFlying && this.currentState !== 'death'
        ? Math.sin(this.hoverPhase * 4.2) * 2.5
        : 0;

    // Grounded organic squash-and-stretch for bosses so 1-frame poses feel alive and fluid
    let squashX = 1;
    let stretchY = 1;
    if (isBoss && this.currentState !== 'death') {
      if (this.currentState === 'move') {
        const wave = Math.sin(this.hoverPhase * 8.5);
        squashX = 1 + wave * 0.045;
        stretchY = 1 - wave * 0.045;
      } else if (this.currentState === 'idle') {
        const breath = Math.sin(this.hoverPhase * 3.6);
        squashX = 1 - breath * 0.022;
        stretchY = 1 + breath * 0.025;
      } else if (this.currentState === 'attack') {
        const pulse = Math.sin(this.hoverPhase * 14);
        squashX = 1 + pulse * 0.05;
        stretchY = 1 + pulse * 0.04;
      }
    }

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (alpha < 1) {
      ctx.globalAlpha = Math.max(0, alpha);
    }
    ctx.translate(Math.round(x), Math.round(y + visualHoverY));
    ctx.scale(facing * scale * squashX, scale * stretchY);

    if (hitFlash) {
      ctx.filter = 'brightness(2.4) contrast(1.2)';
    }

    ctx.drawImage(
      img,
      -frameMeta.anchorX,
      -frameMeta.anchorY,
      frameMeta.width,
      frameMeta.height
    );

    ctx.restore();
    return true;
  }
}
