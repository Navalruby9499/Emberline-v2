/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Sparkles, Users, Settings, BookOpen, RotateCcw, Skull } from 'lucide-react';
import { ZoneId } from '../types/game';

interface TitleMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
  onSelectZone: (zoneId: ZoneId) => void;
  onOpenCodex: () => void;
  onOpenSettings: () => void;
  hasSaveData: boolean;
}

const QUICK_ZONES: { id: ZoneId; num: string; title: string; boss: string }[] = [
  { id: 'zone1_meadow', num: '01', title: 'Forgotten Meadow', boss: 'The Great Mope' },
  { id: 'zone2_hills', num: '02', title: 'Hollow Hills', boss: 'The Rolling Gloom' },
  { id: 'zone3_woods', num: '03', title: 'Weeping Woods', boss: 'Thornmother' },
  { id: 'zone4_caves', num: '04', title: 'Echoing Caves', boss: 'Echo Maw' },
  { id: 'zone5_river', num: '05', title: 'Broken River', boss: 'Undertow' },
  { id: 'zone6_summit', num: '06', title: 'Beacon Summit', boss: 'Blaze’s Shadow' },
];

export const TitleMenu: React.FC<TitleMenuProps> = ({
  onNewGame,
  onContinue,
  onSelectZone,
  onOpenCodex,
  onOpenSettings,
  hasSaveData,
}) => {
  const [showControlsModal, setShowControlsModal] = useState(false);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-950 via-[#130d19] to-slate-950 text-slate-100 select-none overflow-y-auto font-sans">
      {/* Background artwork and atmospheric glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <img
          src="/assets/aistudio/BLAZE__Crimson_Flame_Character_Sheet_b4e16cb5.png"
          alt="Emberline Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover filter blur-xs"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
      </div>

      {/* Top Banner / Version */}
      <div className="z-10 flex items-center justify-between w-full max-w-4xl text-xs text-slate-400">
        <span className="font-mono text-rose-400 tracking-wider font-semibold">
          VERSION 1.0 · ALL 6 ZONES, 18 ENEMIES & 6 BOSSES
        </span>
        <div className="flex items-center gap-3">
          <span>Nine Districts</span>
          <span>·</span>
          <span>One Crimson Flame</span>
        </div>
      </div>

      {/* Central Branding */}
      <div className="z-10 flex flex-col items-center text-center my-auto w-full max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-semibold mb-2 tracking-wide">
          <Sparkles size={13} className="text-rose-400" />
          The Canonical Blaze Campaign
        </div>

        <h1 className="text-4xl md:text-5xl font-black font-cinzel tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-amber-200 drop-shadow-md">
          EMBERLINE
        </h1>
        <h2 className="text-lg md:text-xl font-bold tracking-widest text-rose-400 uppercase font-cinzel mt-0.5">
          The Crimson Flame
        </h2>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-2 w-72 mt-5">
          <button
            onClick={() => onSelectZone('zone1_meadow')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-950/50 cursor-pointer transition-all flex items-center justify-center gap-2 border border-pink-400/40"
          >
            <Skull size={15} />
            Play 01 Forgotten Meadow (Enemies & Boss)
          </button>

          {hasSaveData && (
            <button
              onClick={onContinue}
              className="w-full py-2 px-4 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs tracking-wide cursor-pointer transition-all flex items-center justify-center gap-2 border border-rose-400/30"
            >
              <RotateCcw size={14} />
              Continue Saved Journey
            </button>
          )}

          <button
            onClick={onNewGame}
            className="w-full py-2 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-xs tracking-wide border border-slate-700 cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <Play size={14} />
            Play Prologue: Forge Gate Tutorial
          </button>

          <button
            onClick={onOpenCodex}
            className="w-full py-2 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-purple-300 hover:text-white text-xs font-semibold border border-purple-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Users size={15} className="text-purple-400" />
            Hush Bestiary (18 Enemies & 6 Bosses)
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowControlsModal(true)}
              className="py-1.5 px-3 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-800/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookOpen size={13} />
              Controls
            </button>

            <button
              onClick={onOpenSettings}
              className="py-1.5 px-3 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-800/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Settings size={13} />
              Settings
            </button>
          </div>
        </div>

        {/* Direct 6-Zone & Boss Select Strip */}
        <div className="w-full mt-5 bg-slate-900/75 border border-slate-800 rounded-2xl p-3 backdrop-blur-md">
          <div className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold mb-2">
            Direct Zone & Boss Select (Zones 01–06)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUICK_ZONES.map((z) => (
              <button
                key={z.id}
                onClick={() => onSelectZone(z.id)}
                className="p-2 rounded-xl bg-slate-950/90 hover:bg-purple-950/50 border border-slate-800 hover:border-purple-500/50 text-left transition-all cursor-pointer flex flex-col"
              >
                <span className="text-[10px] font-mono font-bold text-rose-400">
                  {z.num} {z.title}
                </span>
                <span className="text-[10px] text-slate-300 truncate">
                  Boss: {z.boss}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Canon Motto */}
      <div className="z-10 text-center">
        <p className="text-[11px] text-slate-400 font-cinzel tracking-wider">
          “One flame may guide you. Nine flames will bring you home.”
        </p>
      </div>

      {/* Controls Modal */}
      {showControlsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-rose-400 font-cinzel">Combat & Controls</h3>
              <button
                onClick={() => setShowControlsModal(false)}
                className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1 rounded"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Move Left / Right</span>
                <span className="font-mono font-bold text-rose-300 bg-slate-800 px-2 py-0.5 rounded">A / D / ← →</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Jump (Coyote/Buffer)</span>
                <span className="font-mono font-bold text-rose-300 bg-slate-800 px-2 py-0.5 rounded">Space</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Flame Slash (3-Hit)</span>
                <span className="font-mono font-bold text-rose-300 bg-slate-800 px-2 py-0.5 rounded">J</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Crescent Wave (Ranged)</span>
                <span className="font-mono font-bold text-rose-300 bg-slate-800 px-2 py-0.5 rounded">K</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Ember Dash</span>
                <span className="font-mono font-bold text-rose-300 bg-slate-800 px-2 py-0.5 rounded">Shift</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Crimson Cyclone</span>
                <span className="font-mono font-bold text-rose-300 bg-slate-800 px-2 py-0.5 rounded">L (100% SP)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex justify-between items-center col-span-2">
                <span className="text-slate-400">Interact / Beacons / Talk</span>
                <span className="font-mono font-bold text-blue-300 bg-slate-800 px-2 py-0.5 rounded">E</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
