/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from './game/engine';
import { GAME_CANVAS } from './game/constants';
import {
  ZoneId,
  GameSaveData,
  GameSettings,
  DialogueSequence,
  DialogueLine,
  HUDStats,
} from './types/game';
import { TitleMenu } from './components/TitleMenu';
import { RosterCodex } from './components/RosterCodex';
import { GameHUD } from './components/GameHUD';
import { DialogueBox } from './components/DialogueBox';
import { PauseMenu } from './components/PauseMenu';
import { SettingsModal } from './components/SettingsModal';
import { VirtualGamepad } from './components/VirtualGamepad';
import { soundManager } from './audio/soundManager';

export default function App() {
  const [currentView, setCurrentView] = useState<'title' | 'roster' | 'game'>('title');
  const [hasSaveData, setHasSaveData] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<GameSettings>({
    sfxVolume: 0.8,
    bgmVolume: 0.5,
    screenShake: true,
    showTouchControls: false,
    highContrast: false,
    subtitleSize: 'normal',
  });

  // Active Dialogue State
  const [activeDialogueSequence, setActiveDialogueSequence] = useState<DialogueSequence | null>(null);
  const [dialogueLineIndex, setDialogueLineIndex] = useState(0);

  // HUD Stats State
  const [hudStats, setHudStats] = useState<HUDStats>({
    health: 6,
    maxHealth: 6,
    skillMeter: 0,
    heat: 0,
    isOverheated: false,
    sparks: 0,
    level: 1,
    xp: 0,
    maxXp: 100,
    attackBonus: 0,
    resetsRemaining: 3,
    maxResetsPerRun: 3,
    levelUpNotification: null,
    dashCooldownRemaining: 0,
    bossHealth: null,
    bossMaxHealth: null,
    bossName: null,
    currentZone: 'prologue_forge',
    isBeaconLit: false,
    prologueObjective: undefined,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Check saved game on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('emberline_save_v1');
      if (saved) {
        setHasSaveData(true);
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  // Update soundManager whenever volumes change
  useEffect(() => {
    soundManager.setVolumes(settings.sfxVolume, settings.bgmVolume);
    if (engineRef.current) {
      engineRef.current.updateSettings(settings);
    }
  }, [settings]);

  // Keyboard Pause Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key.toLowerCase() === 'p') && currentView === 'game') {
        if (activeDialogueSequence) {
          // Skip dialogue on Escape
          handleDialogueSkip();
          return;
        }
        setIsPaused((prev) => {
          const next = !prev;
          if (engineRef.current) {
            engineRef.current.setPaused(next);
          }
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, activeDialogueSequence]);

  const handleStartGame = (resumeSave = false, targetZone?: ZoneId) => {
    setCurrentView('game');
    setIsPaused(false);
    setActiveDialogueSequence(null);

    let savedGame: Partial<GameSaveData> | undefined;
    if (targetZone) {
      savedGame = { currentZone: targetZone };
    } else if (resumeSave) {
      try {
        const raw = localStorage.getItem('emberline_save_v1');
        if (raw) savedGame = JSON.parse(raw);
      } catch {
        // Fallback
      }
    }

    setTimeout(() => {
      if (!canvasRef.current) return;

      if (engineRef.current) {
        engineRef.current.destroy();
      }

      engineRef.current = new GameEngine(
        canvasRef.current,
        {
          onDialogueTrigger: (sequence) => {
            setActiveDialogueSequence(sequence);
            setDialogueLineIndex(0);
          },
          onZoneComplete: (nextZoneId) => {
            // Handled internally in engine
          },
          onStatsUpdate: (stats) => {
            setHudStats(stats);
          },
          onSaveState: (save) => {
            setHasSaveData(true);
          },
        },
        settings,
        savedGame
      );

      engineRef.current.start();
    }, 50);
  };

  const handleSelectZoneInGame = (zoneId: ZoneId) => {
    setIsPaused(false);
    setActiveDialogueSequence(null);
    if (engineRef.current) {
      engineRef.current.setPaused(false);
      engineRef.current.loadZone(zoneId);
    }
  };

  const handleDialogueNext = () => {
    if (!activeDialogueSequence) return;
    const nextIdx = dialogueLineIndex + 1;
    if (nextIdx < activeDialogueSequence.lines.length) {
      setDialogueLineIndex(nextIdx);
    } else {
      const action = activeDialogueSequence.onCompleteAction;
      setActiveDialogueSequence(null);
      if (action === 'COMPLETE_ZONE' && engineRef.current) {
        engineRef.current.completeZone();
      }
    }
  };

  const handleDialogueSkip = () => {
    if (!activeDialogueSequence) return;
    const action = activeDialogueSequence.onCompleteAction;
    setActiveDialogueSequence(null);
    if (action === 'COMPLETE_ZONE' && engineRef.current) {
      engineRef.current.completeZone();
    }
  };

  const handleResume = () => {
    setIsPaused(false);
    if (engineRef.current) {
      engineRef.current.setPaused(false);
    }
  };

  const handleRestartCheckpoint = () => {
    if (engineRef.current) {
      const didReset = engineRef.current.resetCurrentZone();
      if (didReset) {
        setIsPaused(false);
        setActiveDialogueSequence(null);
        engineRef.current.setPaused(false);
      }
    }
  };

  const handleQuitToTitle = () => {
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
    soundManager.stopMusic();
    setIsPaused(false);
    setActiveDialogueSequence(null);
    setCurrentView('title');
  };

  const currentDialogueLine: DialogueLine | null =
    activeDialogueSequence && activeDialogueSequence.lines[dialogueLineIndex]
      ? activeDialogueSequence.lines[dialogueLineIndex]
      : null;

  return (
    <div className="relative w-screen h-screen bg-[#07080c] flex items-center justify-center overflow-hidden font-sans">
      {/* View 1: Title Menu */}
      {currentView === 'title' && (
        <TitleMenu
          onNewGame={() => handleStartGame(false)}
          onContinue={() => handleStartGame(true)}
          onSelectZone={(zoneId) => handleStartGame(false, zoneId)}
          onOpenCodex={() => setCurrentView('roster')}
          onOpenSettings={() => setShowSettings(true)}
          hasSaveData={hasSaveData}
        />
      )}

      {/* View 2: Nine Heroes Roster & Hush Bestiary Codex */}
      {currentView === 'roster' && (
        <RosterCodex
          onSelectBlaze={() => handleStartGame(false)}
          onDeployZone={(zoneId) => handleStartGame(false, zoneId)}
          onBack={() => setCurrentView('title')}
        />
      )}

      {/* View 3: Active Game View */}
      {currentView === 'game' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
          {/* Objective Banner (hidden during dialogue to keep screen clear) */}
          {hudStats.prologueObjective && !currentDialogueLine && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-slate-950/85 backdrop-blur-md px-4 py-1 rounded-full border border-rose-500/40 text-[11px] text-rose-300 font-semibold shadow-md pointer-events-none">
              ✦ {hudStats.prologueObjective}
            </div>
          )}

          {/* Game Canvas Container maintaining 16:9 pixel aspect ratio */}
          <div
            className="relative flex items-center justify-center shadow-2xl border border-slate-800 rounded-lg overflow-hidden"
            style={{
              aspectRatio: `${GAME_CANVAS.WIDTH} / ${GAME_CANVAS.HEIGHT}`,
              maxWidth: '100vw',
              maxHeight: '100vh',
              width: 'min(100vw, calc(100vh * 16 / 9))',
              height: 'min(100vh, calc(100vw * 9 / 16))',
            }}
          >
            <canvas
              ref={canvasRef}
              width={GAME_CANVAS.WIDTH}
              height={GAME_CANVAS.HEIGHT}
              className="w-full h-full block bg-[#090a0f]"
            />

            {/* In-Game HUD */}
            <GameHUD
              health={hudStats.health}
              maxHealth={hudStats.maxHealth}
              skillMeter={hudStats.skillMeter}
              heat={hudStats.heat}
              isOverheated={hudStats.isOverheated}
              sparks={hudStats.sparks}
              level={hudStats.level}
              xp={hudStats.xp}
              maxXp={hudStats.maxXp}
              attackBonus={hudStats.attackBonus}
              resetsRemaining={hudStats.resetsRemaining}
              maxResetsPerRun={hudStats.maxResetsPerRun}
              levelUpNotification={hudStats.levelUpNotification}
              dashCooldownRemaining={hudStats.dashCooldownRemaining}
              bossHealth={hudStats.bossHealth}
              bossMaxHealth={hudStats.bossMaxHealth}
              bossName={hudStats.bossName}
              currentZone={hudStats.currentZone}
              isBeaconLit={hudStats.isBeaconLit}
              onPause={() => {
                setIsPaused(true);
                if (engineRef.current) engineRef.current.setPaused(true);
              }}
            />

            {/* Dialogue Box */}
            <DialogueBox
              dialogue={currentDialogueLine}
              onNext={handleDialogueNext}
              onSkip={handleDialogueSkip}
            />

            {/* Virtual Touch Gamepad */}
            {settings.showTouchControls && (
              <VirtualGamepad
                onVirtualInput={(key, isDown) => {
                  if (activeDialogueSequence && isDown && key.toLowerCase() === 'e') {
                    handleDialogueNext();
                    return;
                  }
                  if (engineRef.current) {
                    engineRef.current.simulateVirtualKey(key, isDown);
                  }
                }}
              />
            )}

            {/* Pause Menu Modal */}
            {isPaused && (
              <PauseMenu
                onResume={handleResume}
                onRestartCheckpoint={handleRestartCheckpoint}
                onSelectZone={handleSelectZoneInGame}
                onOpenSettings={() => setShowSettings(true)}
                onQuitToTitle={handleQuitToTitle}
                currentZone={hudStats.currentZone}
                level={hudStats.level}
                xp={hudStats.xp}
                maxXp={hudStats.maxXp}
                maxHealth={hudStats.maxHealth}
                attackBonus={hudStats.attackBonus}
                resetsRemaining={hudStats.resetsRemaining}
                maxResetsPerRun={hudStats.maxResetsPerRun}
              />
            )}
          </div>
        </div>
      )}

      {/* Settings Modal (Global) */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
