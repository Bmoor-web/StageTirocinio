import { Bird } from './Bird';
import {
  closestUpcomingPipeIndex,
  createRandomPipe,
  prunePipes,
  shiftPipes,
} from './Pipe';
import { checkCrash, computeDistances } from './physics';
import {
  DEFAULT_CONFIG,
  type Action,
  type GameConfig,
  type GameSnapshot,
  type PipePair,
} from './types';

/**
 * Moteur de jeu discret (logique pure, sans DOM).
 * Équivalent JS de FlappyBirdLogic + environnement gym.
 */
export class Game {
  readonly config: GameConfig;
  readonly bird: Bird;
  pipes: PipePair[] = [];
  score = 0;
  lastAction: Action = 0;

  constructor(config: Partial<GameConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.bird = new Bird(this.config);
    this.reset();
  }

  reset(): void {
    this.bird.reset(this.config);
    this.pipes = [createRandomPipe(this.config)];
    this.score = 0;
    this.lastAction = 0;
  }

  /**
   * Un tick : action → déplacement tuyaux → mouvement oiseau → collision → score.
   * @returns true si l'oiseau est encore en vie
   */
  step(action: Action): boolean {
    this.lastAction = action;
    const { width } = this.config;

    // Spawn d'un nouveau tuyau quand le premier passe le milieu
    if (
      this.pipes.length > 0 &&
      this.pipes[0].x === Math.floor(width / 2) - 1
    ) {
      this.pipes.push(createRandomPipe(this.config));
    }

    shiftPipes(this.pipes);
    this.bird.applyAction(action, this.config);

    if (checkCrash(this.bird, this.pipes, this.config)) {
      this.bird.alive = false;
    }

    // Point quand on vient de passer un tuyau
    if (
      this.bird.alive &&
      this.pipes.length > 0 &&
      this.bird.x === this.pipes[0].x + 1
    ) {
      this.score += 1;
    }

    this.pipes = prunePipes(this.pipes);
    return this.bird.alive;
  }

  getObservation(): { dx: number; dy: number } {
    return computeDistances(
      this.bird.x,
      this.bird.y,
      this.pipes,
      this.config.pipeGap,
    );
  }

  snapshot(): GameSnapshot {
    const { dx, dy } = this.getObservation();
    return {
      bird: this.bird.snapshot(),
      pipes: this.pipes.map((p) => ({ ...p })),
      score: this.score,
      lastAction: this.lastAction,
      dx,
      dy,
    };
  }

  /** Prochain tuyau devant l'oiseau (pour debug / AI). */
  getUpcomingPipe(): PipePair | null {
    const idx = closestUpcomingPipeIndex(this.pipes, this.bird.x);
    return idx >= 0 ? this.pipes[idx] : null;
  }
}
