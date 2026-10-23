"use client";

import { t } from "@/lib/i18n";

import { useId } from "react";
import { cn } from "cn";
import type { Skin } from "@/lib/skins";

/* ---------- Glows: large blurred pigment. Halo for working screens, aurora for moments ---------- */
type GlowProps = { variant?: "halo" | "aurora" | "mist" | "rise"; tint?: string; className?: string; fixed?: boolean };
export function Glow({ variant = "halo", tint, className, fixed = true }: GlowProps) {
  const a = tint ?? "var(--glow-a)";
  return (
    <div aria-hidden="true" className={cn(fixed ? "fixed" : "absolute", "pointer-events-none inset-0 -z-0 overflow-hidden", className)}>
      {variant === "halo" && (
        <>
          <div className="glow" style={{ left: "-20%", top: "-210px", width: "75%", height: "330px", background: a, opacity: 0.6 }} />
          <div className="glow" style={{ right: "-20%", top: "-230px", width: "70%", height: "330px", background: "var(--glow-c)", opacity: 0.55, animationDelay: "-9s" }} />
        </>
      )}
      {variant === "aurora" && (
        <>
          <div className="absolute inset-0" style={{ background: `color-mix(in srgb, ${a} 78%, white)` }} />
          <div className="glow-ring" style={{ left: "50%", top: "47%", width: "max(150vw, 760px)", height: "max(150vw, 760px)", translate: "-50% -50%", background: "radial-gradient(closest-side, transparent 34%, var(--glow-b) 52%, var(--glow-c) 64%, color-mix(in srgb, var(--glow-c) 40%, #ffb08a) 72%, transparent 84%)", opacity: 0.95 }} />
          <div className="glow" style={{ left: "10%", top: "18%", width: "80%", height: "22%", background: "var(--g-sky)", opacity: 0.7, animationDelay: "-6s" }} />
        </>
      )}
      {variant === "mist" && (
        <div className="absolute inset-0" style={{ filter: "blur(50px)" }}>
          <div className="glow" style={{ left: "-35%", top: "-10%", width: "95%", height: "55%", background: "var(--g-sky)", opacity: 0.85 }} />
          <div className="glow" style={{ right: "-30%", top: "28%", width: "70%", height: "40%", background: "var(--g-mint)", opacity: 0.4, animationDelay: "-11s" }} />
          <div className="glow" style={{ left: "-30%", bottom: "-5%", width: "70%", height: "40%", background: "var(--glow-b)", opacity: 0.45, animationDelay: "-4s" }} />
        </div>
      )}
      {variant === "rise" && (
        <>
          <div className="glow" style={{ left: "-15%", top: "-120px", width: "130%", height: "380px", background: `linear-gradient(90deg, ${a}, var(--glow-c))`, opacity: 0.85 }} />
          <div className="glow" style={{ left: "5%", top: "160px", width: "90%", height: "160px", background: "var(--glow-b)", opacity: 0.3, animationDelay: "-7s" }} />
        </>
      )}
    </div>
  );
}

