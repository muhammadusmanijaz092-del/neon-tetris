import {
  TetrominoType,
  RotationState,
  Piece,
  Grid,
  GameMode,
  GameStatus,
  GameStats,
  ScorePopup,
  ThemeColors,
} from '../types/tetris';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TOTAL_HEIGHT,
  BUFFER_HEIGHT,
  TETROMINO_SHAPES,
  SRS_KICKS_NORMAL,
  SRS_KICKS_I,
  GRAVITY_BY_LEVEL,
  LOCK_DELAY_MS,
  MAX_LOCK_RESETS,
  SCORE_VALUES,
} from './constants';
import { soundManager } from './soundManager';

const ALL_TETROMINOES: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

export class TetrisEngine {
  public grid: Grid;
  public currentPiece: Piece | null = null;
  public holdPiece: TetrominoType | null = null;
  public canHold: boolean = true;
  public nextQueue: TetrominoType[] = [];
  public bag: TetrominoType[] = [];
  public status: GameStatus = 'IDLE';
  public mode: GameMode = 'marathon';
  public stats: GameStats;
  public currentTheme: ThemeColors;

  // Timers and locks
  public fallTimer: number = 0;
  public lockTimer: number = 0;
  public isLocking: boolean = false;
  public lockResetsCount: number = 0;
  public backToBack: boolean = false;
  public lastMoveWasRotate: boolean = false;

  // Active animations & VFX
  public clearingRows: number[] = [];
  public clearAnimationTimer: number = 0;
  public scorePopups: ScorePopup[] = [];
  public screenShake: number = 0;

  // Callback hooks for UI sync
  public onStateChange?: () => void;
  public onLineClear?: (rows: number[], count: number) => void;
  public onHardDrop?: (cells: { x: number; y: number }[]) => void;

  constructor(theme: ThemeColors) {
    this.currentTheme = theme;
    this.grid = this.createEmptyGrid();
    this.stats = this.createInitialStats();
  }

  public setTheme(theme: ThemeColors) {
    this.currentTheme = theme;
  }

