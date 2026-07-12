import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

export function ChecklistItem({
  done,
  label,
  hint,
  action,
}: {
  done: boolean;
  label: string;
  hint?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex items-center gap-3 border-b border-outline-variant py-2.5 last:border-0">
      {done ? (
        <CheckCircle2 size={20} className="shrink-0 text-success" />
      ) : (
        <Circle size={20} className="shrink-0 text-outline" />
      )}
      <div className="min-w-0 flex-1">
        <p className={`text-body-md ${done ? "text-on-surface-variant line-through" : "text-primary"}`}>
          {label}
        </p>
        {hint && <p className="text-body-sm text-outline">{hint}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 font-display text-[11px] font-semibold text-on-primary hover:opacity-90"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