/* ---------- The app mark: a single-line oval eye with a short tick ---------- */
export function EyeGlyph({ size = 40, className, strokeWidth = 2.2 }: { size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 40 48" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" className={className} aria-hidden="true">
      <ellipse cx="20" cy="24" rx="14.5" ry="19.5" transform="rotate(-14 20 24)" />
      <path d="M21 21.5 L27.5 33" strokeWidth={strokeWidth * 1.35} />
      <circle cx="14.5" cy="20" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Monogram({ className, light }: { className?: string; light?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center gap-1", light ? "text-white" : "text-ink", className)} aria-label="Pairing Explorer">
      <EyeGlyph size={30} />
      <span className="t-title t-italic text-[1.0625rem] leading-none">pairing</span>
    </div>
  );
}

/* ---------- Rings: a collection is always a thin ring ---------- */
export const RING_COLORS = ["#e8364a", "#7d3fd6", "#6cf2c2", "#c4c6cf", "#ff8aa6", "#141414", "#19a9cc", "#1fc27a", "#ffd2c2", "#1f6fe8", "#d4f200", "#ff8a4c", "#c3b3e6", "#8ccbd0", "#c99aa8", "#ffe45c", "#8a4f8f", "#e5c48f"];

export function Ring({ color = "var(--accent)", size = 20, width = 3, className }: { color?: string; size?: number; width?: number; className?: string }) {
  return <span aria-hidden="true" className={cn("inline-block shrink-0 rounded-full", className)} style={{ width: size, height: size, boxShadow: `inset 0 0 0 ${width}px ${color}` }} />;
}

export function FourRings({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" strokeWidth="3" aria-hidden="true">
      <circle cx="36" cy="22" r="13" stroke="#8ccbd0" />
      <circle cx="22" cy="36" r="13" stroke="#d4f200" />
      <circle cx="50" cy="34" r="13" stroke="#ff8aa6" />
      <circle cx="36" cy="49" r="13" stroke="#1f6fe8" />
    </svg>
  );
}

/** Eighteen rings in a circle: the colour picker for a collection. */
export function RingPicker({ value, onChange, size = 280 }: { value: string | null; onChange: (c: string) => void; size?: number }) {
  const r = size / 2 - 26;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }} role="radiogroup" aria-label={t("Colour")}>
      {RING_COLORS.map((c, i) => {
        const a = (i / RING_COLORS.length) * Math.PI * 2 - Math.PI / 2;
        const on = value === c;
        return (
          <button key={c} type="button" role="radio" aria-checked={on} aria-label={t("Colour {n}", { n: i + 1 })} onClick={() => onChange(c)}
            className="absolute inline-flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform duration-300"
            style={{ left: size / 2 + Math.cos(a) * r, top: size / 2 + Math.sin(a) * r, transform: on ? "translate(-50%,-50%) scale(1.18)" : undefined }}>
            <Ring color={c} size={38} width={on ? 6 : 4} />
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Spinner, loading card, small modal ---------- */
export function Spinner({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span role="status" aria-label={t("Loading…")} className={cn("inline-block", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 32" width={size} height={size} style={{ animation: "spin 900ms steps(8) infinite" }} aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x="14.5" y="2" width="3" height="9" rx="1.5" fill="currentColor" opacity={0.25 + (i / 8) * 0.75} transform={`rotate(${i * 45} 16 16)`} />)}
      </svg>
    </span>
  );
}

export function LoadingCard({ line, className }: { line?: string; className?: string }) {
  return (
    <div className={cn("card rise-in flex flex-col items-center gap-4 px-6 py-8 text-center", className)} style={{ boxShadow: "inset 0 0 0 1.5px #ffd3e1, 0 2px 12px rgba(20,24,40,0.06)" }}>
      <EyeGlyph size={22} className="text-muted" strokeWidth={2} />
      <p className="t-title text-[1.25rem] text-ink-2">{line ?? t("One moment, I’m pairing this for you.")}</p>
    </div>
  );
}

export function SmallModal({ words }: { words: string }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/10 anim-fade" role="status">
      <div className="flex size-36 flex-col items-center justify-center gap-4 rounded-[20px] bg-white shadow-[0_10px_40px_rgba(20,24,40,0.16)]">
        <Spinner size={30} className="text-muted" />
        <span className="text-[0.9375rem] text-ink-2">{words}</span>
      </div>
    </div>
  );
}

/* ---------- Dark mood: the save confirmation ---------- */
export function SavedMoment({ onDetails, onClose }: { onDetails: () => void; onClose: () => void }) {
  return (
    <div className="mood-dark fixed inset-0 z-[80] flex flex-col items-center justify-center px-8 text-center anim-fade" role="dialog" aria-label={t("Saved")} onClick={onClose}>
      <EyeGlyph size={56} className="rise-in text-white" strokeWidth={2} />
      <p className="t-display rise-in mt-8 text-[2.75rem] text-white" style={{ animationDelay: "60ms" }}>{t("Good pairing!")}<br />{t("It’s in your collections.")}</p>
      <button type="button" className="btn-light rise-in mt-10" style={{ animationDelay: "120ms" }} onClick={(e) => { e.stopPropagation(); onDetails(); }}>+ {t("Add details")}</button>
      <p className="absolute inset-x-0 bottom-[calc(var(--safe-b)+28px)] text-[0.8125rem] text-white/70">{t("Tap anywhere to close")}</p>
    </div>
  );
}

/* ---------- Tab icons: thin, two-tone ---------- */
export function PantryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true" fill="currentColor">
      <rect x="3" y="3" width="10" height="10" rx="3.5" />
      <rect x="3" y="15" width="10" height="10" rx="3.5" opacity="0.75" />
      <rect x="15" y="3" width="10" height="22" rx="3.5" opacity="0.9" />
    </svg>
  );
}
export function LeafIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true" fill="currentColor">
      <path d="M23.5 4.5C12.8 4.4 5.6 9.6 5.6 17.2c0 2 .6 3.8 1.6 5.3 1.5 1.1 3.3 1.7 5.3 1.7 7.6 0 11.4-7.4 11-19.7z" opacity="0.88" />
      <path d="M5 24.5c3.4-6.2 7.6-10.4 12.6-13" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}
export function RingIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 28 28" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="14" cy="14" r="10.5" /></svg>;
}
export function ChanceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true" fill="currentColor">
      <path d="M9.5 26v-3.7C6.6 20.6 5 17.8 5 14.6 5 9.3 9.2 5 14.4 5c5 0 9 3.9 9 8.8 0 .8-.1 1.4-.3 2l1.6 2.6c.3.5 0 1-.5 1.1l-1.5.4v2.4c0 1.2-1 2.1-2.1 2.1H18V26z" opacity="0.88" />
      <circle cx="13.6" cy="11.6" r="3.6" fill="none" stroke="#fff" strokeWidth="1.6" opacity="0.9" />
    </svg>
  );
}

