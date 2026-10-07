"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { ROLE_LABELS } from "@/lib/permissions";
import { Wordmark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NAV } from "@/components/app/nav";
import { SidebarNav } from "@/components/app/sidebar-nav";
import { MobileNav } from "@/components/app/mobile-nav";
import { UserMenu } from "@/components/app/user-menu";
import { Badge } from "@/components/ui/badge";
import Loading from "./loading";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, session, org, can } = useStore();

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  if (!ready || !session) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Loading />
      </div>
    );
  }

  const items = NAV.filter((item) => can(item.permission));

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:ring-3 focus:ring-ring"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <div className="flex h-14 items-center px-4">
          <Link href="/dashboard" className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <Wordmark />
          </Link>
        </div>
        <div className="px-3 pb-2">
          <div className="rounded-lg border bg-background/60 px-3 py-2">
            <p className="truncate text-sm font-medium">{org.name}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABELS[session.role]}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <SidebarNav items={items} />
        </div>
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          Prototype on dummy data. <span className="whitespace-nowrap">No real money moves.</span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
          <MobileNav items={items} orgName={org.name} />
          <Link href="/dashboard" className="lg:hidden">
            <Wordmark className="text-sm" markClassName="size-6" />
          </Link>
          <div className="ml-auto flex items-center gap-1.5">
            <Badge variant="outline" className="hidden sm:inline-flex">
              {org.currency}
            </Badge>
            <ThemeToggle />
            <UserMenu name={session.name} email={session.email} image={session.image} roleLabel={ROLE_LABELS[session.role]} />
          </div>
        </header>
        <main id="main" tabIndex={-1} className="flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
