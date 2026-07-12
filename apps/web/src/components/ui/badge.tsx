import type { LucideIcon } from "lucide-react";
import { TONE_SOFT, type Tone } from "./tone";

export function Badge({
  children,
  tone = "neutral",
  icon: Icon,
  size = "md",
}: {
  children: React.ReactNode;
  tone?: Tone;
  icon?: LucideIcon;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill font-mono-caps uppercase ${TONE_SOFT[tone]} ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-label-sm"
      }`}
    >
      {Icon && <Icon size={size === "sm" ? 11 : 13} strokeWidth={2.5} />}
      {children}
    </span>
  );
}

export interface StatusInfo {
  label: string;
  tone: Tone;
  icon: LucideIcon;
}

/** Badge que consome diretamente o resultado das funções de `@/lib/status`. */
export function StatusBadge({ status, size }: { status: StatusInfo; size?: "sm" | "md" }) {
  return (
    <Badge tone={status.tone} icon={status.icon} size={size}>
      {status.label}
    </Badge>
  );
}
