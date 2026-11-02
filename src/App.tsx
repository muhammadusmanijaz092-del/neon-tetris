/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TetrisEngine } from './game/tetrisEngine';
import { soundManager } from './game/soundManager';
import { THEMES, DEFAULT_DAS, DEFAULT_ARR } from './game/constants';
import { GameMode, HighScoreRecord, ThemeColors } from './types/tetris';

import { TopNav } from './components/TopNav';
import { TetrisCanvas } from './components/TetrisCanvas';
import { HoldPanel } from './components/HoldPanel';
import { NextQueuePanel } from './components/NextQueuePanel';
import { StatsPanel } from './components/StatsPanel';
import { TouchControls } from './components/TouchControls';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<ThemeColors>(THEMES[0]);
  const [engine] = useState<TetrisEngine>(() => new TetrisEngine(THEMES[0]));
  const [, setTick] = useState(0); // For reactive UI sync from engine

  // Game Settings & Preferences
  const [showGhost, setShowGhost] = useState(true);
  const [enableParticles, setEnableParticles] = useState(true);
  const [startLevel, setStartLevel] = useState(1);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [musicVolume, setMusicVolume] = useState(0.25);
  const [isSfxMuted, setIsSfxMuted] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(true); // muted initially until user initiates or toggles

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Persistent High Scores
  const [records, setRecords] = useState<HighScoreRecord[]>(() => {
    try {
      const saved = localStorage.getItem('neon_tetris_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Key tracking for DAS & ARR
  const activeKeysRef = useRef<Map<string, { dasTimer: number; arrTimer: number }>>(new Map());

  // Subscribe engine state updates
  useEffect(() => {
    engine.onStateChange = () => {
      setTick((t) => t + 1);
    };

    // Auto start game on initial mount
    engine.startNewGame('marathon', startLevel);

    return () => {
      engine.onStateChange = undefined;
    };
  }, [engine, startLevel]);

  // Check Game Over / Victory to save High Score
  useEffect(() => {
    if (engine.status === 'GAME_OVER' || engine.status === 'VICTORY') {
      const mode = engine.mode;
      const currentScore = engine.stats.score;
      const currentTime = engine.stats.elapsedTime;

      // Find existing personal best for this mode
      const existingBest = records
        .filter((r) => r.mode === mode)
        .sort((a, b) => (mode === 'sprint' ? a.time - b.time : b.score - a.score))[0];

      const isBest =
        !existingBest ||
        (mode === 'sprint' ? currentTime < existingBest.time : currentScore > existingBest.score);

      setIsNewHighScore(isBest && (mode === 'sprint' || currentScore > 0));

      const newRecord: HighScoreRecord = {
        mode,
        score: currentScore,
        lines: engine.stats.lines,
        level: engine.stats.level,
        time: currentTime,
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      };

      const updated = [...records, newRecord];
      setRecords(updated);
      try {
        localStorage.setItem('neon_tetris_records', JSON.stringify(updated));
      } catch {
        // Local storage full or unavailable
      }
    }
  }, [engine.status, engine.mode, engine.stats, records]);

  // Handle Mode Selection
  const handleSelectMode = (newMode: GameMode) => {
    soundManager.userInteraction();
    engine.startNewGame(newMode, startLevel);
    setTick((t) => t + 1);
  };

  // Handle Restart
  const handleRestart = useCallback(() => {
    soundManager.userInteraction();
    setIsNewHighScore(false);
    engine.startNewGame(engine.mode, startLevel);
    setTick((t) => t + 1);
  }, [engine, startLevel]);

  // Handle Theme Change
  const handleSelectTheme = (newTheme: ThemeColors) => {
    setTheme(newTheme);
    engine.setTheme(newTheme);
    setTick((t) => t + 1);
  };

  // Audio handlers
  const handleToggleSfx = () => {
    soundManager.userInteraction();
    const nextMuted = !isSfxMuted;
    setIsSfxMuted(nextMuted);
    soundManager.setSfxMuted(nextMuted);
  };

  const handleToggleMusic = () => {
    soundManager.userInteraction();
    const nextMuted = !isMusicMuted;
    setIsMusicMuted(nextMuted);
    soundManager.setMusicMuted(nextMuted);
    if (!nextMuted) {
      soundManager.startMusic();
    } else {
      soundManager.stopMusic();
    }
  };

  const handleSfxVolumeChange = (vol: number) => {
    setSfxVolume(vol);
    soundManager.setSfxVolume(vol);
  };

  const handleMusicVolumeChange = (vol: number) => {
    setMusicVolume(vol);
    soundManager.setMusicVolume(vol);
  };

  // Keyboard Event Handlers with DAS & ARR
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs/modals
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      soundManager.userInteraction();

      // Pause toggle
      if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        engine.togglePause();
        setTick((t) => t + 1);
        return;
      }

      // Quick restart
      if (e.code === 'KeyR' && !isSettingsOpen && !isLeaderboardOpen) {
        e.preventDefault();
        handleRestart();
        return;
      }

      if (engine.status !== 'PLAYING') return;

      // Single trigger actions
      if (e.code === 'Space') {
        e.preventDefault();
        engine.hardDrop();
        return;
      }

      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyX') {
        e.preventDefault();
        engine.rotateCW();
        return;
      }

      if (e.code === 'KeyZ' || e.code === 'ControlLeft') {
        e.preventDefault();
        engine.rotateCCW();
        return;
      }

      if (e.code === 'KeyC' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault();
        engine.hold();
        return;
      }

      // Continuous movement keys (Left, Right, Down)
      if (['ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD', 'ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        if (!activeKeysRef.current.has(e.code)) {
          // Initial trigger
          if (e.code === 'ArrowLeft' || e.code === 'KeyA') engine.moveLeft();
          else if (e.code === 'ArrowRight' || e.code === 'KeyD') engine.moveRight();
          else if (e.code === 'ArrowDown' || e.code === 'KeyS') engine.softDrop();

          activeKeysRef.current.set(e.code, { dasTimer: DEFAULT_DAS, arrTimer: 0 });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      activeKeysRef.current.delete(e.code);
    };

    const handleWindowBlur = () => {
      activeKeysRef.current.clear();
      if (engine.status === 'PLAYING') {
        engine.pauseGame();
        setTick((t) => t + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    // DAS / ARR continuous tick interval
    const inputInterval = setInterval(() => {
      if (engine.status !== 'PLAYING') return;

      activeKeysRef.current.forEach((val, code) => {
        if (val.dasTimer > 0) {
          val.dasTimer -= 16;
        } else {
          val.arrTimer -= 16;
          if (val.arrTimer <= 0) {
            val.arrTimer = DEFAULT_ARR;
            if (code === 'ArrowLeft' || code === 'KeyA') engine.moveLeft();
            else if (code === 'ArrowRight' || code === 'KeyD') engine.moveRight();
            else if (code === 'ArrowDown' || code === 'KeyS') engine.softDrop();
          }
        }
      });
    }, 16);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      clearInterval(inputInterval);
    };
  }, [engine, isSettingsOpen, isLeaderboardOpen, handleRestart]);

  // Current personal best for active mode
  const currentBestScore =
    records
      .filter((r) => r.mode === engine.mode)
      .sort((a, b) => (engine.mode === 'sprint' ? a.time - b.time : b.score - a.score))[0]?.score || 0;

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black transition-colors duration-500"
      style={{ backgroundColor: theme.background }}
    >
      {/* Top Bar Navigation */}
      <TopNav
        currentMode={engine.mode}
        onSelectMode={handleSelectMode}
        isSfxMuted={isSfxMuted}
        isMusicMuted={isMusicMuted}
        onToggleSfx={handleToggleSfx}
        onToggleMusic={handleToggleMusic}
        currentTheme={theme}
        themes={THEMES}
        onSelectTheme={handleSelectTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onRestart={handleRestart}
      />

      {/* Main Game Arena */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 max-w-7xl w-full mx-auto relative">
        {/* Ambient Backlight Glow */}
        <div
          className="absolute -z-10 w-96 h-96 rounded-full blur-[120px] opacity-25 pointer-events-none transition-all duration-700"
          style={{
            backgroundColor: theme.accent,
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* 3-Column Layout: Left (Hold + Controls), Center (Board), Right (Next + Stats) */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 sm:gap-6 w-full">
          {/* Left Column (Hold & Controls) - Hidden on smallest screens or stacked */}
          <div className="hidden lg:flex flex-col w-52 shrink-0">
            <HoldPanel
              holdPiece={engine.holdPiece}
              canHold={engine.canHold}
              theme={theme}
            />
          </div>

          {/* Center Column: Game Canvas and Overlays */}
          <div className="relative flex flex-col items-center">
            {/* Small screen mobile header strip showing Hold & Next quickly */}
            <div className="flex lg:hidden items-center justify-between w-full max-w-[300px] mb-2 px-1">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <span className="font-sans font-bold text-slate-500">HOLD:</span>
                <span className="font-bold text-white">{engine.holdPiece || '—'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <span className="font-sans font-bold text-slate-500">NEXT:</span>
                <span className="font-bold text-white">{engine.nextQueue[0] || '—'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
                <span className="font-sans font-bold text-slate-500">SCORE:</span>
                <span className="font-bold tabular-nums">{engine.stats.score}</span>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="relative">
              <TetrisCanvas
                engine={engine}
                showGhost={showGhost}
                enableParticles={enableParticles}
              />

              {/* Pause Overlay */}
              {engine.status === 'PAUSED' && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 z-20">
                  <div className="p-3 rounded-full bg-slate-900 border border-slate-700 mb-4 shadow-xl">
                    <Pause className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold tracking-wider text-white mb-6">
                    GAME PAUSED
                  </h3>
                  <div className="flex flex-col gap-2.5 w-44">
                    <button
                      onClick={() => {
                        engine.resumeGame();
                        setTick((t) => t + 1);
                      }}
                      className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
                      style={{ backgroundColor: theme.accent }}
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Resume</span>
                    </button>
                    <button
                      onClick={handleRestart}
                      className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Restart</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile / Tablet On-Screen Touch Controls */}
            <div className="block lg:hidden w-full max-w-[340px] mt-2">
              <TouchControls engine={engine} />
            </div>
          </div>

          {/* Right Column (Next Queue & Telemetry Stats) */}
          <div className="hidden lg:flex flex-col w-56 shrink-0 gap-4">
            <NextQueuePanel queue={engine.nextQueue} theme={theme} />
            <StatsPanel
              stats={engine.stats}
              mode={engine.mode}
              highScore={currentBestScore}
              theme={theme}
            />
          </div>
        </div>
      </main>

      {/* Clean Unboxed Footer */}
      <footer className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/70 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center gap-3">
          <span>Neon Tetris</span>
          <span aria-hidden="true">·</span>
          <span>SRS Rotation Engine</span>
          <span aria-hidden="true">·</span>
          <span>Web Audio Synth</span>
        </div>
      </footer>

      {/* Game Over / Victory Modal */}
      {(engine.status === 'GAME_OVER' || engine.status === 'VICTORY') && (
        <GameOverModal
          status={engine.status}
          mode={engine.mode}
          stats={engine.stats}
          isNewHighScore={isNewHighScore}
          theme={theme}
          onPlayAgain={handleRestart}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        showGhost={showGhost}
        onToggleGhost={() => setShowGhost((g) => !g)}
        enableParticles={enableParticles}
        onToggleParticles={() => setEnableParticles((p) => !p)}
        sfxVolume={sfxVolume}
        onSfxVolumeChange={handleSfxVolumeChange}
        musicVolume={musicVolume}
        onMusicVolumeChange={handleMusicVolumeChange}
        startLevel={startLevel}
        onStartLevelChange={(lvl) => setStartLevel(lvl)}
        theme={theme}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        records={records}
        onClearRecords={() => {
          setRecords([]);
          try {
            localStorage.removeItem('neon_tetris_records');
          } catch {
            // ignore
          }
        }}
        theme={theme}
      />
    </div>
  );
}
