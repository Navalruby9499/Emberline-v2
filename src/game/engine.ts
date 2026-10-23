/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ZoneId,
  GameSaveData,
  GameSettings,
  Projectile,
  Particle,
  FloatingText,
  DialogueSequence,
  EnemyType,
  HUDStats,
} from '../types/game';
import {
  GAME_CANVAS,
  BLAZE_PHYSICS,
  COMBAT_CONFIG,
} from './constants';
import { LEVELS, LevelConfig, PlatformDef } from './levels';
import {
  drawCaptainAlden,
  drawTorch,
  drawForgeFurnace,
  drawFestivalBanner,
  drawTrainingDummy,
  drawMope,
  drawEnemy,
  drawBoss,
  drawWaystationBeacon,
} from './sprites';
import { BlazeAnimationManager, BlazeAnimState } from './blazeAnimationManager';
import { EnemyAnimationController } from './enemyAnimationManager';
import { ENEMY_SPRITE_MANIFEST } from './enemySpriteManifest';
import { soundManager } from '../audio/soundManager';

export type EnemyAIState =
  | 'IDLE'
  | 'PATROL'
  | 'CHASE'
  | 'ATTACK_WINDUP'
  | 'ATTACK_ACTIVE'
  | 'ATTACK_RECOVERY'
  | 'HURT'
  | 'DEATH';

interface ActiveEnemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  spawnX: number;
  hoverY: number;
  vx: number;
  vy: number;
  health: number;
  maxHealth: number;
  facing: 1 | -1;
  attackCooldown: number;
  stateTimer: number;
  hitFlashTimer: number;
  aiState: EnemyAIState;
  hurtTimer: number;
  deathTimer: number;
  attackPhaseTimer: number;
  hasDealtAttackDamage: boolean;
  hasSplit: boolean;
  isSplitMini?: boolean;
  anim: EnemyAnimationController;
}

export interface EngineCallbacks {
  onDialogueTrigger: (sequence: DialogueSequence) => void;
  onZoneComplete: (nextZoneId: ZoneId) => void;
  onStatsUpdate: (stats: HUDStats) => void;
  onSaveState: (save: GameSaveData) => void;
}

interface DashGhost {
  x: number;
  y: number;
  facing: 1 | -1;
  alpha: number;
  frameTime: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: EngineCallbacks;
  private settings: GameSettings;

  private isRunning = false;
  private isPaused = false;
  private animFrameId: number | null = null;
  private lastTime = 0;

  // Level & World State
  public currentZoneId: ZoneId = 'prologue_forge';
  public currentLevel: LevelConfig;
  private cameraX = 0;
  private cameraY = 0;
  private screenShakeTime = 0;
  private screenShakeIntensity = 0;
  private hitFreezeTimer = 0; // Micro-freeze for hit-stop feedback

  // Progressive Tutorial Steps (1 to 7)
  private tutorialStep = 1;
  private movedLeft = false;
  private movedRight = false;
  private hasJumpedPlatform = false;
  private dummyHitsLanded = 0;
  private dummyHitReaction = 0;
  private dummyHitWobble = 0;
  private crescentWavesFired = 0;
  private hasDashed = false;
  private sparHitsLanded = 0;
  private isAldenParrying = false;
  private aldenParryTimer = 0;

  // Prologue Specific State
  private prologuePhase: 'tutorial' | 'hush_invading' | 'rescue_child' | 'alden_sacrifice' | 'ember_furnace' = 'tutorial';
  private hasSavedCourtyardChild = false;
  private hasTakenCrimsonEmber = false;
  private isAldenHushed = false;

  // Player State
  private px = 50;
  private py = 215;
  private pvx = 0;
  private pvy = 0;
  private facing: 1 | -1 = 1;
  private isGrounded = false;
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private playerHitFlashTimer = 0;

  // Player Combat & RPG Level System
  public health = COMBAT_CONFIG.MAX_HEALTH;
  public maxHealth = COMBAT_CONFIG.MAX_HEALTH;
  public skillMeter = 0;
  public sparks = 0;
  public level = 1;
  public xp = 0;
  public maxXp = COMBAT_CONFIG.BASE_XP_TO_LEVEL;
  public runResetsUsed = 0;
  private levelUpNotification: string | null = null;
  private levelUpBannerTimer = 0;
  private iframeTimer = 0;
  private isAttacking = false;
  private attackState: 'slash1' | 'slash2' | 'slash3' | 'cyclone' = 'slash1';
  private attackTimer = 0;
  private comboResetTimer = 0;
  private comboStep = 0;

  // Dash & Ghost Trail
  private isDashing = false;
  private dashTimer = 0;
  private dashCooldownTimer = 0;
  private dashGhosts: DashGhost[] = [];

  // Heat & Overheat
  private heatLevel = 0;
  private heatDecayTimer = 0;
  private isOverheated = false;
  private overheatTimer = 0;

  // Objects & Entities
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private projectileIdCounter = 0;

  // Level Elements
  private platforms: PlatformDef[] = [];
  private crumbleStates: { index: number; timer: number; dropped: boolean }[] = [];
  private movingPlatformOffsets: number[] = [];
  private enemies: ActiveEnemy[] = [];
  private collectedSparks = new Set<number>();
  private isBeaconLit = false;
  private hasRescuedTraveler = false;
  private hasRescuedChildren = false;
  private costumeVariant: 'default' | 'crimson_rescuer' = 'default';

  // Boss State
  private bossCurrentHealth = 0;
  private bossMaxHealth = 0;
  private bossAttackCooldown = 2.0;
  private bossIsTelegraphing = false;
  private bossTelegraphTimer = 0;

