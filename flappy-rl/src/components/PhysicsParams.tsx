import type { GameConfig } from '../game/types';
import { it } from '../i18n/it';

interface PhysicsParamsProps {
  draft: GameConfig;
  onChange: (next: GameConfig) => void;
  onApply: () => void;
  disabled: boolean;
}

export function PhysicsParams({
  draft,
  onChange,
  onApply,
  disabled,
}: PhysicsParamsProps) {
  const set = (key: keyof GameConfig, value: number) => {
    onChange({ ...draft, [key]: value });
  };

  return (
    <div className="card mt-3">
      <div className="card-body">
        <h2 className="h6 mb-3">{it.params}</h2>
        <div className="row g-2 small">
          <Field
            label={`${it.gravity} (${draft.gravity.toFixed(2)})`}
            min={0.2}
            max={2.5}
            step={0.1}
            value={draft.gravity}
            onChange={(v) => set('gravity', v)}
          />
          <Field
            label={`${it.flapThrust} (${(-draft.flapVelocity).toFixed(2)})`}
            min={0.5}
            max={5}
            step={0.1}
            value={-draft.flapVelocity}
            onChange={(v) => set('flapVelocity', -v)}
          />
          <Field
            label={`${it.baseSpeed} (${draft.baseHorizontalSpeed.toFixed(2)})`}
            min={0.5}
            max={2}
            step={0.05}
            value={draft.baseHorizontalSpeed}
            onChange={(v) => set('baseHorizontalSpeed', v)}
          />
          <Field
            label={`${it.speedDelta} (${draft.speedDelta.toFixed(2)})`}
            min={0}
            max={0.6}
            step={0.05}
            value={draft.speedDelta}
            onChange={(v) => set('speedDelta', v)}
          />
          <Field
            label={`${it.speedEvery} (${draft.speedIncreaseEvery})`}
            min={1}
            max={15}
            step={1}
            value={draft.speedIncreaseEvery}
            onChange={(v) => set('speedIncreaseEvery', v)}
          />
          <Field
            label={`${it.maxSpeed} (${draft.maxHorizontalSpeed.toFixed(2)})`}
            min={1}
            max={5}
            step={0.1}
            value={draft.maxHorizontalSpeed}
            onChange={(v) => set('maxHorizontalSpeed', v)}
          />
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary mt-3"
          onClick={onApply}
          disabled={disabled}
        >
          {it.applyParams}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="col-md-6">
      <label className="form-label mb-0">{label}</label>
      <input
        type="range"
        className="form-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
