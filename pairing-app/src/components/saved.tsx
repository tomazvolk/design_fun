"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { useStore } from "@/lib/store";
import { exploreHref } from "@/lib/explore-state";
import type { Combination } from "@/lib/types";
import { EmptyState, SectionLabel, useToast } from "./ui";
import { Illustration } from "./illustrations";

/** Screen 6: saved combinations, newest first. Tap opens the map, swipe left to delete. */
export function SavedScreen() {
  const { graph, saved, savedLoaded, deleteCombination, installed } = useStore();
  const router = useRouter();
  const toast = useToast();
  const fmt = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });
  return (
    <div className="px-4 pt-[calc(var(--safe-t)+20px)] md:px-8">
      <h1 className="t-display text-[2.5rem]">Saved</h1>
      {savedLoaded && saved.length === 0 && (
        <EmptyState art={<Illustration art="olive" cat="condiment" size={120} wash="var(--sky)" strokeWidth={1.6} />} title="Nothing saved yet" body="Tap the centre of a map, or an ingredient card, and save the combination with a note." />
      )}
      {saved.length > 0 && (
        <>
          <SectionLabel muted className="mt-6 mb-2">{saved.length} combination{saved.length === 1 ? "" : "s"} · swipe to delete</SectionLabel>
          <ul className="card overflow-hidden">
            {saved.map((c) => (
              <SavedRow key={c.id} combo={c} names={c.anchors.map((id) => graph?.get(id)?.name ?? id)} date={fmt.format(c.created)}
                onOpen={() => router.push(exploreHref(c.anchors))}
                onDelete={async () => { await deleteCombination(c.id); toast("Deleted"); }} />
            ))}
          </ul>
        </>
      )}
      <p className="mt-10 text-center text-[0.75rem] text-faint">Graph {graph?.version ?? "…"} · {installed ? "installed" : "in the browser"} · saved on this device{saved.length > 0 ? ", syncs when you sign in (later)" : ""}</p>
    </div>
  );
}

function SavedRow({ combo, names, date, onOpen, onDelete }: { combo: Combination; names: string[]; date: string; onOpen: () => void; onDelete: () => void }) {
  const [dx, setDx] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const horizontal = useRef(false);
  return (
    <li className="relative overflow-hidden border-b border-hairline last:border-0">
      <div className="absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-danger text-white"><Trash2Icon className="size-5" /></div>
      <button type="button" onClick={() => { if (Math.abs(dx) < 4) onOpen(); }}
        onPointerDown={(e) => { start.current = { x: e.clientX, y: e.clientY }; horizontal.current = false; }}
        onPointerMove={(e) => { if (!start.current) return; const ddx = e.clientX - start.current.x, ddy = e.clientY - start.current.y; if (!horizontal.current && Math.abs(ddx) > 8 && Math.abs(ddx) > Math.abs(ddy)) horizontal.current = true; if (horizontal.current) { (e.currentTarget as Element).setPointerCapture?.(e.pointerId); setDx(Math.min(0, Math.max(-120, ddx))); } }}
        onPointerUp={() => { if (dx < -80) onDelete(); setDx(0); start.current = null; }}
        onPointerCancel={() => { setDx(0); start.current = null; }}
        className="relative flex min-h-16 w-full flex-col items-start gap-0.5 bg-surface px-4 py-3 text-left"
        style={{ transform: `translateX(${dx}px)`, transition: dx ? "none" : "transform 160ms ease", touchAction: "pan-y" }}
        aria-label={`${names.join(" and ")}${combo.note ? `, ${combo.note}` : ""}`}>
        <span className="text-[1.0625rem] font-medium">{names.join(" + ")}</span>
        <span className="text-[0.875rem] text-muted">{combo.note || "No note"} · {date}</span>
      </button>
    </li>
  );
}
