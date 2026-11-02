import React, { useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ChevronsDown,
  RotateCw,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import { TetrisEngine } from '../game/tetrisEngine';
import { soundManager } from '../game/soundManager';

interface TouchControlsProps {
  engine: TetrisEngine;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ engine }) => {
  const repeatTimerRef = useRef<number | null>(null);

  const startHoldAction = (action: () => void) => {
    soundManager.userInteraction();
    action();
    if (repeatTimerRef.current) clearInterval(repeatTimerRef.current);
    repeatTimerRef.current = window.setInterval(action, 80);
  };

  const endHoldAction = () => {
    if (repeatTimerRef.current) {
      clearInterval(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto pt-4 pb-2 px-2 flex items-center justify-between gap-4 select-none touch-manipulation">
      {/* Left / Right / Soft Drop D-Pad */}
      <div className="flex items-center gap-1.5">
        <button
          onPointerDown={() => startHoldAction(() => engine.moveLeft())}
          onPointerUp={endHoldAction}
          onPointerLeave={endHoldAction}
          aria-label="Move Left"
          className="w-13 h-13 rounded-xl bg-slate-900/90 active:bg-cyan-950/70 border border-slate-700/80 active:border-cyan-500 text-slate-200 flex items-center justify-center transition-transform active:scale-95 shadow-lg cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          onPointerDown={() => startHoldAction(() => engine.softDrop())}
          onPointerUp={endHoldAction}
          onPointerLeave={endHoldAction}
          aria-label="Soft Drop"
          className="w-13 h-13 rounded-xl bg-slate-900/90 active:bg-cyan-950/70 border border-slate-700/80 active:border-cyan-500 text-slate-200 flex items-center justify-center transition-transform active:scale-95 shadow-lg cursor-pointer"
        >
          <ArrowDown className="w-6 h-6" />
        </button>

        <button
          onPointerDown={() => startHoldAction(() => engine.moveRight())}
          onPointerUp={endHoldAction}
          onPointerLeave={endHoldAction}
          aria-label="Move Right"
          className="w-13 h-13 rounded-xl bg-slate-900/90 active:bg-cyan-950/70 border border-slate-700/80 active:border-cyan-500 text-slate-200 flex items-center justify-center transition-transform active:scale-95 shadow-lg cursor-pointer"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Center Utility: Hold & Hard Drop */}
      <div className="flex flex-col gap-1.5 items-center">
        <button
          onPointerDown={() => {
            soundManager.userInteraction();
            engine.hold();
          }}
          aria-label="Hold Piece"
          className="px-3 py-1.5 rounded-lg bg-slate-900/90 active:bg-pink-950/70 border border-slate-700/80 active:border-pink-500 text-[11px] font-mono font-bold text-pink-400 flex items-center gap-1 transition-transform active:scale-95 shadow-lg cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>HOLD</span>
        </button>

        <button
          onPointerDown={() => {
            soundManager.userInteraction();
            engine.hardDrop();
          }}
          aria-label="Hard Drop"
          className="w-14 h-12 rounded-xl bg-cyan-950/40 active:bg-cyan-900/80 border border-cyan-700/60 active:border-cyan-400 text-cyan-300 flex items-center justify-center transition-transform active:scale-95 shadow-lg cursor-pointer"
        >
          <ChevronsDown className="w-6 h-6" />
        </button>
      </div>

      {/* Right Rotation Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onPointerDown={() => {
            soundManager.userInteraction();
            engine.rotateCCW();
          }}
          aria-label="Rotate Counter-Clockwise"
          className="w-13 h-13 rounded-xl bg-slate-900/90 active:bg-purple-950/70 border border-slate-700/80 active:border-purple-500 text-purple-300 flex items-center justify-center transition-transform active:scale-95 shadow-lg cursor-pointer"
        >
          <RotateCcw className="w-6 h-6" />
        </button>

        <button
          onPointerDown={() => {
            soundManager.userInteraction();
            engine.rotateCW();
          }}
          aria-label="Rotate Clockwise"
          className="w-13 h-13 rounded-xl bg-slate-900/90 active:bg-purple-950/70 border border-slate-700/80 active:border-purple-500 text-purple-300 flex items-center justify-center transition-transform active:scale-95 shadow-lg cursor-pointer"
        >
          <RotateCw className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
