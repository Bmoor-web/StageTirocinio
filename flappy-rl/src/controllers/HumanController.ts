import type { Action } from '../game/types';
import { Controller } from './Controller';

/**
 * Contrôle clavier navigateur.
 * Espace / Flèche haut / W → Flap (consommé une fois par tick).
 */
export class HumanController extends Controller {
  private pendingFlap = false;
  private readonly onKeyDown: (e: KeyboardEvent) => void;

  constructor() {
    super();
    this.onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        this.pendingFlap = true;
      }
    };
    window.addEventListener('keydown', this.onKeyDown);
  }

  getAction(): Action {
    if (this.pendingFlap) {
      this.pendingFlap = false;
      return 1;
    }
    return 0;
  }

  /** Flap manuel (bouton UI). */
  requestFlap(): void {
    this.pendingFlap = true;
  }

  reset(): void {
    this.pendingFlap = false;
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
  }
}
