"use client";

import { t } from "@/lib/i18n";

import { useRef, useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { Illustration } from "./illustrations";
import { cn } from "cn";

/* Three swipeable slides: illustration, one-line serif headline, two lines of body, a circle-arrow button. */
const SLIDES = [
  { art: "fennel", cat: "vegetable", wash: "var(--c-vegetable)", title: "Start with what's in the pan.", body: "Type one ingredient and see everything it goes with on a wheel, strongest partners nearest the centre." },
  { art: "orange", cat: "fruit", wash: "var(--c-fruit)", title: "Tap a second. Watch it narrow.", body: "The wheel re-centres on what both ingredients share, so you build the dish outward." },
  { art: "olive", cat: "condiment", wash: "var(--c-condiment)", title: "Keep the ones you like.", body: "Save a combination with a note. It works offline, in the kitchen, one-handed." },
] as const;

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const go = (i: number) => { setIndex(i); track.current?.scrollTo({ left: i * (track.current.clientWidth), behavior: "smooth" }); };
  const onScroll = () => { const el = track.current; if (!el) return; setIndex(Math.round(el.scrollLeft / el.clientWidth)); };
  const last = index === SLIDES.length - 1;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper anim-fade" role="dialog" aria-label={t("Welcome")}>
      <div className="flex justify-end px-5 pt-[calc(var(--safe-t)+14px)]">
        <button type="button" onClick={onDone} className="h-11 px-3 text-[1.0625rem] font-semibold text-faint">{t("Skip")}</button>
      </div>
      <div ref={track} onScroll={onScroll} className="no-scrollbar flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto">
        {SLIDES.map((s, i) => (
          <section key={i} className="flex w-full shrink-0 snap-center flex-col items-center justify-center px-8 text-center" aria-hidden={i !== index}>
            <Illustration art={s.art} cat={s.cat} size={240} wash={s.wash} strokeWidth={1.3} className="text-ink" />
            <h1 className="t-display mt-8 text-[2.25rem]">{t(s.title)}</h1>
            <p className="mt-4 max-w-[30ch] text-[1.0625rem] leading-relaxed text-muted">{t(s.body)}</p>
          </section>
        ))}
      </div>
      <div className="flex items-center justify-between px-8 pb-[calc(var(--safe-b)+28px)] pt-4">
        <div className="flex gap-2" aria-label={t("Slide {i} of {n}", { i: index + 1, n: SLIDES.length })}>
          {SLIDES.map((_, i) => <span key={i} className={cn("h-2 rounded-full transition-all", i === index ? "w-6 bg-ink" : "w-2 bg-faint")} />)}
        </div>
        {last ? (
          <button type="button" className="btn-primary" onClick={onDone}>{t("Start exploring")}</button>
        ) : (
          <button type="button" className="btn-circle" aria-label={t("Next")} onClick={() => go(index + 1)}><ArrowRightIcon className="size-6" /></button>
        )}
      </div>
    </div>
  );
}
