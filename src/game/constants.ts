import { TetrominoType, RotationState, ThemeColors, KeyBindings } from '../types/tetris';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const BUFFER_HEIGHT = 2; // hidden buffer rows for piece spawn
export const TOTAL_HEIGHT = BOARD_HEIGHT + BUFFER_HEIGHT;

// Tetromino Shape Definitions for all 4 rotation states
// 0 = Spawn, 1 = 90 deg clockwise, 2 = 180 deg, 3 = 270 deg (counter-clockwise)
export const TETROMINO_SHAPES: Record<TetrominoType, number[][][]> = {
  I: [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  J: [
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],
  L: [
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],
  O: [
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
  ],
  S: [
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  T: [
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  Z: [
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
  ],
};

// Standard SRS (Super Rotation System) Kick Tables
// [dx, dy] where +x is right and +y is down (screen coordinates)
export const SRS_KICKS_NORMAL: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '1->0': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '1->2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '2->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '2->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '3->2': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '3->0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '0->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
};

export const SRS_KICKS_I: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
};

// Gravity fall interval in milliseconds by level
export const GRAVITY_BY_LEVEL: Record<number, number> = {
  1: 800,
  2: 720,
  3: 630,
  4: 550,
  5: 470,
  6: 380,
  7: 300,
  8: 220,
  9: 150,
  10: 100,
  11: 80,
  12: 60,
  13: 45,
  14: 35,
  15: 25,
  16: 20,
  17: 17,
  18: 15,
  19: 13,
  20: 10,
};

// Lock delay (ms)
export const LOCK_DELAY_MS = 500;
export const MAX_LOCK_RESETS = 15;

// Delayed Auto Shift (DAS) & Auto Repeat Rate (ARR) in ms
export const DEFAULT_DAS = 135;
export const DEFAULT_ARR = 32;

// Standard Scoring multipliers
export const SCORE_VALUES = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP_PER_ROW: 1,
  HARD_DROP_PER_ROW: 2,
  BACK_TO_BACK_MULTIPLIER: 1.5,
  COMBO_BONUS_PER_COMBO: 50,
};

export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  moveLeft: ['ArrowLeft', 'KeyA'],
  moveRight: ['ArrowRight', 'KeyD'],
  softDrop: ['ArrowDown', 'KeyS'],
  hardDrop: ['Space'],
  rotateCW: ['ArrowUp', 'KeyW', 'KeyX'],
  rotateCCW: ['KeyZ', 'ControlLeft'],
  hold: ['KeyC', 'ShiftLeft', 'ShiftRight'],
  pause: ['KeyP', 'Escape'],
  restart: ['KeyR'],
};

// Curated Neon Color Palettes
export const THEMES: ThemeColors[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    background: '#070a12',
    panelBackground: 'rgba(13, 19, 33, 0.85)',
    gridLine: 'rgba(56, 189, 248, 0.08)',
    gridBorder: '#0ea5e9',
    accent: '#06b6d4',
    pieces: {
      I: { primary: '#00f2fe', glow: '#00f2fe', inner: '#a7f3d0' }, // Cyan
      J: { primary: '#3b82f6', glow: '#2563eb', inner: '#93c5fd' }, // Blue
      L: { primary: '#f97316', glow: '#ea580c', inner: '#fed7aa' }, // Orange
      O: { primary: '#facc15', glow: '#eab308', inner: '#fef08a' }, // Yellow
      S: { primary: '#10b981', glow: '#059669', inner: '#a7f3d0' }, // Green
      T: { primary: '#d946ef', glow: '#c026d3', inner: '#f5d0fe' }, // Purple / Magenta
      Z: { primary: '#f43f5e', glow: '#e11d48', inner: '#fecdd3' }, // Crimson / Red
    },
  },
  {
    id: 'synthwave',
    name: 'Synthwave 84',
    background: '#0c0716',
    panelBackground: 'rgba(23, 15, 38, 0.85)',
    gridLine: 'rgba(236, 72, 153, 0.08)',
    gridBorder: '#ec4899',
    accent: '#f43f5e',
    pieces: {
      I: { primary: '#38bdf8', glow: '#0284c7', inner: '#bae6fd' },
      J: { primary: '#818cf8', glow: '#6366f1', inner: '#c7d2fe' },
      L: { primary: '#fb923c', glow: '#f97316', inner: '#ffedd5' },
      O: { primary: '#fde047', glow: '#eab308', inner: '#fef9c3' },
      S: { primary: '#34d399', glow: '#10b981', inner: '#d1fae5' },
      T: { primary: '#f472b6', glow: '#ec4899', inner: '#fce7f3' },
      Z: { primary: '#fb7185', glow: '#f43f5e', inner: '#ffe4e6' },
    },
  },
  {
    id: 'matrix',
    name: 'Matrix Emerald',
    background: '#040d08',
    panelBackground: 'rgba(6, 26, 16, 0.85)',
    gridLine: 'rgba(34, 197, 94, 0.09)',
    gridBorder: '#10b981',
    accent: '#22c55e',
    pieces: {
      I: { primary: '#4ade80', glow: '#22c55e', inner: '#dcfce7' },
      J: { primary: '#2dd4bf', glow: '#14b8a6', inner: '#ccfbf1' },
      L: { primary: '#a3e635', glow: '#84cc16', inner: '#ecfccb' },
      O: { primary: '#facc15', glow: '#eab308', inner: '#fef08a' },
      S: { primary: '#34d399', glow: '#10b981', inner: '#a7f3d0' },
      T: { primary: '#86efac', glow: '#4ade80', inner: '#f0fdf4' },
      Z: { primary: '#6ee7b7', glow: '#059669', inner: '#d1fae5' },
    },
  },
  {
    id: 'tokyo',
    name: 'Tokyo Neon',
    background: '#090812',
    panelBackground: 'rgba(18, 16, 32, 0.85)',
    gridLine: 'rgba(168, 85, 247, 0.08)',
    gridBorder: '#a855f7',
    accent: '#c084fc',
    pieces: {
      I: { primary: '#22d3ee', glow: '#06b6d4', inner: '#cffafe' },
      J: { primary: '#60a5fa', glow: '#3b82f6', inner: '#dbeafe' },
      L: { primary: '#f59e0b', glow: '#d97706', inner: '#fef3c7' },
      O: { primary: '#eab308', glow: '#ca8a04', inner: '#fef08a' },
      S: { primary: '#10b981', glow: '#059669', inner: '#d1fae5' },
      T: { primary: '#ec4899', glow: '#db2777', inner: '#fce7f3' },
      Z: { primary: '#ef4444', glow: '#dc2626', inner: '#fee2e2' },
    },
  },
];
