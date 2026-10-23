"use client";

import { t } from "@/lib/i18n";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { XIcon } from "lucide-react";
import { cn } from "cn";
import { useStore } from "@/lib/store";
import { NOTE_MAX } from "@/lib/config";
import { Sheet, useToast } from "./ui";
import { FourRings, Ring, RingPicker, SavedMoment, SmallModal } from "./mood";
import { Mark } from "./illustrations";

/*
 * Saving a pairing: a small modal for a beat, then the dark-mood confirmation with a light haptic.
 * "Add details" opens a sheet for the note and the collection; a new collection is a two-step screen
 * (name, then a ring colour).
 */
type SaveFlow = { save: (ids: string[]) => void; edit: (id: string) => void };
const Ctx = createContext<SaveFlow>({ save: () => {}, edit: () => {} });
export const useSaveFlow = () => useContext(Ctx);

export function SaveFlowProvider({ children }: { children: React.ReactNode }) {
  const { saveCombination } = useStore();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [moment, setMoment] = useState<string | null>(null);
  const [details, setDetails] = useState<string | null>(null);

  const save = useCallback((ids: string[]) => {
    setBusy(true);
    window.setTimeout(async () => {
      const r = await saveCombination(ids, "");
      setBusy(false);
      if (!r.ok) { toast(r.reason); return; }
      try { navigator.vibrate?.(12); } catch { /* no haptics */ }
      setMoment(r.id);
    }, 420);
  }, [saveCombination, toast]);
  const value = useMemo(() => ({ save, edit: (id: string) => setDetails(id) }), [save]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {busy && <SmallModal words={t("Saving pairing")} />}
      {moment && <SavedMoment onClose={() => setMoment(null)} onDetails={() => { setDetails(moment); setMoment(null); }} />}
      <DetailsSheet id={details} onClose={() => setDetails(null)} />
    </Ctx.Provider>
  );
}

/* ---------- Details: note and collection for one saved pairing ---------- */
function DetailsSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { saved } = useStore();
  const combo = saved.find((c) => c.id === id);
  if (!combo) return null;
  return <DetailsBody key={combo.id} id={combo.id} onClose={onClose} />;
}

function DetailsBody({ id, onClose }: { id: string; onClose: () => void }) {
  const { graph, saved, collections, updateCombination } = useStore();
  const toast = useToast();
  const combo = saved.find((c) => c.id === id)!;
  const [note, setNote] = useState(combo.note);
  const [collection, setCollection] = useState<string | null>(combo.collection ?? null);
  const [creating, setCreating] = useState(false);
  const items = combo.anchors.map((a) => graph?.get(a)).filter((x): x is NonNullable<typeof x> => !!x);
  const done = async () => { await updateCombination(id, { note, collection }); toast(t("Details saved")); onClose(); };
  return (
    <>
      <Sheet open onClose={onClose} title={t("Add details")} height="full">
        <div className="flex flex-col items-center pt-4 text-center">
          <div className="flex items-center gap-2">
            {items.map((i, n) => <span key={i.id} className="flex items-center gap-2">{n > 0 && <span className="text-[1.25rem] font-light text-faint">+</span>}<Mark art={i.art} cat={i.cat} photo={i.photo} image={i.image} size={56} /></span>)}
          </div>
          <p className="t-display mt-5 text-[2rem]">{items.map((i) => i.name).join(" + ")}</p>
        </div>
        <label className="t-label t-accent mt-8 block">{t("A note")}</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))} placeholder={t("Start typing here…")} aria-label={t("Note")} maxLength={NOTE_MAX} rows={2}
          className="mt-2 w-full resize-none bg-transparent text-[1.375rem] leading-snug text-ink outline-none" />
        <p className="text-right text-[0.75rem] text-faint">{note.length}/{NOTE_MAX}</p>
        <p className="t-label-muted mt-6">{t("Collection")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setCollection(null)} aria-pressed={collection === null} className={cn("chip chip-plain", collection === null && "chip-on")}>{t("None")}</button>
          {collections.map((c) => (
            <button key={c.id} type="button" onClick={() => setCollection(c.id)} aria-pressed={collection === c.id} className={cn("chip", collection === c.id && "chip-on")} style={{ paddingLeft: 10 }}>
              <Ring color={c.color} size={18} width={3} /> {c.name}
            </button>
          ))}
          <button type="button" onClick={() => setCreating(true)} className="chip chip-muted chip-plain">+ {t("New collection")}</button>
        </div>
        <div className="mt-10 flex justify-center pb-4"><button type="button" className="btn-step" onClick={done}>{t("Done")}</button></div>
      </Sheet>
      {creating && <NewCollection onClose={() => setCreating(false)} onCreated={(cid) => { setCollection(cid); setCreating(false); }} />}
    </>
  );
}

/* ---------- New collection: name, then a ring colour ---------- */
export function NewCollection({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const { createCollection } = useStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(null);
  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-paper anim-fade" role="dialog" aria-label={t("New collection")}>
      <div className="flex justify-end px-3 pt-[calc(var(--safe-t)+10px)]">
        <button type="button" aria-label={t("Close")} onClick={onClose} className="inline-flex size-12 items-center justify-center text-ink"><XIcon className="size-7" strokeWidth={1.4} /></button>
      </div>
      {step === 1 ? (
        <div key="name" className="rise-in mx-auto flex w-full max-w-[440px] flex-col items-center px-6 pt-2 text-center">
          <FourRings size={78} />
          <h1 className="t-display mt-3 text-[2.5rem] text-ink-2">{t("Create a new collection")}</h1>
          <p className="t-body mt-3">{t("A collection is a ring of saved pairings. File a pairing into it when you save, or later from Collections.")}</p>
          <input value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} placeholder={t("Sunday lunches")} aria-label={t("Name")} autoFocus enterKeyHint="next"
            onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) setStep(2); }} className="field mt-8" />
          <button type="button" className="btn-step mt-6" disabled={!name.trim()} onClick={() => setStep(2)}>{t("Next step")}</button>
        </div>
      ) : (
        <div key="color" className="rise-in mx-auto flex w-full max-w-[440px] flex-1 flex-col items-center px-6 pt-10 text-center">
          <h1 className="t-display text-[2.5rem] text-ink-2">{t("Pick a colour")}</h1>
          <p className="t-body mt-3">{t("Colour coding a collection helps you spot it a lot easier when you need it.")}</p>
          <div className="mt-8"><RingPicker value={color} onChange={setColor} /></div>
          <button type="button" className="btn-step mt-auto mb-[calc(var(--safe-b)+28px)]" disabled={!color} onClick={() => { if (color) onCreated(createCollection(name, color)); }}>{t("Finish & save")}</button>
        </div>
      )}
    </div>
  );
}
