import type { BillingCycle, Category, SubscriptionStatus } from "@/data/types";

export function formatMoney(amount: number | string | { toString(): string }, currency = "EUR", locale = "en-GB") {
  const n = typeof amount === "number" ? amount : Number(amount.toString());
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

export function formatMoneyExact(amount: number | string | { toString(): string }, currency = "EUR", locale = "en-GB") {
  const n = typeof amount === "number" ? amount : Number(amount.toString());
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(n);
}

export function formatDate(date: Date | string | null | undefined, locale = "en-GB") {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export function formatDateTime(date: Date | string, locale = "en-GB") {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function daysFromNow(n: number) {
  return new Date(Date.now() + n * 86_400_000);
}

export function daysUntil(date: Date) {
  const ms = date.getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

/** Cost per period expressed as a monthly figure. */
export function monthlyEquivalent(cost: number, cycle: BillingCycle) {
  switch (cycle) {
    case "MONTHLY":
      return cost;
    case "QUARTERLY":
      return cost / 3;
    case "ANNUAL":
      return cost / 12;
  }
}

export const CYCLE_LABELS: Record<BillingCycle, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  ANNUAL: "Annual",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  COMMUNICATION: "Communication",
  DESIGN: "Design",
  ENGINEERING: "Engineering",
  PRODUCTIVITY: "Productivity",
  SALES: "Sales",
  MARKETING: "Marketing",
  FINANCE: "Finance",
  HR: "HR",
  SECURITY: "Security",
  INFRASTRUCTURE: "Infrastructure",
  ANALYTICS: "Analytics",
  SUPPORT: "Support",
  LEGAL: "Legal",
  OTHER: "Other",
};

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  TRIAL: "Trial",
  ACTIVE: "Active",
  PENDING_CANCELLATION: "Cancelling",
  CANCELLED: "Cancelled",
  PAUSED: "Paused",
};

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
