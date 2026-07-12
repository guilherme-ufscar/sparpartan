import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { GlobalSearch } from "@/components/layout/global-search";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar userName={session?.user?.name} userRole={(session?.user as { role?: string })?.role} />
      <header className="fixed left-0 right-0 top-0 z-10 flex h-16 items-center justify-between border-b border-outline-variant bg-surface-bright px-4 lg:left-64">
        <p className="font-display text-lg font-bold text-primary">Sparapan Solução Naval</p>
        <ThemeToggle />
      </header>
      <main className="px-margin-mobile pb-24 pt-20 lg:ml-64 lg:px-margin-desktop lg:pb-margin-desktop">
        <div className="mx-auto max-w-[1440px] space-y-gutter">{children}</div>
      </main>
      <BottomNav />
      <GlobalSearch />
    </div>
  );
}
