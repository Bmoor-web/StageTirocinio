import { Bird } from './Bird';
import {
  closestUpcomingPipeIndex,
  createRandomPipe,
  prunePipes,
} from './Pipe';
import {
  checkCrash,
  computeDistances,
  currentHorizontalSpeed,
} from './physics';
import {
  DEFAULT_CONFIG,
  type Action,
  type GameConfig,
  type GameSnapshot,
  type PipePair,
} from './types';

export class Game {
  config: GameConfig;
  readonly bird: Bird;
  pipes: PipePair[] = [];
  score = 0;
  lastAction: Action = 0;
  horizontalSpeed: number;

  constructor(config: Partial<GameConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.bird = new Bird(this.config);
    this.horizontalSpeed = this.config.baseHorizontalSpeed;
    this.reset();
  }

  applyConfig(partial: Partial<GameConfig>): void {
    this.config = { ...this.config, ...partial };
  }

  reset(): void {
    this.bird.reset(this.config);
    this.pipes = [createRandomPipe(this.config)];
    this.score = 0;
    this.lastAction = 0;
    this.horizontalSpeed = this.config.baseHorizontalSpeed;
  }

  /**
   * Un tick: azione → scroll tubi (velocità crescente) → uccello → collisioni.
   */
  step(action: Action): boolean {
    this.lastAction = action;
    this.horizontalSpeed = currentHorizontalSpeed(this.score, this.config);

    const prevXs = new Map(this.pipes.map((p) => [p.id, p.x]));

    if (
      this.pipes.length === 0 ||
      this.pipes[this.pipes.length - 1].x <=
        this.config.width - 1 - this.config.pipeSpacing
    ) {
      this.pipes.push(createRandomPipe(this.config));
    }

    for (const pipe of this.pipes) {
      pipe.x -= this.horizontalSpeed;
    }

    this.bird.applyAction(action, this.config);

    if (checkCrash(this.bird, this.pipes, prevXs, this.config)) {
      this.bird.alive = false;
    }

    if (this.bird.alive) {
      for (const pipe of this.pipes) {
        const prevX = prevXs.get(pipe.id) ?? pipe.x;
        if (!pipe.scored && prevX >= this.bird.x && pipe.x < this.bird.x) {
          pipe.scored = true;
          this.score += 1;
        }
      }
    }

    this.pipes = prunePipes(this.pipes);
    this.horizontalSpeed = currentHorizontalSpeed(this.score, this.config);
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
      horizontalSpeed: this.horizontalSpeed,
    };
  }

  getUpcomingPipe(): PipePair | null {
    const idx = closestUpcomingPipeIndex(this.pipes, this.bird.x);
    return idx >= 0 ? this.pipes[idx] : null;
  }
}
