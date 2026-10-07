"use client";

import type { Permission } from "@/lib/permissions";
import { useStore } from "@/lib/store";
import { NoAccess } from "./no-access";

/** Renders children only when the signed-in role holds the permission. */
export function Gate({ permission, what, children }: { permission: Permission; what: string; children: React.ReactNode }) {
  const { can } = useStore();
  if (!can(permission)) return <NoAccess what={what} />;
  return <>{children}</>;
}
