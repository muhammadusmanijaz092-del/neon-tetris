import React from 'react';
import { Trophy, RotateCcw, Flame } from 'lucide-react';
import { GameStats, GameMode, ThemeColors } from '../types/tetris';

interface GameOverModalProps {
  status: 'GAME_OVER' | 'VICTORY';
  mode: GameMode;
  stats: GameStats;
  isNewHighScore: boolean;
  theme: ThemeColors;
  onPlayAgain: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  mode,
  stats,
  isNewHighScore,
  theme,
  onPlayAgain,
}) => {
  const isVictory = status === 'VICTORY';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div
        className="w-full max-w-md p-6 rounded-2xl bg-slate-900/95 border shadow-2xl relative overflow-hidden"
        style={{
          borderColor: isVictory ? '#10b981' : theme.accent,
          boxShadow: `0 0 30px ${isVictory ? 'rgba(16, 185, 129, 0.25)' : 'rgba(6, 182, 212, 0.25)'}`,
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2
            className="text-2xl sm:text-3xl font-extrabold tracking-wide mb-1"
            style={{
              color: isVictory ? '#34d399' : '#f43f5e',
              textShadow: `0 0 16px ${isVictory ? '#34d399' : '#f43f5e'}`,
            }}
          >
            {isVictory ? 'VICTORY!' : 'GAME OVER'}
          </h2>
          <p className="text-xs text-slate-400 capitalize font-medium">
            {mode} Mode Complete
          </p>
        </div>

        {/* High Score Celebration Badge */}
        {isNewHighScore && (
          <div className="mb-5 p-3 rounded-xl bg-amber-950/30 border border-amber-600/50 flex items-center justify-center gap-2 text-amber-300">
            <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
            <span className="text-xs font-bold font-mono tracking-wider">
              NEW PERSONAL BEST!
            </span>
          </div>
        )}

        {/* Primary Score Showcase */}
        <div className="text-center p-4 rounded-xl bg-slate-950/70 border border-slate-800 mb-5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
            FINAL SCORE
          </span>
          <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tabular-nums">
            {stats.score.toLocaleString()}
          </span>
        </div>

        {/* Performance Breakdown Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400 font-sans">Lines Cleared</span>
            <span className="font-bold text-cyan-400 tabular-nums">{stats.lines}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400 font-sans">Level Reached</span>
            <span className="font-bold text-white tabular-nums">{stats.level}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400 font-sans">Tetrises (4L)</span>
            <span className="font-bold text-pink-400 tabular-nums">{stats.tetrises}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400 font-sans">Max Combo</span>
            <span className="font-bold text-amber-400 tabular-nums flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              {stats.maxCombo > 0 ? stats.maxCombo : 0}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between col-span-2">
            <span className="text-slate-400 font-sans">Time Elapsed</span>
            <span className="font-bold text-slate-200 tabular-nums">
              {formatTime(stats.elapsedTime)}
            </span>
          </div>
        </div>

        {/* Action Button: Single line "Play Again" */}
        <button
          onClick={onPlayAgain}
          className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-slate-950 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg"
          style={{
            backgroundColor: theme.accent,
            boxShadow: `0 0 20px ${theme.accent}66`,
          }}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Play Again</span>
        </button>
      </div>
    </div>
  );
};
