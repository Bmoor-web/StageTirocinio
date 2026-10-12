import type { Action } from '../game/types';

/**
 * Contrôleur abstrait : produit une action (Idle / Flap)
 * consommée par Game.step() puis appliquée à l'oiseau.
 */
export abstract class Controller {
  abstract getAction(): Action;
  abstract reset(): void;
  abstract dispose(): void;
}
