import React from 'react';
import { GameStats, GameMode, ThemeColors } from '../types/tetris';

interface StatsPanelProps {
  stats: GameStats;
  mode: GameMode;
  highScore: number;
  theme: ThemeColors;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  stats,
  mode,
  highScore,
  theme,
}) => {
  // Format elapsed time (MM:SS.ms)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  // Format Ultra countdown timer
  const ultraTimeRemaining = Math.max(0, 120 - stats.elapsedTime);

  return (
    <div className="flex flex-col gap-3.5">
      {/* Primary Score Panel */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold tracking-wider text-slate-400">SCORE</span>
          {stats.score > highScore && highScore > 0 && (
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
              NEW RECORD
            </span>
          )}
        </div>
        <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
          {stats.score.toLocaleString()}
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500 font-sans">High Score</span>
          <span className="text-slate-300 font-bold tabular-nums">
            {Math.max(highScore, stats.score).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Mode Specific Objective Strip */}
      {mode === 'sprint' && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-bold tracking-wider text-slate-400">40L SPRINT</span>
            <span className="font-mono text-cyan-400 tabular-nums">
              {stats.lines} / 40
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${Math.min(100, (stats.lines / 40) * 100)}%`,
                backgroundColor: theme.accent,
                boxShadow: `0 0 10px ${theme.accent}`,
              }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="font-sans">Time</span>
            <span className="text-white font-bold tabular-nums">
              {formatTime(stats.elapsedTime)}
            </span>
          </div>
        </div>
      )}

      {mode === 'ultra' && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="font-bold tracking-wider text-slate-400">ULTRA 2-MIN</span>
            <span
              className={`font-mono font-bold tabular-nums text-sm ${
                ultraTimeRemaining <= 30 ? 'text-red-400 animate-pulse' : 'text-amber-400'
              }`}
            >
              {formatTime(ultraTimeRemaining)}
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${Math.max(0, (ultraTimeRemaining / 120) * 100)}%`,
                backgroundColor: ultraTimeRemaining <= 30 ? '#ef4444' : '#f59e0b',
                boxShadow: `0 0 10px ${ultraTimeRemaining <= 30 ? '#ef4444' : '#f59e0b'}`,
              }}
            />
          </div>
        </div>
      )}

      {/* Core Telemetry (Level, Lines, Combo) */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-slate-400">LEVEL</span>
          <span className="text-base font-bold font-mono text-white tabular-nums">
            {stats.level}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-slate-400">LINES</span>
          <span className="text-base font-bold font-mono text-cyan-400 tabular-nums">
            {stats.lines}
          </span>
        </div>

        {stats.currentCombo > 0 && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <span className="text-xs font-bold tracking-wider text-amber-400">COMBO</span>
            <span className="text-sm font-bold font-mono text-amber-300 tabular-nums">
              x{stats.currentCombo}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80 font-mono">
          <span className="font-sans">Time</span>
          <span className="text-slate-300 tabular-nums">{formatTime(stats.elapsedTime)}</span>
        </div>
      </div>
    </div>
  );
};
