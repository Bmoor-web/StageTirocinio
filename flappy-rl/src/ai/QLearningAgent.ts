import type { Action } from '../game/types';
import { QTable } from './QTable';
import type { Experience, QHyperParams, StateKey } from './types';

const DEFAULT_HP: QHyperParams = {
  alpha: 0.2,
  gamma: 0.95,
  epsilon: 1,
  epsilonMin: 0.05,
  epsilonDecay: 0.997,
};

/**
 * Aggiornamento Bellman:
 * Q(s,a) ← Q(s,a) + α [ r + γ max_a' Q(s',a') − Q(s,a) ]
 */
export class QLearningAgent {
  readonly table = new QTable();
  hp: QHyperParams;

  constructor(hp: Partial<QHyperParams> = {}) {
    this.hp = { ...DEFAULT_HP, ...hp };
  }

  selectAction(state: StateKey, greedy = false): Action {
    if (!greedy && Math.random() < this.hp.epsilon) {
      return Math.random() < 0.5 ? 0 : 1;
    }
    return this.table.bestAction(state);
  }

  learn(exp: Experience): void {
    const { state, action, reward, nextState, done } = exp;
    const q = this.table.get(state, action);
    const target = done
      ? reward
      : reward + this.hp.gamma * this.table.maxValue(nextState);
    this.table.set(state, action, q + this.hp.alpha * (target - q));
  }

  decayEpsilon(): void {
    this.hp.epsilon = Math.max(
      this.hp.epsilonMin,
      this.hp.epsilon * this.hp.epsilonDecay,
    );
  }

  resetExploration(): void {
    this.hp.epsilon = DEFAULT_HP.epsilon;
  }
}
