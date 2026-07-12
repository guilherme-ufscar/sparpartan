import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="rounded-pill bg-surface-container p-4 text-outline">
        <Icon size={24} />
      </span>
      <div>
        <p className="font-display text-title-md text-primary">{title}</p>
        {description && <p className="mt-1 text-body-sm text-outline">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="mt-2 rounded-lg bg-primary px-4 py-2 font-display text-label-lg font-semibold text-on-primary hover:opacity-90"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
