import type { QLearningAgent } from './QLearningAgent';
import type { ReplayBuffer } from './ReplayBuffer';
import type { TrainStats } from './types';

const STORAGE_KEY = 'flappy-rl-training-v2';

export interface TrainingCheckpoint {
  table: unknown;
  experiences: unknown;
  stats: TrainStats | null;
}

export function loadTrainingCheckpoint(): TrainingCheckpoint | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const value: unknown = JSON.parse(raw);
    if (
      typeof value !== 'object' ||
      value === null ||
      !('version' in value) ||
      value.version !== 1 ||
      !('table' in value) ||
      !('experiences' in value) ||
      !('stats' in value)
    ) {
      return null;
    }

    return {
      table: value.table,
      experiences: value.experiences,
      stats: isTrainStats(value.stats) ? value.stats : null,
    };
  } catch {
    return null;
  }
}

export function saveTrainingCheckpoint(
  agent: QLearningAgent,
  buffer: ReplayBuffer,
  stats: TrainStats | null,
): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        table: agent.table.serialize(),
        experiences: buffer.serialize(),
        stats,
      }),
    );
  } catch {
    // Storage may be unavailable or full; the current session can still train.
  }
}

function isTrainStats(value: unknown): value is TrainStats {
  if (typeof value !== 'object' || value === null) return false;
  if (
    !('episodes' in value) ||
    !('steps' in value) ||
    !('bestScore' in value) ||
    !('lastScore' in value) ||
    !('tableSize' in value)
  ) {
    return false;
  }

  return [
    value.episodes,
    value.steps,
    value.bestScore,
    value.lastScore,
    value.tableSize,
  ].every((item) => typeof item === 'number' && Number.isFinite(item));
}