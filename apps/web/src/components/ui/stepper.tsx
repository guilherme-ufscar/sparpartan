import { Check, X } from "lucide-react";
import { Badge } from "./badge";

export interface Step {
  key: string;
  label: string;
}

export function Stepper({
  steps,
  currentKey,
  cancelled = false,
}: {
  steps: Step[];
  currentKey: string;
  cancelled?: boolean;
}) {
  const currentIndex = steps.findIndex((s) => s.key === currentKey);

  if (cancelled) {
    return <Badge tone="danger" icon={X}>Cancelado</Badge>;
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const atual = i === currentIndex;
        return (
          <div key={step.key} className="flex items-center gap-3 lg:flex-1">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-label-md font-semibold ${
                  done
                    ? "bg-success text-surface-container-lowest"
                    : atual
                      ? "bg-primary text-on-primary ring-4 ring-primary/15"
                      : "bg-surface-container-high text-outline"
                }`}
              >
                {done ? <Check size={16} /> : i + 1}
              </span>
              <span
                className={`text-body-sm ${
                  atual ? "font-semibold text-primary" : done ? "text-on-surface" : "text-outline"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`hidden h-0.5 flex-1 lg:block ${done ? "bg-success" : "bg-outline-variant"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
