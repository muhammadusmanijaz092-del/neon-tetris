import React from 'react';
import { TetrominoType, ThemeColors } from '../types/tetris';
import { MiniPieceCanvas } from './MiniPieceCanvas';

interface HoldPanelProps {
  holdPiece: TetrominoType | null;
  canHold: boolean;
  theme: ThemeColors;
}

export const HoldPanel: React.FC<HoldPanelProps> = ({
  holdPiece,
  canHold,
  theme,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Hold Piece Container */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-wider text-slate-400">HOLD</span>
          <span className="text-[10px] font-mono text-slate-500">KEY [C]</span>
        </div>

        <div className="w-24 h-24 flex items-center justify-center rounded-lg bg-slate-950/70 border border-slate-800/60 relative overflow-hidden">
          <MiniPieceCanvas
            type={holdPiece}
            theme={theme}
            size={80}
            dimmed={!canHold && holdPiece !== null}
          />
          {!canHold && holdPiece !== null && (
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700">
                LOCKED
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Controls Card */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
        <span className="text-xs font-bold tracking-wider text-slate-400 block mb-3">CONTROLS</span>
        <div className="space-y-2 text-xs font-mono text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Move</span>
            <span className="bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/60 text-slate-200">
              ← / →
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Rotate CW</span>
            <span className="bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/60 text-slate-200">
              ↑ / X
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Rotate CCW</span>
            <span className="bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/60 text-slate-200">
              Z
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Soft Drop</span>
            <span className="bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/60 text-slate-200">
              ↓
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Hard Drop</span>
            <span className="bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/60 text-slate-200">
              Space
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Hold</span>
            <span className="bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/60 text-slate-200">
              C / Shift
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Pause</span>
            <span className="bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/60 text-slate-200">
              P / Esc
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
