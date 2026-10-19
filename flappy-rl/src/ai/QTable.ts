import type { Action } from '../game/types';
import type { StateKey } from './types';

const ACTIONS: Action[] = [0, 1];

export class QTable {
  private table = new Map<StateKey, [number, number]>();

  get(state: StateKey, action: Action): number {
    const row = this.table.get(state);
    return row ? row[action] : 0;
  }

  set(state: StateKey, action: Action, value: number): void {
    const row = this.table.get(state) ?? [0, 0];
    row[action] = value;
    this.table.set(state, row);
  }

  bestAction(state: StateKey): Action {
    const q0 = this.get(state, 0);
    const q1 = this.get(state, 1);
    if (q1 === q0) {
      return Math.random() < 0.5 ? 0 : 1;
    }
    return q1 > q0 ? 1 : 0;
  }

  maxValue(state: StateKey): number {
    return Math.max(this.get(state, 0), this.get(state, 1));
  }

  size(): number {
    return this.table.size;
  }

  serialize(): Array<[StateKey, number, number]> {
    return Array.from(this.table, ([state, values]) => [
      state,
      values[0],
      values[1],
    ]);
  }

  restore(entries: unknown): void {
    this.table.clear();
    if (!Array.isArray(entries)) return;

    for (const entry of entries) {
      if (
        Array.isArray(entry) &&
        typeof entry[0] === 'string' &&
        typeof entry[1] === 'number' &&
        Number.isFinite(entry[1]) &&
        typeof entry[2] === 'number' &&
        Number.isFinite(entry[2])
      ) {
        this.table.set(entry[0], [entry[1], entry[2]]);
      }
    }
  }

  actions(): Action[] {
    return ACTIONS;
  }
}
