import { Game } from '../game/Game';
import type { GameConfig } from '../game/types';
import { QLearningAgent } from './QLearningAgent';
import { ReplayBuffer } from './ReplayBuffer';
import { encodeState } from './StateEncoder';
import type { TrainStats } from './types';

const DEATH_PENALTY = -100;
const SURVIVE_REWARD = 0.1;
const PIPE_REWARD = 10;

export interface TrainOptions {
  episodes: number;
  maxSteps: number;
  config?: Partial<GameConfig>;
}

export function trainQLearning(
  agent: QLearningAgent,
  buffer: ReplayBuffer,
  options: TrainOptions,
): TrainStats {
  const game = new Game(options.config);
  let bestScore = 0;
  let lastScore = 0;
  let steps = 0;

  for (let ep = 0; ep < options.episodes; ep++) {
    game.reset();
    let prevState = encodeState(game.snapshot());
    let prevScore = 0;

    for (let t = 0; t < options.maxSteps; t++) {
      const action = agent.selectAction(prevState);
      const alive = game.step(action);
      const snap = game.snapshot();
      const nextState = encodeState(snap);
      const scored = snap.score > prevScore;
      prevScore = snap.score;

      const reward = !alive
        ? DEATH_PENALTY
        : SURVIVE_REWARD + (scored ? PIPE_REWARD : 0);

      const exp = {
        state: prevState,
        action,
        reward,
        nextState,
        done: !alive,
      };
      buffer.push(exp);
      agent.learn(exp);
      steps += 1;
      prevState = nextState;

      if (!alive) break;
    }

    lastScore = game.score;
    if (game.score > bestScore) bestScore = game.score;
    agent.decayEpsilon();
  }

  return {
    episodes: options.episodes,
    steps,
    bestScore,
    lastScore,
    tableSize: agent.table.size(),
  };
}

export function rewardFromTransition(
  alive: boolean,
  scored: boolean,
): number {
  if (!alive) return DEATH_PENALTY;
  return SURVIVE_REWARD + (scored ? PIPE_REWARD : 0);
}
