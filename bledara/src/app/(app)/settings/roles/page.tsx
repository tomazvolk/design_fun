import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireContext } from "@/lib/tenant";
import { can, ROLE_DESCRIPTIONS, ROLE_LABELS, ROLES } from "@/lib/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MemberRow } from "./member-row";
import { InviteForm } from "./invite-form";

export const metadata: Metadata = { title: "Roles" };

export default async function RolesPage() {
  const ctx = await requireContext();
  const editable = can(ctx.role, "settings:manage");
  const members = await prisma.membership.findMany({
    where: { orgId: ctx.org.id },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
  const adminCount = members.filter((m) => m.role === "ADMIN").length;

  return (
    <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              {members.length} {members.length === 1 ? "person" : "people"} can sign in. Every role change is written to the audit log.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="pr-4 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <MemberRow
                    key={m.id}
                    membershipId={m.id}
                    name={m.user.name}
                    email={m.user.email}
                    role={m.role}
                    isSelf={m.user.id === ctx.user.id}
                    isLastAdmin={m.role === "ADMIN" && adminCount <= 1}
                    editable={editable}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {editable && (
          <Card>
            <CardHeader>
              <CardTitle>Add someone</CardTitle>
              <CardDescription>If they already have a Bledara account they get in straight away. Otherwise they are listed in People as onboarding until they sign up.</CardDescription>
            </CardHeader>
            <CardContent>
              <InviteForm />
            </CardContent>
          </Card>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>What each role can do</CardTitle>
          <CardDescription>Checked on the server for every page and action.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            {ROLES.map((r) => (
              <div key={r}>
                <dt className="font-medium">{ROLE_LABELS[r]}</dt>
                <dd className="text-muted-foreground">{ROLE_DESCRIPTIONS[r]}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
