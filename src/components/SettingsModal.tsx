/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Eye, Smartphone, X } from 'lucide-react';
import { GameSettings } from '../types/game';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-base text-rose-400 font-cinzel">Settings & Accessibility</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* SFX Volume */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Volume2 size={15} className="text-rose-400" />
                Sound Effects (SFX)
              </span>
              <span className="font-mono text-slate-400">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) =>
                onUpdateSettings({ ...settings, sfxVolume: parseFloat(e.target.value) })
              }
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* BGM Volume */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Volume2 size={15} className="text-pink-400" />
                Music (BGM)
              </span>
              <span className="font-mono text-slate-400">{Math.round(settings.bgmVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.bgmVolume}
              onChange={(e) =>
                onUpdateSettings({ ...settings, bgmVolume: parseFloat(e.target.value) })
              }
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>

          {/* Screen Shake Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">Screen Shake Feedback</span>
              <span className="text-[11px] text-slate-500">Camera rumble during impacts and cyclones</span>
            </div>
            <button
              onClick={() =>
                onUpdateSettings({ ...settings, screenShake: !settings.screenShake })
              }
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.screenShake ? 'bg-rose-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.screenShake ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* Touch Controls Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Smartphone size={14} className="text-blue-400" />
                Virtual Touch Gamepad
              </span>
              <span className="text-[11px] text-slate-500">On-screen D-Pad and combat buttons</span>
            </div>
            <button
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  showTouchControls: !settings.showTouchControls,
                })
              }
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.showTouchControls ? 'bg-rose-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.showTouchControls ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer mt-2"
        >
          Done
        </button>
      </div>
    </div>
  );
};
