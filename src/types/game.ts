/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ZoneId = 
  | 'prologue_forge'
  | 'zone1_meadow'
  | 'zone2_hills'
  | 'zone3_woods'
  | 'zone4_caves'
  | 'zone5_river'
  | 'zone5_retreat'
  | 'zone6_summit'
  | 'epilogue_dawn';

export type EnemyType =
  // Zone 1: Forgotten Meadow
  | 'mope'
  | 'split_mope'
  | 'briar_bud'
  | 'great_mope'
  // Zone 2: Hollow Hills
  | 'gust_bat'
  | 'cliff_scrabbler'
  | 'gloom_runner'
  | 'rolling_gloom'
  // Zone 3: Weeping Woods
  | 'thornling'
  | 'root_hound'
  | 'spore_wisp'
  | 'thornmother'
  // Zone 4: Echoing Caves
  | 'echo_bat'
  | 'spike_crawler'
  | 'hollow_drifter'
  | 'echo_maw'
  // Zone 5: Broken River
  | 'raft_leech'
  | 'undertow_fry'
  | 'splash_mope'
  | 'undertow'
  // Zone 6: Beacon Summit
  | 'shadow_sentry'
  | 'ash_wisp'
  | 'beacon_husk'
  | 'blaze_shadow';

export interface BestiaryEntry {
  id: EnemyType;
  name: string;
  category: 'minion' | 'boss';
  zoneNumber: number;
  zoneName: string;
  tagline: string;
  description: string;
  states: string[];
  attackName: string;
  themeColor: string;
}

export interface HeroProfile {
  id: string;
  name: string;
  district: string;
  title: string;
  weapon: string;
  status: 'PLAYABLE' | 'LOCKED_FUTURE';
  visualCue: string;
  lore: string;
  color: string;
  accentHex: string;
}

export interface DialogueLine {
  speaker: string;
  portrait:
    | 'blaze_neutral'
    | 'blaze_happy'
    | 'blaze_angry'
    | 'blaze_surprised'
    | 'blaze_sad'
    | 'blaze_determined'
    | 'blaze_normal'
    | 'blaze_smile'
    | 'blaze_confident'
    | 'alden'
    | 'shadow'
    | 'child'
    | 'traveler'
    | 'beacon'
    | 'narrator';
  text: string;
}

export interface DialogueSequence {
  id: string;
  lines: DialogueLine[];
  onCompleteAction?: 'NEXT_PHASE' | 'START_BOSS' | 'COMPLETE_ZONE' | 'CLOSE';
}

export interface GameSaveData {
  version: number;
  currentZone: ZoneId;
  checkpointId: string;
  respawnX: number;
  respawnY: number;
  health: number;
  maxHealth: number;
  sparks: number;
  level: number;
  xp: number;
  maxXp: number;
  runResetsUsed?: number;
  deaths: number;
  elapsedTimeSeconds: number;
  unlockedZones: ZoneId[];
  completedZones: ZoneId[];
  rescuedTravelerHills: boolean;
  rescuedRetreatChildren: boolean;
  costumeVariant: 'default' | 'crimson_rescuer';
  lastSavedAt: string;
}

export interface HUDStats {
  health: number;
  maxHealth: number;
  skillMeter: number;
  heat: number;
  isOverheated: boolean;
  sparks: number;
  level: number;
  xp: number;
  maxXp: number;
  attackBonus: number;
  resetsRemaining: number;
  maxResetsPerRun: number;
  levelUpNotification: string | null;
  dashCooldownRemaining: number;
  bossHealth: number | null;
  bossMaxHealth: number | null;
  bossName: string | null;
  currentZone: ZoneId;
  isBeaconLit: boolean;
  prologueObjective?: string;
}

export interface GameSettings {
  sfxVolume: number; // 0 to 1
  bgmVolume: number; // 0 to 1
  screenShake: boolean;
  showTouchControls: boolean;
  highContrast: boolean;
  subtitleSize: 'normal' | 'large';
}

export interface AttackHitbox {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  knockbackX: number;
  knockbackY: number;
  source: 'blaze' | 'enemy' | 'hazard';
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  lifetime: number;
  maxLifetime: number;
  type: 'crescent' | 'mope_spit' | 'echo_wave' | 'thorn_needle' | 'shadow_crescent';
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
}
