/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NINE_HEROES, BESTIARY_DATA, HUSH_BESTIARY_IMAGES } from '../game/constants';
import { ENEMY_SPRITE_MANIFEST } from '../game/enemySpriteManifest';
import { HeroProfile, BestiaryEntry, ZoneId } from '../types/game';
import {
  Shield,
  Lock,
  Sparkles,
  Sword,
  MapPin,
  ArrowLeft,
  Skull,
  Eye,
  Flame,
  Activity,
  Image as ImageIcon,
  Play,
} from 'lucide-react';

interface RosterCodexProps {
  onSelectBlaze: () => void;
  onDeployZone?: (zoneId: ZoneId) => void;
  onBack: () => void;
}

const ZONE_ID_BY_NUMBER: Record<number, ZoneId> = {
  1: 'zone1_meadow',
  2: 'zone2_hills',
  3: 'zone3_woods',
  4: 'zone4_caves',
  5: 'zone5_river',
  6: 'zone6_summit',
};

export const RosterCodex: React.FC<RosterCodexProps> = ({
  onSelectBlaze,
  onDeployZone,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'heroes' | 'bestiary'>('bestiary');
  const [selectedHero, setSelectedHero] = useState<HeroProfile>(NINE_HEROES[0]);
  const [selectedEnemy, setSelectedEnemy] = useState<BestiaryEntry>(BESTIARY_DATA[0]);
  const [zoneFilter, setZoneFilter] = useState<number>(0);
  const [showReferenceModal, setShowReferenceModal] = useState<'none' | 'minions' | 'bosses'>('none');

  const zones = [
    { id: 0, label: 'All Zones (24)' },
    { id: 1, label: '01 Forgotten Meadow' },
    { id: 2, label: '02 Hollow Hills' },
    { id: 3, label: '03 Weeping Woods' },
    { id: 4, label: '04 Echoing Caves' },
    { id: 5, label: '05 Broken River' },
    { id: 6, label: '06 Beacon Summit' },
  ];

  const filteredBestiary =
    zoneFilter === 0
      ? BESTIARY_DATA
      : BESTIARY_DATA.filter((entry) => entry.zoneNumber === zoneFilter);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft size={15} />
            Back to Title
          </button>
          <div>
            <h1 className="text-base font-bold font-cinzel tracking-wider text-rose-400">
              {activeTab === 'heroes'
                ? 'The Ninefold Hearth Guardians'
                : 'The Hush Bestiary — 18 Zone Minions & 6 Bosses'}
            </h1>
            <p className="text-[11px] text-slate-400">
              {activeTab === 'heroes'
                ? 'Nine heroes across nine districts. Version 1 features Blaze’s complete journey.'
                : 'Inspect every corrupted creature and boss across Zones 1–6 or deploy directly into their zone.'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('bestiary')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bestiary'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Skull size={14} />
            Hush Bestiary (24)
          </button>
          <button
            onClick={() => setActiveTab('heroes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'heroes'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame size={14} />
            Nine Heroes (9)
          </button>
        </div>
      </div>

      {/* HEROES TAB */}
      {activeTab === 'heroes' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Heroes Grid (Nine Heroes) */}
          <div className="w-80 border-r border-slate-800 p-4 overflow-y-auto flex flex-col gap-2.5 bg-slate-950/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
              Nine District Champions
            </div>

            {NINE_HEROES.map((hero) => {
              const isSelected = selectedHero.id === hero.id;
              const isPlayable = hero.status === 'PLAYABLE';

              return (
                <button
                  key={hero.id}
                  onClick={() => setSelectedHero(hero)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-rose-500 bg-rose-950/30 shadow-md shadow-rose-950/20'
                      : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-inner"
                      style={{ backgroundColor: hero.color }}
                    >
                      {hero.name.slice(0, 1)}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-100">{hero.name}</span>
                        {isPlayable ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded">
                            PLAYABLE
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded flex items-center gap-0.5">
                            <Lock size={10} />
                            LOCKED
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-slate-500" />
                        {hero.district}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Selected Hero Detail View */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="flex flex-col gap-6 max-w-2xl">
              {/* Hero Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedHero.color }}
                    />
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      {selectedHero.district} District
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold font-cinzel text-white">
                    {selectedHero.name}
                  </h2>
                  <div className="text-sm font-semibold mt-1" style={{ color: selectedHero.accentHex }}>
                    {selectedHero.title}
                  </div>
                </div>

                {selectedHero.status === 'PLAYABLE' ? (
                  <div className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500 text-rose-300 font-mono text-xs flex items-center gap-1.5">
                    <Sparkles size={14} />
                    CAMPAIGN READY
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 font-mono text-xs flex items-center gap-1.5">
                    <Lock size={14} />
                    FUTURE EXPANSION
                  </div>
                )}
              </div>

              {/* Special Feature: Character Sheet preview for Blaze */}
              {selectedHero.id === 'blaze' && (
                <div className="relative rounded-2xl overflow-hidden border border-rose-500/40 bg-slate-950/80 shadow-xl group">
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src="/assets/aistudio/Blaze_Full_Reference_Sheet_30136862.png"
                      alt="Blaze Reference Sheet"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top filter contrast-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-slate-300">
                      <span><strong>Age:</strong> 19</span>
                      <span>·</span>
                      <span><strong>Role:</strong> Youngest Forge Guard</span>
                      <span>·</span>
                      <span><strong>Hearth Shard:</strong> Crimson Flame</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Details Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                    <Sword size={14} className="text-rose-400" />
                    Primary Weapon
                  </div>
                  <div className="font-semibold text-sm text-slate-100">
                    {selectedHero.weapon}
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                    <Shield size={14} className="text-amber-400" />
                    Visual Identity
                  </div>
                  <div className="text-xs text-slate-300 leading-snug">
                    {selectedHero.visualCue}
                  </div>
                </div>
              </div>

              {/* Lore Biography */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Hearth Chronicler Record
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedHero.lore}
                </p>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {selectedHero.status === 'PLAYABLE'
                  ? 'Blaze is ready to begin the Forge Gate tutorial and Zones 1–6.'
                  : 'This champion’s district will be unsealed in future expansions.'}
              </span>

              {selectedHero.status === 'PLAYABLE' ? (
                <button
                  onClick={onSelectBlaze}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-950/50 cursor-pointer transition-all flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  Deploy Blaze (Campaign)
                </button>
              ) : (
                <button
                  disabled
                  className="px-6 py-2.5 rounded-xl bg-slate-800/60 text-slate-500 font-bold text-sm tracking-wide border border-slate-800 cursor-not-allowed flex items-center gap-2"
                >
                  <Lock size={16} />
                  Locked Campaign
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* BESTIARY TAB */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sub-bar: Zone filter + Reference Sheet Viewers */}
          <div className="px-6 py-2.5 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {zones.map((z) => (
                <button
                  key={z.id}
                  onClick={() => setZoneFilter(z.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    zoneFilter === z.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReferenceModal('minions')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <ImageIcon size={12} />
                Minions Sheet (18)
              </button>
              <button
                onClick={() => setShowReferenceModal('bosses')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <ImageIcon size={12} />
                Bosses Sheet (6)
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left: Bestiary List */}
            <div className="w-80 border-r border-slate-800 p-3.5 overflow-y-auto flex flex-col gap-2 bg-slate-950/60">
              {filteredBestiary.map((entry) => {
                const isSelected = selectedEnemy.id === entry.id;
                const isBoss = entry.category === 'boss';

                return (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEnemy(entry)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? isBoss
                          ? 'border-rose-500 bg-rose-950/30'
                          : 'border-purple-500 bg-purple-950/30'
                        : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 border border-white/10 overflow-hidden bg-slate-950"
                        style={{ borderColor: entry.themeColor }}
                      >
                        {ENEMY_SPRITE_MANIFEST[entry.id]?.portrait ? (
                          <img
                            src={ENEMY_SPRITE_MANIFEST[entry.id].portrait}
                            alt={entry.name}
                            className="w-full h-full object-contain p-0.5 [image-rendering:pixelated]"
                          />
                        ) : isBoss ? (
                          <Skull size={14} />
                        ) : (
                          entry.name.slice(0, 1)
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-100">{entry.name}</span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 uppercase rounded ${
                              isBoss
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {entry.category}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          0{entry.zoneNumber} {entry.zoneName}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Selected Enemy / Boss Details */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
              <div className="flex flex-col gap-5 max-w-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedEnemy.themeColor }}
                      />
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                        0{selectedEnemy.zoneNumber} {selectedEnemy.zoneName}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold font-cinzel text-white">
                      {selectedEnemy.name}
                    </h2>
                    <div
                      className="text-xs font-semibold italic mt-0.5"
                      style={{ color: selectedEnemy.themeColor }}
                    >
                      “{selectedEnemy.tagline}”
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border ${
                      selectedEnemy.category === 'boss'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-purple-500/20 border-purple-500 text-purple-300'
                    }`}
                  >
                    {selectedEnemy.category === 'boss' ? 'ZONE BOSS' : 'HUSH MINION'}
                  </span>
                </div>

                {/* Extracted Official Sprite Poses Showcase + Full Sheet Inspector */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/90 shadow-xl">
                  <div className="p-4 bg-slate-900/80 flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      {ENEMY_SPRITE_MANIFEST[selectedEnemy.id]?.portrait && (
                        <div className="w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center shrink-0">
                          <img
                            src={ENEMY_SPRITE_MANIFEST[selectedEnemy.id].portrait}
                            alt={selectedEnemy.name}
                            className="w-full h-full object-contain [image-rendering:pixelated]"
                          />
                        </div>
                      )}
                      <div className="flex-1 grid grid-cols-5 gap-2">
                        {Object.entries(
                          ENEMY_SPRITE_MANIFEST[selectedEnemy.id]?.animations ?? {}
                        ).map(([stateKey, seq]) => {
                          const previewFrame = seq.frames[0];
                          if (!previewFrame) return null;
                          return (
                            <div
                              key={stateKey}
                              className="flex flex-col items-center justify-between p-2 rounded-lg bg-slate-950/90 border border-slate-800/80"
                            >
                              <div className="h-14 w-full flex items-center justify-center">
                                <img
                                  src={previewFrame.file}
                                  alt={`${selectedEnemy.name} ${stateKey}`}
                                  className="max-h-14 max-w-full object-contain [image-rendering:pixelated]"
                                />
                              </div>
                              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mt-1">
                                {stateKey}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <span>
                      Extracted Official Sprites:{' '}
                      <strong>
                        {selectedEnemy.category === 'boss'
                          ? `/assets/bosses/${selectedEnemy.id}/`
                          : `/assets/enemies/${selectedEnemy.id}/`}
                      </strong>
                    </span>
                    <button
                      onClick={() =>
                        setShowReferenceModal(
                          selectedEnemy.category === 'boss' ? 'bosses' : 'minions'
                        )
                      }
                      className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={13} />
                      Inspect Full Sheet
                    </button>
                  </div>
                </div>

                {/* States & Attacks */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                      <Activity size={14} className="text-purple-400" />
                      Animation States
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedEnemy.states.map((st) => (
                        <span
                          key={st}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                      <Sword size={14} className="text-rose-400" />
                      Signature Attack
                    </div>
                    <div className="text-xs text-slate-200 font-semibold leading-relaxed">
                      {selectedEnemy.attackName}
                    </div>
                  </div>
                </div>

                {/* Lore Description */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Field Observation Log
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedEnemy.description}
                  </p>
                </div>
              </div>

              {/* Action CTA: Jump directly into this Enemy/Boss's Zone */}
              {onDeployZone && (
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Encounter <strong>{selectedEnemy.name}</strong> in{' '}
                    <strong>
                      0{selectedEnemy.zoneNumber} {selectedEnemy.zoneName}
                    </strong>
                    .
                  </span>

                  <button
                    onClick={() =>
                      onDeployZone(
                        ZONE_ID_BY_NUMBER[selectedEnemy.zoneNumber] ?? 'zone1_meadow'
                      )
                    }
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold text-xs tracking-wide shadow-lg cursor-pointer transition-all flex items-center gap-2"
                  >
                    <Play size={14} />
                    Fight in Zone 0{selectedEnemy.zoneNumber}: {selectedEnemy.zoneName}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Reference Sheet Modal */}
      {showReferenceModal !== 'none' && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setShowReferenceModal('none')}
        >
          <div
            className="max-w-5xl w-full max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-cinzel font-bold text-sm text-white">
                {showReferenceModal === 'minions'
                  ? 'Emberline — Corrupted Hush Enemies (Zones 1–6 Official Sheet)'
                  : 'Emberline — Corrupted Hush Bosses (6 Zone Bosses Official Sheet)'}
              </h3>
              <button
                onClick={() => setShowReferenceModal('none')}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
              >
                Close [ESC]
              </button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-950">
              <img
                src={
                  showReferenceModal === 'minions'
                    ? HUSH_BESTIARY_IMAGES.MINIONS_SHEET
                    : HUSH_BESTIARY_IMAGES.BOSSES_SHEET
                }
                alt="Enemy Reference Sheet"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
