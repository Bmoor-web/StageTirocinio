import type { Action, BirdState, GameConfig } from './types';

/**
 * Uccello su griglia continua (y e velY sono float) così gravità e spinta
 * restano parametrizzabili senza forzare interi.
 */
export class Bird {
  x: number;
  y: number;
  velY: number;
  alive: boolean;

  constructor(config: GameConfig) {
    this.x = Math.floor(config.width * 0.3);
    this.y = config.height / 2;
    this.velY = 0;
    this.alive = true;
  }

  reset(config: GameConfig): void {
    this.x = Math.floor(config.width * 0.3);
    this.y = config.height / 2;
    this.velY = 0;
    this.alive = true;
  }

  applyAction(action: Action, config: GameConfig): void {
    if (action === 1) {
      this.velY = config.flapVelocity;
    }

    this.y += this.velY;
    this.y = Math.max(0, Math.min(this.y, config.height));
    this.velY += config.gravity;
  }

  snapshot(): BirdState {
    return {
      x: this.x,
      y: this.y,
      velY: this.velY,
      alive: this.alive,
    };
  }
}
