import { ACTION_LABELS, type Action } from '../game/types';

interface ScoreProps {
  score: number;
  dx: number;
  dy: number;
  lastAction: Action;
  alive: boolean;
}

export function Score({ score, dx, dy, lastAction, alive }: ScoreProps) {
  return (
    <div className="d-flex flex-wrap gap-3 justify-content-center align-items-center mb-2 small">
      <span className="badge text-bg-primary fs-6">Score : {score}</span>
      <span className={`badge ${alive ? 'text-bg-success' : 'text-bg-danger'}`}>
        {alive ? 'En vie' : 'Mort'}
      </span>
      <span className="text-muted">
        dx={dx} · dy={dy} · action={ACTION_LABELS[lastAction]}
      </span>
    </div>
  );
}
