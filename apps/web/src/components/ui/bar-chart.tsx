import Link from "next/link";
import { TONE_FILL, type Tone } from "./tone";

export interface BarDatum {
  label: string;
  value: number;
  tone?: Tone;
  href?: string;
}

export function BarChart({
  data,
  orientation = "vertical",
  height = 160,
  formatValue = (n: number) => String(n),
}: {
  data: BarDatum[];
  orientation?: "vertical" | "horizontal";
  height?: number;
  formatValue?: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  if (orientation === "horizontal") {
    return (
      <div className="space-y-3">
        {data.map((d) => {
          const pct = (d.value / max) * 100;
          const inner = (
            <>
              <div className="mb-1 flex items-center justify-between text-body-sm">
                <span className="truncate text-on-surface-variant">{d.label}</span>
                <span className="shrink-0 font-mono-caps text-label-sm text-outline">
                  {formatValue(d.value)}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-pill bg-surface-container-high">
                <div
                  className={`h-full rounded-pill ${TONE_FILL[d.tone ?? "info"]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </>
          );
          return d.href ? (
            <Link key={d.label} href={d.href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={d.label}>{inner}</div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={d.label} className="group flex flex-1 flex-col items-center gap-2">
            <span className="text-body-sm text-outline opacity-0 transition-opacity group-hover:opacity-100">
              {formatValue(d.value)}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className={`w-full rounded-t-lg ${TONE_FILL[d.tone ?? "info"]}`}
                style={{ height: `${Math.max(pct, 2)}%` }}
              />
            </div>
            <span className="font-mono-caps text-label-sm text-outline">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
