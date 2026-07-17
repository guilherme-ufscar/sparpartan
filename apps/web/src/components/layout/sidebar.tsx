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
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col bg-primary lg:flex">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-on-primary">
          <Image src="/logo.svg" alt="Sparapan" width={40} height={40} />
        </div>
        <div>
          <p className="font-display text-base font-bold leading-tight text-on-primary">
            Sparapan
          </p>
          <p className="font-mono-caps text-[10px] uppercase tracking-wide text-on-primary/70">
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
                  ? "border-r-2 border-on-primary bg-on-primary/15 font-bold text-on-primary"
                  : "text-on-primary/70 hover:bg-on-primary/10"
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

      <div className="border-t border-on-primary/20 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-pill bg-on-primary text-sm font-bold text-primary">
            {(userName ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-on-primary">
              {userName ?? "Usuário"}
            </p>
            <p className="truncate text-xs capitalize text-on-primary/70">
              {userRole ?? ""}
            </p>
          </div>
        </div>
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-primary/80 hover:bg-on-primary/10"
          >
            <LogOut size={16} />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
