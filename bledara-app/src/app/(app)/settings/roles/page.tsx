"use client";

import { useStore } from "@/lib/store";
import { ROLE_DESCRIPTIONS, ROLE_LABELS, ROLES } from "@/lib/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MemberRow } from "./member-row";
import { InviteForm } from "./invite-form";

const ROLE_ORDER = { ADMIN: 0, FINANCE: 1, IT: 2, OWNER: 3, EMPLOYEE: 4 };

export default function RolesPage() {
  const { session, members, can } = useStore();
  const editable = can("settings:manage");
  const sorted = [...members].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.createdAt.localeCompare(b.createdAt));
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
                {sorted.map((m) => (
                  <MemberRow
                    key={m.id}
                    membershipId={m.id}
                    name={m.user.name}
                    email={m.user.email}
                    role={m.role}
                    isSelf={m.userId === session?.id}
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
              <CardDescription>They appear in People and can sign in straight away. In the prototype their password is the demo password.</CardDescription>
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
          <CardDescription>Checked for every page and action.</CardDescription>
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
