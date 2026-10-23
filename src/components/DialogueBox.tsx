/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DialogueLine } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface DialogueBoxProps {
  dialogue: DialogueLine | null;
  onNext: () => void;
  onSkip?: () => void;
  largeText?: boolean;
}

// Map of canonical expression names to the isolated 256x256 portrait PNG assets
const BLAZE_PORTRAIT_IMAGES: Record<string, string> = {
  neutral: '/assets/aistudio/blaze_neutral_d8e0b8de.png',
  normal: '/assets/aistudio/blaze_neutral_d8e0b8de.png',
  happy: '/assets/aistudio/blaze_happy_6f826735.png',
  smile: '/assets/aistudio/blaze_happy_6f826735.png',
  angry: '/assets/aistudio/blaze_angry_c9204e7d.png',
  surprised: '/assets/aistudio/blaze_surprised_53450420.png',
  sad: '/assets/aistudio/blaze_sad_8dd99a5d.png',
  determined: '/assets/aistudio/blaze_determined_7aa95969.png',
  confident: '/assets/aistudio/blaze_determined_7aa95969.png',
};

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  dialogue,
  onNext,
  onSkip,
  largeText = false,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = React.useRef<number | null>(null);

  const isTypingRef = React.useRef(isTyping);
  isTypingRef.current = isTyping;

  const dialogueRef = React.useRef(dialogue);
  dialogueRef.current = dialogue;

  const onNextRef = React.useRef(onNext);
  onNextRef.current = onNext;

  const onSkipRef = React.useRef(onSkip);
  onSkipRef.current = onSkip;

  const finishTyping = React.useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (dialogueRef.current) {
      setDisplayedText(dialogueRef.current.text);
    }
    setIsTyping(false);
  }, []);

  const handleAdvance = React.useCallback(() => {
    if (isTypingRef.current) {
      finishTyping();
    } else {
      onNextRef.current();
    }
  }, [finishTyping]);

  useEffect(() => {
    if (!dialogue) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    const text = dialogue.text;

    intervalRef.current = window.setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));
      if (index % 2 === 0) {
        soundManager.playDialogueBeep();
      }

      if (index >= text.length) {
        setIsTyping(false);
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 20);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [dialogue]);

  // Window keydown listener: Only E advances dialogue (Space is preserved for jump)
  useEffect(() => {
    if (!dialogue) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const code = e.code;

      if (key === 'e' || code === 'KeyE') {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') {
          e.stopImmediatePropagation();
        }

        handleAdvance();
        return;
      }

      if ((e.key === 'Escape' || e.key === 'Esc') && onSkipRef.current) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') {
          e.stopImmediatePropagation();
        }
        onSkipRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [dialogue, handleAdvance]);

  if (!dialogue) return null;

  const handleBoxClick = () => {
    handleAdvance();
  };

  // Determine portrait rendering
  const renderPortrait = () => {
    if (dialogue.portrait.startsWith('blaze_')) {
      const rawExp = dialogue.portrait.replace('blaze_', '');
      const portraitSrc = BLAZE_PORTRAIT_IMAGES[rawExp] || BLAZE_PORTRAIT_IMAGES.neutral;
      const displayLabel = rawExp === 'smile' ? 'happy' : rawExp === 'normal' ? 'neutral' : rawExp === 'confident' ? 'determined' : rawExp;

      return (
        <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-rose-500 bg-slate-950 shrink-0 shadow-lg shadow-rose-950/50">
          <img
            src={portraitSrc}
            alt={`Blaze (${displayLabel})`}
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        </div>
      );
    }

    if (dialogue.portrait === 'alden') {
      return (
        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-500 bg-slate-900 shrink-0 flex flex-col items-center justify-center shadow-lg shadow-slate-950/50">
          <span className="text-2xl">🛡️</span>
          <span className="text-[8px] font-mono font-bold text-slate-300 uppercase tracking-wider mt-0.5">
            Alden
          </span>
        </div>
      );
    }

    if (dialogue.portrait === 'beacon') {
      return (
        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-500 bg-slate-900 shrink-0 flex flex-col items-center justify-center shadow-lg shadow-amber-950/40">
          <span className="text-2xl animate-pulse">🔥</span>
          <span className="text-[8px] font-mono font-bold text-amber-300 uppercase tracking-wider mt-0.5">
            Beacon
          </span>
        </div>
      );
    }

    if (dialogue.portrait === 'shadow') {
      return (
        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-purple-600 bg-purple-950 shrink-0 flex flex-col items-center justify-center shadow-lg shadow-purple-950/50">
          <span className="text-2xl animate-pulse">👥</span>
          <span className="text-[8px] font-mono font-bold text-purple-300 uppercase tracking-wider mt-0.5">
            Shadow
          </span>
        </div>
      );
    }

    return (
      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-900 shrink-0 flex flex-col items-center justify-center">
        <span className="text-2xl">📜</span>
        <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mt-0.5">
          Emberline
        </span>
      </div>
    );
  };

  return (
    <div
      onClick={handleBoxClick}
      className="absolute top-16 inset-x-4 max-w-xl mx-auto bg-slate-950/95 backdrop-blur-md rounded-2xl border-2 border-slate-700/80 p-3.5 shadow-2xl flex items-start gap-3.5 cursor-pointer z-50 select-none animate-in fade-in slide-in-from-top-3 duration-200"
    >
      {renderPortrait()}

      <div className="flex-1 flex flex-col justify-between min-h-[4.5rem]">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-sm tracking-wide text-rose-400 font-cinzel">
              {dialogue.speaker}
            </span>
            <div className="flex items-center gap-2">
              {onSkip && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSkip();
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-300 px-2 py-0.5 rounded transition-colors"
                >
                  Skip [ESC]
                </button>
              )}
              <span className="text-[10px] text-slate-400 font-mono">
                {isTyping ? 'Fast forward [E / Click]' : 'Continue [E / Click]'}
              </span>
            </div>
          </div>

          <p
            className={`text-slate-200 leading-snug font-sans ${
              largeText ? 'text-base' : 'text-xs'
            }`}
          >
            {displayedText}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-2">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/70 font-mono text-rose-300 font-bold">E</span>
            <span>or</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/70 font-mono text-rose-300 font-bold">Click</span>
            <span>to {isTyping ? 'finish typing' : 'continue'}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAdvance();
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 active:bg-rose-600/70 border border-rose-500/50 text-rose-200 text-xs font-semibold shadow transition-all cursor-pointer"
          >
            <span>{isTyping ? 'Skip Typing' : 'Next ▾'}</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
          </button>
        </div>
      </div>
    </div>
  );
};
