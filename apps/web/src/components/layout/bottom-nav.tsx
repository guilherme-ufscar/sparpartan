"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV_ITEMS } from "@/lib/nav-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-20 items-center justify-around border-t border-outline-variant bg-surface lg:hidden">
      {MOBILE_NAV_ITEMS.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-2"
          >
            <span
              className={`flex items-center rounded-pill px-4 py-1 ${
                active ? "bg-secondary-container text-on-secondary" : "text-on-surface-variant"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            </span>
            <span className="font-mono-caps text-[10px] uppercase text-on-surface-variant">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
