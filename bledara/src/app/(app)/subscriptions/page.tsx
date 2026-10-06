import type { Metadata } from "next";
import Link from "next/link";
import { BoxesIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireContext } from "@/lib/tenant";
import { can } from "@/lib/permissions";
import { CATEGORY_LABELS, CYCLE_LABELS, formatDate, formatMoney, STATUS_LABELS } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { NoAccess } from "@/components/no-access";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";

export const metadata: Metadata = { title: "Subscriptions" };

export default async function SubscriptionsPage() {
  const ctx = await requireContext();
  if (!can(ctx.role, "subscription:read")) return <NoAccess what="the inventory" />;

  const subs = await prisma.subscription.findMany({
    where: { orgId: ctx.org.id },
    include: { vendor: { select: { name: true } }, owner: { select: { name: true } }, team: { select: { name: true } } },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Subscriptions"
        description="Every tool the organisation pays for. Search, filters, CSV import and duplicate flags arrive in build step 2; this is the seeded inventory as it stands."
      />
      {subs.length === 0 ? (
        <EmptyState
          icon={BoxesIcon}
          title="No subscriptions yet"
          description="Record the first one by hand or import a CSV of card transactions once build step 2 lands."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Team</TableHead>
                <TableHead className="hidden lg:table-cell">Owner</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="hidden sm:table-cell">Renews</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link href={`/subscriptions/${s.id}`} className="font-medium underline-offset-4 hover:underline">
                      {s.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {s.vendor.name} · {s.plan}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{CATEGORY_LABELS[s.category]}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{s.team?.name ?? "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{s.owner?.name ?? "—"}</TableCell>
                  <TableCell className="tabular text-right">
                    {formatMoney(s.cost, s.currency)}
                    <span className="block text-xs text-muted-foreground">{CYCLE_LABELS[s.billingCycle].toLowerCase()}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{formatDate(s.renewalDate)}</TableCell>
                  <TableCell>
                    <StatusBadge status={s.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        {subs.length} subscriptions · {Object.values(STATUS_LABELS).length} possible statuses
      </p>
    </>
  );
}
