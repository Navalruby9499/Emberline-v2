/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Zap, Flame, Wind, Sparkles, MessageSquare } from 'lucide-react';

interface VirtualGamepadProps {
  onVirtualInput: (key: string, isDown: boolean) => void;
}

export const VirtualGamepad: React.FC<VirtualGamepadProps> = ({ onVirtualInput }) => {
  const handleTouch = (key: string, isDown: boolean) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onVirtualInput(key, isDown);
  };

  return (
    <div className="absolute inset-x-0 bottom-3 px-4 flex items-end justify-between pointer-events-none select-none z-30 font-sans">
      {/* Left: D-Pad (Left, Right, Jump) */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onTouchStart={handleTouch('arrowleft', true)}
          onTouchEnd={handleTouch('arrowleft', false)}
          onMouseDown={handleTouch('arrowleft', true)}
          onMouseUp={handleTouch('arrowleft', false)}
          className="w-13 h-13 rounded-2xl bg-slate-950/80 active:bg-rose-950/80 border border-slate-700/80 text-slate-200 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <ArrowLeft size={22} />
        </button>

        <button
          onTouchStart={handleTouch('arrowright', true)}
          onTouchEnd={handleTouch('arrowright', false)}
          onMouseDown={handleTouch('arrowright', true)}
          onMouseUp={handleTouch('arrowright', false)}
          className="w-13 h-13 rounded-2xl bg-slate-950/80 active:bg-rose-950/80 border border-slate-700/80 text-slate-200 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <ArrowRight size={22} />
        </button>

        <button
          onTouchStart={handleTouch('Space', true)}
          onTouchEnd={handleTouch('Space', false)}
          onMouseDown={handleTouch('Space', true)}
          onMouseUp={handleTouch('Space', false)}
          className="w-13 h-13 rounded-2xl bg-slate-950/80 active:bg-rose-950/80 border border-slate-700/80 text-slate-200 flex items-center justify-center shadow-lg active:scale-95 transition-transform ml-2"
        >
          <ArrowUp size={22} />
        </button>
      </div>

      {/* Right: Combat Buttons (Slash, Crescent, Dash, Cyclone, Interact) */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Interact */}
        <button
          onTouchStart={handleTouch('e', true)}
          onTouchEnd={handleTouch('e', false)}
          onMouseDown={handleTouch('e', true)}
          onMouseUp={handleTouch('e', false)}
          className="w-11 h-11 rounded-xl bg-blue-950/80 active:bg-blue-800 border border-blue-600/60 text-blue-300 flex items-center justify-center shadow-md active:scale-95 transition-transform text-xs font-bold"
        >
          E
        </button>

        {/* Dash */}
        <button
          onTouchStart={handleTouch('Shift', true)}
          onTouchEnd={handleTouch('Shift', false)}
          onMouseDown={handleTouch('Shift', true)}
          onMouseUp={handleTouch('Shift', false)}
          className="w-11 h-11 rounded-xl bg-amber-950/80 active:bg-amber-800 border border-amber-600/60 text-amber-300 flex items-center justify-center shadow-md active:scale-95 transition-transform"
        >
          <Wind size={18} />
        </button>

        {/* Crescent */}
        <button
          onTouchStart={handleTouch('k', true)}
          onTouchEnd={handleTouch('k', false)}
          onMouseDown={handleTouch('k', true)}
          onMouseUp={handleTouch('k', false)}
          className="w-12 h-12 rounded-2xl bg-pink-950/80 active:bg-pink-800 border border-pink-500/60 text-pink-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Flame size={20} />
        </button>

        {/* Flame Slash (Primary) */}
        <button
          onTouchStart={handleTouch('j', true)}
          onTouchEnd={handleTouch('j', false)}
          onMouseDown={handleTouch('j', true)}
          onMouseUp={handleTouch('j', false)}
          className="w-14 h-14 rounded-2xl bg-rose-600 active:bg-rose-500 border border-rose-400 text-white flex items-center justify-center shadow-lg shadow-rose-950/50 active:scale-95 transition-transform"
        >
          <Zap size={24} />
        </button>
      </div>
    </div>
  );
};
