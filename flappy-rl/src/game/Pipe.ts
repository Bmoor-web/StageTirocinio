import type { GameConfig, PipePair } from './types';

/** Génère un couple de tuyaux avec un gap aléatoire. */
export function createRandomPipe(config: GameConfig, x?: number): PipePair {
  const maxTop = config.height - config.pipeGap - 1;
  const gapTop = 1 + Math.floor(Math.random() * maxTop);
  return {
    x: x ?? config.width - 1,
    gapTop,
    gapBottom: gapTop + config.pipeGap,
  };
}

export function shiftPipes(pipes: PipePair[]): void {
  for (const pipe of pipes) {
    pipe.x -= 1;
  }
}

/** Retire les tuyaux hors écran (x < 0). */
export function prunePipes(pipes: PipePair[]): PipePair[] {
  return pipes.filter((p) => p.x >= 0);
}

/**
 * Index du prochain tuyau devant l'oiseau (x >= birdX).
 * Utile pour dx / dy et la Q-table.
 */
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
