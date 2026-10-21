"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookmarkIcon, CompassIcon, LeafIcon, ShareIcon, XIcon, WifiOffIcon } from "lucide-react";
import { cn } from "cn";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/prefs";
import { ToastProvider } from "./ui";
import { Onboarding } from "./onboarding";

const TABS = [
  { href: "/", label: "Explore", icon: CompassIcon, match: (p: string) => p === "/" || p.startsWith("/ingredient") },
  { href: "/saved/", label: "Saved", icon: BookmarkIcon, match: (p: string) => p.startsWith("/saved") },
  { href: "/season/", label: "Season", icon: LeafIcon, match: (p: string) => p.startsWith("/season") },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { online, onboarded, setOnboarded, installHint, dismissInstallHint, updateReady, applyUpdate, graphError } = useStore();
  const mounted = useMounted();
  const hideNav = pathname.startsWith("/ingredient");
  return (
    <ToastProvider>
      <div className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col md:max-w-[1100px]">
        {!online && (
          <div className="sticky top-0 z-30 flex items-center justify-center gap-2 bg-ink px-4 py-2 text-[0.8125rem] text-white" role="status">
            <WifiOffIcon className="size-4" /> Offline. Everything still works; saved combinations sync later.
          </div>
        )}
        {graphError && (
          <div className="card m-4 p-4 text-[0.9375rem]" role="alert">
            Could not load the pairing graph ({graphError}). Check the connection and reload.
          </div>
        )}
        <main className={cn("flex-1", !hideNav && "pb-[calc(var(--nav-h)+var(--safe-b))]")}>{children}</main>
        {!hideNav && (
          <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-paper/92 backdrop-blur-md safe-b" aria-label="Main">
            <div className="mx-auto flex h-[var(--nav-h)] max-w-[560px] items-stretch md:max-w-[1100px]">
              {TABS.map((t) => {
                const active = t.match(pathname);
                return (
                  <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined} className={cn("flex flex-1 flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] transition-colors", active ? "text-ink" : "text-faint")}>
                    <span className={cn("inline-flex h-8 w-12 items-center justify-center rounded-full transition-colors", active && "bg-ink text-white")}><t.icon className="size-5" strokeWidth={active ? 2.2 : 1.8} /></span>
                    {t.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
        {mounted && installHint && (
          <div className="fixed inset-x-4 bottom-[calc(var(--nav-h)+var(--safe-b)+12px)] z-40 card anim-pop flex items-start gap-3 p-4 md:left-auto md:w-[420px]" role="dialog" aria-label="Add to Home Screen">
            <ShareIcon className="mt-0.5 size-5 shrink-0" />
            <p className="text-[0.9375rem] leading-snug">Add Pairing Explorer to your Home Screen: tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>. It then opens full screen and keeps your saved combinations.</p>
            <button type="button" aria-label="Dismiss" onClick={dismissInstallHint} className="-m-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full"><XIcon className="size-5" /></button>
          </div>
        )}
        {mounted && updateReady && (
          <div className="fixed inset-x-4 bottom-[calc(var(--nav-h)+var(--safe-b)+12px)] z-40 flex items-center justify-between gap-3 rounded-full bg-ink px-5 py-3 text-[0.9375rem] text-white shadow-lg anim-pop" role="status">
            <span>A newer version is ready.</span>
            <button type="button" className="font-semibold uppercase tracking-wider text-[0.75rem]" onClick={applyUpdate}>Update</button>
          </div>
        )}
        {mounted && !onboarded && <Onboarding onDone={() => setOnboarded(true)} />}
      </div>
    </ToastProvider>
  );
}
