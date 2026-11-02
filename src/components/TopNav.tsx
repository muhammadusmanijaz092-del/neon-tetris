import React from 'react';
import { Volume2, VolumeX, Music, Settings, Trophy, RotateCcw } from 'lucide-react';
import { GameMode, ThemeColors } from '../types/tetris';

interface TopNavProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  isSfxMuted: boolean;
  isMusicMuted: boolean;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
  currentTheme: ThemeColors;
  themes: ThemeColors[];
  onSelectTheme: (theme: ThemeColors) => void;
  onOpenSettings: () => void;
  onOpenLeaderboard: () => void;
  onRestart: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentMode,
  onSelectMode,
  isSfxMuted,
  isMusicMuted,
  onToggleSfx,
  onToggleMusic,
  currentTheme,
  themes,
  onSelectTheme,
  onOpenSettings,
  onOpenLeaderboard,
  onRestart,
}) => {
  const modes: { id: GameMode; label: string }[] = [
    { id: 'marathon', label: 'Marathon' },
    { id: 'sprint', label: 'Sprint 40L' },
    { id: 'ultra', label: 'Ultra 2M' },
    { id: 'zen', label: 'Zen Mode' },
  ];

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
        <span
          className="text-lg font-extrabold tracking-wider text-transparent bg-clip-text"
          style={{
            backgroundImage: `linear-gradient(135deg, #ffffff 30%, ${currentTheme.accent} 100%)`,
          }}
        >
          NEON TETRIS
        </span>
      </div>

      {/* Zone 2: 4 single-line game mode tabs */}
      <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-lg">
        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
              style={isActive ? { borderBottom: `2px solid ${currentTheme.accent}` } : {}}
            >
              {mode.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Audio controls, Theme picker, Settings */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Restart Quick Button */}
        <button
          onClick={onRestart}
          title="Restart Game (R)"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Audio SFX Toggle */}
        <button
          onClick={onToggleSfx}
          title={isSfxMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isSfxMuted
              ? 'text-slate-500 border-transparent hover:text-slate-400'
              : 'text-cyan-400 bg-cyan-950/30 border-cyan-800/50 hover:bg-cyan-900/40'
          }`}
        >
          {isSfxMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Music Pulse Toggle */}
        <button
          onClick={onToggleMusic}
          title={isMusicMuted ? 'Play Synth Ambient Music' : 'Mute Synth Music'}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isMusicMuted
              ? 'text-slate-500 border-transparent hover:text-slate-400'
              : 'text-pink-400 bg-pink-950/30 border-pink-800/50 hover:bg-pink-900/40'
          }`}
        >
          <Music className="w-4 h-4" />
        </button>

        {/* Palette Theme Selector Dropdown */}
        <select
          value={currentTheme.id}
          onChange={(e) => {
            const found = themes.find((t) => t.id === e.target.value);
            if (found) onSelectTheme(found);
          }}
          className="hidden sm:block text-xs font-medium bg-slate-900 text-slate-200 border border-slate-700/80 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          {themes.map((t) => (
            <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
              {t.name}
            </option>
          ))}
        </select>

        {/* Leaderboard trigger */}
        <button
          onClick={onOpenLeaderboard}
          title="High Scores & Records"
          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 rounded-lg border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
        >
          <Trophy className="w-4 h-4" />
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Settings & Keybindings"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
