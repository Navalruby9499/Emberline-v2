/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Settings, Home, MapPin, Star, Sword, Heart } from 'lucide-react';
import { ZoneId } from '../types/game';

interface PauseMenuProps {
  onResume: () => void;
  onRestartCheckpoint: () => void;
  onSelectZone: (zoneId: ZoneId) => void;
  onOpenSettings: () => void;
  onQuitToTitle: () => void;
  currentZone: ZoneId;
  level: number;
  xp: number;
  maxXp: number;
  maxHealth: number;
  attackBonus: number;
  resetsRemaining: number;
  maxResetsPerRun: number;
}

const ZONE_OPTIONS: { id: ZoneId; label: string }[] = [
  { id: 'prologue_forge', label: '00 Forge Gate' },
  { id: 'zone1_meadow', label: '01 Meadow' },
  { id: 'zone2_hills', label: '02 Hills' },
  { id: 'zone3_woods', label: '03 Woods' },
  { id: 'zone4_caves', label: '04 Caves' },
  { id: 'zone5_river', label: '05 River' },
  { id: 'zone6_summit', label: '06 Summit' },
];

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestartCheckpoint,
  onSelectZone,
  onOpenSettings,
  onQuitToTitle,
  currentZone,
  level,
  xp,
  maxXp,
  maxHealth,
  attackBonus,
  resetsRemaining,
  maxResetsPerRun,
}) => {
  const xpPercent = maxXp > 0 ? Math.min(100, Math.round((xp / maxXp) * 100)) : 100;
  const canResetRun = resetsRemaining > 0;

  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-semibold">
            {currentZone.replace('_', ' ').toUpperCase()}
          </span>
          <h2 className="text-lg font-bold font-cinzel text-white mt-0.5">
            GAME PAUSED
          </h2>
        </div>

        {/* Blaze RPG Progression & Total Run Reset Status */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-bold text-amber-300 font-mono">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              BLAZE — LEVEL {level}
            </span>
            <span className="text-[10px] font-mono text-slate-300">
              XP: {xp} / {maxXp} ({xpPercent}%)
            </span>
          </div>

          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-amber-500/40 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-200 transition-all"
              style={{ width: `${xpPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-[10px] font-mono">
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg py-1 px-2 flex items-center justify-center gap-1 text-rose-300">
              <Heart size={11} className="fill-rose-500 text-rose-400" />
              <span>{Math.ceil(maxHealth / 2)} Hearts ({maxHealth} HP)</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg py-1 px-2 flex items-center justify-center gap-1 text-amber-300">
              <Sword size={11} />
              <span>+{attackBonus} Bonus ATK</span>
            </div>
            <div
              className={`bg-slate-950/80 border rounded-lg py-1 px-2 flex items-center justify-center gap-1 ${
                canResetRun
                  ? 'border-sky-500/40 text-sky-300'
                  : 'border-rose-500/50 text-rose-400'
              }`}
            >
              <RotateCcw size={11} />
              <span>Run Resets: {resetsRemaining}/{maxResetsPerRun}</span>
            </div>
          </div>
        </div>

        {/* Zone Quick-Jump Selector */}
        <div className="w-full bg-slate-900/70 border border-slate-800 rounded-xl p-2.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-center gap-1">
            <MapPin size={11} className="text-rose-400" />
            Warp to Zone (Test All Enemies & Bosses)
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {ZONE_OPTIONS.map((z) => {
              const isCurrent = currentZone === z.id;
              return (
                <button
                  key={z.id}
                  onClick={() => {
                    if (isCurrent) {
                      onRestartCheckpoint();
                    } else {
                      onSelectZone(z.id);
                    }
                  }}
                  disabled={isCurrent && !canResetRun}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    isCurrent
                      ? canResetRun
                        ? 'bg-rose-600 text-white cursor-pointer'
                        : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer'
                  }`}
                >
                  {z.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <button
            onClick={onResume}
            className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs tracking-wider shadow-md shadow-rose-950/40 cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <Play size={15} />
            Resume [ESC]
          </button>

          <button
            onClick={onRestartCheckpoint}
            disabled={!canResetRun}
            className={`w-full py-2 px-4 rounded-xl text-xs font-semibold border transition-colors flex items-center justify-center gap-2 ${
              canResetRun
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 cursor-pointer'
                : 'bg-slate-950 text-rose-400/70 border-rose-950/60 cursor-not-allowed'
            }`}
          >
            <RotateCcw size={14} />
            {canResetRun
              ? `Use Run Reset (${resetsRemaining}/${maxResetsPerRun} Total Run Resets Left)`
              : `No Run Resets Left (0/${maxResetsPerRun} For Whole Run)`}
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Settings size={14} />
            Settings
          </button>

          <button
            onClick={onQuitToTitle}
            className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 text-xs font-semibold border border-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home size={14} />
            Return to Title Menu
          </button>
        </div>
      </div>
    </div>
  );
};