  // Ambient Forge Embers in Air
  private ambientEmbers: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];

  // Blaze Animation Controller
  public blazeAnim: BlazeAnimationManager;

  // Physics Debug Overlay Toggle (press [P] to inspect hitboxes)
  public showPhysicsDebug = false;

  // Input State
  private keys: Record<string, boolean> = {};

  constructor(
    canvas: HTMLCanvasElement,
    callbacks: EngineCallbacks,
    settings: GameSettings,
    savedGame?: Partial<GameSaveData>
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.callbacks = callbacks;
    this.settings = settings;
    this.blazeAnim = new BlazeAnimationManager();

    // Initialize floating ambient embers in Forge Gate air
    for (let i = 0; i < 28; i++) {
      this.ambientEmbers.push({
        x: Math.random() * 1000,
        y: Math.random() * 260,
        vx: 15 + Math.random() * 25,
        vy: -10 - Math.random() * 20,
        size: 1 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.5,
      });
    }

    if (savedGame && savedGame.currentZone) {
      this.currentZoneId = savedGame.currentZone;
      this.level = savedGame.level ?? 1;
      this.xp = savedGame.xp ?? 0;
      this.maxXp =
        savedGame.maxXp ??
        COMBAT_CONFIG.BASE_XP_TO_LEVEL + (this.level - 1) * COMBAT_CONFIG.XP_SCALE_PER_LEVEL;
      this.maxHealth =
        savedGame.maxHealth ?? COMBAT_CONFIG.MAX_HEALTH + Math.floor(this.level / 2) * 2;
      this.health = savedGame.health ?? this.maxHealth;
      this.sparks = savedGame.sparks ?? 0;
      this.runResetsUsed = savedGame.runResetsUsed ?? 0;
      this.hasRescuedTraveler = !!savedGame.rescuedTravelerHills;
      this.hasRescuedChildren = !!savedGame.rescuedRetreatChildren;
      this.costumeVariant = savedGame.costumeVariant ?? 'default';
    }

    this.currentLevel = LEVELS[this.currentZoneId] || LEVELS.prologue_forge;
    this.loadZone(this.currentZoneId, savedGame?.respawnX, savedGame?.respawnY);
    this.setupInputs();
  }

  public updateSettings(newSettings: GameSettings) {
    this.settings = newSettings;
  }

  public setCostume(costume: 'default' | 'crimson_rescuer') {
    this.costumeVariant = costume;
  }

  private setupInputs() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  public destroy() {
    this.stop();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
  }

  private handleBlur = () => {
    this.keys = {};
    if (!this.isDashing) {
      this.pvx = 0;
    }
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = true;
    this.keys[e.code] = true;

    // Toggle Physics Debug Overlay
    if (e.key.toLowerCase() === 'p') {
      this.showPhysicsDebug = !this.showPhysicsDebug;
    }

    if (e.code === 'Space') {
      this.jumpBufferTimer = BLAZE_PHYSICS.JUMP_BUFFER;
    }

    if (e.key.toLowerCase() === 'j') {
      this.triggerFlameSlash();
    }

    if (e.key.toLowerCase() === 'k') {
      this.triggerCrescentWave();
    }

    if (e.shiftKey || e.key === 'Shift') {
      this.triggerEmberDash();
    }

    if (e.key.toLowerCase() === 'l') {
      this.triggerCrimsonCyclone();
    }

    if (e.key.toLowerCase() === 'e') {
      this.triggerInteract();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
    this.keys[e.code] = false;

    if (e.code === 'Space' && this.pvy < BLAZE_PHYSICS.MIN_JUMP_IMPULSE) {
      this.pvy = BLAZE_PHYSICS.MIN_JUMP_IMPULSE;
    }
  };

  public simulateVirtualKey(key: string, isDown: boolean) {
    if (isDown) {
      this.handleKeyDown({ key, code: key } as unknown as KeyboardEvent);
    } else {
      this.handleKeyUp({ key, code: key } as unknown as KeyboardEvent);
    }
  }

  public loadZone(zoneId: ZoneId, spawnX?: number, spawnY?: number) {
    this.currentZoneId = zoneId;
    this.currentLevel = LEVELS[zoneId] || LEVELS.prologue_forge;

    this.px = spawnX ?? this.currentLevel.spawnX;
    this.py = spawnY ?? this.currentLevel.spawnY;
    this.pvx = 0;
    this.pvy = 0;
    this.facing = 1;
    this.isDashing = false;
    this.dashTimer = 0;
    this.isAttacking = false;
    this.attackTimer = 0;
    this.isBeaconLit = false;
    this.dashGhosts = [];

    if (zoneId === 'prologue_forge') {
      this.prologuePhase = 'tutorial';
      this.tutorialStep = 1;
      this.movedLeft = false;
      this.movedRight = false;
      this.hasJumpedPlatform = false;
      this.dummyHitsLanded = 0;
      this.crescentWavesFired = 0;
      this.hasDashed = false;
      this.sparHitsLanded = 0;
      this.hasSavedCourtyardChild = false;
      this.hasTakenCrimsonEmber = false;
      this.isAldenHushed = false;
      this.enemies = [];
    } else {
      this.enemies = this.currentLevel.enemies.map((e, idx) => ({
        id: e.id,
        type: e.type,
        x: e.x,
        y: e.y,
        spawnX: e.x,
        hoverY: e.y,
        vx: 0,
        vy: 0,
        health: e.maxHealth,
        maxHealth: e.maxHealth,
        facing: -1,
        attackCooldown: 1.4,
        stateTimer: 0,
        hitFlashTimer: 0,
        aiState: 'IDLE',
        hurtTimer: 0,
        deathTimer: 0,
        attackPhaseTimer: 0,
        hasDealtAttackDamage: false,
        hasSplit: false,
        anim: new EnemyAnimationController(e.type, idx * 0.7),
      }));
    }

    this.platforms = JSON.parse(JSON.stringify(this.currentLevel.platforms));
    this.crumbleStates = this.platforms
      .map((p, idx) => (p.type === 'crumble' ? { index: idx, timer: 0, dropped: false } : null))
      .filter(Boolean) as { index: number; timer: number; dropped: boolean }[];
    this.movingPlatformOffsets = this.platforms.map(() => 0);

    if (this.currentLevel.hasBoss && this.currentLevel.bossType) {
      const boss = this.enemies.find(e => e.type === this.currentLevel.bossType);
      if (boss) {
        this.bossCurrentHealth = boss.health;
        this.bossMaxHealth = boss.maxHealth;
      }
    } else {
      this.bossCurrentHealth = 0;
      this.bossMaxHealth = 0;
    }

    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];

    if (this.currentLevel.introDialogue && this.currentLevel.introDialogue.length > 0) {
      this.callbacks.onDialogueTrigger({
        id: `${zoneId}_intro`,
        lines: this.currentLevel.introDialogue,
      });
    }

    if (zoneId === 'prologue_forge') {
      soundManager.playMusic('forge');
    } else if (zoneId === 'zone1_meadow') {
      soundManager.playMusic('exploration');
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    if (!paused) {
      this.lastTime = performance.now();
    }
  }

  // --- COMBAT ACTIONS & PROGRESSIVE TUTORIAL ---

  private triggerFlameSlash() {
    if (this.isAttacking && this.attackTimer > 0.08) return;
    if (this.isDashing) return;

    if (this.comboResetTimer > 0) {
      this.comboStep = (this.comboStep % 3) + 1;
    } else {
      this.comboStep = 1;
    }

    this.isAttacking = true;
    this.attackState = this.comboStep === 1 ? 'slash1' : this.comboStep === 2 ? 'slash2' : 'slash3';
    this.attackTimer = 0.28;
    this.comboResetTimer = COMBAT_CONFIG.SLASH_COMBO_RESET_TIME;
    this.blazeAnim.play('attack1');

    soundManager.playSlash(this.comboStep);

    // Hitbox & Level-scaled Damage
    const reach = 34 + this.comboStep * 6;
    const slashDamage = (this.comboStep === 3 ? 3 : 2) + this.getAttackBonus();
    const hitbox = {
      x: this.facing === 1 ? this.px + 4 : this.px - reach - 4,
      y: this.py - 24,
      width: reach,
      height: 26,
    };

    // 1. Check Hit against Training Dummy in Tutorial
    if (this.currentZoneId === 'prologue_forge' && this.prologuePhase === 'tutorial') {
      const distDummy = Math.hypot(this.px - 175, this.py - 182);
      if (distDummy < 50 && this.facing === 1) {
        this.dummyHitsLanded++;
        this.dummyHitReaction = 6;
        this.dummyHitWobble = 0.25;
        this.hitFreezeTimer = 0.04; // Hit-stop microfreeze
        this.skillMeter = Math.min(COMBAT_CONFIG.MAX_SKILL_METER, this.skillMeter + 25);
        soundManager.playHit();
        this.triggerScreenShake(0.15, 3);
        this.addFloatingText('HIT!', 175, 155, '#f43f5e');
        if (this.dummyHitsLanded <= 6) {
          this.gainXp(15, 175, 142);
        }

        // Advance Step 3 -> Step 4
        if (this.tutorialStep === 3 && this.dummyHitsLanded >= 2) {
          this.tutorialStep = 4;
          this.callbacks.onDialogueTrigger({
            id: 'tut_step_4',
            lines: [
              {
                speaker: 'Captain Alden',
                portrait: 'alden',
                text: 'Sharp strikes! Now channel your crystal hearth with Crescent Wave [K]. Consecutive slashes heat the blade—don’t let it overheat!',
              },
            ],
          });
        }
      }

      // 2. Check Hit against Captain Alden during Sparring Step 6
      if (this.tutorialStep === 6) {
        const distAlden = Math.hypot(this.px - 280, this.py - 232);
        if (distAlden < 50) {
          this.sparHitsLanded++;
          this.isAldenParrying = true;
          this.aldenParryTimer = 0.35;
          this.hitFreezeTimer = 0.05;
          this.skillMeter = Math.min(COMBAT_CONFIG.MAX_SKILL_METER, this.skillMeter + 25);
          soundManager.playHit();
          this.triggerScreenShake(0.2, 4);
          this.addFloatingText(`PARRIED! (${this.sparHitsLanded}/3)`, 280, 200, '#38bdf8');
          if (this.sparHitsLanded <= 4) {
            this.gainXp(25, 280, 186);
          }

          // Spark particle spray from parry
          for (let i = 0; i < 8; i++) {
            this.particles.push({
              x: 280,
              y: 205,
              vx: (Math.random() - 0.5) * 110,
              vy: -20 - Math.random() * 60,
              size: 2.5,
              color: '#38bdf8',
              alpha: 1,
              life: 0.3,
              maxLife: 0.3,
            });
          }

          if (this.sparHitsLanded >= 3) {
            this.tutorialStep = 7;
            this.callbacks.onDialogueTrigger({
              id: 'tut_step_7',
              lines: [
                {
                  speaker: 'Captain Alden',
                  portrait: 'alden',
                  text: 'Superb balance! You read my guard and struck with precision. Come speak with me [E] on the eastern wall.',
                },
              ],
            });
          }
        }
      }
    }

    this.checkMeleeHits(hitbox, slashDamage);

    // Glowing pink slash particles
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: this.px + this.facing * 20,
        y: this.py - 14 + (Math.random() * 16 - 8),
        vx: this.facing * (90 + Math.random() * 70),
        vy: (Math.random() - 0.5) * 60,
        size: 3,
        color: '#f43f5e',
        alpha: 1,
        life: 0.28,
        maxLife: 0.28,
      });
    }
  }

  private triggerCrescentWave() {
    if (this.isOverheated || this.isDashing) return;

    this.heatLevel++;
    this.heatDecayTimer = COMBAT_CONFIG.CRESCENT_HEAT_DECAY_TIME;
    this.blazeAnim.play('attack2');

    if (this.heatLevel >= COMBAT_CONFIG.CRESCENT_MAX_HEAT) {
      this.isOverheated = true;
      this.overheatTimer = COMBAT_CONFIG.OVERHEAT_LOCKOUT_TIME;
      soundManager.playOverheat();
      this.triggerScreenShake(0.25, 4);
      this.addFloatingText('OVERHEAT!', this.px, this.py - 30, '#ef4444');
    } else {
      soundManager.playCrescent();
    }

    this.projectiles.push({
      id: ++this.projectileIdCounter,
      x: this.px + this.facing * 18,
      y: this.py - 15,
      vx: this.facing * 250,
      vy: 0,
      radius: 8,
      damage: 2 + this.getAttackBonus(),
      lifetime: 0,
      maxLifetime: 0.95,
      type: 'crescent',
      color: '#fda4af',
    });

    // Advance Step 4 -> Step 5
    if (this.currentZoneId === 'prologue_forge' && this.tutorialStep === 4) {
      this.crescentWavesFired++;
      if (this.crescentWavesFired >= 2) {
        this.tutorialStep = 5;
        this.callbacks.onDialogueTrigger({
          id: 'tut_step_5',
          lines: [
            {
              speaker: 'Captain Alden',
              portrait: 'alden',
              text: 'The hearth crystal is responding! Now test your mobility with Ember Dash [Shift]. It gives you invulnerability frames to evade danger.',
            },
          ],
        });
      }
    }
  }

  private triggerEmberDash() {
    if (this.dashCooldownTimer > 0 || this.isDashing) return;

    this.isDashing = true;
    this.dashTimer = BLAZE_PHYSICS.DASH_DURATION;
    this.dashCooldownTimer = this.getEffectiveDashCooldown();
    this.iframeTimer = BLAZE_PHYSICS.DASH_DURATION + 0.12;
    this.pvx = this.facing * BLAZE_PHYSICS.DASH_SPEED;
    // Shift-Jump boost: slight upward lift when dashing in mid-air to cross wide/elevated platform gaps
    this.pvy = !this.isGrounded ? -65 : 0;
    this.blazeAnim.play('dash');

    soundManager.playDash();

    // Spawn dash ghost trails
    this.dashGhosts.push({
      x: this.px,
      y: this.py,
      facing: this.facing,
      alpha: 0.75,
      frameTime: performance.now() / 1000,
    });

    for (let i = 0; i < 9; i++) {
      this.particles.push({
        x: this.px - this.facing * 10,
        y: this.py - 10 + (Math.random() * 14 - 7),
        vx: -this.facing * (60 + Math.random() * 90),
        vy: (Math.random() - 0.5) * 45,
        size: 3,
        color: '#fb7185',
        alpha: 1,
        life: 0.35,
        maxLife: 0.35,
      });
    }

    // Advance Step 5 -> Step 6
    if (this.currentZoneId === 'prologue_forge' && this.tutorialStep === 5) {
      this.hasDashed = true;
      this.tutorialStep = 6;
      this.callbacks.onDialogueTrigger({
        id: 'tut_step_6',
        lines: [
          {
            speaker: 'Captain Alden',
            portrait: 'alden',
            text: 'Flawless burst! Now face me in the sparring ring below. Land 3 controlled strikes [J] against my guard.',
          },
        ],
      });
    }
  }

  private triggerCrimsonCyclone() {
    if (this.skillMeter < COMBAT_CONFIG.CYCLONE_COST || this.isDashing) return;
    if (this.isAttacking && this.attackState === 'cyclone') return;

    this.skillMeter = 0;
    this.isAttacking = true;
    this.attackState = 'cyclone';
    this.attackTimer = BLAZE_PHYSICS.CYCLONE_DURATION;
    this.iframeTimer = BLAZE_PHYSICS.CYCLONE_DURATION;
    this.pvx = this.facing * 55;
    this.blazeAnim.forcePlay('skill');

    soundManager.playCyclone();
    this.triggerScreenShake(0.35, 5);

    const aoeHitbox = {
      x: this.px - 56,
      y: this.py - 42,
      width: 112,
      height: 52,
    };
    this.checkMeleeHits(aoeHitbox, 6 + this.getCycloneBonus());
    // Ensure Cyclone's own AOE hits do not refund charge
    this.skillMeter = 0;

    // Also allow hitting the Forge Gate training dummy with L
    if (this.currentZoneId === 'prologue_forge' && this.prologuePhase === 'tutorial') {
      const distDummy = Math.hypot(this.px - 175, this.py - 182);
      if (distDummy < 68) {
        this.dummyHitsLanded++;
        this.dummyHitReaction = 8;
        this.dummyHitWobble = 0.35;
        soundManager.playHit();
        this.addFloatingText('CYCLONE!', 175, 150, '#fb7185');
      }
    }

    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      this.particles.push({
        x: this.px,
        y: this.py - 18,
        vx: Math.cos(angle) * 125,
        vy: Math.sin(angle) * 85 - 15,
        size: 3.5,
        color: i % 2 === 0 ? '#fda4af' : '#f43f5e',
        alpha: 1,
        life: 0.48,
        maxLife: 0.48,
      });
    }
  }

  private triggerInteract() {
    if (this.currentZoneId === 'prologue_forge') {
      // Step 7: Finish Training & Trigger The Hush Invasion!
      if (this.prologuePhase === 'tutorial' && this.tutorialStep >= 7) {
        const distAlden = Math.hypot(this.px - 280, this.py - 232);
        if (distAlden < 50) {
          this.prologuePhase = 'hush_invading';
          this.triggerScreenShake(0.8, 7);
          soundManager.playMusic('boss');

          this.callbacks.onDialogueTrigger({
            id: 'hush_invasion_alarm',
            lines: [
              {
                speaker: 'Captain Alden',
                portrait: 'alden',
                text: 'You fight with courage, Blaze. But never forget: a guard’s true duty is to protect what matters, not merely defeat opponents.',
              },
              {
                speaker: 'Captain Alden',
                portrait: 'alden',
                text: '...Wait. Look toward the distant Summit! The Great Beacon... it flickered! The bells have stopped ringing!',
              },
              {
                speaker: 'Blaze',
                portrait: 'blaze_surprised',
                text: 'The Great Beacon went black! Grey freezing fog is rushing over the eastern walls!',
              },
              {
                speaker: 'Captain Alden',
                portrait: 'alden',
                text: 'The Hush is here! Fall back to the courtyard gate! We’re not protecting stone, Blaze—we’re protecting people!',
              },
            ],
          });

          // Spawn invading Mopes in the courtyard
          this.enemies = [
            {
              id: 'hush_m1',
              type: 'mope',
              x: 490,
              y: 210,
              spawnX: 490,
              hoverY: 210,
              vx: -35,
              vy: 0,
              health: 2,
              maxHealth: 2,
              facing: -1,
              attackCooldown: 1.0,
              stateTimer: 0,
              hitFlashTimer: 0,
              aiState: 'PATROL',
              hurtTimer: 0,
              deathTimer: 0,
              attackPhaseTimer: 0,
              hasDealtAttackDamage: false,
              hasSplit: false,
              anim: new EnemyAnimationController('mope', 0.1),
            },
            {
              id: 'hush_m2',
              type: 'mope',
              x: 630,
              y: 210,
              spawnX: 630,
              hoverY: 210,
              vx: -35,
              vy: 0,
              health: 2,
              maxHealth: 2,
              facing: -1,
              attackCooldown: 1.2,
              stateTimer: 0,
              hitFlashTimer: 0,
              aiState: 'PATROL',
              hurtTimer: 0,
              deathTimer: 0,
              attackPhaseTimer: 0,
              hasDealtAttackDamage: false,
              hasSplit: false,
              anim: new EnemyAnimationController('mope', 0.8),
            },
            {
              id: 'hush_m3',
              type: 'mope',
              x: 750,
              y: 210,
              spawnX: 750,
              hoverY: 210,
              vx: -35,
              vy: 0,
              health: 2,
              maxHealth: 2,
              facing: -1,
              attackCooldown: 1.4,
              stateTimer: 0,
              hitFlashTimer: 0,
              aiState: 'PATROL',
              hurtTimer: 0,
              deathTimer: 0,
              attackPhaseTimer: 0,
              hasDealtAttackDamage: false,
              hasSplit: false,
              anim: new EnemyAnimationController('mope', 1.5),
            },
          ];
          return;
        }
      }

      // Courtyard Child rescue
      if (this.prologuePhase === 'hush_invading' && !this.hasSavedCourtyardChild) {
        const distChild = Math.hypot(this.px - 580, this.py - 232);
        if (distChild < 48) {
          this.hasSavedCourtyardChild = true;
          soundManager.playRescue();
          this.addFloatingText('SAVED BOY!', this.px, this.py - 25, '#38bdf8');
          this.gainXp(50, this.px, this.py - 38);

          this.prologuePhase = 'alden_sacrifice';
          this.isAldenHushed = true;
          this.triggerScreenShake(0.9, 8);

          this.callbacks.onDialogueTrigger({
            id: 'alden_sacrifice_cinematic',
            lines: [
              {
                speaker: 'Blaze',
                portrait: 'blaze_determined',
                text: 'Run inside, kid! Behind the barricade, now!',
              },
              {
                speaker: 'Blaze',
                portrait: 'blaze_surprised',
                text: 'The grey wave... it’s already across the courtyard! There’s nowhere left to stand!',
              },
              {
                speaker: 'Captain Alden',
                portrait: 'alden',
                text: 'MOVE!',
              },
              {
                speaker: 'Narrator',
                portrait: 'narrator',
                text: 'Alden throws himself between Blaze and the darkness, shoving her through the gate. The grey frost washes over him, freezing him in stone.',
              },
              {
                speaker: 'Blaze',
                portrait: 'blaze_sad',
                text: 'CAPTAIN! Captain, get up! ...His arm is frozen reaching toward me. He took the frost because I didn’t fall back...',
              },
            ],
          });

          this.prologuePhase = 'ember_furnace';
          this.px = 780;
          return;
        }
      }

      // Take Crimson Ember at final furnace
      if (this.prologuePhase === 'ember_furnace' && !this.hasTakenCrimsonEmber) {
        const distFurnace = Math.hypot(this.px - 860, this.py - 232);
        if (distFurnace < 75) {
          this.hasTakenCrimsonEmber = true;
          this.isBeaconLit = true;
          soundManager.playBeaconIgnite();
          this.addFloatingText('CRIMSON EMBER AWAKENED!', this.px, this.py - 25, '#f43f5e');
          this.gainXp(60, this.px, this.py - 38);

          this.callbacks.onDialogueTrigger({
            id: 'crimson_ember_awakening',
            lines: [
              {
                speaker: 'Narrator',
                portrait: 'narrator',
                text: 'Beside the final dying furnace, a radiant pink ember rises from the hearth and sinks into Emberfang.',
              },
              {
                speaker: 'Blaze',
                portrait: 'blaze_determined',
                text: 'The hearth is answering... Captain, I’m coming for you. I will reach the Summit, destroy the Hush, and bring you home!',
              },
            ],
            onCompleteAction: 'COMPLETE_ZONE',
          });

          this.saveCurrentProgress('zone1_meadow');
          return;
        }
      }
    }

    // Waystation Beacon interaction for Zones 1–6
    if (this.currentZoneId !== 'prologue_forge') {
      const distBeacon = Math.hypot(this.px - this.currentLevel.beaconX, this.py - this.currentLevel.beaconY);
      if (distBeacon < 50) {
        if (!this.isBeaconLit) {
          this.isBeaconLit = true;
          this.health = this.maxHealth;
          soundManager.playBeaconIgnite();
          this.gainXp(75, this.px, this.py - 35);

          this.callbacks.onDialogueTrigger({
            id: `${this.currentZoneId}_beacon_memory`,
            lines: [
              {
                speaker: 'Waystation Beacon',
                portrait: 'beacon',
                text: this.currentLevel.beaconLine,
              },
            ],
            onCompleteAction: 'COMPLETE_ZONE',
          });

          this.saveCurrentProgress();
        } else {
          this.completeZone();
        }
      }
    }
  }

  private checkMeleeHits(hitbox: { x: number; y: number; width: number; height: number }, damage: number) {
    for (const enemy of this.enemies) {
      if (enemy.health <= 0 || enemy.aiState === 'DEATH') continue;

      const manifest = ENEMY_SPRITE_MANIFEST[enemy.type];
      const halfW = (manifest?.hurtbox.width ?? 22) / 2;
      const height = manifest?.hurtbox.height ?? 24;
      const enemyBottom = enemy.y + 4;
      const enemyTop = enemy.y - height;

      const overlaps =
        hitbox.x < enemy.x + halfW &&
        hitbox.x + hitbox.width > enemy.x - halfW &&
        hitbox.y < enemyBottom &&
        hitbox.y + hitbox.height > enemyTop;

      if (overlaps) {
        this.damageEnemy(enemy, damage);
      }
    }
  }

  private damageEnemy(enemy: ActiveEnemy, amount: number) {
    if (enemy.aiState === 'DEATH') return;

    enemy.health -= amount;
    enemy.hitFlashTimer = 0.16;
    this.hitFreezeTimer = 0.04;
    soundManager.playHit();
    this.addFloatingText(`-${amount}`, enemy.x, enemy.y - 24, '#f43f5e');

    if (!(this.isAttacking && this.attackState === 'cyclone')) {
      const meterBonus = (this.level - 1) * 3;
      this.skillMeter = Math.min(COMBAT_CONFIG.MAX_SKILL_METER, this.skillMeter + 20 + meterBonus);
    }
    this.gainXp(5);

    if (this.currentLevel.hasBoss && enemy.type === this.currentLevel.bossType) {
      this.bossCurrentHealth = Math.max(0, enemy.health);
    }

    // Great Mope half-HP split mechanic (triggers strictly once)
    if (enemy.type === 'great_mope' && enemy.health <= enemy.maxHealth * 0.5 && enemy.health > 0 && !enemy.hasSplit) {
      enemy.hasSplit = true;
      enemy.anim.play('special');
      this.addFloatingText('SPLIT!', enemy.x, enemy.y - 38, '#c084fc');
      soundManager.playBossTelegraph();

      this.enemies.push(
        {
          id: `mini_mope_${Date.now()}_1`,
          type: 'mope',
          x: enemy.x - 36,
          y: enemy.y - 18,
          spawnX: enemy.x - 36,
          hoverY: enemy.y - 18,
          vx: -45,
          vy: 0,
          health: 3,
          maxHealth: 3,
          facing: -1,
          attackCooldown: 1.1,
          stateTimer: 0,
          hitFlashTimer: 0,
          aiState: 'CHASE',
          hurtTimer: 0,
          deathTimer: 0,
          attackPhaseTimer: 0,
          hasDealtAttackDamage: false,
          hasSplit: true,
          isSplitMini: true,
          anim: new EnemyAnimationController('mope', 0.2),
        },
        {
          id: `mini_mope_${Date.now()}_2`,
          type: 'mope',
          x: enemy.x + 36,
          y: enemy.y - 18,
          spawnX: enemy.x + 36,
          hoverY: enemy.y - 18,
          vx: 45,
          vy: 0,
          health: 3,
          maxHealth: 3,
          facing: 1,
          attackCooldown: 1.1,
          stateTimer: 0,
          hitFlashTimer: 0,
          aiState: 'CHASE',
          hurtTimer: 0,
          deathTimer: 0,
          attackPhaseTimer: 0,
          hasDealtAttackDamage: false,
          hasSplit: true,
          isSplitMini: true,
          anim: new EnemyAnimationController('mope', 1.1),
        }
      );
    }

    // Split Mope minion fission mechanic (triggers strictly once upon defeat)
    if (enemy.type === 'split_mope' && enemy.health <= 0 && !enemy.hasSplit && !enemy.isSplitMini) {
      enemy.hasSplit = true;
      this.addFloatingText('SPLIT!', enemy.x, enemy.y - 28, '#c084fc');
      soundManager.playBossTelegraph();
      this.enemies.push(
        {
          id: `split_${Date.now()}_1`,
          type: 'mope',
          x: enemy.x - 20,
          y: enemy.y - 16,
          spawnX: enemy.x - 20,
          hoverY: enemy.y - 16,
          vx: -38,
          vy: 0,
          health: 2,
          maxHealth: 2,
          facing: -1,
          attackCooldown: 1.0,
          stateTimer: 0,
          hitFlashTimer: 0,
          aiState: 'CHASE',
          hurtTimer: 0,
          deathTimer: 0,
          attackPhaseTimer: 0,
          hasDealtAttackDamage: false,
          hasSplit: true,
          isSplitMini: true,
          anim: new EnemyAnimationController('mope', 0.4),
        },
        {
          id: `split_${Date.now()}_2`,
          type: 'mope',
          x: enemy.x + 20,
          y: enemy.y - 16,
          spawnX: enemy.x + 20,
          hoverY: enemy.y - 16,
          vx: 38,
          vy: 0,
          health: 2,
          maxHealth: 2,
          facing: 1,
          attackCooldown: 1.0,
          stateTimer: 0,
          hitFlashTimer: 0,
          aiState: 'CHASE',
          hurtTimer: 0,
          deathTimer: 0,
          attackPhaseTimer: 0,
          hasDealtAttackDamage: false,
          hasSplit: true,
          isSplitMini: true,
          anim: new EnemyAnimationController('mope', 1.3),
        }
      );
    }

    if (enemy.health <= 0) {
      enemy.health = 0;
      enemy.aiState = 'DEATH';
      enemy.deathTimer = 0.55;
      enemy.vx = 0;
      enemy.vy = 0;
      enemy.anim.play('death');

      soundManager.playEnemyDeath();
      this.sparks += COMBAT_CONFIG.SPARK_VALUE;
      if (!(this.isAttacking && this.attackState === 'cyclone')) {
        const meterBonus = (this.level - 1) * 3;
        this.skillMeter = Math.min(COMBAT_CONFIG.MAX_SKILL_METER, this.skillMeter + 25 + meterBonus);
      }

      const isBoss = Boolean(ENEMY_SPRITE_MANIFEST[enemy.type]?.isBoss);
      const killXp = isBoss
        ? 150
        : enemy.isSplitMini
        ? 20
        : Math.max(35, enemy.maxHealth * 12);
      this.gainXp(killXp, enemy.x, enemy.y - 34);

      for (let i = 0; i < 14; i++) {
        this.particles.push({
          x: enemy.x,
          y: enemy.y - 14,
          vx: (Math.random() - 0.5) * 100,
          vy: (Math.random() - 0.5) * 100,
          size: 3,
          color: '#fbbf24',
          alpha: 1,
          life: 0.45,
          maxLife: 0.45,
        });
      }

      if (this.currentLevel.hasBoss && enemy.type === this.currentLevel.bossType) {
        this.onBossDefeated();
      }
    } else {
      // Non-lethal damage: bosses use hit-flash poise so they don't get stun-locked or flicker animations
      const isBoss = Boolean(ENEMY_SPRITE_MANIFEST[enemy.type]?.isBoss);
      if (!isBoss) {
        enemy.aiState = 'HURT';
        enemy.hurtTimer = 0.24;
        enemy.vx = 0;
        enemy.anim.play('hurt');
      }
    }
  }

  private onBossDefeated() {
    this.bossCurrentHealth = 0;
    this.isBeaconLit = true;
    this.triggerScreenShake(0.8, 8);
    soundManager.playBeaconIgnite();

    if (this.currentLevel.victoryDialogue && this.currentLevel.victoryDialogue.length > 0) {
      this.callbacks.onDialogueTrigger({
        id: `${this.currentZoneId}_victory`,
        lines: this.currentLevel.victoryDialogue,
        onCompleteAction: 'COMPLETE_ZONE',
      });
    }
  }

  public completeZone() {
    const zoneOrder: ZoneId[] = [
      'prologue_forge',
      'zone1_meadow',
      'zone2_hills',
      'zone3_woods',
      'zone4_caves',
      'zone5_river',
      'zone6_summit',
    ];
    const currentIndex = zoneOrder.indexOf(this.currentZoneId);
    if (currentIndex !== -1 && currentIndex < zoneOrder.length - 1) {
      const nextZone = zoneOrder[currentIndex + 1];
      this.loadZone(nextZone);
      this.saveCurrentProgress(nextZone);
      this.callbacks.onZoneComplete(nextZone);
      return;
    }

    if (this.currentZoneId === 'zone6_summit') {
      this.saveCurrentProgress('zone6_summit');
      this.callbacks.onDialogueTrigger({
        id: 'campaign_complete',
        lines: [
          {
            speaker: 'Blaze',
            portrait: 'blaze_happy',
            text: 'The Great Beacon is alight! Its crimson fire is piercing the Hush across all six districts!',
          },
          {
            speaker: 'Narrator',
            portrait: 'narrator',
            text: 'Blaze’s First Ember campaign is complete! You can revisit any Zone (1–6) from the Pause Menu or Bestiary Codex.',
          },
        ],
      });
    }
  }

  private damagePlayer(amount: number) {
    if (this.iframeTimer > 0 || this.isDashing) return;

    this.health = Math.max(0, this.health - amount);
    this.iframeTimer = BLAZE_PHYSICS.IFRAME_DURATION;
    this.playerHitFlashTimer = 0.2;
    this.blazeAnim.play('hurt');
    this.triggerScreenShake(0.35, 5);
    soundManager.playHit();
    this.addFloatingText(`-${amount}`, this.px, this.py - 25, '#ef4444');

    if (this.health <= 0) {
      this.handlePlayerDeath();
    }
  }

  public getAttackBonus(): number {
    return Math.floor((this.level - 1) / 2);
  }

  public getCycloneBonus(): number {
    return (this.level - 1) * 2;
  }

  public getEffectiveDashCooldown(): number {
    return Math.max(0.65, BLAZE_PHYSICS.DASH_COOLDOWN - (this.level - 1) * 0.05);
  }

  public getResetsRemaining(): number {
    return Math.max(0, COMBAT_CONFIG.MAX_RESETS_PER_RUN - this.runResetsUsed);
  }

  public resetCurrentZone(): boolean {
    const remaining = this.getResetsRemaining();
    if (remaining <= 0) {
      soundManager.playOverheat();
      this.addFloatingText('0/3 RUN RESETS LEFT!', this.px, this.py - 32, '#ef4444');
      return false;
    }

    this.runResetsUsed++;
    const afterRemaining = this.getResetsRemaining();
    this.health = this.maxHealth;
    this.loadZone(this.currentZoneId);
    this.addFloatingText(
      `RUN RESET USED (${afterRemaining}/${COMBAT_CONFIG.MAX_RESETS_PER_RUN} LEFT)`,
      this.px,
      this.py - 32,
      '#38bdf8'
    );
    this.saveCurrentProgress();
    return true;
  }

  public gainXp(amount: number, sourceX?: number, sourceY?: number) {
    if (this.level >= COMBAT_CONFIG.MAX_LEVEL) return;

    this.xp += amount;
    if (sourceX !== undefined && sourceY !== undefined && amount >= 10) {
      this.addFloatingText(`+${amount} XP`, sourceX, sourceY, '#fbbf24');
    }

    this.checkLevelUp();
  }

  private checkLevelUp() {
    while (this.xp >= this.maxXp && this.level < COMBAT_CONFIG.MAX_LEVEL) {
      this.xp -= this.maxXp;
      this.level++;
      this.maxXp =
        COMBAT_CONFIG.BASE_XP_TO_LEVEL + (this.level - 1) * COMBAT_CONFIG.XP_SCALE_PER_LEVEL;

      const prevMaxHp = this.maxHealth;
      this.maxHealth = COMBAT_CONFIG.MAX_HEALTH + Math.floor(this.level / 2) * 2;
      this.health = this.maxHealth;

      soundManager.playLevelUp();
      this.triggerScreenShake(0.45, 5);

      const gainedHeart = this.maxHealth > prevMaxHp;
      const upgradeSummary = gainedHeart
        ? `LV.${this.level}! +1 HEART & FULL HEAL!`
        : `LV.${this.level}! +ATK POWER & SPEED!`;

      this.levelUpNotification = upgradeSummary;
      this.levelUpBannerTimer = 4.0;
      this.addFloatingText(`LEVEL UP! LV.${this.level}`, this.px, this.py - 44, '#fde047');

      for (let i = 0; i < 28; i++) {
        const angle = (i / 28) * Math.PI * 2;
        const speed = 75 + Math.random() * 65;
        this.particles.push({
          x: this.px,
          y: this.py - 18,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 20,
          size: 3.5,
          color: i % 2 === 0 ? '#fde047' : '#fb7185',
          alpha: 1,
          life: 0.65,
          maxLife: 0.65,
        });
      }

      this.saveCurrentProgress();
    }

    if (this.level >= COMBAT_CONFIG.MAX_LEVEL) {
      this.xp = this.maxXp;
    }
  }

  private handlePlayerDeath() {
    this.blazeAnim.play('death');
    const remaining = this.getResetsRemaining();

    if (remaining > 0) {
      this.runResetsUsed++;
      const leftAfter = this.getResetsRemaining();
      this.addFloatingText(
        `FALLEN! (${leftAfter}/${COMBAT_CONFIG.MAX_RESETS_PER_RUN} RUN RESETS LEFT)`,
        this.px,
        this.py - 30,
        '#ef4444'
      );
      setTimeout(() => {
        this.health = this.maxHealth;
        this.px = this.currentLevel.spawnX;
        this.py = this.currentLevel.spawnY;
        this.pvx = 0;
        this.pvy = 0;
        this.iframeTimer = 2.0;
        this.blazeAnim.play('idle');
        this.saveCurrentProgress();
      }, 1000);
    } else {
      // All 3 total run resets exhausted: Full Run Reset back to start of campaign with fresh 3/3 resets
      this.runResetsUsed = 0;
      this.level = 1;
      this.xp = 0;
      this.maxXp = COMBAT_CONFIG.BASE_XP_TO_LEVEL;
      this.maxHealth = COMBAT_CONFIG.MAX_HEALTH;
      this.sparks = 0;
      this.skillMeter = 0;
      const restartZone: ZoneId =
        this.currentZoneId === 'prologue_forge' ? 'prologue_forge' : 'zone1_meadow';
      this.addFloatingText('0/3 RUN RESETS LEFT! FULL RUN RESET!', this.px, this.py - 32, '#ef4444');
      setTimeout(() => {
        this.health = this.maxHealth;
        this.loadZone(restartZone);
        this.iframeTimer = 2.0;
        this.blazeAnim.play('idle');
        this.saveCurrentProgress(restartZone);
      }, 1100);
    }
  }

  private saveCurrentProgress(targetZone?: ZoneId) {
    const saveData: GameSaveData = {
      version: 1,
      currentZone: targetZone ?? this.currentZoneId,
      checkpointId: `${this.currentZoneId}_beacon`,
      respawnX: this.currentLevel.beaconX - 20,
      respawnY: this.currentLevel.beaconY - 10,
      health: this.health,
      maxHealth: this.maxHealth,
      sparks: this.sparks,
      level: this.level,
      xp: this.xp,
      maxXp: this.maxXp,
      runResetsUsed: this.runResetsUsed,
      deaths: 0,
      elapsedTimeSeconds: 0,
      unlockedZones: ['prologue_forge', 'zone1_meadow'],
      completedZones: this.currentZoneId === 'zone1_meadow' && this.isBeaconLit ? ['prologue_forge', 'zone1_meadow'] : ['prologue_forge'],
      rescuedTravelerHills: this.hasRescuedTraveler,
      rescuedRetreatChildren: this.hasRescuedChildren,
      costumeVariant: this.costumeVariant,
      lastSavedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('emberline_save_v1', JSON.stringify(saveData));
      this.callbacks.onSaveState(saveData);
    } catch {
      // Fallback
    }
  }

  private triggerScreenShake(duration: number, intensity: number) {
    if (!this.settings.screenShake) return;
    this.screenShakeTime = duration;
    this.screenShakeIntensity = intensity;
  }

  private addFloatingText(text: string, x: number, y: number, color: string) {
    this.floatingTexts.push({
      id: Math.random(),
      text,
      x,
      y,
      vy: -25,
      color,
      alpha: 1,
      life: 0.8,
    });
  }

  // --- MAIN GAME LOOP ---

  private loop = (timestamp: number) => {
    if (!this.isRunning) return;

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    if (!this.isPaused) {
      // Handle Hit Freeze micro-pause
      if (this.hitFreezeTimer > 0) {
        this.hitFreezeTimer -= dt;
      } else {
        this.update(dt);
      }
    }
    this.render(timestamp / 1000);

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    if (this.iframeTimer > 0) this.iframeTimer -= dt;
    if (this.playerHitFlashTimer > 0) this.playerHitFlashTimer -= dt;
    if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= dt;
    if (this.screenShakeTime > 0) this.screenShakeTime -= dt;
    if (this.levelUpBannerTimer > 0) {
      this.levelUpBannerTimer -= dt;
      if (this.levelUpBannerTimer <= 0) {
        this.levelUpNotification = null;
      }
    }
    if (this.aldenParryTimer > 0) {
      this.aldenParryTimer -= dt;
      if (this.aldenParryTimer <= 0) this.isAldenParrying = false;
    }

    if (this.dummyHitWobble > 0) {
      this.dummyHitWobble -= dt;
      this.dummyHitReaction = Math.sin(this.dummyHitWobble * 35) * 5;
    } else {
      this.dummyHitReaction = 0;
    }

    // Update Dash Ghosts
    for (let i = this.dashGhosts.length - 1; i >= 0; i--) {
      this.dashGhosts[i].alpha -= dt * 3.5;
      if (this.dashGhosts[i].alpha <= 0) {
        this.dashGhosts.splice(i, 1);
      }
    }

    if (this.isDashing) {
      this.dashTimer -= dt;
      // Spawn trail ghost
      if (Math.random() < 0.4) {
        this.dashGhosts.push({
          x: this.px,
          y: this.py,
          facing: this.facing,
          alpha: 0.6,
          frameTime: performance.now() / 1000,
        });
      }
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.pvx = 0;
      }
    }

    if (this.isAttacking) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
      }
    }

    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= dt;
      if (this.comboResetTimer <= 0) this.comboStep = 0;
    }

    if (this.isOverheated) {
      this.overheatTimer -= dt;
      if (this.overheatTimer <= 0) {
        this.isOverheated = false;
        this.heatLevel = 0;
      }
    } else if (this.heatLevel > 0) {
      this.heatDecayTimer -= dt;
      if (this.heatDecayTimer <= 0) {
        this.heatLevel = Math.max(0, this.heatLevel - 1);
        this.heatDecayTimer = 0.5;
      }
    }

    // Player Movement & Gravity (FIX 1 & FIX 2)
    let moveDir = 0;
    if (this.keys['arrowleft'] || this.keys['a']) moveDir -= 1;
    if (this.keys['arrowright'] || this.keys['d']) moveDir += 1;

    if (!this.isDashing) {
      if (moveDir !== 0) {
        this.facing = moveDir as 1 | -1;
        this.pvx += moveDir * BLAZE_PHYSICS.ACCELERATION * dt;
        if (Math.abs(this.pvx) > BLAZE_PHYSICS.MOVE_SPEED) {
          this.pvx = moveDir * BLAZE_PHYSICS.MOVE_SPEED;
        }

        // Track Step 1 Movement
        if (this.tutorialStep === 1) {
          if (moveDir === -1) this.movedLeft = true;
          if (moveDir === 1) this.movedRight = true;
          if (this.movedLeft && this.movedRight) {
            this.tutorialStep = 2;
            this.callbacks.onDialogueTrigger({
              id: 'tut_step_2',
              lines: [
                {
                  speaker: 'Captain Alden',
                  portrait: 'alden',
                  text: 'Good footing! Now leap onto the eastern watchtower platform using [Space].',
                },
              ],
            });
          }
        }
      } else {
        // Immediate clean deceleration when movement input is released (FIX 2)
        if (Math.abs(this.pvx) > 15) {
          this.pvx -= Math.sign(this.pvx) * BLAZE_PHYSICS.DECELERATION * dt;
        } else {
          this.pvx = 0;
        }
      }

      // Continuous Gravity: pulls Blaze down to floor and platform surfaces (FIX 1)
      this.pvy += BLAZE_PHYSICS.GRAVITY * dt;
      if (this.pvy > 450) {
        this.pvy = 450; // Terminal fall velocity
      }
    }

    // Jump Logic
    if (this.isGrounded) {
      this.coyoteTimer = BLAZE_PHYSICS.COYOTE_TIME;
    } else {
      this.coyoteTimer -= dt;
    }

    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
    }

    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0 && !this.isDashing) {
      this.pvy = BLAZE_PHYSICS.JUMP_IMPULSE;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      soundManager.playJump();
    }

    // Resolve physics movement and collisions FIRST so grounded status is accurate (FIX 1 & FIX 3)
    this.resolveCollisions(dt);

    // Strict Animation State Hierarchy (FIX 4: 1.Death, 2.Hurt, 3.Skill, 4.Attack, 5.Dash, 6.Jump, 7.Fall, 8.Walk/Run, 9.Idle)
    let desiredState: BlazeAnimState = 'idle';

    if (this.health <= 0) {
      // 1. Death
      desiredState = 'death';
    } else if (this.playerHitFlashTimer > 0) {
      // 2. Hurt
      desiredState = 'hurt';
    } else if (this.isAttacking && this.attackState === 'cyclone') {
      // 3. Special skill (Crimson Cyclone)
      desiredState = 'skill';
    } else if (this.isAttacking) {
      // 4. Attack
      desiredState = this.attackState === 'slash2' ? 'attack2' : 'attack1';
    } else if (this.isDashing) {
      // 5. Dash
      desiredState = 'dash';
    } else if (!this.isGrounded) {
      // 6 & 7. Jump / Fall
      desiredState = this.pvy < 0 ? 'jump' : 'fall';
    } else if (moveDir !== 0 && Math.abs(this.pvx) > 110) {
      // 8. Run (grounded with active directional input)
      desiredState = 'run';
    } else if (moveDir !== 0 && Math.abs(this.pvx) > 5) {
      // 8. Walk (grounded with active directional input)
      desiredState = 'walk';
    } else {
      // 9. Idle (grounded, no directional input)
      desiredState = 'idle';
    }

    this.blazeAnim.play(desiredState);
    this.blazeAnim.update(dt);

    // Track Step 2 Jump onto Platform
    if (this.currentZoneId === 'prologue_forge' && this.tutorialStep === 2 && this.isGrounded && this.py <= 190) {
      this.hasJumpedPlatform = true;
      this.tutorialStep = 3;
      this.callbacks.onDialogueTrigger({
        id: 'tut_step_3',
        lines: [
          {
            speaker: 'Captain Alden',
            portrait: 'alden',
            text: 'Light on your feet. Draw Emberfang and practice your 3-hit Flame Slash combo [J] against the sparring dummy ahead.',
          },
        ],
      });
    }

    this.updateProjectiles(dt);
    this.updateEnemies(dt);
    this.updateParticles(dt);

    // Update ambient floating embers in Forge Gate
    for (const ember of this.ambientEmbers) {
      ember.x += ember.vx * dt;
      ember.y += ember.vy * dt;
      if (ember.y < 0) {
        ember.y = 260;
        ember.x = Math.random() * 1000;
      }
      if (ember.x > 1000) {
        ember.x = 0;
      }
    }

    // Camera Framing (Smoother look-ahead keeping Blaze prominent)
    const targetCamX = this.px - GAME_CANVAS.WIDTH * 0.38;
    this.cameraX += (targetCamX - this.cameraX) * 0.12;
    this.cameraX = Math.max(0, Math.min(this.currentLevel.width - GAME_CANVAS.WIDTH, this.cameraX));

    // Dynamic Single Active Objective Text for HUD
    let objectiveText = '';
    if (this.currentZoneId === 'prologue_forge') {
      if (this.prologuePhase === 'tutorial') {
        if (this.tutorialStep === 1) {
          objectiveText = 'Tutorial 1/7: Move left and right with [A] and [D] (or Arrow Keys)';
        } else if (this.tutorialStep === 2) {
          objectiveText = 'Tutorial 2/7: Leap onto the watchtower platform with [Space]';
        } else if (this.tutorialStep === 3) {
          objectiveText = 'Tutorial 3/7: Strike the wooden dummy with Flame Slash [J]';
        } else if (this.tutorialStep === 4) {
          objectiveText = 'Tutorial 4/7: Cast ranged Crescent Wave with [K] (Watch heat!)';
        } else if (this.tutorialStep === 5) {
          objectiveText = 'Tutorial 5/7: Perform Ember Dash burst with [Shift]';
        } else if (this.tutorialStep === 6) {
          objectiveText = `Tutorial 6/7: Spar with Alden! Land 3 parried strikes [J] (${this.sparHitsLanded}/3)`;
        } else if (this.tutorialStep >= 7) {
          objectiveText = 'Tutorial 7/7: Speak with Captain Alden on the ramparts [E]';
        }
      } else if (this.prologuePhase === 'hush_invading') {
        objectiveText = 'Hush Invasion: Defeat Mopes and rescue the child near the gate [E]';
      } else if (this.prologuePhase === 'ember_furnace') {
        objectiveText = 'Dying Hearth: Approach the furnace to receive the Crimson Ember [E]';
      }
    } else {
      const zoneObjectives: Record<string, string> = {
        zone1_meadow: 'Zone 1 — Forgotten Meadow: Defeat Mope, Split Mope, Briar Bud & Boss: The Great Mope',
        zone2_hills: 'Zone 2 — Hollow Hills: Defeat Gust Bat, Cliff Scrabbler, Gloom Runner & Boss: The Rolling Gloom',
        zone3_woods: 'Zone 3 — Weeping Woods: Defeat Thornling, Root Hound, Spore Wisp & Boss: Thornmother',
        zone4_caves: 'Zone 4 — Echoing Caves: Defeat Echo Bat, Spike Crawler, Hollow Drifter & Boss: Echo Maw',
        zone5_river: 'Zone 5 — Broken River: Defeat Raft Leech, Undertow Fry, Splash Mope & Boss: Undertow',
        zone6_summit: 'Zone 6 — Beacon Summit: Defeat Shadow Sentry, Ash Wisp, Beacon Husk & Boss: Blaze’s Shadow',
      };
      objectiveText = this.isBeaconLit
        ? 'Waystation Beacon Ignited! Press [E] at the beacon to advance to the next Zone.'
        : (zoneObjectives[this.currentZoneId] ?? this.currentLevel.name);
    }

    const bossNamesMap: Record<string, string> = {
      great_mope: 'THE GREAT MOPE',
      rolling_gloom: 'THE ROLLING GLOOM',
      thornmother: 'THE THORNMOTHER',
      echo_maw: 'THE ECHO MAW',
      undertow: 'THE UNDERTOW',
      blaze_shadow: 'BLAZE’S SHADOW',
    };

    this.callbacks.onStatsUpdate({
      health: this.health,
      maxHealth: this.maxHealth,
      skillMeter: this.skillMeter,
      heat: this.heatLevel,
      isOverheated: this.isOverheated,
      sparks: this.sparks,
      level: this.level,
      xp: this.xp,
      maxXp: this.maxXp,
      attackBonus: this.getAttackBonus(),
      resetsRemaining: this.getResetsRemaining(),
      maxResetsPerRun: COMBAT_CONFIG.MAX_RESETS_PER_RUN,
      levelUpNotification: this.levelUpNotification,
      dashCooldownRemaining: Math.max(0, this.dashCooldownTimer),
      bossHealth: this.currentLevel.hasBoss ? this.bossCurrentHealth : null,
      bossMaxHealth: this.currentLevel.hasBoss ? this.bossMaxHealth : null,
      bossName: this.currentLevel.bossType ? (bossNamesMap[this.currentLevel.bossType] ?? 'HUSH BOSS') : null,
      currentZone: this.currentZoneId,
      isBeaconLit: this.isBeaconLit,
      prologueObjective: objectiveText,
    });
  }

  private resolveCollisions(dt: number) {
    this.px += this.pvx * dt;
    if (this.px < 15) this.px = 15;
    if (this.px > this.currentLevel.width - 15) this.px = this.currentLevel.width - 15;

    const prevY = this.py;
    this.py += this.pvy * dt;
    this.isGrounded = false;

    for (let i = 0; i < this.platforms.length; i++) {
      const plat = this.platforms[i];
      // Blaze's body collider is 14px wide (±7px from center px)
      const horizontalOverlap = this.px + 7 >= plat.x && this.px - 7 <= plat.x + plat.width;

      if (horizontalOverlap) {
        // Landing on platform top surface from above or standing securely on top
        if (this.pvy >= 0 && prevY <= plat.y + 4 && this.py >= plat.y) {
          this.py = plat.y;
          this.pvy = 0;
          this.isGrounded = true;
          break;
        }
      }
    }

    if (this.py > GAME_CANVAS.HEIGHT + 40) {
      this.damagePlayer(1);
      this.px = this.currentLevel.spawnX;
      this.py = this.currentLevel.spawnY;
      this.pvy = 0;
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.lifetime += dt;

      // Dummy hit check for Crescent Wave
      if (p.type === 'crescent' && this.currentZoneId === 'prologue_forge') {
        const distDummy = Math.hypot(p.x - 175, p.y - 165);
        if (distDummy < 24) {
          this.dummyHitReaction = 6;
          this.dummyHitWobble = 0.25;
          soundManager.playHit();
          this.addFloatingText('HIT!', 175, 150, '#fda4af');
          p.lifetime = p.maxLifetime;
        }
      }

      if (p.type === 'crescent') {
        for (const enemy of this.enemies) {
          if (enemy.health <= 0 || enemy.aiState === 'DEATH') continue;
          const manifest = ENEMY_SPRITE_MANIFEST[enemy.type];
          const enemyRadius = (manifest?.hurtbox.width ?? 24) * 0.55;
          const centerOffsetY = (manifest?.hurtbox.height ?? 24) * 0.5;
          const dist = Math.hypot(p.x - enemy.x, p.y - (enemy.y - centerOffsetY));
          if (dist < p.radius + enemyRadius) {
            this.damageEnemy(enemy, p.damage);
            p.lifetime = p.maxLifetime;
            break;
          }
        }
      } else {
        // Enemy projectile hitting Blaze
        const distBlaze = Math.hypot(p.x - this.px, p.y - (this.py - 16));
        if (distBlaze < p.radius + 10) {
          this.damagePlayer(p.damage);
          p.lifetime = p.maxLifetime;
        }
      }

      if (p.lifetime >= p.maxLifetime) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private snapGroundEnemyToPlatform(enemy: ActiveEnemy, dt: number) {
    const manifest = ENEMY_SPRITE_MANIFEST[enemy.type];
    if (manifest?.isFlying) {
      // Flying enemy: maintain controlled hover height without gravity drop
      const targetY = enemy.hoverY ?? enemy.y;
      enemy.y += (targetY - enemy.y) * Math.min(1, dt * 6);
      enemy.vy = 0;
      return;
    }

    // Ground enemy: apply gravity if above platform and snap feet to platform top surface
    const prevY = enemy.y;
    enemy.vy = Math.min(420, (enemy.vy ?? 0) + BLAZE_PHYSICS.GRAVITY * dt);
    enemy.y += enemy.vy * dt;

    let landedPlatform: PlatformDef | null = null;
    for (const plat of this.platforms) {
      if (enemy.x + 8 >= plat.x && enemy.x - 8 <= plat.x + plat.width) {
        if (prevY <= plat.y + 8 && enemy.y >= plat.y) {
          enemy.y = plat.y;
          enemy.vy = 0;
          landedPlatform = plat;
          break;
        }
      }
    }

    // Keep ground enemies within the horizontal bounds of their current platform so they don't walk off ledges
    if (landedPlatform) {
      const minX = landedPlatform.x + 14;
      const maxX = landedPlatform.x + landedPlatform.width - 14;
      if (enemy.x < minX) {
        enemy.x = minX;
        enemy.vx = Math.abs(enemy.vx);
        enemy.facing = 1;
      } else if (enemy.x > maxX) {
        enemy.x = maxX;
        enemy.vx = -Math.abs(enemy.vx);
        enemy.facing = -1;
      }
    }
  }

  private updateEnemies(dt: number) {
    const fastChargers: EnemyType[] = [
      'gloom_runner',
      'root_hound',
      'cliff_scrabbler',
      'spike_crawler',
      'raft_leech',
      'undertow_fry',
      'shadow_sentry',
    ];
    const rangedCasterColors: Partial<Record<EnemyType, string>> = {
      mope: '#c084fc',
      briar_bud: '#f43f5e',
      gust_bat: '#60a5fa',
      spore_wisp: '#2dd4bf',
      echo_bat: '#c084fc',
      hollow_drifter: '#a78bfa',
      splash_mope: '#38bdf8',
      ash_wisp: '#fb923c',
    };

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const manifest = ENEMY_SPRITE_MANIFEST[enemy.type];
      const isBoss = Boolean(manifest?.isBoss);

      if (enemy.hitFlashTimer > 0) {
        enemy.hitFlashTimer = Math.max(0, enemy.hitFlashTimer - dt);
      }

      // 1. DEATH state: play full death animation before despawning
      if (enemy.aiState === 'DEATH' || enemy.health <= 0) {
        enemy.aiState = 'DEATH';
        enemy.vx = 0;
        enemy.anim.play('death');
        enemy.anim.update(dt);
        enemy.deathTimer -= dt;
        if (enemy.deathTimer <= 0) {
          this.enemies.splice(i, 1);
        }
        continue;
      }

      // 2. HURT state: brief hit-stun reaction before resuming behavior
      if (enemy.aiState === 'HURT') {
        enemy.vx = 0;
        enemy.anim.play('hurt');
        enemy.anim.update(dt);
        this.snapGroundEnemyToPlatform(enemy, dt);
        enemy.hurtTimer -= dt;
        if (enemy.hurtTimer <= 0) {
          enemy.aiState = 'IDLE';
          enemy.anim.play('idle');
        }
        continue;
      }

      enemy.stateTimer += dt;
      enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);

      const distToPlayer = Math.hypot(this.px - enemy.x, this.py - enemy.y);
      const isRanged = Boolean(rangedCasterColors[enemy.type]) || isBoss;
      const engageRange = isBoss ? 240 : 165;
      const attackTriggerRange = isBoss ? 190 : isRanged ? 135 : 42;

      // 3. ATTACK sequence (WINDUP -> ACTIVE -> RECOVERY)
      if (
        enemy.aiState === 'ATTACK_WINDUP' ||
        enemy.aiState === 'ATTACK_ACTIVE' ||
        enemy.aiState === 'ATTACK_RECOVERY'
      ) {
        enemy.vx = 0;
        enemy.anim.play('attack');
        enemy.anim.update(dt);
        enemy.attackPhaseTimer -= dt;

        if (enemy.aiState === 'ATTACK_WINDUP' && enemy.attackPhaseTimer <= 0) {
          enemy.aiState = 'ATTACK_ACTIVE';
          enemy.attackPhaseTimer = isBoss ? 0.28 : 0.20;
          enemy.hasDealtAttackDamage = false;
          if (isBoss) {
            this.bossIsTelegraphing = false;
            this.triggerScreenShake(0.35, 5);
          }
        } else if (enemy.aiState === 'ATTACK_ACTIVE') {
          if (!enemy.hasDealtAttackDamage) {
            enemy.hasDealtAttackDamage = true;

            if (isBoss) {
              const projColor =
                enemy.type === 'blaze_shadow'
                  ? '#f43f5e'
                  : enemy.type === 'thornmother'
                  ? '#ec4899'
                  : enemy.type === 'undertow'
                  ? '#38bdf8'
                  : '#c084fc';

              this.projectiles.push({
                id: ++this.projectileIdCounter,
                x: enemy.x + enemy.facing * 22,
                y: enemy.y - 20,
                vx: enemy.facing * 150,
                vy: 0,
                radius: 6,
                damage: 1,
                lifetime: 0,
                maxLifetime: 1.8,
                type: enemy.type === 'blaze_shadow' ? 'shadow_crescent' : 'mope_spit',
                color: projColor,
              });

              if (distToPlayer < 78) {
                this.damagePlayer(2);
              }
            } else if (rangedCasterColors[enemy.type]) {
              this.projectiles.push({
                id: ++this.projectileIdCounter,
                x: enemy.x + enemy.facing * 12,
                y: enemy.y - 14,
                vx: enemy.facing * 118,
                vy: 0,
                radius: 4,
                damage: 1,
                lifetime: 0,
                maxLifetime: 1.5,
                type: 'mope_spit',
                color: rangedCasterColors[enemy.type]!,
              });
            } else {
              // Active melee hitbox check only during ATTACK_ACTIVE
              const atkBox = manifest?.attackBox ?? { width: 22, height: 18, offsetX: 16, offsetY: -12 };
              const hitX = enemy.facing === 1 ? enemy.x + 2 : enemy.x - atkBox.width - 2;
              const hitY = enemy.y + atkBox.offsetY - atkBox.height / 2;
              const blazeLeft = this.px - 7;
              const blazeRight = this.px + 7;
              const blazeTop = this.py - 32;
              const blazeBottom = this.py;

              if (
                hitX < blazeRight &&
                hitX + atkBox.width > blazeLeft &&
                hitY < blazeBottom &&
                hitY + atkBox.height > blazeTop
              ) {
                this.damagePlayer(1);
              }
            }
          }

          if (enemy.attackPhaseTimer <= 0) {
            enemy.aiState = 'ATTACK_RECOVERY';
            enemy.attackPhaseTimer = isBoss ? 0.35 : 0.25;
          }
        } else if (enemy.aiState === 'ATTACK_RECOVERY' && enemy.attackPhaseTimer <= 0) {
          enemy.aiState = 'IDLE';
          enemy.attackCooldown = isBoss ? (enemy.type === 'blaze_shadow' ? 2.1 : 2.6) : isRanged ? 2.1 : 1.5;
          enemy.anim.play('idle');
        }

        this.snapGroundEnemyToPlatform(enemy, dt);
        continue;
      }

      // 4. Normal AI decision: IDLE / PATROL / CHASE
      const moveSpeed = isBoss
        ? enemy.type === 'blaze_shadow' || enemy.type === 'rolling_gloom'
          ? 52
          : 28
        : fastChargers.includes(enemy.type)
        ? 74
        : 44;

      if (distToPlayer <= engageRange) {
        // Horizontal deadband prevents rapid left/right flipping when Blaze is directly above/below
        if (Math.abs(this.px - enemy.x) > 14) {
          enemy.facing = this.px >= enemy.x ? 1 : -1;
        }

        const stopDistance = isBoss
          ? enemy.aiState === 'CHASE'
            ? 52
            : 72
          : isRanged
          ? enemy.aiState === 'CHASE'
            ? 65
            : 82
          : 26;

        if (distToPlayer <= attackTriggerRange && enemy.attackCooldown <= 0) {
          enemy.aiState = 'ATTACK_WINDUP';
          enemy.attackPhaseTimer = isBoss ? 0.50 : 0.26;
          enemy.vx = 0;
          enemy.anim.play('attack');
          if (isBoss) {
            this.bossIsTelegraphing = true;
            this.bossTelegraphTimer = enemy.attackPhaseTimer;
            soundManager.playBossTelegraph();
          }
        } else if (distToPlayer > stopDistance) {
          enemy.aiState = 'CHASE';
          enemy.vx = enemy.facing * moveSpeed;
        } else {
          enemy.aiState = 'IDLE';
          enemy.vx = 0;
        }
      } else {
        // Patrol near spawnX with periodic idle pauses so enemies don't walk in place
        const anchorX = enemy.spawnX ?? enemy.x;
        const cycle = enemy.stateTimer % 4.2;
        if (cycle < 1.2) {
          enemy.aiState = 'IDLE';
          enemy.vx = 0;
        } else {
          enemy.aiState = 'PATROL';
          const patrolSpeed = moveSpeed * 0.55;
          if (enemy.x > anchorX + 42) {
            enemy.facing = -1;
          } else if (enemy.x < anchorX - 42) {
            enemy.facing = 1;
          } else if (Math.abs(enemy.vx) < 1) {
            enemy.facing = cycle < 2.7 ? -1 : 1;
          }
          enemy.vx = enemy.facing * patrolSpeed;
        }
      }

      // Apply horizontal movement
      enemy.x += enemy.vx * dt;
      enemy.x = Math.max(55, Math.min(this.currentLevel.width - 55, enemy.x));
      this.snapGroundEnemyToPlatform(enemy, dt);

      // Drive animation strictly from actual movement & AI state (never walk while stationary)
      if (Math.abs(enemy.vx) > 2 && (enemy.aiState === 'PATROL' || enemy.aiState === 'CHASE')) {
        enemy.anim.play('move');
      } else {
        enemy.anim.play('idle');
      }

      enemy.anim.update(dt);
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      ft.alpha = Math.max(0, ft.life / 0.8);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // --- RENDERING ---

  private render(time: number) {
    this.ctx.save();

    if (this.screenShakeTime > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.screenShakeIntensity;
      this.ctx.translate(shakeX, shakeY);
    }

    this.ctx.fillStyle = '#07080d';
    this.ctx.fillRect(0, 0, GAME_CANVAS.WIDTH, GAME_CANVAS.HEIGHT);

    this.ctx.translate(-Math.round(this.cameraX), 0);

    // 1. Layered Parallax Background
    this.drawBackground(time);

    // 2. Environmental Props (Furnaces, Torches, Banners, Training Dummies)
    this.drawProps(time);

    // 3. Platforms & Cobblestones
    this.drawPlatforms(time);

    // 4. Waystation Beacon
    drawWaystationBeacon(
      this.ctx,
      this.currentLevel.beaconX,
      this.currentLevel.beaconY,
      this.isBeaconLit,
      time
    );

    // 5. Captain Alden in Forge Gate
    if (this.currentZoneId === 'prologue_forge') {
      const aldenAction = this.isAldenParrying ? 'spar_block' : 'idle';
      drawCaptainAlden(this.ctx, 280, 232, this.isAldenHushed, -1, aldenAction, time);

      if (this.prologuePhase === 'tutorial') {
        this.ctx.fillStyle = '#38bdf8';
        this.ctx.font = 'bold 8px monospace';
        if (this.tutorialStep === 6) {
          this.ctx.fillText(`SPAR [J] (${this.sparHitsLanded}/3)`, 245, 195);
        } else if (this.tutorialStep >= 7) {
          this.ctx.fillText('TALK [E]', 265, 195);
        }
      } else if (this.isAldenHushed) {
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '8px monospace';
        this.ctx.fillText('FROZEN IN STONE', 235, 195);
      }

      // Courtyard Child in trouble
      if (this.prologuePhase === 'hush_invading' && !this.hasSavedCourtyardChild) {
        this.ctx.fillStyle = '#fed7aa';
        this.ctx.fillRect(576, 218, 8, 14);
        this.ctx.fillStyle = '#38bdf8';
        this.ctx.fillRect(576, 222, 8, 8);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '8px monospace';
        this.ctx.fillText('RESCUE [E]', 565, 210);
      }

      // Dying Hearth / Crimson Ember interactive beacon prompt
      if (this.prologuePhase === 'ember_furnace' && !this.hasTakenCrimsonEmber) {
        const furnaceX = 860;
        const furnaceY = 232;
        const bob = Math.sin(time * 5) * 3;

        // Glowing quest prompt banner
        this.ctx.fillStyle = '#f43f5e';
        this.ctx.font = 'bold 8px monospace';
        this.ctx.fillText('✦ DYING HEARTH ✦', furnaceX - 38, furnaceY - 60 + bob);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('TAKE EMBER [E]', furnaceX - 32, furnaceY - 50 + bob);

        // Bouncing pink triangle arrow pointing down to hearth
        this.ctx.fillStyle = '#fda4af';
        this.ctx.beginPath();
        this.ctx.moveTo(furnaceX, furnaceY - 38 + bob);
        this.ctx.lineTo(furnaceX - 5, furnaceY - 45 + bob);
        this.ctx.lineTo(furnaceX + 5, furnaceY - 45 + bob);
        this.ctx.closePath();
        this.ctx.fill();
      }
    }

    // 6. Dash Ghost Trails
    for (const ghost of this.dashGhosts) {
      this.ctx.save();
      this.ctx.globalAlpha = ghost.alpha * 0.45;
      this.blazeAnim.render(
        this.ctx,
        ghost.x,
        ghost.y,
        ghost.facing,
        false
      );
      this.ctx.restore();
    }

    // 7. Blaze Official Pixel-Art Sprite
    if (this.iframeTimer <= 0 || Math.floor(time * 16) % 2 === 0) {
      this.blazeAnim.render(
        this.ctx,
        this.px,
        this.py,
        this.facing,
        this.playerHitFlashTimer > 0
      );
    }

    // 8. Enemies & Bosses (18 Zone Minions + 6 Zone Bosses)
    const bossTypes = ['great_mope', 'rolling_gloom', 'thornmother', 'echo_maw', 'undertow', 'blaze_shadow'];
    const displayNames: Record<string, string> = {
      mope: 'MOPE',
      split_mope: 'SPLIT MOPE',
      briar_bud: 'BRIAR BUD',
      gust_bat: 'GUST BAT',
      cliff_scrabbler: 'CLIFF SCRABBLER',
      gloom_runner: 'GLOOM RUNNER',
      thornling: 'THORNLING',
      root_hound: 'ROOT HOUND',
      spore_wisp: 'SPORE WISP',
      echo_bat: 'ECHO BAT',
      spike_crawler: 'SPIKE CRAWLER',
      hollow_drifter: 'HOLLOW DRIFTER',
      raft_leech: 'RAFT LEECH',
      undertow_fry: 'UNDERTOW FRY',
      splash_mope: 'SPLASH MOPE',
      shadow_sentry: 'SHADOW SENTRY',
      ash_wisp: 'ASH WISP',
      beacon_husk: 'BEACON HUSK',
      great_mope: 'THE GREAT MOPE',
      rolling_gloom: 'THE ROLLING GLOOM',
      thornmother: 'THORNMOTHER',
      echo_maw: 'ECHO MAW',
      undertow: 'UNDERTOW',
      blaze_shadow: 'BLAZE’S SHADOW',
    };

    for (const enemy of this.enemies) {
      const hpPercent = Math.max(0, enemy.health / enemy.maxHealth);
      const deathAlpha =
        enemy.aiState === 'DEATH' ? Math.max(0, enemy.deathTimer / 0.55) : 1;

      const renderedOfficial = enemy.anim.render(
        this.ctx,
        enemy.x,
        enemy.y,
        enemy.facing,
        enemy.hitFlashTimer > 0,
        deathAlpha
      );

      if (bossTypes.includes(enemy.type)) {
        if (!renderedOfficial) {
          drawBoss(
            this.ctx,
            enemy.type as any,
            enemy.x,
            enemy.y,
            hpPercent,
            time,
            this.bossIsTelegraphing,
            enemy.facing
          );
        }

        if (enemy.aiState !== 'DEATH') {
          // Overhead Boss Title, State Tag & HP Bar
          const bossLabel = displayNames[enemy.type] ?? 'BOSS';
          const stateTag =
            enemy.aiState === 'HURT'
              ? 'HURT'
              : enemy.aiState === 'ATTACK_WINDUP' || enemy.aiState === 'ATTACK_ACTIVE'
              ? enemy.type === 'great_mope'
                ? 'ORB ATTACK'
                : enemy.type === 'rolling_gloom'
                ? 'SURGE'
                : enemy.type === 'thornmother'
                ? 'ROOT SWEEP'
                : enemy.type === 'echo_maw'
                ? 'SONIC CRY'
                : enemy.type === 'undertow'
                ? 'BREACHED'
                : 'CYCLONE'
              : enemy.hasSplit && enemy.type === 'great_mope'
              ? 'SPLIT'
              : enemy.aiState;

          this.ctx.save();
          this.ctx.font = 'bold 7px monospace';
          this.ctx.textAlign = 'center';
          this.ctx.fillStyle = '#fdf4ff';
          this.ctx.fillText(`★ ${bossLabel} [${stateTag}] ★`, enemy.x, enemy.y - 68);

          // Boss overhead health bar
          const barW = 54;
          this.ctx.fillStyle = '#090a0f';
          this.ctx.fillRect(enemy.x - barW / 2 - 1, enemy.y - 64, barW + 2, 5);
          this.ctx.fillStyle = '#ec4899';
          this.ctx.fillRect(enemy.x - barW / 2, enemy.y - 63, barW * hpPercent, 3);
          this.ctx.restore();
        }
      } else {
        if (!renderedOfficial) {
          const isEnemyAttacking =
            enemy.aiState === 'ATTACK_WINDUP' || enemy.aiState === 'ATTACK_ACTIVE';
          drawEnemy(
            this.ctx,
            enemy.type as EnemyType,
            enemy.x,
            enemy.y,
            time,
            enemy.facing,
            isEnemyAttacking,
            hpPercent
          );
        }

        if (enemy.aiState !== 'DEATH') {
          // Overhead Minion Nameplate & HP Bar
          const label = displayNames[enemy.type] ?? enemy.type.toUpperCase();
          this.ctx.save();
          this.ctx.font = 'bold 6px monospace';
          this.ctx.textAlign = 'center';
          this.ctx.fillStyle = '#e9d5ff';
          this.ctx.fillText(label, enemy.x, enemy.y - 38);

          const barW = 24;
          this.ctx.fillStyle = '#090a0f';
          this.ctx.fillRect(enemy.x - barW / 2 - 1, enemy.y - 35, barW + 2, 3.5);
          this.ctx.fillStyle = '#a855f7';
          this.ctx.fillRect(enemy.x - barW / 2, enemy.y - 34.5, barW * hpPercent, 2.5);
          this.ctx.restore();
        }
      }
    }

    // 9. Sparks
    for (const spark of this.currentLevel.sparks) {
      if (this.collectedSparks.has(spark.id)) continue;
      if (Math.hypot(this.px - spark.x, this.py - spark.y) < 22) {
        this.collectedSparks.add(spark.id);
        this.sparks += COMBAT_CONFIG.SPARK_VALUE;
        this.skillMeter = Math.min(COMBAT_CONFIG.MAX_SKILL_METER, this.skillMeter + 10);
        soundManager.playSpark();
        continue;
      }

      const floatY = Math.sin(time * 6 + spark.id) * 3;
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.beginPath();
      this.ctx.arc(spark.x, spark.y + floatY, 3, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
      this.ctx.beginPath();
      this.ctx.arc(spark.x, spark.y + floatY, 6, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 10. Projectiles
    for (const p of this.projectiles) {
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Crescent trail
      this.ctx.fillStyle = 'rgba(244, 63, 94, 0.3)';
      this.ctx.beginPath();
      this.ctx.arc(p.x - (p.vx > 0 ? 6 : -6), p.y, p.radius * 0.7, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 11. Particles & Floating Embers
    for (const part of this.particles) {
      this.ctx.fillStyle = part.color;
      this.ctx.globalAlpha = part.alpha;
      this.ctx.fillRect(part.x, part.y, part.size, part.size);
    }
    this.ctx.globalAlpha = 1.0;

    for (const ft of this.floatingTexts) {
      this.ctx.fillStyle = ft.color;
      this.ctx.globalAlpha = ft.alpha;
      this.ctx.font = 'bold 9px monospace';
      this.ctx.fillText(ft.text, ft.x - 10, ft.y);
    }
    this.ctx.globalAlpha = 1.0;

    // 12. Physics Debug Overlay (FIX 1)
    if (this.showPhysicsDebug) {
      this.drawPhysicsDebug();
    }

    this.ctx.restore();
  }

  private drawBackground(time: number) {
    const bgFarParallax = this.cameraX * 0.15;
    const bgMidParallax = this.cameraX * 0.35;

    if (this.currentZoneId === 'prologue_forge') {
      // Sky Gradient: warm sunset amber fading to deep night
      const skyGrad = this.ctx.createLinearGradient(0, 0, 0, 270);
      if (this.prologuePhase === 'tutorial') {
        skyGrad.addColorStop(0, '#0f172a');
        skyGrad.addColorStop(0.6, '#1e1b4b');
        skyGrad.addColorStop(1, '#31102b');
      } else {
        // Cold Hush night
        skyGrad.addColorStop(0, '#020617');
        skyGrad.addColorStop(0.6, '#0f172a');
        skyGrad.addColorStop(1, '#1e1b4b');
      }
      this.ctx.fillStyle = skyGrad;
      this.ctx.fillRect(this.cameraX, 0, GAME_CANVAS.WIDTH, GAME_CANVAS.HEIGHT);

      // Layer 1 (Far): Mountain range & Great Beacon on distant summit
      this.ctx.fillStyle = '#1e1b2e';
      this.ctx.beginPath();
      this.ctx.moveTo(this.cameraX, 160);
      for (let x = 0; x <= GAME_CANVAS.WIDTH; x += 40) {
        this.ctx.lineTo(this.cameraX + x, 130 + Math.sin((x + bgFarParallax) * 0.015) * 35);
      }
      this.ctx.lineTo(this.cameraX + GAME_CANVAS.WIDTH, 270);
      this.ctx.lineTo(this.cameraX, 270);
      this.ctx.closePath();
      this.ctx.fill();

      // Great Beacon atop summit (lit during tutorial, dead during invasion)
      if (this.prologuePhase === 'tutorial') {
        const flicker = Math.sin(time * 16) * 3;
        const bX = 680 - bgFarParallax;
        const bY = 65;
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.beginPath();
        this.ctx.arc(bX, bY, 8 + flicker, 0, Math.PI * 2);
        this.ctx.fill();

        const bGlow = this.ctx.createRadialGradient(bX, bY, 2, bX, bY, 35);
        bGlow.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
        bGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        this.ctx.fillStyle = bGlow;
        this.ctx.beginPath();
        this.ctx.arc(bX, bY, 35, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Layer 2 (Mid): Forge Gate watchtowers, masonry spires, and furnace chimneys
      this.ctx.fillStyle = '#181824';
      for (let i = 0; i < 9; i++) {
        const tx = i * 130 - (bgMidParallax % 130);
        // Tower body
        this.ctx.fillRect(tx, 100, 48, 132);
        // Battlements
        this.ctx.fillRect(tx - 4, 96, 56, 6);
        this.ctx.fillRect(tx - 4, 90, 10, 6);
        this.ctx.fillRect(tx + 18, 90, 12, 6);
        this.ctx.fillRect(tx + 42, 90, 10, 6);

        // Lit Amber Windows
        if (this.prologuePhase === 'tutorial') {
          this.ctx.fillStyle = '#fbbf24';
          this.ctx.fillRect(tx + 12, 120, 6, 9);
          this.ctx.fillRect(tx + 30, 120, 6, 9);
          this.ctx.fillStyle = '#181824';
        }
      }

      // Floating Ambient Embers in air
      for (const ember of this.ambientEmbers) {
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.globalAlpha = ember.alpha;
        this.ctx.fillRect(ember.x, ember.y, ember.size, ember.size);
      }
      this.ctx.globalAlpha = 1.0;
    } else {
      // Zones 1–6 Themed Parallax Landscapes matching the Official Sheet Headers
      const palettes: Record<string, { top: string; mid: string; ridge: string; accent: string }> = {
        zone1_meadow: {
          top: this.isBeaconLit ? '#064e3b' : '#1e1035',
          mid: this.isBeaconLit ? '#047857' : '#3b0764',
          ridge: this.isBeaconLit ? '#065f46' : '#2e1065',
          accent: '#ec4899',
        },
        zone2_hills: {
          top: '#0f172a',
          mid: '#1e293b',
          ridge: '#1e1b4b',
          accent: '#60a5fa',
        },
        zone3_woods: {
          top: '#022c22',
          mid: '#064e3b',
          ridge: '#0f2922',
          accent: '#2dd4bf',
        },
        zone4_caves: {
          top: '#0f0720',
          mid: '#2e1065',
          ridge: '#1e1b4b',
          accent: '#c084fc',
        },
        zone5_river: {
          top: '#082f49',
          mid: '#0c4a6e',
          ridge: '#0f172a',
          accent: '#38bdf8',
        },
        zone6_summit: {
          top: '#1f0812',
          mid: '#4c0519',
          ridge: '#270915',
          accent: '#f43f5e',
        },
      };

      const pal = palettes[this.currentZoneId] ?? palettes.zone1_meadow;
      const skyGrad = this.ctx.createLinearGradient(0, 0, 0, 270);
      skyGrad.addColorStop(0, pal.top);
      skyGrad.addColorStop(1, pal.mid);
      this.ctx.fillStyle = skyGrad;
      this.ctx.fillRect(this.cameraX, 0, GAME_CANVAS.WIDTH, GAME_CANVAS.HEIGHT);

      // Distant glowing moon / crystal / citadel beacon
      this.ctx.fillStyle = pal.accent;
      this.ctx.globalAlpha = 0.28;
      this.ctx.beginPath();
      this.ctx.arc(this.cameraX + 340 - bgFarParallax * 0.3, 68, 26, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;

      // Far ridge / ruins silhouette
      this.ctx.fillStyle = pal.ridge;
      this.ctx.beginPath();
      this.ctx.moveTo(this.cameraX, 200);
      for (let x = 0; x <= GAME_CANVAS.WIDTH; x += 50) {
        this.ctx.lineTo(this.cameraX + x, 165 + Math.sin((x + bgFarParallax) * 0.02) * 22);
      }
      this.ctx.lineTo(this.cameraX + GAME_CANVAS.WIDTH, 270);
      this.ctx.lineTo(this.cameraX, 270);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }

  private drawProps(time: number) {
    if (!this.currentLevel.props) return;

    for (const prop of this.currentLevel.props) {
      if (prop.type === 'torch') {
        drawTorch(this.ctx, prop.x, prop.y, time);
      } else if (prop.type === 'furnace') {
        const isDyingHearth = this.currentZoneId === 'prologue_forge' && prop.x > 800;
        const hasCrimsonEmber = isDyingHearth && this.prologuePhase === 'ember_furnace' && !this.hasTakenCrimsonEmber;
        const isLit = this.prologuePhase === 'tutorial' || isDyingHearth;
        drawForgeFurnace(this.ctx, prop.x, prop.y, time, isLit, hasCrimsonEmber);
      } else if (prop.type === 'banner') {
        drawFestivalBanner(this.ctx, prop.x, prop.y, time);
      } else if (prop.type === 'dummy') {
        drawTrainingDummy(this.ctx, prop.x, prop.y, this.dummyHitReaction);
      }
    }
  }

  private drawPlatforms(time: number) {
    this.platforms.forEach((plat) => {
      // Detailed medieval cobblestone masonry
      this.ctx.fillStyle = '#1e293b';
      this.ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

      // Top Stone Cap with mortar joints
      this.ctx.fillStyle = this.isBeaconLit && this.currentZoneId === 'zone1_meadow' ? '#10b981' : '#334155';
      this.ctx.fillRect(plat.x, plat.y, plat.width, 4);

      // Brick texture detailing
      this.ctx.fillStyle = '#0f172a';
      for (let bx = plat.x; bx < plat.x + plat.width; bx += 24) {
        this.ctx.fillRect(bx, plat.y + 4, 1, plat.height - 4);
      }
    });
  }

  /**
   * Temporary Physics Debug Overlay (FIX 1)
   * Displays platform collision lines, Blaze's 14x32 physics collider,
   * foot ground contact point, and real-time state telemetry.
   * Can be toggled on/off at runtime using key [P].
   */
  private drawPhysicsDebug() {
    this.ctx.save();

    // 1. Draw all platform collision boundaries & top landing surfaces
    for (const plat of this.platforms) {
      // Platform bounding rectangle (semi-transparent green outline)
      this.ctx.strokeStyle = 'rgba(34, 197, 94, 0.45)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);

      // Top landing surface (bright solid cyan line)
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(plat.x, plat.y);
      this.ctx.lineTo(plat.x + plat.width, plat.y);
      this.ctx.stroke();

      // Platform coordinate label
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.font = '7px monospace';
      this.ctx.fillText(`Y:${plat.y}`, plat.x + 2, plat.y - 3);
    }

    // 2. Draw Blaze's Physics Collision Body (14px wide x 32px tall, centered at px, anchored at py)
    const bodyW = 14;
    const bodyH = 32;
    const bodyX = this.px - bodyW / 2;
    const bodyY = this.py - bodyH;

    // Body bounding box (bright green)
    this.ctx.strokeStyle = '#22c55e';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(bodyX, bodyY, bodyW, bodyH);

    // Foot contact baseline (bright red/magenta crossbar at ground contact)
    this.ctx.strokeStyle = '#f43f5e';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.px - 10, this.py);
    this.ctx.lineTo(this.px + 10, this.py);
    this.ctx.stroke();

    // Center pivot point dot
    this.ctx.fillStyle = '#f43f5e';
    this.ctx.beginPath();
    this.ctx.arc(this.px, this.py, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Telemetry text directly above Blaze
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.font = 'bold 8px monospace';
    this.ctx.fillText(`Blaze (${Math.round(this.px)}, ${Math.round(this.py)})`, this.px - 28, bodyY - 14);

    this.ctx.fillStyle = this.isGrounded ? '#4ade80' : '#f87171';
    this.ctx.fillText(
      `Grounded: ${this.isGrounded ? 'YES' : 'NO'} | ${this.blazeAnim.currentState}`,
      this.px - 34,
      bodyY - 5
    );

    // 3. Draw Enemy Hurtboxes, Foot/Hover Anchors, Active Attack Hitboxes & AI State Telemetry
    for (const enemy of this.enemies) {
      const manifest = ENEMY_SPRITE_MANIFEST[enemy.type];
      const hbW = manifest?.hurtbox.width ?? 22;
      const hbH = manifest?.hurtbox.height ?? 24;
      const hbX = enemy.x - hbW / 2;
      const hbY = enemy.y - hbH;

      // Hurtbox outline (amber/purple)
      this.ctx.strokeStyle = enemy.aiState === 'DEATH' ? '#64748b' : '#c084fc';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(hbX, hbY, hbW, hbH);

      // Anchor point dot at (enemy.x, enemy.y)
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.beginPath();
      this.ctx.arc(enemy.x, enemy.y, 2, 0, Math.PI * 2);
      this.ctx.fill();

      // Active attack hitbox (red) when in ATTACK_ACTIVE
      if (enemy.aiState === 'ATTACK_ACTIVE' && manifest?.attackBox) {
        const atk = manifest.attackBox;
        const atkX = enemy.facing === 1 ? enemy.x + 2 : enemy.x - atk.width - 2;
        const atkY = enemy.y + atk.offsetY - atk.height / 2;
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(atkX, atkY, atk.width, atk.height);
      }

      // AI + Anim state label
      this.ctx.fillStyle = '#fde047';
      this.ctx.font = '6px monospace';
      this.ctx.fillText(
        `${enemy.aiState} (${enemy.anim.currentState})`,
        enemy.x - 22,
        hbY - 2
      );
    }

    // Screen HUD debug indicator in top-right (below React HUD buttons)
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.ctx.fillRect(this.cameraX + GAME_CANVAS.WIDTH - 175, 26, 170, 16);
    this.ctx.strokeStyle = '#22c55e';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(this.cameraX + GAME_CANVAS.WIDTH - 175, 26, 170, 16);
    this.ctx.fillStyle = '#4ade80';
    this.ctx.font = 'bold 8px monospace';
    this.ctx.fillText('PHYSICS DEBUG: ON [P: toggle]', this.cameraX + GAME_CANVAS.WIDTH - 168, 37);

    this.ctx.restore();
  }
}
