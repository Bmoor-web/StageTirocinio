import type { PlayMode } from '../game/types';
import { it } from '../i18n/it';

interface ModeSelectorProps {
  mode: PlayMode;
  onChange: (mode: PlayMode) => void;
}

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="btn-group mb-3" role="group" aria-label={it.modeLabel}>
      <input
        type="radio"
        className="btn-check"
        name="mode"
        id="mode-human"
        checked={mode === 'human'}
        onChange={() => onChange('human')}
      />
      <label className="btn btn-outline-primary" htmlFor="mode-human">
        {it.human}
      </label>

      <input
        type="radio"
        className="btn-check"
        name="mode"
        id="mode-ai"
        checked={mode === 'qlearning'}
        onChange={() => onChange('qlearning')}
      />
      <label className="btn btn-outline-success" htmlFor="mode-ai">
        {it.qlearning}
      </label>

      <input
        type="radio"
        className="btn-check"
        name="mode"
        id="mode-dqn"
        checked={mode === 'dqn'}
        onChange={() => onChange('dqn')}
        disabled
      />
      <label
        className="btn btn-outline-secondary"
        htmlFor="mode-dqn"
        title={it.dqnSoon}
      >
        {it.dqn}
      </label>
    </div>
  );
}
