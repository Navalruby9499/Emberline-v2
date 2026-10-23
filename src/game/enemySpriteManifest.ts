/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnemyType } from "../types/game";

export type EnemyAnimState = "idle" | "move" | "attack" | "hurt" | "death" | "special";

export interface EnemyFrameMeta {
  index?: number;
  file: string;
  width: number;
  height: number;
  contentWidth?: number;
  contentHeight?: number;
  anchorX: number;
  anchorY: number;
}

export interface EnemyAnimSequence {
  fps: number;
  loop: boolean;
  frameCount: number;
  frames: EnemyFrameMeta[];
}

export interface EnemySpriteManifestEntry {
  id: EnemyType;
  folder: string;
  zone: string;
  isBoss?: boolean;
  isFlying: boolean;
  moveAlias?: string;
  portrait?: string;
  hurtbox: { width: number; height: number };
  attackBox: { width: number; height: number; offsetX: number; offsetY: number };
  animations: Record<string, EnemyAnimSequence>;
}

export const ENEMY_SPRITE_MANIFEST: Record<EnemyType, EnemySpriteManifestEntry> = {
  "mope": {
    "id": "mope",
    "folder": "/assets/enemies/meadow/mope",
    "zone": "zone1_meadow",
    "isFlying": true,
    "moveAlias": "float",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/meadow/mope/mope_idle_01.png",
            "width": 57,
            "height": 58,
            "contentWidth": 49,
            "contentHeight": 50,
            "anchorX": 29,
            "anchorY": 54
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/meadow/mope/mope_move_01.png",
            "width": 51,
            "height": 65,
            "contentWidth": 43,
            "contentHeight": 57,
            "anchorX": 26,
            "anchorY": 61
          },
          {
            "index": 1,
            "file": "/assets/enemies/meadow/mope/mope_move_02.png",
            "width": 68,
            "height": 58,
            "contentWidth": 60,
            "contentHeight": 50,
            "anchorX": 34,
            "anchorY": 54
          }
        ]
      },
      "attack": {
        "frameCount": 2,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/meadow/mope/mope_attack_01.png",
            "width": 87,
            "height": 61,
            "contentWidth": 79,
            "contentHeight": 53,
            "anchorX": 29,
            "anchorY": 57
          },
          {
            "index": 1,
            "file": "/assets/enemies/meadow/mope/mope_attack_02.png",
            "width": 167,
            "height": 64,
            "contentWidth": 159,
            "contentHeight": 56,
            "anchorX": 29,
            "anchorY": 60
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/meadow/mope/mope_hurt_01.png",
            "width": 59,
            "height": 43,
            "contentWidth": 51,
            "contentHeight": 35,
            "anchorX": 30,
            "anchorY": 39
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/meadow/mope/mope_death_01.png",
            "width": 106,
            "height": 66,
            "contentWidth": 98,
            "contentHeight": 58,
            "anchorX": 29,
            "anchorY": 62
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/meadow/mope/mope_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "split_mope": {
    "id": "split_mope",
    "folder": "/assets/enemies/meadow/split-mope",
    "zone": "zone1_meadow",
    "isFlying": false,
    "moveAlias": "move",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/meadow/split-mope/split_mope_idle_01.png",
            "width": 82,
            "height": 76,
            "contentWidth": 74,
            "contentHeight": 68,
            "anchorX": 41,
            "anchorY": 72
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/meadow/split-mope/split_mope_move_01.png",
            "width": 69,
            "height": 69,
            "contentWidth": 61,
            "contentHeight": 61,
            "anchorX": 35,
            "anchorY": 65
          },
          {
            "index": 1,
            "file": "/assets/enemies/meadow/split-mope/split_mope_move_02.png",
            "width": 96,
            "height": 74,
            "contentWidth": 88,
            "contentHeight": 66,
            "anchorX": 48,
            "anchorY": 70
          }
        ]
      },
      "attack": {
        "frameCount": 2,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/meadow/split-mope/split_mope_attack_01.png",
            "width": 98,
            "height": 76,
            "contentWidth": 90,
            "contentHeight": 68,
            "anchorX": 49,
            "anchorY": 72
          },
          {
            "index": 1,
            "file": "/assets/enemies/meadow/split-mope/split_mope_attack_02.png",
            "width": 114,
            "height": 71,
            "contentWidth": 106,
            "contentHeight": 63,
            "anchorX": 41,
            "anchorY": 67
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/meadow/split-mope/split_mope_hurt_01.png",
            "width": 80,
            "height": 79,
            "contentWidth": 72,
            "contentHeight": 71,
            "anchorX": 40,
            "anchorY": 75
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/meadow/split-mope/split_mope_death_01.png",
            "width": 72,
            "height": 80,
            "contentWidth": 64,
            "contentHeight": 72,
            "anchorX": 36,
            "anchorY": 76
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/meadow/split-mope/split_mope_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "briar_bud": {
    "id": "briar_bud",
    "folder": "/assets/enemies/meadow/briar-bud",
    "zone": "zone1_meadow",
    "isFlying": false,
    "moveAlias": "walk",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/meadow/briar-bud/briar_bud_idle_01.png",
            "width": 66,
            "height": 69,
            "contentWidth": 58,
            "contentHeight": 61,
            "anchorX": 33,
            "anchorY": 65
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/meadow/briar-bud/briar_bud_move_01.png",
            "width": 63,
            "height": 70,
            "contentWidth": 55,
            "contentHeight": 62,
            "anchorX": 32,
            "anchorY": 66
          },
          {
            "index": 1,
            "file": "/assets/enemies/meadow/briar-bud/briar_bud_move_02.png",
            "width": 71,
            "height": 69,
            "contentWidth": 63,
            "contentHeight": 61,
            "anchorX": 36,
            "anchorY": 65
          }
        ]
      },
      "attack": {
        "frameCount": 2,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/meadow/briar-bud/briar_bud_attack_01.png",
            "width": 70,
            "height": 68,
            "contentWidth": 62,
            "contentHeight": 60,
            "anchorX": 35,
            "anchorY": 64
          },
          {
            "index": 1,
            "file": "/assets/enemies/meadow/briar-bud/briar_bud_attack_02.png",
            "width": 226,
            "height": 70,
            "contentWidth": 218,
            "contentHeight": 62,
            "anchorX": 33,
            "anchorY": 66
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/meadow/briar-bud/briar_bud_hurt_01.png",
            "width": 67,
            "height": 69,
            "contentWidth": 59,
            "contentHeight": 61,
            "anchorX": 34,
            "anchorY": 65
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/meadow/briar-bud/briar_bud_death_01.png",
            "width": 91,
            "height": 66,
            "contentWidth": 83,
            "contentHeight": 58,
            "anchorX": 33,
            "anchorY": 62
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/meadow/briar-bud/briar_bud_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "gust_bat": {
    "id": "gust_bat",
    "folder": "/assets/enemies/hills/gust-bat",
    "zone": "zone2_hills",
    "isFlying": true,
    "moveAlias": "flap",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/hills/gust-bat/gust_bat_idle_01.png",
            "width": 121,
            "height": 59,
            "contentWidth": 113,
            "contentHeight": 51,
            "anchorX": 61,
            "anchorY": 55
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/hills/gust-bat/gust_bat_move_01.png",
            "width": 136,
            "height": 67,
            "contentWidth": 128,
            "contentHeight": 59,
            "anchorX": 68,
            "anchorY": 63
          },
          {
            "index": 1,
            "file": "/assets/enemies/hills/gust-bat/gust_bat_move_02.png",
            "width": 121,
            "height": 59,
            "contentWidth": 113,
            "contentHeight": 51,
            "anchorX": 61,
            "anchorY": 55
          }
        ]
      },
      "attack": {
        "frameCount": 1,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/hills/gust-bat/gust_bat_attack_01.png",
            "width": 173,
            "height": 70,
            "contentWidth": 165,
            "contentHeight": 62,
            "anchorX": 61,
            "anchorY": 66
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/hills/gust-bat/gust_bat_hurt_01.png",
            "width": 79,
            "height": 58,
            "contentWidth": 71,
            "contentHeight": 50,
            "anchorX": 40,
            "anchorY": 54
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/hills/gust-bat/gust_bat_death_01.png",
            "width": 95,
            "height": 70,
            "contentWidth": 87,
            "contentHeight": 62,
            "anchorX": 48,
            "anchorY": 66
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/hills/gust-bat/gust_bat_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "cliff_scrabbler": {
    "id": "cliff_scrabbler",
    "folder": "/assets/enemies/hills/cliff-scrabbler",
    "zone": "zone2_hills",
    "isFlying": false,
    "moveAlias": "walk",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/hills/cliff-scrabbler/cliff_scrabbler_idle_01.png",
            "width": 79,
            "height": 53,
            "contentWidth": 71,
            "contentHeight": 45,
            "anchorX": 40,
            "anchorY": 49
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/hills/cliff-scrabbler/cliff_scrabbler_move_01.png",
            "width": 66,
            "height": 48,
            "contentWidth": 58,
            "contentHeight": 40,
            "anchorX": 33,
            "anchorY": 44
          },
          {
            "index": 1,
            "file": "/assets/enemies/hills/cliff-scrabbler/cliff_scrabbler_move_02.png",
            "width": 72,
            "height": 46,
            "contentWidth": 64,
            "contentHeight": 38,
            "anchorX": 36,
            "anchorY": 42
          }
        ]
      },
      "attack": {
        "frameCount": 2,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/hills/cliff-scrabbler/cliff_scrabbler_attack_01.png",
            "width": 112,
            "height": 61,
            "contentWidth": 104,
            "contentHeight": 53,
            "anchorX": 40,
            "anchorY": 57
          },
          {
            "index": 1,
            "file": "/assets/enemies/hills/cliff-scrabbler/cliff_scrabbler_attack_02.png",
            "width": 92,
            "height": 45,
            "contentWidth": 84,
            "contentHeight": 37,
            "anchorX": 46,
            "anchorY": 41
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/hills/cliff-scrabbler/cliff_scrabbler_hurt_01.png",
            "width": 63,
            "height": 52,
            "contentWidth": 55,
            "contentHeight": 44,
            "anchorX": 32,
            "anchorY": 48
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/hills/cliff-scrabbler/cliff_scrabbler_death_01.png",
            "width": 76,
            "height": 51,
            "contentWidth": 68,
            "contentHeight": 43,
            "anchorX": 38,
            "anchorY": 47
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/hills/cliff-scrabbler/cliff_scrabbler_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "gloom_runner": {
    "id": "gloom_runner",
    "folder": "/assets/enemies/hills/gloom-runner",
    "zone": "zone2_hills",
    "isFlying": false,
    "moveAlias": "run",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/hills/gloom-runner/gloom_runner_idle_01.png",
            "width": 111,
            "height": 70,
            "contentWidth": 103,
            "contentHeight": 62,
            "anchorX": 56,
            "anchorY": 66
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/hills/gloom-runner/gloom_runner_move_01.png",
            "width": 123,
            "height": 68,
            "contentWidth": 115,
            "contentHeight": 60,
            "anchorX": 62,
            "anchorY": 64
          },
          {
            "index": 1,
            "file": "/assets/enemies/hills/gloom-runner/gloom_runner_move_02.png",
            "width": 111,
            "height": 70,
            "contentWidth": 103,
            "contentHeight": 62,
            "anchorX": 56,
            "anchorY": 66
          }
        ]
      },
      "attack": {
        "frameCount": 1,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/hills/gloom-runner/gloom_runner_attack_01.png",
            "width": 201,
            "height": 73,
            "contentWidth": 193,
            "contentHeight": 65,
            "anchorX": 56,
            "anchorY": 69
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/hills/gloom-runner/gloom_runner_hurt_01.png",
            "width": 93,
            "height": 72,
            "contentWidth": 85,
            "contentHeight": 64,
            "anchorX": 47,
            "anchorY": 68
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/hills/gloom-runner/gloom_runner_death_01.png",
            "width": 123,
            "height": 72,
            "contentWidth": 115,
            "contentHeight": 64,
            "anchorX": 62,
            "anchorY": 68
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/hills/gloom-runner/gloom_runner_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "thornling": {
    "id": "thornling",
    "folder": "/assets/enemies/woods/thornling",
    "zone": "zone3_woods",
    "isFlying": false,
    "moveAlias": "walk",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/woods/thornling/thornling_idle_01.png",
            "width": 68,
            "height": 62,
            "contentWidth": 60,
            "contentHeight": 54,
            "anchorX": 34,
            "anchorY": 58
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/woods/thornling/thornling_move_01.png",
            "width": 67,
            "height": 64,
            "contentWidth": 59,
            "contentHeight": 56,
            "anchorX": 34,
            "anchorY": 60
          },
          {
            "index": 1,
            "file": "/assets/enemies/woods/thornling/thornling_move_02.png",
            "width": 78,
            "height": 64,
            "contentWidth": 70,
            "contentHeight": 56,
            "anchorX": 39,
            "anchorY": 60
          }
        ]
      },
      "attack": {
        "frameCount": 1,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/woods/thornling/thornling_attack_01.png",
            "width": 194,
            "height": 65,
            "contentWidth": 186,
            "contentHeight": 57,
            "anchorX": 34,
            "anchorY": 61
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/woods/thornling/thornling_hurt_01.png",
            "width": 65,
            "height": 61,
            "contentWidth": 57,
            "contentHeight": 53,
            "anchorX": 33,
            "anchorY": 57
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/woods/thornling/thornling_death_01.png",
            "width": 94,
            "height": 56,
            "contentWidth": 86,
            "contentHeight": 48,
            "anchorX": 34,
            "anchorY": 52
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/woods/thornling/thornling_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "root_hound": {
    "id": "root_hound",
    "folder": "/assets/enemies/woods/root-hound",
    "zone": "zone3_woods",
    "isFlying": false,
    "moveAlias": "walk",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/woods/root-hound/root_hound_idle_01.png",
            "width": 103,
            "height": 74,
            "contentWidth": 95,
            "contentHeight": 66,
            "anchorX": 52,
            "anchorY": 70
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/woods/root-hound/root_hound_move_01.png",
            "width": 122,
            "height": 74,
            "contentWidth": 114,
            "contentHeight": 66,
            "anchorX": 61,
            "anchorY": 70
          },
          {
            "index": 1,
            "file": "/assets/enemies/woods/root-hound/root_hound_move_02.png",
            "width": 103,
            "height": 74,
            "contentWidth": 95,
            "contentHeight": 66,
            "anchorX": 52,
            "anchorY": 70
          }
        ]
      },
      "attack": {
        "frameCount": 1,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/woods/root-hound/root_hound_attack_01.png",
            "width": 209,
            "height": 74,
            "contentWidth": 201,
            "contentHeight": 66,
            "anchorX": 52,
            "anchorY": 70
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/woods/root-hound/root_hound_hurt_01.png",
            "width": 114,
            "height": 69,
            "contentWidth": 106,
            "contentHeight": 61,
            "anchorX": 57,
            "anchorY": 65
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/woods/root-hound/root_hound_death_01.png",
            "width": 148,
            "height": 70,
            "contentWidth": 140,
            "contentHeight": 62,
            "anchorX": 52,
            "anchorY": 66
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/woods/root-hound/root_hound_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "spore_wisp": {
    "id": "spore_wisp",
    "folder": "/assets/enemies/woods/spore-wisp",
    "zone": "zone3_woods",
    "isFlying": true,
    "moveAlias": "float",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/woods/spore-wisp/spore_wisp_idle_01.png",
            "width": 77,
            "height": 67,
            "contentWidth": 69,
            "contentHeight": 59,
            "anchorX": 39,
            "anchorY": 63
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/woods/spore-wisp/spore_wisp_move_01.png",
            "width": 66,
            "height": 66,
            "contentWidth": 58,
            "contentHeight": 58,
            "anchorX": 33,
            "anchorY": 62
          },
          {
            "index": 1,
            "file": "/assets/enemies/woods/spore-wisp/spore_wisp_move_02.png",
            "width": 67,
            "height": 62,
            "contentWidth": 59,
            "contentHeight": 54,
            "anchorX": 34,
            "anchorY": 58
          }
        ]
      },
      "attack": {
        "frameCount": 1,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/woods/spore-wisp/spore_wisp_attack_01.png",
            "width": 168,
            "height": 62,
            "contentWidth": 160,
            "contentHeight": 54,
            "anchorX": 39,
            "anchorY": 58
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/woods/spore-wisp/spore_wisp_hurt_01.png",
            "width": 100,
            "height": 64,
            "contentWidth": 92,
            "contentHeight": 56,
            "anchorX": 39,
            "anchorY": 60
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/woods/spore-wisp/spore_wisp_death_01.png",
            "width": 86,
            "height": 65,
            "contentWidth": 78,
            "contentHeight": 57,
            "anchorX": 43,
            "anchorY": 61
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/woods/spore-wisp/spore_wisp_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "echo_bat": {
    "id": "echo_bat",
    "folder": "/assets/enemies/caves/echo-bat",
    "zone": "zone4_caves",
    "isFlying": true,
    "moveAlias": "flap",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/caves/echo-bat/echo_bat_idle_01.png",
            "width": 109,
            "height": 65,
            "contentWidth": 101,
            "contentHeight": 57,
            "anchorX": 55,
            "anchorY": 61
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/caves/echo-bat/echo_bat_move_01.png",
            "width": 123,
            "height": 67,
            "contentWidth": 115,
            "contentHeight": 59,
            "anchorX": 62,
            "anchorY": 63
          },
          {
            "index": 1,
            "file": "/assets/enemies/caves/echo-bat/echo_bat_move_02.png",
            "width": 109,
            "height": 65,
            "contentWidth": 101,
            "contentHeight": 57,
            "anchorX": 55,
            "anchorY": 61
          }
        ]
      },
      "attack": {
        "frameCount": 1,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/caves/echo-bat/echo_bat_attack_01.png",
            "width": 214,
            "height": 74,
            "contentWidth": 206,
            "contentHeight": 66,
            "anchorX": 55,
            "anchorY": 70
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/caves/echo-bat/echo_bat_hurt_01.png",
            "width": 74,
            "height": 68,
            "contentWidth": 66,
            "contentHeight": 60,
            "anchorX": 37,
            "anchorY": 64
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/caves/echo-bat/echo_bat_death_01.png",
            "width": 133,
            "height": 70,
            "contentWidth": 125,
            "contentHeight": 62,
            "anchorX": 67,
            "anchorY": 66
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/caves/echo-bat/echo_bat_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "spike_crawler": {
    "id": "spike_crawler",
    "folder": "/assets/enemies/caves/spike-crawler",
    "zone": "zone4_caves",
    "isFlying": false,
    "moveAlias": "walk",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/caves/spike-crawler/spike_crawler_idle_01.png",
            "width": 74,
            "height": 53,
            "contentWidth": 66,
            "contentHeight": 45,
            "anchorX": 37,
            "anchorY": 49
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/caves/spike-crawler/spike_crawler_move_01.png",
            "width": 61,
            "height": 50,
            "contentWidth": 53,
            "contentHeight": 42,
            "anchorX": 31,
            "anchorY": 46
          },
          {
            "index": 1,
            "file": "/assets/enemies/caves/spike-crawler/spike_crawler_move_02.png",
            "width": 85,
            "height": 55,
            "contentWidth": 77,
            "contentHeight": 47,
            "anchorX": 43,
            "anchorY": 51
          }
        ]
      },
      "attack": {
        "frameCount": 2,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/caves/spike-crawler/spike_crawler_attack_01.png",
            "width": 78,
            "height": 54,
            "contentWidth": 70,
            "contentHeight": 46,
            "anchorX": 39,
            "anchorY": 50
          },
          {
            "index": 1,
            "file": "/assets/enemies/caves/spike-crawler/spike_crawler_attack_02.png",
            "width": 141,
            "height": 59,
            "contentWidth": 133,
            "contentHeight": 51,
            "anchorX": 37,
            "anchorY": 55
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/caves/spike-crawler/spike_crawler_hurt_01.png",
            "width": 64,
            "height": 52,
            "contentWidth": 56,
            "contentHeight": 44,
            "anchorX": 32,
            "anchorY": 48
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/caves/spike-crawler/spike_crawler_death_01.png",
            "width": 110,
            "height": 53,
            "contentWidth": 102,
            "contentHeight": 45,
            "anchorX": 37,
            "anchorY": 49
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/caves/spike-crawler/spike_crawler_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "hollow_drifter": {
    "id": "hollow_drifter",
    "folder": "/assets/enemies/caves/hollow-drifter",
    "zone": "zone4_caves",
    "isFlying": true,
    "moveAlias": "float",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/caves/hollow-drifter/hollow_drifter_idle_01.png",
            "width": 96,
            "height": 76,
            "contentWidth": 88,
            "contentHeight": 68,
            "anchorX": 48,
            "anchorY": 72
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/caves/hollow-drifter/hollow_drifter_move_01.png",
            "width": 95,
            "height": 76,
            "contentWidth": 87,
            "contentHeight": 68,
            "anchorX": 48,
            "anchorY": 72
          },
          {
            "index": 1,
            "file": "/assets/enemies/caves/hollow-drifter/hollow_drifter_move_02.png",
            "width": 96,
            "height": 76,
            "contentWidth": 88,
            "contentHeight": 68,
            "anchorX": 48,
            "anchorY": 72
          }
        ]
      },
      "attack": {
        "frameCount": 1,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/caves/hollow-drifter/hollow_drifter_attack_01.png",
            "width": 252,
            "height": 74,
            "contentWidth": 244,
            "contentHeight": 66,
            "anchorX": 48,
            "anchorY": 70
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/caves/hollow-drifter/hollow_drifter_hurt_01.png",
            "width": 77,
            "height": 65,
            "contentWidth": 69,
            "contentHeight": 57,
            "anchorX": 39,
            "anchorY": 61
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/caves/hollow-drifter/hollow_drifter_death_01.png",
            "width": 126,
            "height": 70,
            "contentWidth": 118,
            "contentHeight": 62,
            "anchorX": 48,
            "anchorY": 66
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/caves/hollow-drifter/hollow_drifter_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "raft_leech": {
    "id": "raft_leech",
    "folder": "/assets/enemies/river/raft-leech",
    "zone": "zone5_river",
    "isFlying": false,
    "moveAlias": "swim",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/river/raft-leech/raft_leech_idle_01.png",
            "width": 86,
            "height": 65,
            "contentWidth": 78,
            "contentHeight": 57,
            "anchorX": 43,
            "anchorY": 61
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/river/raft-leech/raft_leech_move_01.png",
            "width": 84,
            "height": 48,
            "contentWidth": 76,
            "contentHeight": 40,
            "anchorX": 42,
            "anchorY": 44
          },
          {
            "index": 1,
            "file": "/assets/enemies/river/raft-leech/raft_leech_move_02.png",
            "width": 109,
            "height": 55,
            "contentWidth": 101,
            "contentHeight": 47,
            "anchorX": 43,
            "anchorY": 51
          }
        ]
      },
      "attack": {
        "frameCount": 1,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/river/raft-leech/raft_leech_attack_01.png",
            "width": 149,
            "height": 58,
            "contentWidth": 141,
            "contentHeight": 50,
            "anchorX": 43,
            "anchorY": 54
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/river/raft-leech/raft_leech_hurt_01.png",
            "width": 83,
            "height": 58,
            "contentWidth": 75,
            "contentHeight": 50,
            "anchorX": 42,
            "anchorY": 54
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/river/raft-leech/raft_leech_death_01.png",
            "width": 125,
            "height": 59,
            "contentWidth": 117,
            "contentHeight": 51,
            "anchorX": 43,
            "anchorY": 55
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/river/raft-leech/raft_leech_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "undertow_fry": {
    "id": "undertow_fry",
    "folder": "/assets/enemies/river/undertow-fry",
    "zone": "zone5_river",
    "isFlying": false,
    "moveAlias": "swim",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/river/undertow-fry/undertow_fry_idle_01.png",
            "width": 106,
            "height": 49,
            "contentWidth": 98,
            "contentHeight": 41,
            "anchorX": 53,
            "anchorY": 45
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/river/undertow-fry/undertow_fry_move_01.png",
            "width": 77,
            "height": 44,
            "contentWidth": 69,
            "contentHeight": 36,
            "anchorX": 39,
            "anchorY": 40
          },
          {
            "index": 1,
            "file": "/assets/enemies/river/undertow-fry/undertow_fry_move_02.png",
            "width": 83,
            "height": 54,
            "contentWidth": 75,
            "contentHeight": 46,
            "anchorX": 42,
            "anchorY": 50
          }
        ]
      },
      "attack": {
        "frameCount": 1,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/river/undertow-fry/undertow_fry_attack_01.png",
            "width": 154,
            "height": 64,
            "contentWidth": 146,
            "contentHeight": 56,
            "anchorX": 53,
            "anchorY": 60
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/river/undertow-fry/undertow_fry_hurt_01.png",
            "width": 91,
            "height": 49,
            "contentWidth": 83,
            "contentHeight": 41,
            "anchorX": 46,
            "anchorY": 45
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/river/undertow-fry/undertow_fry_death_01.png",
            "width": 144,
            "height": 58,
            "contentWidth": 136,
            "contentHeight": 50,
            "anchorX": 53,
            "anchorY": 54
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/river/undertow-fry/undertow_fry_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "splash_mope": {
    "id": "splash_mope",
    "folder": "/assets/enemies/river/splash-mope",
    "zone": "zone5_river",
    "isFlying": false,
    "moveAlias": "float",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/river/splash-mope/splash_mope_idle_01.png",
            "width": 81,
            "height": 69,
            "contentWidth": 73,
            "contentHeight": 61,
            "anchorX": 41,
            "anchorY": 65
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/river/splash-mope/splash_mope_move_01.png",
            "width": 62,
            "height": 75,
            "contentWidth": 54,
            "contentHeight": 67,
            "anchorX": 31,
            "anchorY": 71
          },
          {
            "index": 1,
            "file": "/assets/enemies/river/splash-mope/splash_mope_move_02.png",
            "width": 74,
            "height": 68,
            "contentWidth": 66,
            "contentHeight": 60,
            "anchorX": 37,
            "anchorY": 64
          }
        ]
      },
      "attack": {
        "frameCount": 1,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/river/splash-mope/splash_mope_attack_01.png",
            "width": 194,
            "height": 77,
            "contentWidth": 186,
            "contentHeight": 69,
            "anchorX": 41,
            "anchorY": 73
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/river/splash-mope/splash_mope_hurt_01.png",
            "width": 101,
            "height": 75,
            "contentWidth": 93,
            "contentHeight": 67,
            "anchorX": 41,
            "anchorY": 71
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/river/splash-mope/splash_mope_death_01.png",
            "width": 136,
            "height": 75,
            "contentWidth": 128,
            "contentHeight": 67,
            "anchorX": 41,
            "anchorY": 71
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/river/splash-mope/splash_mope_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "shadow_sentry": {
    "id": "shadow_sentry",
    "folder": "/assets/enemies/summit/shadow-sentry",
    "zone": "zone6_summit",
    "isFlying": false,
    "moveAlias": "walk",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/summit/shadow-sentry/shadow_sentry_idle_01.png",
            "width": 95,
            "height": 67,
            "contentWidth": 87,
            "contentHeight": 59,
            "anchorX": 48,
            "anchorY": 63
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/summit/shadow-sentry/shadow_sentry_move_01.png",
            "width": 78,
            "height": 66,
            "contentWidth": 70,
            "contentHeight": 58,
            "anchorX": 39,
            "anchorY": 62
          },
          {
            "index": 1,
            "file": "/assets/enemies/summit/shadow-sentry/shadow_sentry_move_02.png",
            "width": 97,
            "height": 67,
            "contentWidth": 89,
            "contentHeight": 59,
            "anchorX": 49,
            "anchorY": 63
          }
        ]
      },
      "attack": {
        "frameCount": 1,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/summit/shadow-sentry/shadow_sentry_attack_01.png",
            "width": 177,
            "height": 67,
            "contentWidth": 169,
            "contentHeight": 59,
            "anchorX": 48,
            "anchorY": 63
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/summit/shadow-sentry/shadow_sentry_hurt_01.png",
            "width": 106,
            "height": 67,
            "contentWidth": 98,
            "contentHeight": 59,
            "anchorX": 53,
            "anchorY": 63
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/summit/shadow-sentry/shadow_sentry_death_01.png",
            "width": 127,
            "height": 67,
            "contentWidth": 119,
            "contentHeight": 59,
            "anchorX": 48,
            "anchorY": 63
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/summit/shadow-sentry/shadow_sentry_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "ash_wisp": {
    "id": "ash_wisp",
    "folder": "/assets/enemies/summit/ash-wisp",
    "zone": "zone6_summit",
    "isFlying": true,
    "moveAlias": "float",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/summit/ash-wisp/ash_wisp_idle_01.png",
            "width": 77,
            "height": 58,
            "contentWidth": 69,
            "contentHeight": 50,
            "anchorX": 39,
            "anchorY": 54
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/summit/ash-wisp/ash_wisp_move_01.png",
            "width": 79,
            "height": 59,
            "contentWidth": 71,
            "contentHeight": 51,
            "anchorX": 40,
            "anchorY": 55
          },
          {
            "index": 1,
            "file": "/assets/enemies/summit/ash-wisp/ash_wisp_move_02.png",
            "width": 82,
            "height": 54,
            "contentWidth": 74,
            "contentHeight": 46,
            "anchorX": 41,
            "anchorY": 50
          }
        ]
      },
      "attack": {
        "frameCount": 1,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/summit/ash-wisp/ash_wisp_attack_01.png",
            "width": 158,
            "height": 51,
            "contentWidth": 150,
            "contentHeight": 43,
            "anchorX": 39,
            "anchorY": 47
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/summit/ash-wisp/ash_wisp_hurt_01.png",
            "width": 81,
            "height": 56,
            "contentWidth": 73,
            "contentHeight": 48,
            "anchorX": 41,
            "anchorY": 52
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/summit/ash-wisp/ash_wisp_death_01.png",
            "width": 122,
            "height": 56,
            "contentWidth": 114,
            "contentHeight": 48,
            "anchorX": 39,
            "anchorY": 52
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/summit/ash-wisp/ash_wisp_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "beacon_husk": {
    "id": "beacon_husk",
    "folder": "/assets/enemies/summit/beacon-husk",
    "zone": "zone6_summit",
    "isFlying": false,
    "moveAlias": "walk",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 4,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/summit/beacon-husk/beacon_husk_idle_01.png",
            "width": 94,
            "height": 83,
            "contentWidth": 86,
            "contentHeight": 75,
            "anchorX": 47,
            "anchorY": 79
          }
        ]
      },
      "move": {
        "frameCount": 2,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/summit/beacon-husk/beacon_husk_move_01.png",
            "width": 94,
            "height": 83,
            "contentWidth": 86,
            "contentHeight": 75,
            "anchorX": 47,
            "anchorY": 79
          },
          {
            "index": 1,
            "file": "/assets/enemies/summit/beacon-husk/beacon_husk_move_02.png",
            "width": 104,
            "height": 83,
            "contentWidth": 96,
            "contentHeight": 75,
            "anchorX": 52,
            "anchorY": 79
          }
        ]
      },
      "attack": {
        "frameCount": 1,
        "fps": 8,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/summit/beacon-husk/beacon_husk_attack_01.png",
            "width": 157,
            "height": 83,
            "contentWidth": 149,
            "contentHeight": 75,
            "anchorX": 47,
            "anchorY": 79
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/summit/beacon-husk/beacon_husk_hurt_01.png",
            "width": 86,
            "height": 79,
            "contentWidth": 78,
            "contentHeight": 71,
            "anchorX": 43,
            "anchorY": 75
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/enemies/summit/beacon-husk/beacon_husk_death_01.png",
            "width": 94,
            "height": 82,
            "contentWidth": 86,
            "contentHeight": 74,
            "anchorX": 47,
            "anchorY": 78
          }
        ]
      }
    },
    "isBoss": false,
    "portrait": "/assets/enemies/summit/beacon-husk/beacon_husk_idle_01.png",
    "hurtbox": {
      "width": 22,
      "height": 24
    },
    "attackBox": {
      "width": 24,
      "height": 18,
      "offsetX": 14,
      "offsetY": -12
    }
  },
  "great_mope": {
    "id": "great_mope",
    "folder": "/assets/bosses/great-mope",
    "zone": "zone1_meadow",
    "isBoss": true,
    "isFlying": false,
    "portrait": "/assets/bosses/great-mope/great_mope_idle_01.png",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/great-mope/great_mope_idle_01.png",
            "width": 143,
            "height": 82,
            "contentWidth": 135,
            "contentHeight": 74,
            "anchorX": 72,
            "anchorY": 78
          }
        ]
      },
      "move": {
        "frameCount": 1,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/great-mope/great_mope_idle_01.png",
            "width": 143,
            "height": 82,
            "contentWidth": 135,
            "contentHeight": 74,
            "anchorX": 72,
            "anchorY": 78
          }
        ]
      },
      "attack": {
        "frameCount": 2,
        "fps": 5,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/great-mope/great_mope_hurt_01.png",
            "width": 164,
            "height": 96,
            "contentWidth": 156,
            "contentHeight": 88,
            "anchorX": 82,
            "anchorY": 92
          },
          {
            "index": 1,
            "file": "/assets/bosses/great-mope/great_mope_attack_01.png",
            "width": 142,
            "height": 96,
            "contentWidth": 134,
            "contentHeight": 88,
            "anchorX": 71,
            "anchorY": 92
          }
        ]
      },
      "special": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/great-mope/great_mope_move_01.png",
            "width": 164,
            "height": 92,
            "contentWidth": 156,
            "contentHeight": 84,
            "anchorX": 82,
            "anchorY": 88
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/great-mope/great_mope_hurt_01.png",
            "width": 164,
            "height": 96,
            "contentWidth": 156,
            "contentHeight": 88,
            "anchorX": 82,
            "anchorY": 92
          }
        ]
      },
      "death": {
        "frameCount": 2,
        "fps": 5,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/great-mope/great_mope_hurt_01.png",
            "width": 164,
            "height": 96,
            "contentWidth": 156,
            "contentHeight": 88,
            "anchorX": 82,
            "anchorY": 92
          },
          {
            "index": 1,
            "file": "/assets/bosses/great-mope/great_mope_move_01.png",
            "width": 164,
            "height": 92,
            "contentWidth": 156,
            "contentHeight": 84,
            "anchorX": 82,
            "anchorY": 88
          }
        ]
      }
    },
    "hurtbox": {
      "width": 48,
      "height": 48
    },
    "attackBox": {
      "width": 44,
      "height": 34,
      "offsetX": 24,
      "offsetY": -22
    }
  },
  "rolling_gloom": {
    "id": "rolling_gloom",
    "folder": "/assets/bosses/rolling-gloom",
    "zone": "zone2_hills",
    "isBoss": true,
    "isFlying": false,
    "portrait": "/assets/bosses/rolling-gloom/rolling_gloom_idle_01.png",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/rolling-gloom/rolling_gloom_idle_01.png",
            "width": 134,
            "height": 82,
            "contentWidth": 126,
            "contentHeight": 74,
            "anchorX": 67,
            "anchorY": 78
          }
        ]
      },
      "move": {
        "frameCount": 1,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/rolling-gloom/rolling_gloom_move_01.png",
            "width": 161,
            "height": 96,
            "contentWidth": 153,
            "contentHeight": 88,
            "anchorX": 81,
            "anchorY": 92
          }
        ]
      },
      "attack": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/rolling-gloom/rolling_gloom_attack_01.png",
            "width": 134,
            "height": 96,
            "contentWidth": 126,
            "contentHeight": 88,
            "anchorX": 67,
            "anchorY": 92
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/rolling-gloom/rolling_gloom_hurt_01.png",
            "width": 166,
            "height": 96,
            "contentWidth": 158,
            "contentHeight": 88,
            "anchorX": 83,
            "anchorY": 92
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/rolling-gloom/rolling_gloom_death_01.png",
            "width": 166,
            "height": 96,
            "contentWidth": 158,
            "contentHeight": 88,
            "anchorX": 83,
            "anchorY": 92
          }
        ]
      }
    },
    "hurtbox": {
      "width": 48,
      "height": 48
    },
    "attackBox": {
      "width": 44,
      "height": 34,
      "offsetX": 24,
      "offsetY": -22
    }
  },
  "thornmother": {
    "id": "thornmother",
    "folder": "/assets/bosses/thornmother",
    "zone": "zone3_woods",
    "isBoss": true,
    "isFlying": false,
    "portrait": "/assets/bosses/thornmother/thornmother_idle_01.png",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/thornmother/thornmother_idle_01.png",
            "width": 143,
            "height": 93,
            "contentWidth": 135,
            "contentHeight": 85,
            "anchorX": 72,
            "anchorY": 89
          }
        ]
      },
      "move": {
        "frameCount": 1,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/thornmother/thornmother_idle_01.png",
            "width": 143,
            "height": 93,
            "contentWidth": 135,
            "contentHeight": 85,
            "anchorX": 72,
            "anchorY": 89
          }
        ]
      },
      "attack": {
        "frameCount": 2,
        "fps": 5,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/thornmother/thornmother_idle_01.png",
            "width": 143,
            "height": 93,
            "contentWidth": 135,
            "contentHeight": 85,
            "anchorX": 72,
            "anchorY": 89
          },
          {
            "index": 1,
            "file": "/assets/bosses/thornmother/thornmother_attack_01.png",
            "width": 164,
            "height": 93,
            "contentWidth": 156,
            "contentHeight": 85,
            "anchorX": 82,
            "anchorY": 89
          }
        ]
      },
      "special": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/thornmother/thornmother_move_01.png",
            "width": 143,
            "height": 101,
            "contentWidth": 135,
            "contentHeight": 93,
            "anchorX": 72,
            "anchorY": 97
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/thornmother/thornmother_hurt_01.png",
            "width": 164,
            "height": 106,
            "contentWidth": 156,
            "contentHeight": 98,
            "anchorX": 82,
            "anchorY": 102
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/thornmother/thornmother_death_01.png",
            "width": 164,
            "height": 106,
            "contentWidth": 156,
            "contentHeight": 98,
            "anchorX": 82,
            "anchorY": 102
          }
        ]
      }
    },
    "hurtbox": {
      "width": 48,
      "height": 52
    },
    "attackBox": {
      "width": 46,
      "height": 34,
      "offsetX": 24,
      "offsetY": -22
    }
  },
  "echo_maw": {
    "id": "echo_maw",
    "folder": "/assets/bosses/echo-maw",
    "zone": "zone4_caves",
    "isBoss": true,
    "isFlying": false,
    "portrait": "/assets/bosses/echo-maw/echo_maw_move_01.png",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/echo-maw/echo_maw_move_01.png",
            "width": 161,
            "height": 94,
            "contentWidth": 153,
            "contentHeight": 86,
            "anchorX": 81,
            "anchorY": 90
          }
        ]
      },
      "move": {
        "frameCount": 1,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/echo-maw/echo_maw_move_01.png",
            "width": 161,
            "height": 94,
            "contentWidth": 153,
            "contentHeight": 86,
            "anchorX": 81,
            "anchorY": 90
          }
        ]
      },
      "attack": {
        "frameCount": 2,
        "fps": 5,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/echo-maw/echo_maw_move_01.png",
            "width": 161,
            "height": 94,
            "contentWidth": 153,
            "contentHeight": 86,
            "anchorX": 81,
            "anchorY": 90
          },
          {
            "index": 1,
            "file": "/assets/bosses/echo-maw/echo_maw_attack_01.png",
            "width": 134,
            "height": 101,
            "contentWidth": 126,
            "contentHeight": 93,
            "anchorX": 67,
            "anchorY": 97
          }
        ]
      },
      "special": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/echo-maw/echo_maw_idle_01.png",
            "width": 134,
            "height": 85,
            "contentWidth": 126,
            "contentHeight": 77,
            "anchorX": 67,
            "anchorY": 81
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/echo-maw/echo_maw_hurt_01.png",
            "width": 166,
            "height": 106,
            "contentWidth": 158,
            "contentHeight": 98,
            "anchorX": 83,
            "anchorY": 102
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/echo-maw/echo_maw_death_01.png",
            "width": 166,
            "height": 106,
            "contentWidth": 158,
            "contentHeight": 98,
            "anchorX": 83,
            "anchorY": 102
          }
        ]
      }
    },
    "hurtbox": {
      "width": 48,
      "height": 50
    },
    "attackBox": {
      "width": 46,
      "height": 34,
      "offsetX": 24,
      "offsetY": -22
    }
  },
  "undertow": {
    "id": "undertow",
    "folder": "/assets/bosses/undertow",
    "zone": "zone5_river",
    "isBoss": true,
    "isFlying": false,
    "portrait": "/assets/bosses/undertow/undertow_idle_01.png",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/undertow/undertow_idle_01.png",
            "width": 143,
            "height": 78,
            "contentWidth": 135,
            "contentHeight": 70,
            "anchorX": 72,
            "anchorY": 74
          }
        ]
      },
      "move": {
        "frameCount": 1,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/undertow/undertow_move_01.png",
            "width": 143,
            "height": 113,
            "contentWidth": 135,
            "contentHeight": 105,
            "anchorX": 72,
            "anchorY": 109
          }
        ]
      },
      "attack": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/undertow/undertow_attack_01.png",
            "width": 164,
            "height": 78,
            "contentWidth": 156,
            "contentHeight": 70,
            "anchorX": 82,
            "anchorY": 74
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/undertow/undertow_hurt_01.png",
            "width": 164,
            "height": 118,
            "contentWidth": 156,
            "contentHeight": 110,
            "anchorX": 82,
            "anchorY": 114
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/undertow/undertow_death_01.png",
            "width": 164,
            "height": 118,
            "contentWidth": 156,
            "contentHeight": 110,
            "anchorX": 82,
            "anchorY": 114
          }
        ]
      }
    },
    "hurtbox": {
      "width": 48,
      "height": 50
    },
    "attackBox": {
      "width": 46,
      "height": 34,
      "offsetX": 24,
      "offsetY": -22
    }
  },
  "blaze_shadow": {
    "id": "blaze_shadow",
    "folder": "/assets/bosses/blazes-shadow",
    "zone": "zone6_summit",
    "isBoss": true,
    "isFlying": false,
    "portrait": "/assets/bosses/blazes-shadow/blaze_shadow_idle_01.png",
    "animations": {
      "idle": {
        "frameCount": 1,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/blazes-shadow/blaze_shadow_idle_01.png",
            "width": 130,
            "height": 78,
            "contentWidth": 122,
            "contentHeight": 70,
            "anchorX": 65,
            "anchorY": 74
          }
        ]
      },
      "move": {
        "frameCount": 1,
        "fps": 6,
        "loop": true,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/blazes-shadow/blaze_shadow_move_01.png",
            "width": 161,
            "height": 78,
            "contentWidth": 153,
            "contentHeight": 70,
            "anchorX": 81,
            "anchorY": 74
          }
        ]
      },
      "attack": {
        "frameCount": 2,
        "fps": 5,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/blazes-shadow/blaze_shadow_attack_01.png",
            "width": 134,
            "height": 113,
            "contentWidth": 126,
            "contentHeight": 105,
            "anchorX": 67,
            "anchorY": 109
          },
          {
            "index": 1,
            "file": "/assets/bosses/blazes-shadow/blaze_shadow_hurt_01.png",
            "width": 166,
            "height": 118,
            "contentWidth": 158,
            "contentHeight": 110,
            "anchorX": 83,
            "anchorY": 114
          }
        ]
      },
      "special": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/blazes-shadow/blaze_shadow_hurt_01.png",
            "width": 166,
            "height": 118,
            "contentWidth": 158,
            "contentHeight": 110,
            "anchorX": 83,
            "anchorY": 114
          }
        ]
      },
      "hurt": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/blazes-shadow/blaze_shadow_idle_01.png",
            "width": 130,
            "height": 78,
            "contentWidth": 122,
            "contentHeight": 70,
            "anchorX": 65,
            "anchorY": 74
          }
        ]
      },
      "death": {
        "frameCount": 1,
        "fps": 6,
        "loop": false,
        "frames": [
          {
            "index": 0,
            "file": "/assets/bosses/blazes-shadow/blaze_shadow_death_01.png",
            "width": 166,
            "height": 118,
            "contentWidth": 158,
            "contentHeight": 110,
            "anchorX": 83,
            "anchorY": 114
          }
        ]
      }
    },
    "hurtbox": {
      "width": 36,
      "height": 42
    },
    "attackBox": {
      "width": 44,
      "height": 34,
      "offsetX": 24,
      "offsetY": -22
    }
  }
} as unknown as Record<EnemyType, EnemySpriteManifestEntry>;
