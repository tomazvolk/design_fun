import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const POINTS = [
  "One inventory of every tool, who owns it and what it costs.",
  "A virtual card per subscription, locked to the vendor and capped.",
  "Approvals that follow your rules, then issue the card for you.",
  "Renewal reminders at 60, 30 and 7 days, with the decision recorded.",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at 20% 10%, black 0%, transparent 70%)",
          }}
        />
        <Link href="/" className="relative w-fit text-lg">
          <Wordmark markClassName="[&_rect:first-child]:fill-primary-foreground [&_rect:not(:first-child)]:fill-primary [&_circle]:fill-primary" />
        </Link>
        <div className="relative max-w-md space-y-8">
          <h1 className="font-heading text-4xl leading-[1.1] font-semibold tracking-tight text-balance">
            Every subscription your company pays for, in one ledger.
          </h1>
          <ul className="space-y-3 text-primary-foreground/85">
            {POINTS.map((p) => (
              <li key={p} className="flex gap-3">
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-current" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-primary-foreground/70">For finance and IT teams who would rather not chase invoices.</p>
      </aside>

      <main className="flex flex-col">
        <header className="flex items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="lg:invisible">
            <Wordmark />
          </Link>
          <ThemeToggle />
        </header>
        <div className="flex flex-1 items-center justify-center px-6 pb-16 lg:px-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
