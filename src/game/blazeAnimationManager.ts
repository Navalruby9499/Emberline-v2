/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BlazeAnimState =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'fall'
  | 'attack1'
  | 'attack2'
  | 'dash'
  | 'hurt'
  | 'death'
  | 'skill';

export interface AnimConfig {
  key: BlazeAnimState;
  fps: number;
  loop: boolean;
  frameCount: number;
  priority: number;
  canvasWidth: number;
  canvasHeight: number;
  anchorX: number;
  anchorY: number;
}

export const ANIM_CONFIGS: Record<BlazeAnimState, AnimConfig> = {
  idle: { key: 'idle', fps: 8, loop: true, frameCount: 11, priority: 1, canvasWidth: 96, canvasHeight: 96, anchorX: 48, anchorY: 83 },
  walk: { key: 'walk', fps: 12, loop: true, frameCount: 11, priority: 2, canvasWidth: 96, canvasHeight: 96, anchorX: 48, anchorY: 83 },
  run: { key: 'run', fps: 15, loop: true, frameCount: 12, priority: 3, canvasWidth: 112, canvasHeight: 96, anchorX: 56, anchorY: 83 },
  jump: { key: 'jump', fps: 14, loop: false, frameCount: 10, priority: 4, canvasWidth: 96, canvasHeight: 104, anchorX: 48, anchorY: 89 },
  fall: { key: 'fall', fps: 12, loop: true, frameCount: 10, priority: 4, canvasWidth: 96, canvasHeight: 104, anchorX: 48, anchorY: 89 },
  dash: { key: 'dash', fps: 22, loop: false, frameCount: 9, priority: 5, canvasWidth: 176, canvasHeight: 96, anchorX: 112, anchorY: 83 },
  attack1: { key: 'attack1', fps: 22, loop: false, frameCount: 9, priority: 6, canvasWidth: 240, canvasHeight: 104, anchorX: 96, anchorY: 89 },
  attack2: { key: 'attack2', fps: 22, loop: false, frameCount: 9, priority: 6, canvasWidth: 240, canvasHeight: 104, anchorX: 96, anchorY: 89 },
  skill: { key: 'skill', fps: 16, loop: false, frameCount: 9, priority: 7, canvasWidth: 336, canvasHeight: 160, anchorX: 144, anchorY: 143 },
  hurt: { key: 'hurt', fps: 14, loop: false, frameCount: 11, priority: 8, canvasWidth: 96, canvasHeight: 96, anchorX: 48, anchorY: 83 },
  death: { key: 'death', fps: 10, loop: false, frameCount: 8, priority: 9, canvasWidth: 128, canvasHeight: 96, anchorX: 64, anchorY: 83 },
};

export class BlazeAnimationManager {
  public currentState: BlazeAnimState = 'idle';
  public currentFrame = 0;
  private frameTimer = 0;
  private elapsedInState = 0;
  private images: Map<string, HTMLImageElement> = new Map();
  public loaded = false;
  public isComplete = false;

  constructor() {
    this.preloadAll();
  }

  private preloadAll() {
    const states: BlazeAnimState[] = [
      'idle',
      'walk',
      'run',
      'jump',
      'fall',
      'attack1',
      'attack2',
      'dash',
      'hurt',
      'death',
      'skill',
    ];

    let totalFrames = 0;
    let loadedCount = 0;

    for (const state of states) {
      const cfg = ANIM_CONFIGS[state];
      totalFrames += cfg.frameCount;

      for (let i = 0; i < cfg.frameCount; i++) {
        const path = `/assets/blaze_sprites/${state}/frame_${i}.png`;
        const img = new Image();
        img.src = path;
        img.onload = () => {
          loadedCount++;
          if (loadedCount >= totalFrames) {
            this.loaded = true;
          }
        };
        img.onerror = () => {
          loadedCount++;
        };
        this.images.set(`${state}_${i}`, img);
      }
    }
  }

