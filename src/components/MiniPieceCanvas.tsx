import React, { useRef, useEffect } from 'react';
import { TetrominoType, ThemeColors } from '../types/tetris';
import { TETROMINO_SHAPES } from '../game/constants';

interface MiniPieceCanvasProps {
  type: TetrominoType | null;
  theme: ThemeColors;
  size?: number;
  dimmed?: boolean;
}

export const MiniPieceCanvas: React.FC<MiniPieceCanvasProps> = ({
  type,
  theme,
  size = 72,
  dimmed = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    if (!type) {
      ctx.restore();
      return;
    }

    const shape = TETROMINO_SHAPES[type][0];
    const rows = shape.length;
    const cols = shape[0].length;

    // Find actual bounding box of piece
    let minR = rows, maxR = -1, minC = cols, maxC = -1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (shape[r][c] !== 0) {
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;
        }
      }
    }

    const pieceWidth = maxC - minC + 1;
    const pieceHeight = maxR - minR + 1;
    const blockSize = Math.floor(Math.min((size * 0.75) / Math.max(pieceWidth, pieceHeight), 18));

    const totalW = pieceWidth * blockSize;
    const totalH = pieceHeight * blockSize;
    const offsetX = Math.floor((size - totalW) / 2);
    const offsetY = Math.floor((size - totalH) / 2);

    const pieceTheme = theme.pieces[type];

    ctx.globalAlpha = dimmed ? 0.35 : 1.0;

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (shape[r][c] !== 0) {
          const bx = offsetX + (c - minC) * blockSize;
          const by = offsetY + (r - minR) * blockSize;
          const pad = 1;
          const innerSize = blockSize - pad * 2;

          // Outer glow
          if (!dimmed) {
            ctx.shadowColor = pieceTheme.glow;
            ctx.shadowBlur = 6;
          }

          const grad = ctx.createLinearGradient(bx, by, bx + innerSize, by + innerSize);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.25, pieceTheme.primary);
          grad.addColorStop(1, '#0b0f19');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(bx + pad, by + pad, innerSize, innerSize, 2);
          ctx.fill();

          ctx.strokeStyle = pieceTheme.primary;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(bx + pad, by + pad, innerSize, innerSize, 2);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }, [type, theme, size, dimmed]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="block"
    />
  );
};
