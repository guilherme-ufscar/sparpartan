import { TONE_FILL, type Tone } from "./tone";

function tonAutomatico(pct: number, invertido: boolean): Tone {
  const efetivo = invertido ? 100 - pct : pct;
  if (efetivo >= 100) return "success";
  if (efetivo >= 60) return "info";
  if (efetivo >= 30) return "warning";
  return "danger";
}

export function ProgressBar({
  value,
  total,
  label,
  tone,
  showValue = true,
  invertTone = false,
}: {
  value: number;
  total: number;
  label?: string;
  tone?: Tone;
  showValue?: boolean;
  invertTone?: boolean;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const t = tone ?? tonAutomatico(pct, invertTone);

  return (
    <div className="space-y-1.5">
      {(label || showValue) && (
        <div className="flex items-center justify-between text-body-sm">
          {label && <span className="text-on-surface-variant">{label}</span>}
          {showValue && (
            <span className="font-mono-caps text-label-sm text-outline">
              {value}/{total} ({pct}%)
            </span>
          )}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-pill bg-surface-container-high">
        <div
          className={`h-full rounded-pill transition-all ${TONE_FILL[t]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
