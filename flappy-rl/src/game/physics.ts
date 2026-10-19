import type { Bird } from './Bird';
import { sweptColumns } from './Pipe';
import type { GameConfig, PipePair } from './types';

/**
 * Collisione suolo / tubo. Con velocità orizzontale > 1 il tubo può saltare
 * delle colonne: si controlla tutto l'intervallo [x precedente, x attuale].
 */
export function checkCrash(
  bird: Bird,
  pipes: PipePair[],
  prevXs: Map<number, number>,
  config: GameConfig,
): boolean {
  if (bird.y >= config.height - 0.01) {
    return true;
  }

  const yCell = Math.min(config.height - 1, Math.floor(bird.y));

  for (const pipe of pipes) {
    const prevX = prevXs.get(pipe.id) ?? pipe.x;
    const cols = sweptColumns(prevX, pipe.x);
    if (!cols.includes(bird.x)) continue;
    const inGap = yCell >= pipe.gapTop && yCell < pipe.gapBottom;
    if (!inGap) return true;
  }

  return false;
}

export function computeDistances(
  birdX: number,
  birdY: number,
  pipes: PipePair[],
  pipeGap: number,
): { dx: number; dy: number } {
  const upcoming = pipes
    .map((p) => ({ p, dx: p.x - birdX }))
    .filter((e) => e.dx >= 0)
    .sort((a, b) => a.dx - b.dx)[0];

  if (!upcoming) {
    return { dx: 0, dy: 0 };
  }

  const gapCenter = upcoming.p.gapTop + pipeGap / 2;
  return {
    dx: upcoming.dx,
    dy: birdY - gapCenter,
  };
}

export function currentHorizontalSpeed(
  score: number,
  config: GameConfig,
): number {
  const steps = Math.floor(score / Math.max(1, config.speedIncreaseEvery));
  const speed = config.baseHorizontalSpeed + steps * config.speedDelta;
  return Math.min(config.maxHorizontalSpeed, speed);
}
