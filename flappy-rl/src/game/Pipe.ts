import type { GameConfig, PipePair } from './types';

let nextPipeId = 1;

export function createRandomPipe(config: GameConfig, x?: number): PipePair {
  const maxTop = Math.max(1, config.height - config.pipeGap - 1);
  const gapTop = 1 + Math.floor(Math.random() * maxTop);
  return {
    id: nextPipeId++,
    x: x ?? config.width - 1,
    gapTop,
    gapBottom: gapTop + config.pipeGap,
    scored: false,
  };
}

export function prunePipes(pipes: PipePair[]): PipePair[] {
  return pipes.filter((p) => p.x >= -1);
}

export function closestUpcomingPipeIndex(
  pipes: PipePair[],
  birdX: number,
): number {
  let best = -1;
  let bestDx = Infinity;
  for (let i = 0; i < pipes.length; i++) {
    const dx = pipes[i].x - birdX;
    if (dx >= 0 && dx < bestDx) {
      bestDx = dx;
      best = i;
    }
  }
  return best;
}

/** Colonne intere attraversate da un tubo che si sposta verso sinistra. */
export function sweptColumns(prevX: number, currX: number): number[] {
  const cols: number[] = [];
  const from = Math.ceil(currX);
  const to = Math.floor(prevX);
  for (let c = from; c <= to; c++) {
    cols.push(c);
  }
  const occupied = Math.floor(currX + 1e-9);
  if (!cols.includes(occupied)) {
    cols.push(occupied);
  }
  return cols;
}
