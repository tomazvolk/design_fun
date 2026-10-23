"use client";

import { t } from "@/lib/i18n";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";
import { Glow } from "./mood";

/* ---------- Section label: letterspaced small caps ("IN SEASON NOW") ---------- */
export function SectionLabel({ children, muted, className }: { children: React.ReactNode; muted?: boolean; className?: string }) {
  return <h2 className={cn(muted ? "t-label-muted" : "t-label", className)}>{children}</h2>;
}

/* ---------- Chip: white pill, selected = charcoal ---------- */
type ChipProps = {
  children: React.ReactNode; on?: boolean; muted?: boolean; className?: string; onClick?: () => void; onLongPress?: () => void;
  ariaLabel?: string; pressed?: boolean; size?: "md" | "sm"; mark?: React.ReactNode;
};
export function Chip({ children, on, muted, className, onClick, onLongPress, ariaLabel, pressed, size = "md", mark }: ChipProps) {
  const timer = useRef<number | null>(null);
  const fired = useRef(false);
  const start = () => { if (!onLongPress) return; fired.current = false; timer.current = window.setTimeout(() => { fired.current = true; onLongPress(); }, 500); };
  const stop = () => { if (timer.current) window.clearTimeout(timer.current); timer.current = null; };
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={pressed}
      className={cn("chip", !mark && "chip-plain", on && "chip-on", muted && !on && "chip-muted", size === "sm" && "h-9 text-[0.875rem]", size === "sm" && !mark && "px-3", className)}
      onClick={() => { if (fired.current) { fired.current = false; return; } onClick?.(); }}
      onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
      onContextMenu={(e) => { if (onLongPress) e.preventDefault(); }}
    >
      {mark}
      {children}
    </button>
  );
}

/* ---------- Icon button: 48px target ---------- */
export function IconButton({ label, children, onClick, className, badge, active }: { label: string; children: React.ReactNode; onClick?: () => void; className?: string; badge?: number; active?: boolean }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={cn("fab relative [&_svg]:size-5", active && "fab-on", className)}>
      {children}
      {badge ? <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[0.6875rem] font-semibold text-white">{badge}</span> : null}
    </button>
  );
}

/* ---------- Bottom sheet: half height by default, drags to full, swipe down to close ---------- */
type SheetProps = { open: boolean; onClose: () => void; children: React.ReactNode; title?: string; height?: "half" | "full" | "auto"; labelledBy?: string };
export function Sheet(props: SheetProps) {
  if (!props.open) return null;
  return <SheetBody {...props} />;
}

function SheetBody({ onClose, children, title, height = "half", labelledBy }: SheetProps) {
  const [full, setFull] = useState(height === "full");
  const [drag, setDrag] = useState(0);
  const startY = useRef<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  const onDown = (e: React.PointerEvent) => { startY.current = e.clientY; };
  const onMove = (e: React.PointerEvent) => {
    if (startY.current === null) return;
    const dy = e.clientY - startY.current;
    if (dy > 0 && (scroller.current?.scrollTop ?? 0) <= 0) setDrag(dy);
    if (dy < -40 && !full) { setFull(true); startY.current = null; }
  };
  const onUp = () => {
    if (startY.current === null) return;
    if (drag > 110) onClose(); else if (drag > 40 && full) setFull(false);
    setDrag(0); startY.current = null;
  };
  const h = height === "auto" ? "max-h-[88dvh]" : full ? "h-[92dvh]" : "h-[56dvh]";
  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-labelledby={labelledBy} aria-label={title}>
      <button type="button" aria-label={t("Close")} className="absolute inset-0 bg-ink/30 anim-fade" onClick={onClose} />
      <div
        className={cn("sheet absolute inset-x-0 bottom-0 mx-auto flex max-w-[640px] flex-col anim-rise transition-[height] duration-300", h)}
        style={{ transform: drag ? `translateY(${drag}px)` : undefined, transition: drag ? "none" : undefined }}
      >
        <div className="grid shrink-0 touch-none grid-cols-[48px_1fr_48px] items-center px-2 pt-2 pb-1" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <button type="button" aria-label={t("Close")} onClick={onClose} className="inline-flex size-12 items-center justify-center rounded-full text-ink-2"><ChevronDownIcon className="size-6" strokeWidth={1.6} /></button>
          {title ? <h2 className="truncate text-center text-[1.0625rem] text-ink">{title}</h2> : <span />}
          <span />
        </div>
        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(20px+var(--safe-b))]" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---------- Toasts ---------- */
type Toast = { id: number; text: string; action?: { label: string; onClick: () => void } };
const ToastCtx = createContext<(text: string, action?: Toast["action"]) => void>(() => {});
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, action?: Toast["action"]) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, action }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), action ? 6000 : 2600);
  }, []);
  const value = useMemo(() => push, [push]);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--nav-h)+var(--safe-b)+10px)] z-50 mx-auto flex max-w-[640px] flex-col gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto anim-pop flex min-h-12 items-center justify-center gap-4 rounded-[8px] bg-accent px-5 py-3 text-center text-[1.0625rem] text-white">
            <span>{t.text}</span>
            {t.action && <button type="button" className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] underline underline-offset-4" onClick={t.action.onClick}>{t.action.label}</button>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

/* ---------- Empty state: one italic serif sentence on a faint glow, plus one pill. No illustrations. ---------- */
export function EmptyState({ title, body, children, className }: { title: string; body?: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative flex flex-col items-center px-6 py-20 text-center", className)}>
      <Glow variant="rise" fixed={false} className="-inset-x-10 -top-24 opacity-70" />
      <h3 className="t-display t-italic relative max-w-[16ch] text-[2.375rem]">{title}</h3>
      {body && <p className="t-body relative mt-4 max-w-[30ch]">{body}</p>}
      {children && <div className="relative mt-8">{children}</div>}
    </div>
  );
}
