"use client";

import { t as translate } from "@/lib/i18n";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShareIcon, XIcon, WifiOffIcon } from "lucide-react";
import { cn } from "cn";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/prefs";
import { skinStyle, useSkin } from "@/lib/skins";
import { ToastProvider } from "./ui";
import { Onboarding } from "./onboarding";
import { SaveFlowProvider } from "./save-flow";
import { ChanceIcon, Glow, LeafIcon, Monogram, PantryIcon, RingIcon, Spinner } from "./mood";

const TABS = [
  { href: "/", label: "Explore", icon: PantryIcon, match: (p: string) => p === "/" || p.startsWith("/ingredient") },
  { href: "/season/", label: "Season", icon: LeafIcon, match: (p: string) => p.startsWith("/season") },
  { href: "/chance/", label: "Chance", icon: ChanceIcon, match: (p: string) => p.startsWith("/chance") },
  { href: "/saved/", label: "Saved", icon: RingIcon, match: (p: string) => p.startsWith("/saved") },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { graph, online, onboarded, setOnboarded, installHint, dismissInstallHint, updateReady, applyUpdate, graphError } = useStore();
  const mounted = useMounted();
  const [skin] = useSkin();
  return (
    <ToastProvider>
      <SaveFlowProvider>
        <div className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col md:max-w-[1100px]" style={skinStyle(skin)}>
          {!online && (
            <div className="sticky top-0 z-30 flex items-center justify-center gap-2 bg-ink px-4 py-2 text-[0.8125rem] text-white" role="status">
              <WifiOffIcon className="size-4" /> {translate("Offline. Everything still works on this device.")}
            </div>
          )}
          {graphError && (
            <div className="card m-4 p-4 text-[0.9375rem]" role="alert">
              {translate("Could not load the pairing graph. Check the connection and reload.")}
            </div>
          )}
          <main className="relative flex-1 pb-[calc(var(--nav-h)+var(--safe-b))]">{children}</main>
          <nav className="fixed inset-x-0 bottom-0 z-30 bg-[#f4f5f8]/95 backdrop-blur-md safe-b" aria-label={translate("Main")}>
            <div className="mx-auto flex h-[var(--nav-h)] max-w-[640px] items-stretch">
              {TABS.map((tab) => {
                const active = tab.match(pathname);
                return (
                  <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined} className={cn("flex flex-1 flex-col items-center justify-center gap-1 text-[0.8125rem] transition-colors duration-300", active ? "text-accent" : "text-muted")}>
                    <tab.icon className="size-6" />
                    {translate(tab.label)}
                  </Link>
                );
              })}
            </div>
          </nav>
          {mounted && installHint && (
            <div className="fixed inset-x-4 bottom-[calc(var(--nav-h)+var(--safe-b)+12px)] z-40 card anim-pop flex items-start gap-3 p-4 md:left-auto md:w-[420px]" role="dialog" aria-label={translate("Add to Home Screen")}>
              <ShareIcon className="mt-0.5 size-5 shrink-0 text-muted" />
              <p className="text-[0.9375rem] leading-snug text-ink-2">{translate("Add Pairing Explorer to your Home Screen: tap Share, then Add to Home Screen. It then opens full screen and keeps your saved combinations.")}</p>
              <button type="button" aria-label={translate("Dismiss")} onClick={dismissInstallHint} className="-m-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full"><XIcon className="size-5" /></button>
            </div>
          )}
          {mounted && updateReady && (
            <div className="fixed inset-x-4 bottom-[calc(var(--nav-h)+var(--safe-b)+12px)] z-40 mx-auto flex max-w-[600px] items-center justify-between gap-3 rounded-[8px] bg-ink px-5 py-3 text-[0.9375rem] text-white anim-pop" role="status">
              <span>{translate("A newer version is ready.")}</span>
              <button type="button" className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em]" onClick={applyUpdate}>{translate("Update")}</button>
            </div>
          )}
          <Splash ready={!!graph || !!graphError} />
          {mounted && !onboarded && graph && <Onboarding onDone={() => setOnboarded(true)} />}
        </div>
      </SaveFlowProvider>
    </ToastProvider>
  );
}

/** Splash: pink aurora ring, the monogram, two lines of serif and a tiny spinner. Holds for a beat on first paint. */
function Splash({ ready }: { ready: boolean }) {
  const [held, setHeld] = useState(true);
  const [gone, setGone] = useState(false);
  useEffect(() => { const id = window.setTimeout(() => setHeld(false), 1100); return () => window.clearTimeout(id); }, []);
  const leaving = ready && !held;
  useEffect(() => { if (!leaving) return; const id = window.setTimeout(() => setGone(true), 420); return () => window.clearTimeout(id); }, [leaving]);
  if (gone) return null;
  return (
    <div className={cn("fixed inset-0 z-[85] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-[400ms]", leaving && "pointer-events-none opacity-0")} role="status" aria-label={translate("Loading the pairing map…")}>
      <Glow variant="aurora" fixed={false} />
      <div className="relative flex flex-col items-center px-8 text-center">
        <Monogram className="text-white" light />
        <h1 className="t-display mt-10 text-[3.25rem] text-plum">{translate("Find what")}<br />{translate("pairs with it.")}</h1>
        <Spinner size={30} className="mt-10 text-plum/40" />
      </div>
    </div>
  );
}
