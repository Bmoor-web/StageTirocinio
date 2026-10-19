import type { Action } from '../game/types';

export type StateKey = string;

/** Transizione (s, a, r, s') — utile per Q-learning e, più avanti, DQN. */
export interface Experience {
  state: StateKey;
  action: Action;
  reward: number;
  nextState: StateKey;
  done: boolean;
}

export interface TrainStats {
  episodes: number;
  steps: number;
  bestScore: number;
  lastScore: number;
  tableSize: number;
}

export interface QHyperParams {
  alpha: number;
  gamma: number;
  epsilon: number;
  epsilonMin: number;
  epsilonDecay: number;
}
