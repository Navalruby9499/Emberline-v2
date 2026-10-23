/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Sparkles, Flame, ShieldAlert, Wind, Compass, RotateCcw, Sword, Star } from 'lucide-react';
import { ZoneId } from '../types/game';

interface GameHUDProps {
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
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  health,
  maxHealth,
  skillMeter,
  heat,
  isOverheated,
  sparks,
  level,
  xp,
  maxXp,
  attackBonus,
  resetsRemaining,
  maxResetsPerRun,
  levelUpNotification,
  dashCooldownRemaining,
  bossHealth,
  bossMaxHealth,
  bossName,
  currentZone,
  isBeaconLit,
  prologueObjective,
  onPause,
}) => {
  const totalHearts = Math.ceil(maxHealth / 2);
  const isCycloneReady = skillMeter >= 100;
  const xpPercent = maxXp > 0 ? Math.min(100, Math.round((xp / maxXp) * 100)) : 100;

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3.5 font-sans">
      {/* Top Header: Blaze Stats, Objective Banner & Meta */}
      <div className="flex items-start justify-between w-full gap-4">
        {/* Left: Blaze Status Frame */}
        <div className="flex items-center gap-3 bg-slate-950/90 backdrop-blur-md p-2.5 rounded-2xl border-2 border-rose-950/80 shadow-xl pointer-events-auto">
          {/* Dedicated Blaze Portrait Frame + Level Badge */}
          <div className="relative w-13 h-13 rounded-xl overflow-hidden border-2 border-rose-500/80 bg-slate-900 shrink-0 shadow-md shadow-rose-950/40">
            <img
              src="/assets/aistudio/blaze_determined_7aa95969.png"
              alt="Blaze"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            {/* Level Tag */}
            <div className="absolute top-0 right-0 bg-amber-500/95 text-slate-950 text-[8px] font-mono font-extrabold px-1 py-0.2 rounded-bl-md shadow">
              LV.{level}
            </div>
            {/* Guard Name Tag */}
            <div className="absolute bottom-0 inset-x-0 bg-rose-950/90 text-[8px] font-mono font-bold text-center text-rose-300 border-t border-rose-500/40">
              BLAZE
            </div>
          </div>

          {/* Vitals: Hearts, XP Bar, Cyclone & Overheat */}
          <div className="flex flex-col gap-1">
            {/* Ornate Pixel Hearts & Attack Bonus */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: totalHearts }).map((_, i) => {
                  const heartHp = health - i * 2;
                  const isFull = heartHp >= 2;
                  const isHalf = heartHp === 1;

                  return (
                    <div key={i} className="relative flex items-center justify-center">
                      <Heart
                        size={16}
                        className={`transition-transform duration-150 ${
                          isFull
                            ? 'fill-rose-500 text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                            : isHalf
                            ? 'fill-rose-500/50 text-rose-400'
                            : 'fill-slate-900 text-slate-700'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {attackBonus > 0 && (
                <span className="flex items-center gap-0.5 text-[9px] font-mono font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-1.5 py-0.2 rounded">
                  <Sword size={9} />+{attackBonus} ATK
                </span>
              )}
            </div>

            {/* RPG Level XP Progress Bar */}
            <div className="flex items-center gap-2">
              <div className="w-28 h-1.5 bg-slate-900/90 rounded-full overflow-hidden border border-amber-500/40">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-200 transition-all duration-200"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="text-[8px] font-mono font-bold text-amber-300 tabular-nums">
                XP {xp}/{maxXp}
              </span>
            </div>

            {/* Skill Meter: Crimson Cyclone */}
            <div className="flex items-center gap-2">
              <div className="w-28 h-2 bg-slate-900/90 rounded-full overflow-hidden border border-slate-700 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-150 ${
                    isCycloneReady
                      ? 'bg-gradient-to-r from-rose-500 via-pink-400 to-amber-300 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, skillMeter)}%` }}
                />
              </div>
              <span
                className={`text-[9px] font-mono font-bold tracking-tight ${
                  isCycloneReady ? 'text-amber-300 animate-bounce' : 'text-rose-400'
                }`}
              >
                {isCycloneReady ? 'CYCLONE [L]' : `${skillMeter}%`}
              </span>
            </div>

            {/* Emberfang Temperature / Overheat Indicator */}
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-slate-400 flex items-center gap-0.5 font-medium">
                <Flame
                  size={11}
                  className={isOverheated ? 'text-rose-500 animate-bounce' : 'text-amber-400'}
                />
                Heat:
              </span>
              <div className="flex gap-1 items-center">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-3.5 h-1.5 rounded-xs transition-colors duration-150 ${
                      isOverheated
                        ? 'bg-rose-500 animate-pulse'
                        : heat >= step
                        ? 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.5)]'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              {isOverheated && (
                <span className="text-rose-400 font-mono text-[9px] font-bold tracking-wider animate-pulse ml-1">
                  OVERHEAT (2s)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Top Objective Banner, Level-Up Celebration & Boss Health Bar */}
        <div className="flex-1 flex flex-col items-center gap-1.5 max-w-lg mx-auto">
          {levelUpNotification && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-950/95 via-rose-950/95 to-amber-950/95 backdrop-blur-md px-4 py-1.5 rounded-xl border-2 border-amber-400/80 text-xs font-extrabold text-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.5)] animate-bounce pointer-events-none">
              <Star size={14} className="text-amber-300 fill-amber-300 shrink-0" />
              <span className="tracking-wide font-cinzel">{levelUpNotification}</span>
            </div>
          )}

          {prologueObjective && (
            <div className="flex items-center gap-2 bg-slate-950/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-rose-500/50 text-xs font-semibold text-rose-200 shadow-xl w-full justify-center text-center pointer-events-auto">
              <Compass size={14} className="text-rose-400 shrink-0 animate-spin-slow" />
              <span className="truncate">{prologueObjective}</span>
            </div>
          )}

          {/* Boss Health Bar (anchored at top center) */}
          {bossHealth !== null && bossMaxHealth !== null && bossHealth > 0 && (
            <div className="w-full bg-slate-950/95 backdrop-blur-md px-3.5 py-2 rounded-xl border-2 border-rose-950/80 shadow-2xl flex flex-col gap-1 animate-in fade-in duration-300 pointer-events-auto">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-400 tracking-wider flex items-center gap-1.5 font-cinzel">
                  <ShieldAlert size={14} />
                  {bossName || 'BOSS ENCOUNTER'}
                </span>
                <span className="font-mono text-[11px] text-slate-300 font-bold tabular-nums">
                  {bossHealth} / {bossMaxHealth}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-600 via-pink-500 to-rose-400 transition-all duration-150 shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                  style={{ width: `${Math.max(0, (bossHealth / bossMaxHealth) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Total Run Resets, Sparks, Dash Indicator & Menu */}
        <div className="flex items-center gap-2 pointer-events-auto shrink-0">
          {/* Total Run Resets Counter (3 for the whole run) */}
          <div
            className={`flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border shadow-lg ${
              resetsRemaining > 0
                ? 'border-sky-500/40 text-sky-300'
                : 'border-rose-600/60 text-rose-400'
            }`}
            title="Remaining Total Resets for the Entire Run"
          >
            <RotateCcw size={13} className={resetsRemaining > 0 ? 'text-sky-400' : 'text-rose-500'} />
            <span className="font-mono text-[10px] font-bold tabular-nums">
              Run Resets: {resetsRemaining}/{maxResetsPerRun}
            </span>
          </div>

          {/* Golden Sparks Counter */}
          <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 shadow-lg">
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span className="font-mono text-xs font-bold text-amber-300 tabular-nums">
              {sparks}
            </span>
          </div>

          {/* Dash Cooldown Indicator */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs shadow-lg transition-colors ${
              dashCooldownRemaining <= 0
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                : 'bg-slate-950/90 border-slate-800 text-slate-500'
            }`}
          >
            <Wind size={13} />
            <span className="text-[10px] font-mono font-semibold">
              {dashCooldownRemaining <= 0 ? 'DASH' : `${dashCooldownRemaining.toFixed(1)}s`}
            </span>
          </div>

          {/* Pause Menu Trigger */}
          <button
            onClick={onPause}
            className="bg-slate-950/90 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-bold cursor-pointer transition-colors shadow-lg"
          >
            ESC
          </button>
        </div>
      </div>

      {/* Bottom Hint Banner */}
      <div className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/85 backdrop-blur-md px-4 py-1.5 rounded-xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-4">
          <span>Move: <strong className="text-white">A / D</strong></span>
          <span>Jump: <strong className="text-white">Space</strong></span>
          <span>Flame Slash: <strong className="text-rose-400">J</strong></span>
          <span>Crescent Wave: <strong className="text-pink-400">K</strong></span>
          <span>Ember Dash: <strong className="text-amber-400">Shift</strong></span>
          <span>Crimson Cyclone: <strong className="text-rose-300">L</strong></span>
          <span>Interact: <strong className="text-blue-400">E</strong></span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="text-amber-300 font-bold">LV.{level}</span>
          <span>Beacon: {isBeaconLit ? <strong className="text-rose-400">LIT</strong> : <strong className="text-slate-500">UNLIT</strong>}</span>
        </div>
      </div>
    </div>
  );
};
