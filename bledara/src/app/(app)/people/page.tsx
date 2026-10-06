import type { Metadata } from "next";
import { UsersIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireContext } from "@/lib/tenant";
import { can, ROLE_LABELS } from "@/lib/permissions";
import { formatDate, initials } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { NoAccess } from "@/components/no-access";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "People" };

const STATUS: Record<string, string> = {
  ACTIVE: "Active",
  ONBOARDING: "Onboarding",
  OFFBOARDING: "Offboarding",
  OFFBOARDED: "Left",
};

export default async function PeoplePage() {
  const ctx = await requireContext();
  if (!can(ctx.role, "people:read")) return <NoAccess what="people" />;

  const [people, memberships] = await Promise.all([
    prisma.employee.findMany({
      where: { orgId: ctx.org.id },
      include: { team: { select: { name: true } }, _count: { select: { toolAccess: { where: { revokedAt: null } } } } },
      orderBy: [{ status: "asc" }, { name: "asc" }],
    }),
    prisma.membership.findMany({ where: { orgId: ctx.org.id }, select: { userId: true, role: true } }),
  ]);
  const roleByUser = new Map(memberships.map((m) => [m.userId, m.role]));

  return (
    <>
      <PageHeader
        title="People"
        description="Everyone in the organisation, the tools they hold and whether they can sign in. Per-tool seat lists and onboarding checklists arrive in build step 7."
      />
      {people.length === 0 ? (
        <EmptyState icon={UsersIcon} title="Nobody here yet" description="Invite people from Settings → Roles. They show up here with their tools once access is recorded." />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead className="hidden md:table-cell">Team</TableHead>
                <TableHead className="hidden lg:table-cell">Started</TableHead>
                <TableHead className="text-right">Tools</TableHead>
                <TableHead>Login role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.map((p) => {
                const role = p.userId ? roleByUser.get(p.userId) : undefined;
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-[11px]">{initials(p.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{p.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{p.title ?? p.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{p.team?.name ?? "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{formatDate(p.startDate)}</TableCell>
                    <TableCell className="tabular text-right">{p._count.toolAccess}</TableCell>
                    <TableCell>
                      {role ? <Badge variant="secondary">{ROLE_LABELS[role]}</Badge> : <span className="text-xs text-muted-foreground">No login</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{STATUS[p.status]}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
