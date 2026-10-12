interface GameControlsProps {
  running: boolean;
  alive: boolean;
  onStart: () => void;
  onRestart: () => void;
  onFlap: () => void;
}

export function GameControls({
  running,
  alive,
  onStart,
  onRestart,
  onFlap,
}: GameControlsProps) {
  return (
    <div className="d-flex flex-wrap gap-2 justify-content-center mt-3">
      {!running && alive && (
        <button type="button" className="btn btn-success" onClick={onStart}>
          Démarrer
        </button>
      )}
      <button
        type="button"
        className="btn btn-warning"
        onClick={onFlap}
        disabled={!running || !alive}
      >
        Flap (Espace)
      </button>
      <button type="button" className="btn btn-outline-dark" onClick={onRestart}>
        Rejouer
      </button>
    </div>
  );
}