/* ---------- The mascot: one seated figure, no face, in twelve materials ---------- */
const FIGURE = [
  "M51 10c9.5 1.2 15.6 9.9 13.8 19.4-1 5.5-4.2 9.5-8.4 11.6 3.2 6.6 4.3 15 3.2 24.6 3.8-1.6 8.4-.9 11.6 2.1 4.3 4 5.3 10.5 2.4 15.6L71 92H30.5c-4.4-7.6-7-17-6.2-27.5.8-10.5 4.8-19.2 10.5-25.5-2.4-3.4-3.6-7.6-3-12C33.2 16 41.8 8.8 51 10z",
];
function Material({ id, uid }: { id: string; uid: string }) {
  const g = (stops: [number, string][], angle = 135) => (
    <linearGradient id={uid} gradientTransform={`rotate(${angle - 90} .5 .5)`}>{stops.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}</linearGradient>
  );
  switch (id) {
    case "chrome": return g([[0, "#0c1a1e"], [0.25, "#4f7b80"], [0.42, "#d8f1ea"], [0.55, "#2b3f58"], [0.72, "#8de0c6"], [1, "#0b0c10"]]);
    case "delft": return (
      <pattern id={uid} width="14" height="14" patternUnits="userSpaceOnUse">
        <rect width="14" height="14" fill="#f5f7fc" />
        <path d="M2 7c2-4 6-4 8 0s5 4 4 0" stroke="#2443a6" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="4" cy="12" r="1.3" fill="#2443a6" /><circle cx="11" cy="3" r="1" fill="#3b5fc8" />
      </pattern>
    );
    case "rose": return g([[0, "#ffd0c2"], [0.35, "#ff6f8e"], [0.7, "#ff5a3c"], [1, "#ffb15c"]], 160);
    case "oil": return g([[0, "#f7c3d8"], [0.18, "#ff6f3c"], [0.34, "#ffd166"], [0.5, "#c86bd9"], [0.66, "#ff4f8b"], [0.82, "#fff1c2"], [1, "#ff8a4c"]], 100);
    case "obsidian": return (
      <radialGradient id={uid} cx="0.4" cy="0.3" r="0.9"><stop offset="0" stopColor="#3a3f4a" /><stop offset="0.35" stopColor="#0a0b0e" /><stop offset="0.8" stopColor="#101828" /><stop offset="1" stopColor="#2c4f9b" /></radialGradient>
    );
    case "terracotta": return (
      <pattern id={uid} width="9" height="9" patternUnits="userSpaceOnUse">
        <rect width="9" height="9" fill="#e4653a" /><circle cx="2" cy="3" r="0.8" fill="#ffd9bf" /><circle cx="6.5" cy="7" r="0.6" fill="#ffe6d2" /><circle cx="7" cy="1.5" r="0.4" fill="#a8401f" />
      </pattern>
    );
    case "jade": return g([[0, "#c5f0dc"], [0.4, "#3fa37f"], [0.75, "#1d5e47"], [1, "#82d1ad"]]);
    case "marble": return (
      <pattern id={uid} width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="#f3f1ec" />
        <path d="M-2 12c10-4 14 6 24 2s14-10 20-6M0 30c8 2 12-6 22-2s12 8 20 4" stroke="#a9a49b" strokeWidth="0.9" fill="none" />
      </pattern>
    );
    case "holo": return g([[0, "#ff7ad9"], [0.25, "#ffe066"], [0.5, "#7af0c3"], [0.75, "#7aa8ff"], [1, "#d47aff"]], 120);
    case "lavender": return g([[0, "#efe9ff"], [0.45, "#b7a3f2"], [1, "#7f6ad8"]]);
    case "bronze": return g([[0, "#3d2410"], [0.4, "#c98b4b"], [0.6, "#f3c27a"], [1, "#5d3515"]]);
    default: return g([[0, "#ff7d3a"], [1, "#f2581f"]]);
  }
}

export function Mascot({ skin, size = 96, className }: { skin: Skin; size?: number; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const fill = `m${uid}`, shade = `s${uid}`, fuzz = `f${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <Material id={skin.id} uid={fill} />
        <radialGradient id={shade} cx="0.32" cy="0.22" r="0.85">
          <stop offset="0" stopColor="#fff" stopOpacity={skin.id === "felt" ? 0.18 : 0.42} />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </radialGradient>
        <filter id={fuzz}><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" /><feDisplacementMap in="SourceGraphic" scale={skin.id === "felt" ? 2.2 : 0} /></filter>
      </defs>
      <ellipse cx="51" cy="93" rx="30" ry="3.5" fill="#000" opacity="0.12" />
      <g filter={`url(#${fuzz})`}>
        {FIGURE.map((d) => <path key={d} d={d} fill={`url(#${fill})`} />)}
        {FIGURE.map((d) => <path key={`s${d}`} d={d} fill={`url(#${shade})`} />)}
        <path d="M57 41c4.6 7 5.4 16.6 2.8 24.4" stroke="#000" strokeOpacity="0.16" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
