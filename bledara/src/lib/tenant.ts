import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Membership, Organisation, Role } from "@prisma/client";
import { auth } from "./auth";
import { prisma } from "./prisma";
import { can, ForbiddenError, type Permission } from "./permissions";

export type TenantContext = {
  user: { id: string; name: string; email: string; image?: string | null };
  org: Organisation;
  membership: Membership;
  role: Role;
  /** The Employee record for this user in this organisation, when there is one. */
  employeeId: string | null;
};

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/** Redirects to the login page when there is no session. */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** The caller's organisation, or null when they have not created or joined one. */
export const getContext = cache(async (): Promise<TenantContext | null> => {
  const session = await getSession();
  if (!session) return null;
  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    include: { org: true },
    orderBy: { createdAt: "asc" },
  });
  if (!membership) return null;
  const employee = await prisma.employee.findFirst({
    where: { orgId: membership.orgId, userId: session.user.id },
    select: { id: true },
  });
  return {
    user: session.user,
    org: membership.org,
    membership,
    role: membership.role,
    employeeId: employee?.id ?? null,
  };
});

/** For pages: redirects to login or to the welcome screen as needed. */
export async function requireContext(): Promise<TenantContext> {
  await requireUser();
  const ctx = await getContext();
  if (!ctx) redirect("/welcome");
  return ctx;
}

/** For server actions: throws instead of redirecting so the caller can return an error. */
export async function requirePermission(permission: Permission): Promise<TenantContext> {
  const ctx = await getContext();
  if (!ctx) throw new ForbiddenError(permission);
  if (!can(ctx.role, permission)) throw new ForbiddenError(permission);
  return ctx;
}
