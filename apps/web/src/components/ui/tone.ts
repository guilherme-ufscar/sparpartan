export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

export const TONE_SOFT: Record<Tone, string> = {
  success: "bg-success-container text-on-success-container",
  warning: "bg-warning-container text-on-warning-container",
  danger: "bg-danger-container text-on-danger-container",
  info: "bg-info-container text-on-info-container",
  neutral: "bg-neutral-container text-on-neutral-container",
};

export const TONE_ACCENT: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
  neutral: "text-neutral",
};

export const TONE_BORDER: Record<Tone, string> = {
  success: "border-success/40",
  warning: "border-warning/40",
  danger: "border-danger/40",
  info: "border-info/40",
  neutral: "border-outline-variant",
};

/** Preenchimento sólido — usado em barras de gráfico e barras de progresso. */
export const TONE_FILL: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-neutral",
};
