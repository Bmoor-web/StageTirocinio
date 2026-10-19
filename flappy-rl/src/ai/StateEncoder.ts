import type { GameSnapshot } from '../game/types';
import type { StateKey } from './types';

/**
 * Discretizza lo stato per la Q-table:
 * - altezza dell'uccello (y)
 * - distanza orizzontale dal tubo (dx)
 * - distanza verticale dal centro del gap (dy)
 * - velocità verticale (velY)
 *
 * I bin tengono la tabella gestibile nel browser.
 */
export function encodeState(snapshot: GameSnapshot): StateKey {
  const y = clampInt(Math.floor(snapshot.bird.y), 0, 20);
  const dx = clampInt(Math.floor(snapshot.dx), 0, 24);
  const dy = clampInt(Math.round(snapshot.dy), -12, 12);
  const vy = clampInt(Math.round(snapshot.bird.velY), -6, 8);
  return `${y}|${dx}|${dy}|${vy}`;
}

function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
