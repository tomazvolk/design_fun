"use client";

import { t, tn } from "@/lib/i18n";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "cn";
import { useStore } from "@/lib/store";
import { profileHref } from "@/lib/explore-state";
import { reasonSentence } from "@/lib/labels";
import type { PairingGraph } from "@/lib/graph";
import type { Ingredient } from "@/lib/types";
import { useToast } from "./ui";
import { Glow, LoadingCard } from "./mood";
import { Portrait } from "./explore";

const DECK = 10;
type Draw = { a: Ingredient; b: Ingredient; why: string };

/** Ten pairings drawn by chance: a drawn ingredient (with a drawing where possible) and one of its strong partners. */
function draw(graph: PairingGraph): Draw[] {
  const pool = graph.ingredients.filter((i) => i.image && graph.partnersOf(i.id).some((e) => e.tier >= 2));
  const out: Draw[] = [];
  const used = new Set<string>();
  for (let tries = 0; out.length < DECK && tries < 200; tries++) {
    const a = pool[Math.floor(Math.random() * pool.length)];
    if (!a || used.has(a.id)) continue;
    const strong = graph.partnersOf(a.id).filter((e) => e.tier >= 2);
    const drawn = strong.filter((e) => graph.get(e.a === a.id ? e.b : e.a)?.image);
    const edges = drawn.length ? drawn : strong;
    const e = edges[Math.floor(Math.random() * edges.length)];
    const b = graph.get(e.a === a.id ? e.b : e.a);
    if (!b) continue;
    used.add(a.id);
    out.push({ a, b, why: e.reason ?? reasonSentence(e.reasonType, a.name, b.name) });
  }
  return out;
}

/** Chance: kicker and question, then one card at a time with Skip and Keep, then an italic line and "Do it again?". */
export function ChanceScreen() {
  const { graph, saveCombination } = useStore();
  const router = useRouter();
  const toast = useToast();
  const [phase, setPhase] = useState<"intro" | "loading" | "deck" | "done">("intro");
  const [deck, setDeck] = useState<Draw[]>([]);
  const [index, setIndex] = useState(0);
  const [kept, setKept] = useState(0);
  const [leaving, setLeaving] = useState<null | "skip" | "keep">(null);

  const begin = () => {
    if (!graph) return;
    setPhase("loading");
    setDeck(draw(graph)); setIndex(0); setKept(0);
    window.setTimeout(() => setPhase("deck"), 1100);
  };
  const next = (how: "skip" | "keep") => {
    const card = deck[index];
    if (!card || leaving) return;
    if (how === "keep") {
      saveCombination([card.a.id, card.b.id], "").then((r) => {
        if (r.ok) { setKept((k) => k + 1); try { navigator.vibrate?.(10); } catch { /* no haptics */ } toast(t("Kept. It’s in your collections.")); } else toast(r.reason);
      });
    }
    setLeaving(how);
    window.setTimeout(() => {
      setLeaving(null);
      if (index + 1 >= deck.length) setPhase("done"); else setIndex(index + 1);
    }, 320);
  };
  const card = deck[index];

  return (
    <div className="relative flex min-h-[calc(100dvh-var(--nav-h)-var(--safe-b))] flex-col items-center px-6 pt-[calc(var(--safe-t)+24px)] text-center">
      <Glow variant="mist" />
      {phase === "intro" && (
        <div className="rise-in relative my-auto flex flex-col items-center pb-10">
          <p className="t-label tracking-[0.2em]">{t("Embrace chance")}</p>
          <h1 className="t-display mt-5 max-w-[12ch] text-[2.75rem] text-ink-2">{t("What will chance pair for you today?")}</h1>
          <p className="t-body mt-6 max-w-[30ch] text-ink-2/80">{t("Ten pairings drawn at random from the whole pantry. Keep the ones that make you hungry. We call it")} <span className="underline underline-offset-4">{t("Chance")}</span>.</p>
          <button type="button" className="btn-secondary mt-9" disabled={!graph} onClick={begin}>{t("Show me how")}</button>
        </div>
      )}
      {phase === "loading" && <div className="relative my-auto w-full max-w-[320px] pb-16"><LoadingCard /></div>}
      {phase === "deck" && card && (
        <div className="relative my-auto flex w-full max-w-[400px] flex-col items-center pb-6">
          <button key={index} type="button" onClick={() => router.push(profileHref(card.b.id, [card.a.id]))}
            className={cn("card block w-full max-w-[330px] p-2 shadow-[0_18px_50px_rgba(40,60,110,0.16)] transition-[transform,opacity] duration-300", !leaving && "rise-in", leaving === "skip" && "-translate-x-10 -rotate-3 opacity-0", leaving === "keep" && "translate-x-10 rotate-3 opacity-0")}
            aria-label={`${card.a.name} + ${card.b.name}`}>
            <span className="flex aspect-square items-center justify-center gap-1 rounded-[8px]" style={{ background: "linear-gradient(160deg, #f7f8fb, #e7ecf6)" }}>
              <Portrait ing={card.a} size={128} />
              <span className="text-[1.25rem] font-light text-faint">+</span>
              <Portrait ing={card.b} size={128} />
            </span>
            <span className="t-title mt-4 block text-[1.5rem]">{card.a.name} + {card.b.name}</span>
            <span className="mx-auto mt-1 mb-2 block max-w-[30ch] px-2 text-[0.9375rem] leading-snug text-muted">{card.why}</span>
          </button>
          <div className="flex items-center justify-center pt-12">
            <button type="button" className="btn-circle" onClick={() => next("skip")}>{t("Skip")}</button>
            <button type="button" className="btn-circle -ml-2" onClick={() => next("keep")}>{t("Keep")}</button>
          </div>
          <div className="mt-5 mb-5 flex gap-1.5" aria-label={t("Slide {i} of {n}", { i: index + 1, n: deck.length })}>
            {deck.map((_, i) => <span key={i} className={cn("size-1.5 rounded-full transition-colors duration-300", i <= index ? "bg-[#7f97c2]" : "bg-[#7f97c2]/25")} />)}
          </div>
        </div>
      )}
      {phase === "done" && (
        <div className="rise-in relative my-auto flex flex-col items-center pb-10">
          <h1 className="t-display t-italic max-w-[14ch] text-[2.5rem] text-ink-2">{t("Float along with whatever the pantry pairs next.")}</h1>
          <p className="t-body mt-4">{kept ? tn(kept, "You kept {n} pairing.", "You kept {n} pairings.") : t("Nothing kept this time.")}</p>
          <button type="button" className="btn-secondary mt-9" onClick={begin}>{t("Do it again?")}</button>
        </div>
      )}
    </div>
  );
}
