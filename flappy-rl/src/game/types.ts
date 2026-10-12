/** 0 = Idle, 1 = Flap */
export type Action = 0 | 1;

export const ACTION_LABELS: Record<Action, string> = {
  0: 'Idle',
  1: 'Flap',
};

export type PlayMode = 'human' | 'ai';

export interface GameConfig {
  width: number;
  height: number;
  pipeGap: number;
  gravity: number;
  flapVelocity: number;
  /** Taille d'une cellule à l'écran (px) */
  cellSize: number;
  /** Intervalle entre deux ticks (ms) */
  tickMs: number;
}

export interface PipePair {
  x: number;
  /** Y exclusif du haut du gap (tuyau haut occupe [0, gapTop)) */
  gapTop: number;
  /** Y inclusif du bas du gap (tuyau bas occupe [gapBottom, height)) */
  gapBottom: number;
}

export interface BirdState {
  x: number;
  y: number;
  velY: number;
  alive: boolean;
}

export interface GameSnapshot {
  bird: BirdState;
  pipes: PipePair[];
  score: number;
  lastAction: Action;
  /** Distances utiles pour le Q-learning (préparé dès maintenant) */
  dx: number;
  dy: number;
}

/**
 * Aligné sur text_flappy_bird_logic.py (grille 20×15, gap 4).
 * flapVelocity / gravity légèrement adoucis pour le jeu humain ;
 * on pourra les recalibrer pour le Q-learning.
 */
export const DEFAULT_CONFIG: GameConfig = {
  width: 20,
  height: 15,
  pipeGap: 4,
  gravity: 1,
  flapVelocity: -2,
  cellSize: 28,
  tickMs: 140,
};
