import React from 'react';
import { X, Volume2, Music, Sparkles, Eye, Sliders, Shield, Smartphone } from 'lucide-react';
import { ThemeColors } from '../types/tetris';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showGhost: boolean;
  onToggleGhost: () => void;
  enableParticles: boolean;
  onToggleParticles: () => void;
  sfxVolume: number;
  onSfxVolumeChange: (vol: number) => void;
  musicVolume: number;
  onMusicVolumeChange: (vol: number) => void;
  startLevel: number;
  onStartLevelChange: (lvl: number) => void;
  theme: ThemeColors;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  showGhost,
  onToggleGhost,
  enableParticles,
  onToggleParticles,
  sfxVolume,
  onSfxVolumeChange,
  musicVolume,
  onMusicVolumeChange,
  startLevel,
  onStartLevelChange,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5" style={{ color: theme.accent }} />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Game Settings & Customization
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Audio Settings */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Audio Volumes
            </span>
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>Sound Effects</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={sfxVolume}
                  onChange={(e) => onSfxVolumeChange(parseFloat(e.target.value))}
                  className="w-36 accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Music className="w-4 h-4 text-pink-400" />
                  <span>Ambient Synth Music</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => onMusicVolumeChange(parseFloat(e.target.value))}
                  className="w-36 accent-pink-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Gameplay & Visual Toggles */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Gameplay & Visuals
            </span>
            <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
              {/* Ghost Piece */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Ghost Piece Projection
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Shows outline where the piece will land
                    </span>
                  </div>
                </div>
                <button
                  onClick={onToggleGhost}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    showGhost ? 'bg-cyan-600' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      showGhost ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Particle Explosions */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-850">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Particle & Laser FX
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Sparks and laser sweeps on line clears
                    </span>
                  </div>
                </div>
                <button
                  onClick={onToggleParticles}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    enableParticles ? 'bg-cyan-600' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      enableParticles ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Marathon Starting Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Marathon Start Level
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
                Level {startLevel}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <input
                type="range"
                min="1"
                max="15"
                value={startLevel}
                onChange={(e) => onStartLevelChange(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5">
                <span>1 (Gentle)</span>
                <span>8 (Brisk)</span>
                <span>15 (Master)</span>
              </div>
            </div>
          </div>

          {/* Android APK & Mobile Installation Guide */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Convert to Android APK
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-850 space-y-3 text-xs">
              <div>
                <span className="font-semibold text-cyan-300 block mb-1">
                  Option 1: 1-Click Cloud APK (PWABuilder)
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
                  No Android Studio or SDK required. The app includes a configured PWA manifest and neon icon.
                </p>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                  1. Visit <span className="text-cyan-300">pwabuilder.com</span><br />
                  2. Paste this app URL & click &quot;Package for Android&quot;<br />
                  3. Download the generated ready-to-install <span className="text-pink-300">.apk</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-850">
                <span className="font-semibold text-cyan-300 block mb-1">
                  Option 2: Native APK (Capacitor + Android Studio)
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed mb-1.5">
                  Pre-configured with <span className="text-slate-200 font-mono">capacitor.config.json</span>:
                </p>
                <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto select-all">
                  npm install @capacitor/core @capacitor/cli @capacitor/android{'\n'}
                  npm run build{'\n'}
                  npx cap add android{'\n'}
                  npx cap open android
                </pre>
              </div>
            </div>
          </div>

          {/* Keybindings Reference */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Default Controls
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-slate-300">
              <div>Move: <span className="text-white">← / → or A / D</span></div>
              <div>Soft Drop: <span className="text-white">↓ or S</span></div>
              <div>Hard Drop: <span className="text-white">Space</span></div>
              <div>Rotate CW: <span className="text-white">↑ or X or W</span></div>
              <div>Rotate CCW: <span className="text-white">Z</span></div>
              <div>Hold: <span className="text-white">C or Shift</span></div>
              <div>Pause: <span className="text-white">P or Esc</span></div>
              <div>Quick Restart: <span className="text-white">R</span></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 transition-colors cursor-pointer"
            style={{ backgroundColor: theme.accent }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
