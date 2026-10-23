"use client";

import { cn } from "cn";
import { useStore } from "@/lib/store";
import { LANGS, t } from "@/lib/i18n";

/** Two-letter language switch: EN / SL. The choice is remembered on the device. */
export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang } = useStore();
  return (
    <div className={cn("inline-flex rounded-full bg-paper-deep p-1", className)} role="radiogroup" aria-label={t("Language")}>
      {LANGS.map((l) => (
        <button key={l.id} type="button" role="radio" aria-checked={lang === l.id} title={l.label} onClick={() => setLang(l.id)}
          className={cn("h-8 min-w-10 rounded-full px-2.5 text-[0.75rem] font-bold uppercase tracking-[0.1em] transition-colors", lang === l.id ? "bg-ink text-white" : "text-ink-2 hover:bg-card")}>
          {l.id}
        </button>
      ))}
    </div>
  );
}
