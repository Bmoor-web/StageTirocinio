import { ACTION_LABELS, type Action } from '../game/types';
import { it } from '../i18n/it';

interface ScoreProps {
  score: number;
  dx: number;
  dy: number;
  lastAction: Action;
  alive: boolean;
  velY: number;
  horizontalSpeed: number;
}

export function Score({
  score,
  dx,
  dy,
  lastAction,
  alive,
  velY,
  horizontalSpeed,
}: ScoreProps) {
  return (
    <div className="d-flex flex-wrap gap-2 justify-content-center align-items-center mb-2 small">
      <span className="badge text-bg-primary fs-6">
        {it.score}: {score}
      </span>
      <span className={`badge ${alive ? 'text-bg-success' : 'text-bg-danger'}`}>
        {alive ? it.alive : it.dead}
      </span>
      <span className="badge text-bg-dark">
        {it.velocity} {it.velY}: {velY.toFixed(2)}
      </span>
      <span className="badge text-bg-secondary">
        {it.velocity} {it.velX}: {horizontalSpeed.toFixed(2)}
      </span>
      <span className="text-muted">
        dx={dx.toFixed(1)} · dy={dy.toFixed(1)} · {ACTION_LABELS[lastAction]}
      </span>
    </div>
  );
}
