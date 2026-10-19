import type { Experience } from './types';

/**
 * Buffer circolare di esperienze. Il Q-learning tabellare non ne ha bisogno
 * (aggiorna online), ma lo stesso formato servirà per il Deep Q-learning.
 */
export class ReplayBuffer {
  private items: Experience[] = [];
  constructor(private readonly capacity: number) {}

  push(exp: Experience): void {
    if (this.items.length >= this.capacity) {
      this.items.shift();
    }
    this.items.push(exp);
  }

  sample(n: number): Experience[] {
    const count = Math.min(n, this.items.length);
    const out: Experience[] = [];
    for (let i = 0; i < count; i++) {
      out.push(this.items[Math.floor(Math.random() * this.items.length)]);
    }
    return out;
  }

  get length(): number {
    return this.items.length;
  }

  serialize(): Experience[] {
    return this.items.map((item) => ({ ...item }));
  }

  restore(experiences: unknown): void {
    this.items = [];
    if (!Array.isArray(experiences)) return;

    for (const item of experiences.slice(-this.capacity)) {
      if (
        typeof item?.state === 'string' &&
        (item.action === 0 || item.action === 1) &&
        typeof item.reward === 'number' &&
        Number.isFinite(item.reward) &&
        typeof item.nextState === 'string' &&
        typeof item.done === 'boolean'
      ) {
        this.items.push({
          state: item.state,
          action: item.action,
          reward: item.reward,
          nextState: item.nextState,
          done: item.done,
        });
      }
    }
  }

  clear(): void {
    this.items = [];
  }
}
