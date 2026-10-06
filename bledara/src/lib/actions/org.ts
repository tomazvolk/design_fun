"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getContext, getSession, requirePermission } from "@/lib/tenant";
import { recordAudit } from "@/lib/audit";
import { ForbiddenError, ROLES } from "@/lib/permissions";
import { slugify } from "@/lib/format";

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
};

const idle: ActionState = { ok: false };

function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function failure(e: unknown): ActionState {
  if (e instanceof ForbiddenError) return { ok: false, error: "You do not have permission to do that." };
  console.error(e);
  return { ok: false, error: "Something went wrong. Please try again." };
}

// ───────────── create organisation (sign-up and first Google login) ─────────────

const createOrgSchema = z.object({
  name: z.string().trim().min(2, "Give the organisation a name.").max(80, "Keep it under 80 characters."),
  currency: z.enum(["EUR", "USD", "GBP", "CHF"]).default("EUR"),
});

export async function createOrganisation(_prev: ActionState = idle, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (await getContext()) redirect("/dashboard");

  const parsed = createOrgSchema.safeParse({
    name: formData.get("name"),
    currency: formData.get("currency") ?? "EUR",
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsOf(parsed.error) };

  const base = slugify(parsed.data.name) || "org";
  let slug = base;
  for (let i = 2; await prisma.organisation.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;

  const org = await prisma.$transaction(async (tx) => {
    const org = await tx.organisation.create({
      data: {
        name: parsed.data.name,
        slug,
        currency: parsed.data.currency,
        inboxAddress: `invoices-${slug}@in.bledara.app`,
        memberships: { create: { userId: session.user.id, role: "ADMIN" } },
        employees: {
          create: { userId: session.user.id, name: session.user.name, email: session.user.email, status: "ACTIVE", startDate: new Date() },
        },
        wallet: { create: { balance: 0, currency: parsed.data.currency, lowBalanceThreshold: 1000 } },
        integrations: {
          createMany: {
            data: [
              { kind: "CARD_ISSUER", provider: "mock", enabled: true },
              { kind: "ACCOUNTING", provider: "mock", enabled: true },
              { kind: "EMAIL", provider: "mock", enabled: true },
            ],
          },
        },
      },
    });
    await tx.auditLog.create({
      data: {
        orgId: org.id,
        actorId: session.user.id,
        actorEmail: session.user.email,
        action: "organisation.created",
        entityType: "Organisation",
        entityId: org.id,
        summary: `${session.user.name} created ${org.name}.`,
      },
    });
    return org;
  });

  redirect(`/dashboard?welcome=${encodeURIComponent(org.name)}`);
}

// ───────────── organisation settings ─────────────

const updateOrgSchema = z.object({
  name: z.string().trim().min(2, "Give the organisation a name.").max(80),
  currency: z.enum(["EUR", "USD", "GBP", "CHF"]),
});

export async function updateOrganisation(_prev: ActionState = idle, formData: FormData): Promise<ActionState> {
  try {
    const ctx = await requirePermission("settings:manage");
    const parsed = updateOrgSchema.safeParse({ name: formData.get("name"), currency: formData.get("currency") });
    if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsOf(parsed.error) };

    const before = { name: ctx.org.name, currency: ctx.org.currency };
    if (before.name === parsed.data.name && before.currency === parsed.data.currency) {
      return { ok: true, message: "Nothing changed." };
    }
    await prisma.$transaction(async (tx) => {
      await tx.organisation.update({ where: { id: ctx.org.id }, data: parsed.data });
      await recordAudit(
        ctx,
        {
          action: "organisation.updated",
          entityType: "Organisation",
          entityId: ctx.org.id,
          summary: `Organisation settings changed by ${ctx.user.name}.`,
          before,
          after: parsed.data,
        },
        tx,
      );
    });
    revalidatePath("/", "layout");
    return { ok: true, message: "Saved." };
  } catch (e) {
    return failure(e);
  }
}

// ───────────── members and roles ─────────────

const roleSchema = z.object({
  membershipId: z.string().min(1),
  role: z.enum(ROLES as [Role, ...Role[]]),
});

export async function updateMemberRole(_prev: ActionState = idle, formData: FormData): Promise<ActionState> {
  try {
    const ctx = await requirePermission("settings:manage");
    const parsed = roleSchema.safeParse({ membershipId: formData.get("membershipId"), role: formData.get("role") });
    if (!parsed.success) return { ok: false, error: "Pick a valid role." };

    const membership = await prisma.membership.findFirst({
      where: { id: parsed.data.membershipId, orgId: ctx.org.id },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!membership) return { ok: false, error: "That member is no longer in the organisation." };
    if (membership.role === parsed.data.role) return { ok: true, message: "Nothing changed." };

    if (membership.role === "ADMIN") {
      const admins = await prisma.membership.count({ where: { orgId: ctx.org.id, role: "ADMIN" } });
      if (admins <= 1) return { ok: false, error: "Keep at least one admin in the organisation." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.membership.update({ where: { id: membership.id }, data: { role: parsed.data.role } });
      await recordAudit(
        ctx,
        {
          action: "member.role_changed",
          entityType: "Membership",
          entityId: membership.id,
          summary: `${membership.user.name} is now ${parsed.data.role.toLowerCase()} (was ${membership.role.toLowerCase()}).`,
          before: { role: membership.role },
          after: { role: parsed.data.role },
        },
        tx,
      );
    });
    revalidatePath("/settings/roles");
    revalidatePath("/people");
    return { ok: true, message: `${membership.user.name} is now ${parsed.data.role.toLowerCase()}.` };
  } catch (e) {
    return failure(e);
  }
}

const inviteSchema = z.object({
  name: z.string().trim().min(2, "Enter their name.").max(80),
  email: z.email("Enter a valid email address.").transform((v) => v.toLowerCase()),
  role: z.enum(ROLES as [Role, ...Role[]]),
});

/**
 * Adds a person to the organisation. If they already have a Bledara account the
 * membership is created at once; otherwise they appear in People as onboarding and
 * get the role when they sign up with that email.
 */
export async function inviteMember(_prev: ActionState = idle, formData: FormData): Promise<ActionState> {
  try {
    const ctx = await requirePermission("settings:manage");
    const parsed = inviteSchema.safeParse({ name: formData.get("name"), email: formData.get("email"), role: formData.get("role") });
    if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsOf(parsed.error) };
    const { name, email, role } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const existing = await prisma.membership.findUnique({ where: { orgId_userId: { orgId: ctx.org.id, userId: user.id } } });
      if (existing) return { ok: false, fieldErrors: { email: "They are already a member." } };
    }

    await prisma.$transaction(async (tx) => {
      const employee = await tx.employee.upsert({
        where: { orgId_email: { orgId: ctx.org.id, email } },
        update: { name, userId: user?.id ?? undefined },
        create: { orgId: ctx.org.id, name, email, userId: user?.id ?? null, status: "ONBOARDING", startDate: new Date() },
      });
      if (user) {
        await tx.membership.create({ data: { orgId: ctx.org.id, userId: user.id, role } });
      }
      await tx.emailLog.create({
        data: {
          orgId: ctx.org.id,
          to: email,
          subject: `${ctx.user.name} added you to ${ctx.org.name} on Bledara`,
          body: `Hi ${name},\n\n${ctx.user.name} added you to ${ctx.org.name} as ${role.toLowerCase()}. Sign in at ${process.env.NEXT_PUBLIC_APP_URL ?? ""}/login with this email address.`,
        },
      });
      await recordAudit(
        ctx,
        {
          action: "member.invited",
          entityType: "Employee",
          entityId: employee.id,
          summary: `${name} (${email}) invited as ${role.toLowerCase()}.`,
          after: { email, role, linked: Boolean(user) },
        },
        tx,
      );
    });
    revalidatePath("/settings/roles");
    revalidatePath("/people");
    return { ok: true, message: user ? `${name} added.` : `${name} invited. They get the role when they sign up.` };
  } catch (e) {
    return failure(e);
  }
}

export async function removeMember(_prev: ActionState = idle, formData: FormData): Promise<ActionState> {
  try {
    const ctx = await requirePermission("settings:manage");
    const membershipId = String(formData.get("membershipId") ?? "");
    const membership = await prisma.membership.findFirst({
      where: { id: membershipId, orgId: ctx.org.id },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!membership) return { ok: false, error: "That member is no longer in the organisation." };
    if (membership.userId === ctx.user.id) return { ok: false, error: "You cannot remove yourself." };

    await prisma.$transaction(async (tx) => {
      await tx.membership.delete({ where: { id: membership.id } });
      await recordAudit(
        ctx,
        {
          action: "member.removed",
          entityType: "Membership",
          entityId: membership.id,
          summary: `${membership.user.name} (${membership.user.email}) removed from the organisation.`,
          before: { role: membership.role },
        },
        tx,
      );
    });
    revalidatePath("/settings/roles");
    return { ok: true, message: `${membership.user.name} removed.` };
  } catch (e) {
    return failure(e);
  }
}