  public play(state: BlazeAnimState) {
    if (this.currentState === state) {
      return; // Never restart if already in this state
    }

    this.currentState = state;
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.elapsedInState = 0;
    this.isComplete = false;
  }

  public forcePlay(state: BlazeAnimState) {
    this.currentState = state;
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.elapsedInState = 0;
    this.isComplete = false;
  }

  public update(dt: number): { isComplete: boolean; currentFrame: number } {
    this.elapsedInState += dt;

    // If state is idle, pause on frame 0 (the standing ready pose) until movement or action begins
    if (this.currentState === 'idle') {
      this.currentFrame = 0;
      this.frameTimer = 0;
      return { isComplete: false, currentFrame: 0 };
    }

    const cfg = ANIM_CONFIGS[this.currentState];
    const frameDuration = 1 / cfg.fps;

    this.frameTimer += dt;
    while (this.frameTimer >= frameDuration) {
      this.frameTimer -= frameDuration;
      if (this.currentFrame < cfg.frameCount - 1) {
        this.currentFrame++;
      } else {
        if (cfg.loop) {
          this.currentFrame = 0;
        } else {
          this.isComplete = true;
        }
      }
    }

    return { isComplete: this.isComplete, currentFrame: this.currentFrame };
  }

  public render(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: 1 | -1,
    hitFlash = false
  ) {
    const cfg = ANIM_CONFIGS[this.currentState];
    const imgKey = `${this.currentState}_${this.currentFrame}`;
    const img = this.images.get(imgKey);

    // Pixel-art scale calibrated to 0.48 so Blaze stands ~34px tall, matching Alden and environment
    const SCALE = 0.48;
    const frameDuration = 1 / cfg.fps;
    const subFrameT = Math.min(1, this.frameTimer / frameDuration);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(facing * SCALE, SCALE);

    if (hitFlash) {
      ctx.filter = 'brightness(2.5)';
    }

    // 1. Continuous 60fps fluid Crimson Cyclone energy ribbon during 'skill'
    if (this.currentState === 'skill' && this.currentFrame >= 1 && this.currentFrame <= 7) {
      const spinAngle = this.elapsedInState * 24;
      ctx.save();
      ctx.translate(0, -34);

      // Outer crimson aura glow
      const grad = ctx.createRadialGradient(10, 0, 6, 10, 0, 68);
      grad.addColorStop(0, 'rgba(244, 63, 94, 0.28)');
      grad.addColorStop(0.6, 'rgba(236, 72, 153, 0.16)');
      grad.addColorStop(1, 'rgba(244, 63, 94, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(10, 0, 68, 0, Math.PI * 2);
      ctx.fill();

      // Rotating 60fps twin crimson slash ribbons bridging keyframe arcs
      for (let r = 0; r < 2; r++) {
        ctx.save();
        ctx.rotate(spinAngle + r * Math.PI);
        ctx.strokeStyle = r === 0 ? 'rgba(251, 113, 133, 0.55)' : 'rgba(244, 63, 94, 0.42)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, 44 + r * 6, -0.35, Math.PI * 0.85);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }

    // 2. Sub-frame motion blend (crossfade trail from previous frame for ultra-smooth sword sweeps)
    if (
      (this.currentState === 'skill' ||
        this.currentState === 'attack1' ||
        this.currentState === 'attack2') &&
      this.currentFrame > 0
    ) {
      const prevImg = this.images.get(`${this.currentState}_${this.currentFrame - 1}`);
      if (prevImg && prevImg.complete && prevImg.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = (1 - subFrameT) * 0.48;
        ctx.drawImage(
          prevImg,
          -cfg.anchorX,
          -cfg.anchorY,
          prevImg.naturalWidth,
          prevImg.naturalHeight
        );
        ctx.restore();
      }
    }

    // 3. Primary active sprite frame anchored at Blaze's feet/body center
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(
        img,
        -cfg.anchorX,
        -cfg.anchorY,
        img.naturalWidth,
        img.naturalHeight
      );
    }

    ctx.restore();
  }

  public isAnimationFinished(): boolean {
    return this.isComplete;
  }
}
