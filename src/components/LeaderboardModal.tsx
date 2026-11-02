import React from 'react';
import { X, Trophy, Trash2, Award } from 'lucide-react';
import { GameMode, HighScoreRecord, ThemeColors } from '../types/tetris';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: HighScoreRecord[];
  onClearRecords: () => void;
  theme: ThemeColors;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  records,
  onClearRecords,
  theme,
}) => {
  if (!isOpen) return null;

  const modes: GameMode[] = ['marathon', 'sprint', 'ultra', 'zen'];

  const modeLabels: Record<GameMode, string> = {
    marathon: 'Marathon Mode',
    sprint: 'Sprint (40 Lines)',
    ultra: 'Ultra (2 Minutes)',
    zen: 'Zen Mode',
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Hall of Records
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Record Cards */}
        <div className="space-y-3 mb-6">
          {modes.map((mode) => {
            const bestForMode = records
              .filter((r) => r.mode === mode)
              .sort((a, b) => {
                if (mode === 'sprint') return a.time - b.time; // sprint: lowest time is best
                return b.score - a.score;
              })[0];

            return (
              <div
                key={mode}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-300 block mb-0.5">
                    {modeLabels[mode]}
                  </span>
                  {bestForMode ? (
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span>Lvl {bestForMode.level}</span>
                      <span>·</span>
                      <span>{bestForMode.lines} Lines</span>
                      <span>·</span>
                      <span>{formatTime(bestForMode.time)}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">No record logged yet</span>
                  )}
                </div>

                <div className="text-right">
                  {bestForMode ? (
                    <div>
                      <div className="text-base font-bold font-mono text-white tabular-nums">
                        {mode === 'sprint'
                          ? formatTime(bestForMode.time)
                          : bestForMode.score.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {bestForMode.date}
                      </span>
                    </div>
                  ) : (
                    <Award className="w-5 h-5 text-slate-700" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Clear Records and Close */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          {records.length > 0 ? (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all saved high scores?')) {
                  onClearRecords();
                }
              }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Records</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 cursor-pointer"
            style={{ backgroundColor: theme.accent }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
