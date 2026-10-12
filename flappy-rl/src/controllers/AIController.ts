import type { Action, GameSnapshot } from '../game/types';
import { Controller } from './Controller';

/**
 * Stub — sera branché sur QLearningAgent + QTable plus tard.
 * Pour l'instant renvoie Idle.
 */
export class AIController extends Controller {
  selectAction(_snapshot: GameSnapshot): Action {
    return 0;
  }

  getAction(): Action {
    return 0;
  }

  reset(): void {
    // no-op pour l'instant
  }

  dispose(): void {
    // no-op
  }
}
