import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type Variant = "filled" | "tonal" | "outlined" | "text" | "danger";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  filled: "bg-primary text-on-primary hover:opacity-90",
  tonal: "bg-primary-container text-on-primary-container hover:opacity-90",
  outlined: "border border-outline text-primary hover:bg-surface-container-low",
  text: "text-primary hover:bg-surface-container-low",
  danger: "bg-danger-container text-on-danger-container hover:opacity-90",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[11px]",
  md: "px-4 py-2 text-label-lg",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-display font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";

export function Button({
  variant = "filled",
  size = "md",
  icon: Icon,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
}) {
  return (
    <button
      className={`${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {props.children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "filled",
  size = "md",
  icon: Icon,
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </Link>
  );
}