  public createEmptyGrid(): Grid {
    return Array.from({ length: TOTAL_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
  }

  public createInitialStats(level: number = 1): GameStats {
    return {
      score: 0,
      lines: 0,
      level,
      singles: 0,
      doubles: 0,
      triples: 0,
      tetrises: 0,
      maxCombo: 0,
      currentCombo: -1,
      piecesPlaced: 0,
      startTime: Date.now(),
      elapsedTime: 0,
    };
  }

  // Refill bag using Fisher-Yates shuffle
  private refillBag(): TetrominoType[] {
    const pieces = [...ALL_TETROMINOES];
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
    return pieces;
  }

  private pullNextPiece(): TetrominoType {
    if (this.bag.length === 0) {
      this.bag = this.refillBag();
    }
    return this.bag.pop()!;
  }

  public startNewGame(mode: GameMode = 'marathon', startLevel: number = 1) {
    this.mode = mode;
    this.grid = this.createEmptyGrid();
    this.stats = this.createInitialStats(startLevel);
    this.status = 'PLAYING';
    this.holdPiece = null;
    this.canHold = true;
    this.bag = this.refillBag();
    this.nextQueue = [];
    this.clearingRows = [];
    this.scorePopups = [];
    this.screenShake = 0;
    this.backToBack = false;

    // Fill next queue with 5 pieces
    for (let i = 0; i < 5; i++) {
      this.nextQueue.push(this.pullNextPiece());
    }

    this.spawnNextPiece();
    this.onStateChange?.();
  }

  public pauseGame() {
    if (this.status === 'PLAYING') {
      this.status = 'PAUSED';
      this.onStateChange?.();
    }
  }

  public resumeGame() {
    if (this.status === 'PAUSED') {
      this.status = 'PLAYING';
      this.onStateChange?.();
    }
  }

  public togglePause() {
    if (this.status === 'PLAYING') {
      this.pauseGame();
    } else if (this.status === 'PAUSED') {
      this.resumeGame();
    }
  }

  private spawnNextPiece(): boolean {
    const nextType = this.nextQueue.shift() || this.pullNextPiece();
    this.nextQueue.push(this.pullNextPiece());

    const shape = TETROMINO_SHAPES[nextType][0];
    const width = shape[0].length;
    const startX = Math.floor((BOARD_WIDTH - width) / 2);
    const startY = nextType === 'I' ? 0 : 1;

    const piece: Piece = {
      type: nextType,
      rotation: 0,
      x: startX,
      y: startY,
    };

    // Check collision on spawn
    if (this.checkCollision(piece.x, piece.y, piece.rotation, piece.type)) {
      this.currentPiece = piece;
      this.gameOver();
      return false;
    }

    this.currentPiece = piece;
    this.canHold = true;
    this.fallTimer = 0;
    this.lockTimer = 0;
    this.isLocking = false;
    this.lockResetsCount = 0;
    this.lastMoveWasRotate = false;
    return true;
  }

  public checkCollision(
    x: number,
    y: number,
    rotation: RotationState,
    type: TetrominoType,
    grid: Grid = this.grid
  ): boolean {
    const shape = TETROMINO_SHAPES[type][rotation];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const boardX = x + c;
          const boardY = y + r;

          // Out of horizontal bounds
          if (boardX < 0 || boardX >= BOARD_WIDTH) return true;
          // Floor collision
          if (boardY >= TOTAL_HEIGHT) return true;
          // Existing cell collision
          if (boardY >= 0 && grid[boardY][boardX] !== null) return true;
        }
      }
    }
    return false;
  }

  public getGhostY(): number {
    if (!this.currentPiece) return 0;
    let ghostY = this.currentPiece.y;
    while (!this.checkCollision(this.currentPiece.x, ghostY + 1, this.currentPiece.rotation, this.currentPiece.type)) {
      ghostY++;
    }
    return ghostY;
  }

  public moveLeft(): boolean {
    if (this.status !== 'PLAYING' || !this.currentPiece || this.clearingRows.length > 0) return false;
    if (!this.checkCollision(this.currentPiece.x - 1, this.currentPiece.y, this.currentPiece.rotation, this.currentPiece.type)) {
      this.currentPiece.x--;
      this.lastMoveWasRotate = false;
      this.handleMovementLockReset();
      soundManager.playMove();
      this.onStateChange?.();
      return true;
    }
    return false;
  }

  public moveRight(): boolean {
    if (this.status !== 'PLAYING' || !this.currentPiece || this.clearingRows.length > 0) return false;
    if (!this.checkCollision(this.currentPiece.x + 1, this.currentPiece.y, this.currentPiece.rotation, this.currentPiece.type)) {
      this.currentPiece.x++;
      this.lastMoveWasRotate = false;
      this.handleMovementLockReset();
      soundManager.playMove();
      this.onStateChange?.();
      return true;
    }
    return false;
  }

  public rotateCW(): boolean {
    return this.attemptRotation(1);
  }

  public rotateCCW(): boolean {
    return this.attemptRotation(-1);
  }

  private attemptRotation(direction: 1 | -1): boolean {
    if (this.status !== 'PLAYING' || !this.currentPiece || this.clearingRows.length > 0) return false;

    const fromRot = this.currentPiece.rotation;
    const toRot = ((fromRot + direction + 4) % 4) as RotationState;
    const kickKey = `${fromRot}->${toRot}`;

    const kicks =
      this.currentPiece.type === 'I'
        ? SRS_KICKS_I[kickKey] || [[0, 0]]
        : this.currentPiece.type === 'O'
        ? [[0, 0]]
        : SRS_KICKS_NORMAL[kickKey] || [[0, 0]];

    for (const [dx, dy] of kicks) {
      const targetX = this.currentPiece.x + dx;
      const targetY = this.currentPiece.y + dy;
      if (!this.checkCollision(targetX, targetY, toRot, this.currentPiece.type)) {
        this.currentPiece.x = targetX;
        this.currentPiece.y = targetY;
        this.currentPiece.rotation = toRot;
        this.lastMoveWasRotate = true;
        this.handleMovementLockReset();
        soundManager.playRotate();
        this.onStateChange?.();
        return true;
      }
    }
    return false;
  }

  public softDrop(): boolean {
    if (this.status !== 'PLAYING' || !this.currentPiece || this.clearingRows.length > 0) return false;
    if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.rotation, this.currentPiece.type)) {
      this.currentPiece.y++;
      this.stats.score += SCORE_VALUES.SOFT_DROP_PER_ROW;
      this.fallTimer = 0;
      soundManager.playSoftDrop();
      this.onStateChange?.();
      return true;
    }
    return false;
  }

  public hardDrop(): boolean {
    if (this.status !== 'PLAYING' || !this.currentPiece || this.clearingRows.length > 0) return false;
    const ghostY = this.getGhostY();
    const dropDistance = ghostY - this.currentPiece.y;
    this.currentPiece.y = ghostY;
    this.stats.score += dropDistance * SCORE_VALUES.HARD_DROP_PER_ROW;

    // VFX screen shake
    this.screenShake = 6;
    soundManager.playHardDrop();

    // Collect hard drop cell points for particles
    const shape = TETROMINO_SHAPES[this.currentPiece.type][this.currentPiece.rotation];
    const dropCells: { x: number; y: number }[] = [];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          dropCells.push({ x: this.currentPiece.x + c, y: this.currentPiece.y + r });
        }
      }
    }
    this.onHardDrop?.(dropCells);

    this.lockPiece();
    return true;
  }

  public hold(): boolean {
    if (this.status !== 'PLAYING' || !this.currentPiece || !this.canHold || this.clearingRows.length > 0) return false;

    const currentType = this.currentPiece.type;
    soundManager.playHold();

    if (this.holdPiece === null) {
      this.holdPiece = currentType;
      this.spawnNextPiece();
    } else {
      const prevHold = this.holdPiece;
      this.holdPiece = currentType;

      const shape = TETROMINO_SHAPES[prevHold][0];
      const startX = Math.floor((BOARD_WIDTH - shape[0].length) / 2);
      const startY = prevHold === 'I' ? 0 : 1;

      this.currentPiece = {
        type: prevHold,
        rotation: 0,
        x: startX,
        y: startY,
      };
      this.fallTimer = 0;
      this.lockTimer = 0;
      this.isLocking = false;
      this.lockResetsCount = 0;
    }

    this.canHold = false;
    this.onStateChange?.();
    return true;
  }

  private handleMovementLockReset() {
    if (this.isLocking && this.lockResetsCount < MAX_LOCK_RESETS) {
      this.lockTimer = 0;
      this.lockResetsCount++;
    }
  }

  public lockPiece() {
    if (!this.currentPiece) return;

    const { x, y, rotation, type } = this.currentPiece;
    const shape = TETROMINO_SHAPES[type][rotation];
    const pieceTheme = this.currentTheme.pieces[type];

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const boardX = x + c;
          const boardY = y + r;
          if (boardY >= 0 && boardY < TOTAL_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            this.grid[boardY][boardX] = {
              type,
              color: pieceTheme.primary,
              glow: pieceTheme.glow,
            };
          }
        }
      }
    }

    this.stats.piecesPlaced++;
    this.currentPiece = null;
    soundManager.playLock();

    // Check for completed lines
    this.findAndProcessCompletedLines();
  }

  private findAndProcessCompletedLines() {
    const fullRows: number[] = [];

    for (let r = TOTAL_HEIGHT - 1; r >= 0; r--) {
      let isFull = true;
      for (let c = 0; c < BOARD_WIDTH; c++) {
        if (this.grid[r][c] === null) {
          isFull = false;
          break;
        }
      }
      if (isFull) {
        fullRows.push(r);
      }
    }

    if (fullRows.length > 0) {
      // Trigger line clear animation
      this.clearingRows = fullRows;
      this.clearAnimationTimer = 220; // 220ms animation

      if (fullRows.length === 4) {
        this.screenShake = 12;
      } else {
        this.screenShake = 4;
      }

      this.onLineClear?.(fullRows, fullRows.length);
      soundManager.playLineClear(fullRows.length);
    } else {
      // No lines cleared: reset combo
      this.stats.currentCombo = -1;
      this.finalizePieceCycle();
    }
  }

  private finalizePieceCycle() {
    // Check if topped out (blocks locked inside buffer zone)
    for (let c = 0; c < BOARD_WIDTH; c++) {
      if (this.grid[1][c] !== null) {
        this.gameOver();
        return;
      }
    }

    // Check Game Mode completion
    if (this.mode === 'sprint' && this.stats.lines >= 40) {
      this.victory();
      return;
    }

    this.spawnNextPiece();
    this.onStateChange?.();
  }

  private removeClearedLines() {
    if (this.clearingRows.length === 0) return;

    const count = this.clearingRows.length;
    const sortedRows = [...this.clearingRows].sort((a, b) => a - b);

    // Remove rows from grid
    const newGrid: Grid = this.grid.filter((_, idx) => !sortedRows.includes(idx));
    // Add empty rows at top
    for (let i = 0; i < count; i++) {
      newGrid.unshift(Array(BOARD_WIDTH).fill(null));
    }
    this.grid = newGrid;

    // Calculate score & stats
    this.stats.lines += count;
    this.stats.currentCombo++;
    if (this.stats.currentCombo > this.stats.maxCombo) {
      this.stats.maxCombo = this.stats.currentCombo;
    }

    let basePoints = 0;
    let label = '';
    let isTetris = false;

    switch (count) {
      case 1:
        basePoints = SCORE_VALUES.SINGLE;
        this.stats.singles++;
        label = 'SINGLE';
        this.backToBack = false;
        break;
      case 2:
        basePoints = SCORE_VALUES.DOUBLE;
        this.stats.doubles++;
        label = 'DOUBLE';
        this.backToBack = false;
        break;
      case 3:
        basePoints = SCORE_VALUES.TRIPLE;
        this.stats.triples++;
        label = 'TRIPLE';
        this.backToBack = false;
        break;
      case 4:
        basePoints = SCORE_VALUES.TETRIS;
        this.stats.tetrises++;
        label = 'TETRIS!';
        isTetris = true;
        break;
    }

    let lineScore = basePoints * this.stats.level;
    let sublabel = '';

    if (isTetris && this.backToBack) {
      lineScore = Math.floor(lineScore * SCORE_VALUES.BACK_TO_BACK_MULTIPLIER);
      sublabel = 'BACK-TO-BACK';
    }
    if (isTetris) {
      this.backToBack = true;
    }

    // Combo bonus
    if (this.stats.currentCombo > 0) {
      const comboScore = SCORE_VALUES.COMBO_BONUS_PER_COMBO * this.stats.currentCombo * this.stats.level;
      lineScore += comboScore;
      sublabel = sublabel ? `${sublabel} · COMBO x${this.stats.currentCombo}` : `COMBO x${this.stats.currentCombo}`;
    }

    this.stats.score += lineScore;

    // Create score popup
    this.addScorePopup(label, sublabel, lineScore);

    // Level progression (Marathon mode)
    if (this.mode === 'marathon') {
      const targetLevel = Math.min(20, Math.floor(this.stats.lines / 10) + 1);
      if (targetLevel > this.stats.level) {
        this.stats.level = targetLevel;
        soundManager.playLevelUp();
        this.addScorePopup(`LEVEL ${this.stats.level}`, 'SPEED INCREASE', 0, '#38bdf8');
      }
    }

    this.clearingRows = [];
    this.finalizePieceCycle();
  }

  public addScorePopup(text: string, subtext: string, points: number, colorOverride?: string) {
    const id = Math.random().toString(36).substring(2, 9);
    const color = colorOverride || (points >= 800 ? '#f43f5e' : points >= 300 ? '#00f2fe' : '#facc15');
    this.scorePopups.push({
      id,
      text,
      subtext,
      points,
      x: BOARD_WIDTH / 2,
      y: 10,
      opacity: 1,
      scale: 1,
      color,
    });
  }

  public gameOver() {
    this.status = 'GAME_OVER';
    soundManager.playGameOver();
    this.onStateChange?.();
  }

  public victory() {
    this.status = 'VICTORY';
    soundManager.playLevelUp();
    this.onStateChange?.();
  }

  public tick(deltaMs: number) {
    if (this.status !== 'PLAYING') return;

    this.stats.elapsedTime += deltaMs / 1000;

    // Check Ultra mode 2-minute limit (120s)
    if (this.mode === 'ultra' && this.stats.elapsedTime >= 120) {
      this.gameOver();
      return;
    }

    // Handle line clear animation
    if (this.clearingRows.length > 0) {
      this.clearAnimationTimer -= deltaMs;
      if (this.clearAnimationTimer <= 0) {
        this.removeClearedLines();
      }
      return;
    }

    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - deltaMs * 0.04);
    }

    // Update score popups
    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const p = this.scorePopups[i];
      p.y -= deltaMs * 0.003;
      p.opacity -= deltaMs * 0.0012;
      p.scale += deltaMs * 0.0003;
      if (p.opacity <= 0) {
        this.scorePopups.splice(i, 1);
      }
    }

    if (!this.currentPiece) return;

    // Check if touching ground/block
    const isGrounded = this.checkCollision(
      this.currentPiece.x,
      this.currentPiece.y + 1,
      this.currentPiece.rotation,
      this.currentPiece.type
    );

    if (isGrounded) {
      this.isLocking = true;
      this.lockTimer += deltaMs;
      if (this.lockTimer >= LOCK_DELAY_MS) {
        this.lockPiece();
        return;
      }
    } else {
      this.isLocking = false;
      this.lockTimer = 0;

      // Gravity fall
      const fallSpeed = this.mode === 'zen' ? 700 : (GRAVITY_BY_LEVEL[this.stats.level] || 800);
      this.fallTimer += deltaMs;
      if (this.fallTimer >= fallSpeed) {
        this.currentPiece.y++;
        this.fallTimer = 0;
        this.onStateChange?.();
      }
    }
  }
}
