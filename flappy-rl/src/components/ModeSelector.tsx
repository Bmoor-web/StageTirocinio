import type { PlayMode } from '../game/types';

interface ModeSelectorProps {
  mode: PlayMode;
  onChange: (mode: PlayMode) => void;
}

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="btn-group mb-3" role="group" aria-label="Mode de jeu">
      <input
        type="radio"
        className="btn-check"
        name="mode"
        id="mode-human"
        checked={mode === 'human'}
        onChange={() => onChange('human')}
      />
      <label className="btn btn-outline-primary" htmlFor="mode-human">
        Humain
      </label>

      <input
        type="radio"
        className="btn-check"
        name="mode"
        id="mode-ai"
        checked={mode === 'ai'}
        onChange={() => onChange('ai')}
        disabled
      />
      <label className="btn btn-outline-secondary" htmlFor="mode-ai" title="À venir">
        IA (Q-learning) — bientôt
      </label>
    </div>
  );
}
