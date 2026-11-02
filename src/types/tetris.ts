export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type RotationState = 0 | 1 | 2 | 3;

export interface Piece {
  type: TetrominoType;
  rotation: RotationState;
  x: number;
  y: number;
}

export interface CellData {
  type: TetrominoType;
  color: string;
  glow: string;
}

export type Grid = (CellData | null)[][];

export type GameMode = 'marathon' | 'sprint' | 'ultra' | 'zen';

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

export interface ScorePopup {
  id: string;
  text: string;
  subtext?: string;
  points: number;
  x: number;
  y: number;
  opacity: number;
  color: string;
  scale: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  glowColor: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface LineClearAnimation {
  rows: number[];
  progress: number; // 0 to 1
  color: string;
}

export interface GameStats {
  score: number;
  lines: number;
  level: number;
  singles: number;
  doubles: number;
  triples: number;
  tetrises: number;
  maxCombo: number;
  currentCombo: number;
  piecesPlaced: number;
  startTime: number;
  elapsedTime: number; // in seconds
}

export interface HighScoreRecord {
  mode: GameMode;
  score: number;
  lines: number;
  level: number;
  time: number;
  date: string;
}

export interface ThemeColors {
  id: string;
  name: string;
  background: string;
  panelBackground: string;
  gridLine: string;
  gridBorder: string;
  accent: string;
  pieces: Record<TetrominoType, {
    primary: string;
    glow: string;
    inner: string;
  }>;
}

export interface KeyBindings {
  moveLeft: string[];
  moveRight: string[];
  softDrop: string[];
  hardDrop: string[];
  rotateCW: string[];
  rotateCCW: string[];
  hold: string[];
  pause: string[];
  restart: string[];
}
