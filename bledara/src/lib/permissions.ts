import type { Role } from "@prisma/client";

/**
 * What a role may do. Checked on the server in every action and page; the UI only
 * hides what the server would refuse anyway.
 *
 * OWNER is a membership role for people who own specific tools. Owner-only actions
 * (renewal decisions, freezing the tool's card) additionally require that the
 * subscription's ownerId matches the caller; see `canOnSubscription`.
 */
export const PERMISSIONS = [
  "dashboard:view",
  "subscription:read",
  "subscription:write",
  "subscription:import",
  "card:read",
  "card:manage",
  "wallet:topup",
  "transaction:read",
  "transaction:code",
  "request:create",
  "request:read_all",
  "request:approve",
  "renewal:read",
  "renewal:decide",
  "insights:read",
  "people:read",
  "people:manage",
  "access:manage",
  "settings:read",
  "settings:manage",
  "audit:read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL: Permission[] = [...PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  ADMIN: ALL,
  FINANCE: [
    "dashboard:view",
    "subscription:read",
    "subscription:write",
    "subscription:import",
    "card:read",
    "card:manage",
    "wallet:topup",
    "transaction:read",
    "transaction:code",
    "request:create",
    "request:read_all",
    "request:approve",
    "renewal:read",
    "renewal:decide",
    "insights:read",
    "people:read",
    "settings:read",
    "audit:read",
  ],
  IT: [
    "dashboard:view",
    "subscription:read",
    "subscription:write",
    "card:read",
    "card:manage",
    "transaction:read",
    "request:create",
    "request:read_all",
    "request:approve",
    "renewal:read",
    "renewal:decide",
    "insights:read",
    "people:read",
    "people:manage",
    "access:manage",
    "settings:read",
    "audit:read",
  ],
  OWNER: [
    "dashboard:view",
    "subscription:read",
    "card:read",
    "transaction:read",
    "request:create",
    "renewal:read",
    "renewal:decide", // only for subscriptions they own
    "card:manage", // only for subscriptions they own
    "people:read",
  ],
  EMPLOYEE: ["dashboard:view", "subscription:read", "request:create", "people:read"],
};

/** Permissions an OWNER holds only on subscriptions they own. */
const OWNER_SCOPED: ReadonlySet<Permission> = new Set(["renewal:decide", "card:manage"]);

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canOnSubscription(
  actor: { role: Role; employeeId?: string | null },
  subscription: { ownerId: string | null },
  permission: Permission,
): boolean {
  if (!can(actor.role, permission)) return false;
  if (actor.role === "OWNER" && OWNER_SCOPED.has(permission)) {
    return Boolean(actor.employeeId) && subscription.ownerId === actor.employeeId;
  }
  return true;
}

export const ROLES: Role[] = ["ADMIN", "FINANCE", "IT", "OWNER", "EMPLOYEE"];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  FINANCE: "Finance",
  IT: "IT",
  OWNER: "Tool owner",
  EMPLOYEE: "Employee",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN: "Everything, including settings, roles and integrations.",
  FINANCE: "Spend, cards, wallet, transactions, coding and approvals.",
  IT: "Inventory, cards, access management and approvals.",
  OWNER: "Reads everything, decides renewals and card freezes for the tools they own.",
  EMPLOYEE: "Browses the inventory and requests new tools.",
};

export class ForbiddenError extends Error {
  readonly permission: Permission;
  constructor(permission: Permission) {
    super(`Missing permission: ${permission}`);
    this.name = "ForbiddenError";
    this.permission = permission;
  }
}
