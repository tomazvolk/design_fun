import { cn } from "cn";

/** The Bledara mark: a ledger of three shortening lines inside a rounded tile. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
      fill="none"
    >
      <rect x="1" y="1" width="30" height="30" rx="8" className="fill-primary" />
      <rect x="8" y="9" width="16" height="3" rx="1.5" className="fill-primary-foreground" />
      <rect x="8" y="14.5" width="12" height="3" rx="1.5" className="fill-primary-foreground" />
      <rect x="8" y="20" width="8" height="3" rx="1.5" className="fill-primary-foreground" />
      <circle cx="22.5" cy="21.5" r="1.5" className="fill-primary-foreground" />
    </svg>
  );
}

export function Wordmark({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-semibold tracking-tight", className)}>
      <BrandMark className={markClassName} />
      <span>Bledara</span>
    </span>
  );
}
