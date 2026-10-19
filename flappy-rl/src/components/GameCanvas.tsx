import { useEffect, useRef } from 'react';
import type { GameSnapshot, GameConfig } from '../game/types';

interface GameCanvasProps {
  snapshot: GameSnapshot;
  config: GameConfig;
}

const COLORS = {
  bg: '#87CEEB',
  ground: '#C2B280',
  pipe: '#2E8B57',
  pipeBorder: '#1B5E3B',
  bird: '#F4C430',
  birdDead: '#E74C3C',
  grid: 'rgba(0,0,0,0.06)',
};

/**
 * Rendu grille → canvas. Une cellule = config.cellSize px.
 * Même logique visuelle que le rendu texte Python (@, |).
 */
export function GameCanvas({ snapshot, config }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height, cellSize } = config;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = width * cellSize;
    const h = height * cellSize;

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, w, h);

    // Grille légère
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, h);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(w, y * cellSize);
      ctx.stroke();
    }

    for (const pipe of snapshot.pipes) {
      drawPipe(ctx, pipe.x, 0, pipe.gapTop, cellSize);
      drawPipe(ctx, pipe.x, pipe.gapBottom, height - pipe.gapBottom, cellSize);
    }

    // Oiseau
    const { bird } = snapshot;
    const bx = bird.x * cellSize;
    const by = Math.min(bird.y, height - 1) * cellSize;
    ctx.fillStyle = bird.alive ? COLORS.bird : COLORS.birdDead;
    ctx.beginPath();
    ctx.arc(bx + cellSize / 2, by + cellSize / 2, cellSize * 0.35, 0, Math.PI * 2);
    ctx.fill();
    // Œil
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(bx + cellSize * 0.62, by + cellSize * 0.38, cellSize * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }, [snapshot, config, width, height, cellSize]);

  return (
    <canvas
      ref={canvasRef}
      width={width * cellSize}
      height={height * cellSize}
      className="border border-dark rounded shadow-sm d-block mx-auto"
      style={{ imageRendering: 'pixelated', maxWidth: '100%' }}
    />
  );
}

function drawPipe(
  ctx: CanvasRenderingContext2D,
  col: number,
  rowStart: number,
  rows: number,
  cellSize: number,
) {
  if (rows <= 0) return;
  const x = col * cellSize;
  const y = rowStart * cellSize;
  const h = rows * cellSize;
  ctx.fillStyle = COLORS.pipe;
  ctx.fillRect(x + 2, y, cellSize - 4, h);
  ctx.strokeStyle = COLORS.pipeBorder;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 2, y, cellSize - 4, h);
}
