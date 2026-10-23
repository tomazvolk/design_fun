"use client";

import { t } from "@/lib/i18n";

import { useRef, useState } from "react";
import { cn } from "cn";
import { BASE_PATH } from "@/lib/config";
import { Glow, Monogram } from "./mood";

/* Four swipeable screens, each on its own aurora: monogram, serif headline, one paragraph, one pill, Skip bottom-left. */
const SLIDES = [
  { kind: "plain", tint: "var(--g-blush)", title: "Start with what's in the pan.", body: "Type one ingredient and see everything it goes with on a wheel, strongest partners nearest the centre." },
  { kind: "plain", tint: "var(--g-sky)", title: "Tap a second. Watch it narrow.", body: "The wheel re-centres on what both ingredients share, so you build the dish outward." },
  { kind: "tags", tint: "var(--g-peach)", title: "Every ingredient knows its partners.", body: "Taste, season and the classic partners are already noted, so all you do is choose." },
  { kind: "no", tint: "var(--g-blush)", title: "Keep the ones you like.", body: "Save a combination with a note. It works offline, in the kitchen, one-handed." },
] as const;

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const go = (i: number) => { setIndex(i); track.current?.scrollTo({ left: i * track.current.clientWidth, behavior: "smooth" }); };
  const onScroll = () => { const el = track.current; if (!el) return; setIndex(Math.round(el.scrollLeft / el.clientWidth)); };
  const last = index === SLIDES.length - 1;
  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-paper anim-fade" role="dialog" aria-label={t("Welcome")}>
      <div ref={track} onScroll={onScroll} className="no-scrollbar flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto">
        {SLIDES.map((s, i) => (
          <section key={i} className="relative flex w-full shrink-0 snap-center flex-col items-center overflow-hidden px-8 pt-[calc(var(--safe-t)+40px)] text-center" aria-hidden={i !== index}>
            <Glow variant="aurora" tint={s.tint} fixed={false} />
            <Monogram className="relative" light={s.kind !== "tags"} />
            <div className="relative flex flex-1 flex-col items-center justify-center pb-6">
              {s.kind === "tags" && <TaggedTomato />}
              {s.kind === "no" && <NoPills />}
              <h1 className={cn("t-display max-w-[13ch] text-[2.625rem]", s.kind === "tags" ? "text-ink" : "text-plum")}>{t(s.title)}</h1>
              <p className={cn("mt-4 max-w-[30ch] text-[1.0625rem] leading-relaxed", s.kind === "tags" ? "text-muted" : "text-plum/75")}>{t(s.body)}</p>
            </div>
          </section>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 pb-[calc(var(--safe-b)+26px)]">
        <button type="button" onClick={onDone} className={cn("h-11 min-w-16 text-left text-[0.9375rem] text-plum/60", last && "invisible")}>{t("Skip")}</button>
        <div className="flex gap-1.5" aria-label={t("Slide {i} of {n}", { i: index + 1, n: SLIDES.length })}>
          {SLIDES.map((_, i) => <span key={i} className={cn("size-1.5 rounded-full transition-colors duration-300", i === index ? "bg-plum" : "bg-plum/25")} />)}
        </div>
        <span className="min-w-16" />
      </div>
      <div className="absolute inset-x-0 bottom-[calc(var(--safe-b)+86px)] flex justify-center">
        {last
          ? <button type="button" className="btn-primary" onClick={onDone}>→ {t("Start exploring")}</button>
          : <button type="button" className="btn-primary" onClick={() => go(index + 1)}>→ {t("Next")}</button>}
      </div>
    </div>
  );
}

/** One ingredient cut out on a pale gradient, with white label pills floating around it: automatic tagging. */
function TaggedTomato() {
  return (
    <div className="relative mb-8 h-[230px] w-[290px]">
      <div className="dot-grid absolute inset-x-6 inset-y-2 rotate-[-3deg] rounded-[14px] shadow-[0_8px_30px_rgba(20,24,40,0.08)]" style={{ backgroundColor: "#f6efe9" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${BASE_PATH}/art/tomato.png`} alt="" width={170} height={170} className="absolute left-1/2 top-1/2 w-[170px] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_14px_16px_rgba(20,24,40,0.18)]" />
      <span className="tag absolute left-0 top-8 -rotate-3">{t("Acidic")}</span>
      <span className="tag absolute right-0 top-16 rotate-2"><span className="tag-dot" />{t("Summer")}</span>
      <span className="tag absolute bottom-6 left-4 rotate-1">{t("Pairs with basil")}</span>
      <span className="tag absolute bottom-2 right-6 -rotate-2">{t("Italian")}</span>
    </div>
  );
}

function NoPills() {
  const rows = ["account to sign up for", "ads between the pairings", "signal needed in the kitchen", "tracking of what you cook"];
  return (
    <ul className="mb-9 flex flex-col items-center gap-2.5">
      {rows.map((r) => (
        <li key={r} className="rounded-full bg-white/85 px-5 py-2.5 text-[0.9375rem] text-ink-2 shadow-[0_3px_14px_rgba(74,44,79,0.08)]"><span className="mr-1.5 font-extrabold tracking-[0.08em] text-ink">{t("NO")}</span>{t(r)}</li>
      ))}
    </ul>
  );
}
