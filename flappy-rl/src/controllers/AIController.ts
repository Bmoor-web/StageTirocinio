import { encodeState } from '../ai/StateEncoder';
import type { QLearningAgent } from '../ai/QLearningAgent';
import type { Action, GameSnapshot } from '../game/types';
import { Controller } from './Controller';

export class AIController extends Controller {
  constructor(private readonly agent: QLearningAgent) {
    super();
  }

  selectAction(snapshot: GameSnapshot, greedy = true): Action {
    return this.agent.selectAction(encodeState(snapshot), greedy);
  }

  getAction(): Action {
    return 0;
  }

  reset(): void {
    // no-op
  }

  dispose(): void {
    // no-op
  }
}
