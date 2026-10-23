"use client";

import { t } from "@/lib/i18n";

import { useState } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "cn";
import { useStore } from "@/lib/store";
import { SKINS, useSkin } from "@/lib/skins";
import { Sheet } from "./ui";
import { LangSwitch } from "./lang-switch";
import { Mascot } from "./mood";

/** The hamburger: season, the look (skins), language, the introduction again. */
export function MenuSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { graph, setOnboarded, installed } = useStore();
  const [skin] = useSkin();
  const [skins, setSkins] = useState(false);
  const row = "flex min-h-16 w-full items-center gap-4 border-b border-hairline py-3 text-left";
  return (
    <>
      <Sheet open={open && !skins} onClose={onClose} title={t("Menu")} height="auto">
        <div className="flex flex-col pb-4">
          <Link href="/season/" onClick={onClose} className={row}>
            <span className="t-title min-w-0 flex-1 text-[1.375rem]">{t("In season now")}</span>
            <ChevronRightIcon className="size-5 text-faint" />
          </Link>
          <button type="button" onClick={() => setSkins(true)} className={row}>
            <span className="t-title min-w-0 flex-1 text-[1.375rem]">{t("Give your pantry a new look")}</span>
            <Mascot skin={skin} size={40} />
          </button>
          <div className={row}>
            <span className="t-title min-w-0 flex-1 text-[1.375rem]">{t("Language")}</span>
            <LangSwitch />
          </div>
          <button type="button" onClick={() => { onClose(); setOnboarded(false); }} className={row}>
            <span className="t-title min-w-0 flex-1 text-[1.375rem]">{t("See the introduction again")}</span>
            <ChevronRightIcon className="size-5 text-faint" />
          </button>
          <p className="mt-6 text-center text-[0.8125rem] text-faint">{t("Graph")} {graph?.version ?? "…"} · {installed ? t("installed") : t("in the browser")} · {t("saved on this device")}</p>
        </div>
      </Sheet>
      <SkinsSheet open={open && skins} onClose={() => setSkins(false)} />
    </>
  );
}

/** Skins: the same seated figure in twelve materials, three to a row. Picking one tints the glows. */
export function SkinsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [skin, setSkin] = useSkin();
  return (
    <Sheet open={open} onClose={onClose} height="full">
      <h2 className="t-display mx-auto mt-2 max-w-[12ch] text-center text-[2.5rem]">{t("Give your pantry a new look")}</h2>
      <p className="t-body mx-auto mt-3 max-w-[30ch] text-center">{t("The glows follow the material you pick. Nothing else changes.")}</p>
      <div className="mx-auto mt-8 grid max-w-[420px] grid-cols-3 gap-x-4 gap-y-6 pb-8" role="radiogroup" aria-label={t("Skin")}>
        {SKINS.map((s) => {
          const on = s.id === skin.id;
          return (
            <button key={s.id} type="button" role="radio" aria-checked={on} onClick={() => setSkin(s.id)} className="flex flex-col items-center gap-2">
              <span className={cn("flex aspect-square w-full items-center justify-center rounded-[24px] transition-shadow duration-300")} style={{ background: s.tile, boxShadow: on ? "0 0 0 4px var(--paper), 0 0 0 6px #b9c3d6" : undefined }}>
                <Mascot skin={s} size={84} />
              </span>
              <span className={cn("text-[0.9375rem]", on ? "text-ink" : "text-muted")}>{t(s.name)}</span>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
