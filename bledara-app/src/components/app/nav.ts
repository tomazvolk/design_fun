import type { Permission } from "@/lib/permissions";

export type NavItem = {
  href: string;
  label: string;
  icon: "dashboard" | "subscriptions" | "cards" | "requests" | "renewals" | "transactions" | "insights" | "people" | "settings" | "audit";
  permission: Permission;
  /** Build step that delivers the page; shown as a hint until it ships. */
  step?: number;
};

export const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", permission: "dashboard:view" },
  { href: "/subscriptions", label: "Subscriptions", icon: "subscriptions", permission: "subscription:read" },
  { href: "/cards", label: "Cards", icon: "cards", permission: "card:read", step: 3 },
  { href: "/requests", label: "Requests", icon: "requests", permission: "request:create", step: 4 },
  { href: "/renewals", label: "Renewals", icon: "renewals", permission: "renewal:read", step: 5 },
  { href: "/transactions", label: "Transactions", icon: "transactions", permission: "transaction:read", step: 3 },
  { href: "/insights", label: "Insights", icon: "insights", permission: "insights:read", step: 7 },
  { href: "/people", label: "People", icon: "people", permission: "people:read" },
  { href: "/settings", label: "Settings", icon: "settings", permission: "settings:read" },
  { href: "/audit-log", label: "Audit log", icon: "audit", permission: "audit:read" },
];
