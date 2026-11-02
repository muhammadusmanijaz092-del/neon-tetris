import React, { useRef, useEffect } from 'react';
import { TetrisEngine } from '../game/tetrisEngine';
import { Particle, ScorePopup } from '../types/tetris';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BUFFER_HEIGHT,
  TETROMINO_SHAPES,
} from '../game/constants';

interface TetrisCanvasProps {
  engine: TetrisEngine;
  showGhost: boolean;
  enableParticles: boolean;
}

export const TetrisCanvas: React.FC<TetrisCanvasProps> = ({
  engine,
  showGhost,
  enableParticles,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Register hard drop & line clear listeners for particles
  useEffect(() => {
    engine.onHardDrop = (cells) => {
      if (!enableParticles) return;
      const theme = engine.currentTheme;
      cells.forEach((cell) => {
        // Spawn small dust/spark particles at bottom of dropped cells
        for (let i = 0; i < 4; i++) {
          particlesRef.current.push({
            x: (cell.x + 0.5) * 30 + (Math.random() - 0.5) * 15,
            y: (cell.y - BUFFER_HEIGHT + 1) * 30,
            vx: (Math.random() - 0.5) * 80,
            vy: -Math.random() * 60 - 20,
            color: '#ffffff',
            glowColor: theme.accent,
            size: Math.random() * 3 + 1.5,
            life: 1,
            maxLife: 0.35,
          });
        }
      });
    };

    engine.onLineClear = (rows) => {
      if (!enableParticles) return;
      const theme = engine.currentTheme;
      rows.forEach((r) => {
        const visualRow = r - BUFFER_HEIGHT;
        for (let i = 0; i < 30; i++) {
          particlesRef.current.push({
            x: Math.random() * (BOARD_WIDTH * 30),
            y: visualRow * 30 + Math.random() * 30,
            vx: (Math.random() - 0.5) * 160,
            vy: (Math.random() - 0.5) * 120,
            color: i % 2 === 0 ? '#ffffff' : theme.accent,
            glowColor: theme.accent,
            size: Math.random() * 4 + 2,
            life: 1,
            maxLife: 0.6,
          });
        }
      });
    };

    return () => {
      engine.onHardDrop = undefined;
      engine.onLineClear = undefined;
    };
  }, [engine, enableParticles]);

  // Main rendering loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const deltaMs = Math.min(100, time - lastTime);
      lastTime = time;

      // Advance engine state
      engine.tick(deltaMs);

      // Advance particles
      if (enableParticles && particlesRef.current.length > 0) {
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += (p.vx * deltaMs) / 1000;
          p.y += (p.vy * deltaMs) / 1000;
          p.vy += (140 * deltaMs) / 1000; // gravity
          p.life -= deltaMs / (p.maxLife * 1000);
          if (p.life <= 0) {
            particlesRef.current.splice(i, 1);
          }
        }
      }

      // Draw canvas
      drawCanvas(time);

      animId = requestAnimationFrame(render);
    };

    const drawCanvas = (currentTime: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cellSize = 30; // standard cell width/height
      const width = BOARD_WIDTH * cellSize;
      const height = BOARD_HEIGHT * cellSize;
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Apply screen shake
      if (engine.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * engine.screenShake * 1.5;
        const shakeY = (Math.random() - 0.5) * engine.screenShake * 1.5;
        ctx.translate(shakeX, shakeY);
      }

      // Clear background
      ctx.fillStyle = '#060911';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle background neon grid
      ctx.strokeStyle = engine.currentTheme.gridLine;
      ctx.lineWidth = 1;

      for (let x = 0; x <= BOARD_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, height);
        ctx.stroke();
      }

      for (let y = 0; y <= BOARD_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(width, y * cellSize);
        ctx.stroke();
      }

      // Draw locked grid blocks
      for (let r = BUFFER_HEIGHT; r < engine.grid.length; r++) {
        const visualY = r - BUFFER_HEIGHT;
        for (let c = 0; c < BOARD_WIDTH; c++) {
          const cell = engine.grid[r][c];
          if (cell) {
            const isClearing = engine.clearingRows.includes(r);
            if (!isClearing) {
              drawNeonBlock(
                ctx,
                c * cellSize,
                visualY * cellSize,
                cellSize,
                cell.color,
                cell.glow,
                1.0
              );
            }
          }
        }
      }

      // Draw Ghost Piece
      if (showGhost && engine.currentPiece && engine.status === 'PLAYING') {
        const ghostY = engine.getGhostY();
        const { type, rotation, x } = engine.currentPiece;
        const shape = TETROMINO_SHAPES[type][rotation];
        const theme = engine.currentTheme.pieces[type];

        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] !== 0) {
              const visualY = ghostY + r - BUFFER_HEIGHT;
              if (visualY >= 0 && visualY < BOARD_HEIGHT) {
                drawGhostBlock(
                  ctx,
                  (x + c) * cellSize,
                  visualY * cellSize,
                  cellSize,
                  theme.primary,
                  theme.glow
                );
              }
            }
          }
        }
      }

      // Draw Active Piece
      if (engine.currentPiece && engine.status === 'PLAYING') {
        const { type, rotation, x, y } = engine.currentPiece;
        const shape = TETROMINO_SHAPES[type][rotation];
        const theme = engine.currentTheme.pieces[type];

        // Pulsing glow if locking
        let alpha = 1.0;
        if (engine.isLocking) {
          alpha = 0.85 + Math.sin(currentTime * 0.02) * 0.15;
        }

        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] !== 0) {
              const visualY = y + r - BUFFER_HEIGHT;
              if (visualY >= 0 && visualY < BOARD_HEIGHT) {
                drawNeonBlock(
                  ctx,
                  (x + c) * cellSize,
                  visualY * cellSize,
                  cellSize,
                  theme.primary,
                  theme.glow,
                  alpha
                );
              }
            }
          }
        }
      }

      // Draw Line Clear Flash Animation
      if (engine.clearingRows.length > 0) {
        const progress = Math.max(0, engine.clearAnimationTimer / 220); // 1 -> 0
        const flashAlpha = Math.sin(progress * Math.PI);

        engine.clearingRows.forEach((r) => {
          const visualY = r - BUFFER_HEIGHT;
          const yPos = visualY * cellSize;

          ctx.save();
          // White-hot laser sweep
          ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.95})`;
          ctx.fillRect(0, yPos + 2, width, cellSize - 4);

          // Accent neon bloom
          ctx.shadowColor = engine.currentTheme.accent;
          ctx.shadowBlur = 25;
          ctx.fillStyle = engine.currentTheme.accent;
          ctx.globalAlpha = flashAlpha * 0.7;
          ctx.fillRect(0, yPos + 6, width, cellSize - 12);
          ctx.restore();
        });
      }

      // Draw Particles
      if (enableParticles && particlesRef.current.length > 0) {
        ctx.save();
        particlesRef.current.forEach((p) => {
          ctx.shadowColor = p.glowColor;
          ctx.shadowBlur = 8;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        });
        ctx.restore();
      }

      // Draw In-Game Floating Score Popups
      if (engine.scorePopups.length > 0) {
        engine.scorePopups.forEach((popup) => {
          drawScorePopup(ctx, popup, width);
        });
      }

      // Bounding Glowing Border
      ctx.strokeStyle = engine.currentTheme.gridBorder;
      ctx.lineWidth = 2;
      ctx.shadowColor = engine.currentTheme.accent;
      ctx.shadowBlur = 12;
      ctx.strokeRect(1, 1, width - 2, height - 2);

      ctx.restore();
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [engine, showGhost, enableParticles]);

  const drawNeonBlock = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
    glow: string,
    alpha: number = 1.0
  ) => {
    ctx.save();
    ctx.globalAlpha = alpha;

    const pad = 1.5;
    const innerSize = size - pad * 2;
    const rx = x + pad;
    const ry = y + pad;
    const radius = 3;

    // Outer neon glow
    ctx.shadowColor = glow;
    ctx.shadowBlur = 10;

    // Fill with gradient for 3D neon depth
    const grad = ctx.createLinearGradient(rx, ry, rx + innerSize, ry + innerSize);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, color);
    grad.addColorStop(1, '#05070f');

    ctx.fillStyle = grad;
    drawRoundedRect(ctx, rx, ry, innerSize, innerSize, radius);
    ctx.fill();

    // Inner bright border
    ctx.shadowBlur = 4;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, rx, ry, innerSize, innerSize, radius);
    ctx.stroke();

    // Specular top highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(rx + 2, ry + 2, innerSize - 4, 2);

    ctx.restore();
  };

  const drawGhostBlock = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
    glow: string
  ) => {
    ctx.save();
    const pad = 2;
    const innerSize = size - pad * 2;
    const rx = x + pad;
    const ry = y + pad;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(rx, ry, innerSize, innerSize);

    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.shadowColor = glow;
    ctx.shadowBlur = 6;
    drawRoundedRect(ctx, rx, ry, innerSize, innerSize, 2);
    ctx.stroke();

    ctx.restore();
  };

  const drawScorePopup = (
    ctx: CanvasRenderingContext2D,
    popup: ScorePopup,
    width: number
  ) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, popup.opacity);
    ctx.translate(width / 2, popup.y * 30);
    ctx.scale(popup.scale, popup.scale);

    ctx.font = '800 18px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = popup.color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = popup.color;
    ctx.fillText(popup.text, 0, 0);

    if (popup.subtext) {
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#f8fafc';
      ctx.shadowBlur = 8;
      ctx.fillText(popup.subtext, 0, 18);
    }

    if (popup.points > 0) {
      ctx.font = '700 13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`+${popup.points}`, 0, popup.subtext ? 34 : 18);
    }

    ctx.restore();
  };

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  return (
    <div className="relative inline-block rounded-xl overflow-hidden p-1 bg-slate-950/70 border border-slate-800/80 shadow-2xl">
      <canvas
        ref={canvasRef}
        style={{ width: BOARD_WIDTH * 30, height: BOARD_HEIGHT * 30 }}
        className="block rounded-lg"
      />
    </div>
  );
};
