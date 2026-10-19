import { it } from '../i18n/it';

export interface SessionRecords {
  human: number;
  qlearning: number;
  dqn: number;
}

interface RecordsBarProps {
  records: SessionRecords;
}

function fmt(n: number): string {
  return n > 0 ? String(n) : it.noRecord;
}

export function RecordsBar({ records }: RecordsBarProps) {
  return (
    <div className="card mb-3">
      <div className="card-body py-2 px-3">
        <div className="small text-muted mb-1">{it.records}</div>
        <div className="d-flex flex-wrap gap-2">
          <span className="badge text-bg-primary">
            {it.recordHuman}: {fmt(records.human)}
          </span>
          <span className="badge text-bg-success">
            {it.recordQ}: {fmt(records.qlearning)}
          </span>
          <span className="badge text-bg-light text-dark border">
            {it.recordDqn}: {fmt(records.dqn)}
          </span>
        </div>
      </div>
    </div>
  );
}
