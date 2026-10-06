import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import type { TenantContext } from "./tenant";

export type AuditEntry = {
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
};

/** Every approval, card action and settings change goes through here. */
export async function recordAudit(ctx: TenantContext, entry: AuditEntry, tx?: Prisma.TransactionClient) {
  const client = tx ?? prisma;
  return client.auditLog.create({
    data: {
      orgId: ctx.org.id,
      actorId: ctx.user.id,
      actorEmail: ctx.user.email,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      summary: entry.summary,
      before: entry.before,
      after: entry.after,
    },
  });
}
