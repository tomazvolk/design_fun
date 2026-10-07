"use client";

import { UsersIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { ROLE_LABELS } from "@/lib/permissions";
import { formatDate, initials } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Gate } from "@/components/gate";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS: Record<string, string> = { ACTIVE: "Active", ONBOARDING: "Onboarding", OFFBOARDING: "Offboarding", OFFBOARDED: "Left" };
const ORDER: Record<string, number> = { ONBOARDING: 0, ACTIVE: 1, OFFBOARDING: 2, OFFBOARDED: 3 };

export default function PeoplePage() {
  const { data, employees, members } = useStore();
  const teams = new Map(data.teams.map((t) => [t.id, t.name]));
  const roleByUser = new Map(members.map((m) => [m.userId, m.role]));
  const toolCount = new Map<string, number>();
  for (const a of data.toolAccess) toolCount.set(a.employeeId, (toolCount.get(a.employeeId) ?? 0) + 1);
  const people = [...employees].sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.name.localeCompare(b.name));

  return (
    <Gate permission="people:read" what="people">
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
                    <TableCell className="hidden text-muted-foreground md:table-cell">{(p.teamId && teams.get(p.teamId)) || "—"}</TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">{formatDate(p.startDate)}</TableCell>
                    <TableCell className="tabular text-right">{toolCount.get(p.id) ?? 0}</TableCell>
                    <TableCell>{role ? <Badge variant="secondary">{ROLE_LABELS[role]}</Badge> : <span className="text-xs text-muted-foreground">No login</span>}</TableCell>
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
    </Gate>
  );
}
