import React from 'react';
import { TetrominoType, ThemeColors } from '../types/tetris';
import { MiniPieceCanvas } from './MiniPieceCanvas';

interface NextQueuePanelProps {
  queue: TetrominoType[];
  theme: ThemeColors;
}

export const NextQueuePanel: React.FC<NextQueuePanelProps> = ({ queue, theme }) => {
  // Show up to 4 upcoming pieces
  const previewPieces = queue.slice(0, 4);

  return (
    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-3">
        <span className="text-xs font-bold tracking-wider text-slate-400">NEXT</span>
        <span className="text-[10px] font-mono text-slate-500">QUEUE</span>
      </div>

      <div className="flex flex-col gap-2.5 w-full items-center">
        {previewPieces.map((type, idx) => (
          <div
            key={idx}
            className={`w-22 h-18 flex items-center justify-center rounded-lg bg-slate-950/70 border transition-all ${
              idx === 0
                ? 'border-slate-700 shadow-sm'
                : 'border-slate-800/60 opacity-80'
            }`}
          >
            <MiniPieceCanvas
              type={type}
              theme={theme}
              size={idx === 0 ? 68 : 56}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
