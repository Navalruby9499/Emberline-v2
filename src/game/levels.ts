/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ZoneId, DialogueLine, EnemyType } from '../types/game';

export interface PlatformDef {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: 'solid' | 'crumble' | 'moving' | 'raft' | 'hazard_spike';
  moveRange?: number;
  moveSpeed?: number;
}

export interface EnemyDef {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  maxHealth: number;
}

export interface SparkDef {
  id: number;
  x: number;
  y: number;
  collected?: boolean;
}

export interface PropDef {
  type: 'torch' | 'furnace' | 'banner' | 'dummy';
  x: number;
  y: number;
}

export interface LevelConfig {
  id: ZoneId;
  name: string;
  subtitle: string;
  lesson: string;
  width: number;
  height: number;
  spawnX: number;
  spawnY: number;
  beaconX: number;
  beaconY: number;
  beaconLine: string;
  platforms: PlatformDef[];
  enemies: EnemyDef[];
  sparks: SparkDef[];
  props?: PropDef[];
  hasBoss: boolean;
  bossType?: 'great_mope' | 'rolling_gloom' | 'thornmother' | 'echo_maw' | 'undertow' | 'blaze_shadow';
  introDialogue: DialogueLine[];
  victoryDialogue: DialogueLine[];
}

export const LEVELS: Record<ZoneId, LevelConfig> = {
  prologue_forge: {
    id: 'prologue_forge',
    name: 'Forge Gate: Eastern Ramparts',
    subtitle: 'The Last Watch & The Guard Trials',
    lesson: 'Failure to obey retreat order; Alden saves her',
    width: 960,
    height: 270,
    spawnX: 45,
    spawnY: 232,
    beaconX: 880,
    beaconY: 220,
    beaconLine: 'A sword isn’t a promise to fight every battle. It’s a promise to protect what matters.',
    platforms: [
      // Main cobblestone rampart floor
      { x: 0, y: 232, width: 960, height: 38, type: 'solid' },
      // Eastern watchtower raised platforms & walkways
      { x: 130, y: 182, width: 85, height: 12, type: 'solid' },
      { x: 240, y: 152, width: 90, height: 12, type: 'solid' },
      { x: 360, y: 182, width: 85, height: 12, type: 'solid' },
      { x: 530, y: 172, width: 95, height: 12, type: 'solid' },
      { x: 710, y: 185, width: 80, height: 12, type: 'solid' },
    ],
    props: [
      // Animated wall torches along the ramparts
      { type: 'torch', x: 70, y: 185 },
      { type: 'torch', x: 210, y: 135 },
      { type: 'torch', x: 340, y: 135 },
      { type: 'torch', x: 490, y: 185 },
      { type: 'torch', x: 670, y: 185 },
      { type: 'torch', x: 840, y: 185 },

      // Hanging Festival Banners
      { type: 'banner', x: 105, y: 145 },
      { type: 'banner', x: 285, y: 115 },
      { type: 'banner', x: 420, y: 145 },
      { type: 'banner', x: 580, y: 135 },

      // Blacksmith Forge Furnaces with anvils
      { type: 'furnace', x: 470, y: 232 },
      { type: 'furnace', x: 860, y: 232 },

      // Sparring Training Dummy for combat tutorial practice
      { type: 'dummy', x: 175, y: 182 },
    ],
    enemies: [],
    sparks: [
      { id: 1, x: 170, y: 150 },
      { id: 2, x: 285, y: 120 },
      { id: 3, x: 400, y: 150 },
      { id: 4, x: 570, y: 140 },
    ],
    hasBoss: false,
    introDialogue: [
      {
        speaker: 'Captain Alden',
        portrait: 'alden',
        text: 'Steady your stance, Blaze. The Festival of Embers is quiet tonight, but a true Forge Guard never lowers their guard.',
      },
      {
        speaker: 'Blaze',
        portrait: 'blaze_determined',
        text: 'I’ve been ready since dawn, Captain! Emberfang feels lighter every day. Think we’ll ever get a real battle to test it?',
      },
      {
        speaker: 'Captain Alden',
        portrait: 'alden',
        text: 'A sword isn’t a toy, Blaze. Remember your final trials: you defeated four attackers, but chased the fifth and lost the bridge flag. Let’s review the basics.',
      },
    ],
    victoryDialogue: [],
  },

  zone1_meadow: {
    id: 'zone1_meadow',
    name: 'Chapter 1: Forgotten Meadow',
    subtitle: 'Wilted Glade of Grey',
    lesson: 'Anger must give way to purpose',
    width: 1000,
    height: 270,
    spawnX: 45,
    spawnY: 232,
    beaconX: 920,
    beaconY: 220,
    beaconLine: 'Strength without purpose is only noise.',
    platforms: [
      { x: 0, y: 232, width: 1000, height: 38, type: 'solid' },
      { x: 140, y: 178, width: 80, height: 12, type: 'solid' },
      { x: 260, y: 142, width: 90, height: 12, type: 'solid' },
      { x: 400, y: 178, width: 70, height: 12, type: 'solid' },
      { x: 520, y: 152, width: 100, height: 12, type: 'solid' },
      { x: 720, y: 172, width: 120, height: 12, type: 'solid' },
    ],
    enemies: [
      { id: 'm1', type: 'mope', x: 145, y: 210, maxHealth: 3 },
      { id: 'bb1', type: 'briar_bud', x: 235, y: 232, maxHealth: 4 },
      { id: 'sb1', type: 'split_mope', x: 335, y: 232, maxHealth: 5 },
      { id: 'm2', type: 'mope', x: 430, y: 158, maxHealth: 3 },
      { id: 'bb2', type: 'briar_bud', x: 520, y: 232, maxHealth: 4 },
      { id: 'sb2', type: 'split_mope', x: 625, y: 232, maxHealth: 5 },
      { id: 'boss_great_mope', type: 'great_mope', x: 810, y: 232, maxHealth: 20 },
    ],
    sparks: [
      { id: 10, x: 180, y: 145 },
      { id: 11, x: 300, y: 115 },
      { id: 12, x: 440, y: 145 },
      { id: 13, x: 570, y: 125 },
      { id: 14, x: 760, y: 145 },
    ],
    hasBoss: true,
    bossType: 'great_mope',
    introDialogue: [
      {
        speaker: 'Blaze',
        portrait: 'blaze_angry',
        text: 'Forgotten Meadow... Look ahead: Mopes, dividing Split Mopes, and thorny Briar Buds—with The Great Mope guarding the Waystation Beacon!',
      },
    ],
    victoryDialogue: [
      {
        speaker: 'Waystation Beacon',
        portrait: 'beacon',
        text: 'Warm crimson flame bursts from the hearth bowl. An echo of Alden’s voice resonates: "Strength without purpose is only noise."',
      },
      {
        speaker: 'Blaze',
        portrait: 'blaze_determined',
        text: 'I swung wildly and let my sword overheat. Reckless fury made the fight worse. I need to fight with purpose, not revenge.',
      },
    ],
  },

  zone2_hills: {
    id: 'zone2_hills',
    name: 'Chapter 2: Hollow Hills',
    subtitle: 'Crumbling Precipice',
    lesson: 'Knowing when to move is part of knowing how to fight',
    width: 1100,
    height: 270,
    spawnX: 45,
    spawnY: 195,
    beaconX: 1020,
    beaconY: 220,
    beaconLine: 'Knowing when to move is part of knowing how to fight.',
    platforms: [
      { x: 0, y: 215, width: 180, height: 55, type: 'solid' },
      { x: 220, y: 195, width: 60, height: 12, type: 'crumble' },
      { x: 320, y: 175, width: 60, height: 12, type: 'crumble' },
      { x: 420, y: 205, width: 140, height: 65, type: 'solid' },
      { x: 580, y: 145, width: 70, height: 12, type: 'solid' },
      { x: 680, y: 175, width: 60, height: 12, type: 'crumble' },
      { x: 780, y: 225, width: 320, height: 45, type: 'solid' },
    ],
    enemies: [
      { id: 'gb1', type: 'gust_bat', x: 145, y: 165, maxHealth: 3 },
      { id: 'cs1', type: 'cliff_scrabbler', x: 250, y: 195, maxHealth: 4 },
      { id: 'gr1', type: 'gloom_runner', x: 470, y: 205, maxHealth: 5 },
      { id: 'gb2', type: 'gust_bat', x: 610, y: 125, maxHealth: 3 },
      { id: 'gr2', type: 'gloom_runner', x: 790, y: 225, maxHealth: 5 },
      { id: 'boss_rolling_gloom', type: 'rolling_gloom', x: 920, y: 225, maxHealth: 22 },
    ],
    sparks: [
      { id: 20, x: 250, y: 165 },
      { id: 21, x: 350, y: 145 },
      { id: 22, x: 610, y: 115 },
    ],
    hasBoss: true,
    bossType: 'rolling_gloom',
    introDialogue: [
      {
        speaker: 'Blaze',
        portrait: 'blaze_determined',
        text: 'The wind howling through Hollow Hills is deafening. Watch out for Gust Bats, Cliff Scrabblers, Gloom Runners, and The Rolling Gloom!',
      },
    ],
    victoryDialogue: [
      {
        speaker: 'Waystation Beacon',
        portrait: 'beacon',
        text: 'The gale recedes as the second beacon ignites: "Knowing when to move is part of knowing how to fight."',
      },
    ],
  },

  zone3_woods: {
    id: 'zone3_woods',
    name: 'Chapter 3: Weeping Woods',
    subtitle: 'Bramble Canopy & Ancient Roots',
    lesson: 'Not everything corrupted should be destroyed',
    width: 1000,
    height: 270,
    spawnX: 45,
    spawnY: 215,
    beaconX: 920,
    beaconY: 220,
    beaconLine: 'Fire can forge and warm, and strength exists to protect.',
    platforms: [
      { x: 0, y: 232, width: 1000, height: 38, type: 'solid' },
      { x: 180, y: 175, width: 85, height: 12, type: 'solid' },
      { x: 360, y: 145, width: 90, height: 12, type: 'solid' },
      { x: 560, y: 175, width: 85, height: 12, type: 'solid' },
    ],
    enemies: [
      { id: 'tl1', type: 'thornling', x: 150, y: 232, maxHealth: 3 },
      { id: 'rh1', type: 'root_hound', x: 290, y: 232, maxHealth: 5 },
      { id: 'sw1', type: 'spore_wisp', x: 420, y: 180, maxHealth: 3 },
      { id: 'tl2', type: 'thornling', x: 550, y: 232, maxHealth: 3 },
      { id: 'rh2', type: 'root_hound', x: 660, y: 232, maxHealth: 5 },
      { id: 'boss_thornmother', type: 'thornmother', x: 820, y: 232, maxHealth: 24 },
    ],
    sparks: [
      { id: 30, x: 220, y: 145 },
      { id: 31, x: 400, y: 115 },
      { id: 32, x: 600, y: 145 },
    ],
    hasBoss: true,
    bossType: 'thornmother',
    introDialogue: [
      {
        speaker: 'Blaze',
        portrait: 'blaze_surprised',
        text: 'The Weeping Woods are swarming with Thornlings, Root Hounds, and Spore Wisps—and Thornmother has rooted herself ahead!',
      },
    ],
    victoryDialogue: [
      {
        speaker: 'Waystation Beacon',
        portrait: 'beacon',
        text: 'The ancient roots relax their grip: "Fire can forge and warm, and strength exists to protect."',
      },
    ],
  },

  zone4_caves: {
    id: 'zone4_caves',
    name: 'Chapter 4: Echoing Caves',
    subtitle: 'Chasm of Stolen Voices',
    lesson: 'Guilt cannot be fought away',
    width: 1050,
    height: 270,
    spawnX: 45,
    spawnY: 215,
    beaconX: 960,
    beaconY: 220,
    beaconLine: 'I’ll bring them home, Captain.',
    platforms: [
      { x: 0, y: 232, width: 1050, height: 38, type: 'solid' },
      { x: 200, y: 180, width: 80, height: 12, type: 'solid' },
      { x: 380, y: 145, width: 85, height: 12, type: 'solid' },
      { x: 580, y: 175, width: 80, height: 12, type: 'solid' },
    ],
    enemies: [
      { id: 'eb1', type: 'echo_bat', x: 155, y: 175, maxHealth: 3 },
      { id: 'sc1', type: 'spike_crawler', x: 295, y: 232, maxHealth: 4 },
      { id: 'hd1', type: 'hollow_drifter', x: 455, y: 195, maxHealth: 4 },
      { id: 'sc2', type: 'spike_crawler', x: 615, y: 232, maxHealth: 4 },
      { id: 'boss_echo_maw', type: 'echo_maw', x: 850, y: 232, maxHealth: 24 },
    ],
    sparks: [
      { id: 40, x: 240, y: 150 },
      { id: 41, x: 420, y: 115 },
    ],
    hasBoss: true,
    bossType: 'echo_maw',
    introDialogue: [
      {
        speaker: 'Blaze',
        portrait: 'blaze_sad',
        text: 'Echo Bats, Spike Crawlers, and Hollow Drifters prowl these amethyst caverns... and Echo Maw awaits in the deep.',
      },
    ],
    victoryDialogue: [
      {
        speaker: 'Waystation Beacon',
        portrait: 'beacon',
        text: 'The cavern falls quiet as the crystal beacon ignites: "I’ll bring them home, Captain."',
      },
    ],
  },

  zone5_river: {
    id: 'zone5_river',
    name: 'Chapter 5: Broken River',
    subtitle: 'Torrent of the Undertow',
    lesson: 'Protection can require putting the sword away',
    width: 1100,
    height: 270,
    spawnX: 45,
    spawnY: 195,
    beaconX: 1020,
    beaconY: 220,
    beaconLine: 'We all made it.',
    platforms: [
      { x: 0, y: 215, width: 180, height: 55, type: 'solid' },
      { x: 240, y: 185, width: 75, height: 12, type: 'raft' },
      { x: 420, y: 185, width: 75, height: 12, type: 'raft' },
      { x: 600, y: 185, width: 75, height: 12, type: 'raft' },
      { x: 780, y: 215, width: 320, height: 55, type: 'solid' },
    ],
    enemies: [
      { id: 'rl1', type: 'raft_leech', x: 140, y: 215, maxHealth: 3 },
      { id: 'uf1', type: 'undertow_fry', x: 280, y: 185, maxHealth: 3 },
      { id: 'sm1', type: 'splash_mope', x: 455, y: 185, maxHealth: 4 },
      { id: 'rl2', type: 'raft_leech', x: 635, y: 185, maxHealth: 3 },
      { id: 'boss_undertow', type: 'undertow', x: 900, y: 215, maxHealth: 26 },
    ],
    sparks: [
      { id: 50, x: 275, y: 155 },
      { id: 51, x: 455, y: 155 },
      { id: 52, x: 635, y: 155 },
    ],
    hasBoss: true,
    bossType: 'undertow',
    introDialogue: [
      {
        speaker: 'Blaze',
        portrait: 'blaze_determined',
        text: 'Raft Leeches, Undertow Fry, and Splash Mopes infest these rapids—and the great serpent Undertow lurks ahead!',
      },
    ],
    victoryDialogue: [
      {
        speaker: 'Waystation Beacon',
        portrait: 'beacon',
        text: 'The turbulent waters settle into clear dawn ripples: "We all made it."',
      },
    ],
  },

  zone5_retreat: {
    id: 'zone5_retreat',
    name: 'Turning Point: The Retreat',
    subtitle: 'Abandoned River Shelter',
    lesson: 'Protection can require putting the sword away',
    width: 600,
    height: 270,
    spawnX: 45,
    spawnY: 215,
    beaconX: 520,
    beaconY: 220,
    beaconLine: 'We all made it.',
    platforms: [
      { x: 0, y: 232, width: 600, height: 38, type: 'solid' },
    ],
    enemies: [],
    sparks: [],
    hasBoss: false,
    introDialogue: [
      {
        speaker: 'Blaze',
        portrait: 'blaze_determined',
        text: 'An old outpost shelter. We caught our breath. The children are safe behind the barricade.',
      },
    ],
    victoryDialogue: [],
  },

  zone6_summit: {
    id: 'zone6_summit',
    name: 'Chapter 6: Beacon Summit',
    subtitle: 'The Great Hearth & Her Shadow',
    lesson: 'Acceptance, patience, and self-forgiveness',
    width: 950,
    height: 270,
    spawnX: 50,
    spawnY: 215,
    beaconX: 860,
    beaconY: 210,
    beaconLine: 'One flame may guide you. Nine flames will bring you home.',
    platforms: [
      { x: 0, y: 232, width: 950, height: 38, type: 'solid' },
      { x: 180, y: 175, width: 90, height: 12, type: 'solid' },
      { x: 380, y: 145, width: 90, height: 12, type: 'solid' },
      { x: 580, y: 175, width: 90, height: 12, type: 'solid' },
    ],
    enemies: [
      { id: 'ss1', type: 'shadow_sentry', x: 165, y: 232, maxHealth: 5 },
      { id: 'aw1', type: 'ash_wisp', x: 310, y: 185, maxHealth: 4 },
      { id: 'bh1', type: 'beacon_husk', x: 480, y: 232, maxHealth: 6 },
      { id: 'ss2', type: 'shadow_sentry', x: 630, y: 232, maxHealth: 5 },
      { id: 'boss_blaze_shadow', type: 'blaze_shadow', x: 790, y: 232, maxHealth: 28 },
    ],
    sparks: [
      { id: 60, x: 225, y: 145 },
      { id: 61, x: 425, y: 115 },
      { id: 62, x: 625, y: 145 },
    ],
    hasBoss: true,
    bossType: 'blaze_shadow',
    introDialogue: [
      {
        speaker: 'Blaze',
        portrait: 'blaze_determined',
        text: 'The Summit of the Great Beacon... and waiting in the ashes is my own shadow, holding a corrupt Emberfang.',
      },
      {
        speaker: 'Blaze’s Shadow',
        portrait: 'shadow',
        text: 'You left him behind. You were too weak to hold the gate. Why pretend you can ignite anything?',
      },
    ],
    victoryDialogue: [
      {
        speaker: 'Blaze',
        portrait: 'blaze_determined',
        text: 'Because Captain Alden didn’t die so I would drown in regret. He held the gate so I could carry the fire forward!',
      },
      {
        speaker: 'Waystation Beacon',
        portrait: 'beacon',
        text: 'The Great Beacon ignites in brilliant crimson and gold: "One flame may guide you. Nine flames will bring you home."',
      },
    ],
  },

  epilogue_dawn: {
    id: 'epilogue_dawn',
    name: 'Epilogue: The Borrowed Sunrise',
    subtitle: 'The Light That Cannot Last',
    lesson: 'One ember is a beginning, not the final victory',
    width: 600,
    height: 270,
    spawnX: 50,
    spawnY: 215,
    beaconX: 500,
    beaconY: 220,
    beaconLine: 'One flame may guide you. Nine flames will bring you home.',
    platforms: [
      { x: 0, y: 232, width: 600, height: 38, type: 'solid' },
    ],
    enemies: [],
    sparks: [],
    hasBoss: false,
    introDialogue: [
      {
        speaker: 'Narrator',
        portrait: 'narrator',
        text: 'Blaze’s journey through the First Ember is complete. Eight more hearths await across the realm.',
      },
    ],
    victoryDialogue: [],
  },
};
