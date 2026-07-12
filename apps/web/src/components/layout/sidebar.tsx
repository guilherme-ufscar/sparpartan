"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav-items";

export function Sidebar({
  userName,
  userRole,
}: {
  userName?: string | null;
  userRole?: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-outline-variant bg-surface lg:flex">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container">
          <Image src="/logo.svg" alt="Sparapan" width={24} height={24} className="invert" />
        </div>
        <div>
          <p className="font-display text-base font-bold leading-tight text-primary">
            Sparapan
          </p>
          <p className="font-mono-caps text-[10px] uppercase tracking-wide text-outline">
            Nautical Management
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-r-2 border-primary bg-surface-container font-bold text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              <span className="font-mono-caps text-[11px] uppercase tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-outline-variant p-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-pill bg-primary-container text-sm font-bold text-on-primary">
            {(userName ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-on-surface">
              {userName ?? "Usuário"}
            </p>
            <p className="truncate text-xs capitalize text-on-surface-variant">
              {userRole ?? ""}
            </p>
          </div>
        </div>
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low"
          >
            <LogOut size={16} />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
