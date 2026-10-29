/** 0 = Idle, 1 = Flap */
export type Action = 0 | 1;

export const ACTION_LABELS: Record<Action, string> = {
  0: 'Idle',
  1: 'Salto',
};

export type PlayMode = 'human' | 'qlearning' | 'dqn';

export interface GameConfig {
  width: number;
  height: number;
  pipeGap: number;
  /** Accelerazione verso il basso (celle / tick²) */
  gravity: number;
  /** Velocità verticale imposta dal tasto Spazio (negativa = verso l'alto) */
  flapVelocity: number;
  cellSize: number;
  tickMs: number;
  /** Celle per tick all'inizio della partita */
  baseHorizontalSpeed: number;
  /** Incremento di velocità ogni `speedIncreaseEvery` punti */
  speedDelta: number;
  /** Ogni quanti punti aumenta la velocità orizzontale */
  speedIncreaseEvery: number;
  /** Tetto della velocità orizzontale */
  maxHorizontalSpeed: number;
  /** Distanza orizzontale tra due coppie di tubi */
  pipeSpacing: number;
}

export interface PipePair {
  id: number;
  x: number;
  gapTop: number;
  gapBottom: number;
  scored: boolean;
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
  dx: number;
  dy: number;
  /** Velocità orizzontale corrente (celle / tick) */
  horizontalSpeed: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  width: 20,
  height: 15,
  pipeGap: 4,
  gravity: 1,
  flapVelocity: -1,
  cellSize: 28,
  tickMs: 140,
  baseHorizontalSpeed: 1,
  speedDelta: 0.15,
  speedIncreaseEvery: 5,
  maxHorizontalSpeed: 3,
  pipeSpacing: 10,
};
