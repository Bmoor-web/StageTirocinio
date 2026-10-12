import type { Bird } from './Bird';
import type { GameConfig, PipePair } from './types';

/**
 * Collision sol / plafond / tuyau — miroir de _check_crash() Python.
 * L'oiseau meurt s'il touche le sol, ou s'il est sur la colonne du tuyau
 * sans être dans le gap.
 */
export function checkCrash(
  bird: Bird,
  pipes: PipePair[],
  config: GameConfig,
): boolean {
  if (bird.y >= config.height) {
    return true;
  }

  for (const pipe of pipes) {
    if (pipe.x !== bird.x) continue;
    const inGap = bird.y >= pipe.gapTop && bird.y < pipe.gapBottom;
    if (!inGap) return true;
  }

  return false;
}

/**
 * Distances à l'obstacle le plus proche (observation simple pour le RL) :
 * - dx : distance horizontale oiseau → tuyau
 * - dy : distance verticale oiseau → centre du gap
 */
export function computeDistances(
  birdX: number,
  birdY: number,
  pipes: PipePair[],
  pipeGap: number,
): { dx: number; dy: number } {
  const upcoming = pipes
    .map((p, i) => ({ p, i, dx: p.x - birdX }))
    .filter((e) => e.dx >= 0)
    .sort((a, b) => a.dx - b.dx)[0];

  if (!upcoming) {
    return { dx: 0, dy: 0 };
  }

  const gapCenter = upcoming.p.gapTop + Math.floor(pipeGap / 2);
  return {
    dx: upcoming.dx,
    dy: birdY - gapCenter,
  };
}
