import type { Metadata } from "next";
import Link from "next/link";
import { ScrollTextIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireContext } from "@/lib/tenant";
import { can } from "@/lib/permissions";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { NoAccess } from "@/components/no-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Audit log" };
const PAGE_SIZE = 50;

export default async function AuditLogPage(props: PageProps<"/audit-log">) {
  const ctx = await requireContext();
  if (!can(ctx.role, "audit:read")) return <NoAccess what="the audit log" />;
  const sp = await props.searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { orgId: ctx.org.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { actor: { select: { name: true } } },
    }),
    prisma.auditLog.count({ where: { orgId: ctx.org.id } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader title="Audit log" description="Every approval, card action and settings change, who did it and when. Entries are never edited or deleted." />
      {entries.length === 0 ? (
        <EmptyState icon={ScrollTextIcon} title="Nothing recorded yet" description="Change a role or a setting and it shows up here." />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Who</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="tabular whitespace-nowrap text-muted-foreground">{formatDateTime(e.createdAt)}</TableCell>
                    <TableCell className="whitespace-nowrap">{e.actor?.name ?? e.actorEmail ?? "System"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[11px]">
                        {e.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">{e.summary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {total} {total === 1 ? "entry" : "entries"} · page {page} of {pages}
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page <= 1} render={<Link href={`/audit-log?page=${page - 1}`} aria-disabled={page <= 1} />}>
                Newer
              </Button>
              <Button variant="outline" size="sm" disabled={page >= pages} render={<Link href={`/audit-log?page=${page + 1}`} aria-disabled={page >= pages} />}>
                Older
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
