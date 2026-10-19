import { it } from '../i18n/it';

interface GameControlsProps {
  running: boolean;
  alive: boolean;
  humanMode: boolean;
  onStart: () => void;
  onRestart: () => void;
  onFlap: () => void;
}

export function GameControls({
  running,
  alive,
  humanMode,
  onStart,
  onRestart,
  onFlap,
}: GameControlsProps) {
  return (
    <div className="d-flex flex-wrap gap-2 justify-content-center mt-3">
      {!running && alive && (
        <button type="button" className="btn btn-success" onClick={onStart}>
          {it.start}
        </button>
      )}
      {humanMode && (
        <button
          type="button"
          className="btn btn-warning"
          onClick={onFlap}
          disabled={!running || !alive}
        >
          {it.flap}
        </button>
      )}
      <button type="button" className="btn btn-outline-dark" onClick={onRestart}>
        {it.restart}
      </button>
    </div>
  );
}
