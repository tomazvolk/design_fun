"use client";

import Link from "next/link";
import { BoxesIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { CATEGORY_LABELS, CYCLE_LABELS, formatDate, formatMoney } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Gate } from "@/components/gate";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";

const STATUS_ORDER = { ACTIVE: 0, TRIAL: 1, PENDING_CANCELLATION: 2, PAUSED: 3, CANCELLED: 4 };

export default function SubscriptionsPage() {
  const { data, employees } = useStore();
  const vendors = new Map(data.vendors.map((v) => [v.id, v]));
  const teams = new Map(data.teams.map((t) => [t.id, t]));
  const owners = new Map(employees.map((e) => [e.id, e]));
  const subs = [...data.subscriptions].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.name.localeCompare(b.name));

  return (
    <Gate permission="subscription:read" what="the inventory">
      <PageHeader
        title="Subscriptions"
        description="Every tool the organisation pays for. Search, filters, CSV import and duplicate flags arrive in build step 2; this is the inventory as it stands."
      />
      {subs.length === 0 ? (
        <EmptyState icon={BoxesIcon} title="No subscriptions yet" description="Record the first one by hand or import a CSV of card transactions once build step 2 lands." />
      ) : (
        <>
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
                        {vendors.get(s.vendorId)?.name} · {s.plan}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{CATEGORY_LABELS[s.category]}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">{(s.teamId && teams.get(s.teamId)?.name) || "—"}</TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">{(s.ownerId && owners.get(s.ownerId)?.name) || "—"}</TableCell>
                    <TableCell className="tabular text-right">
                      {formatMoney(s.cost, s.currency)}
                      <span className="block text-xs text-muted-foreground">{CYCLE_LABELS[s.billingCycle].toLowerCase()}</span>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDate(s.renewalDate)}</TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{subs.length} subscriptions</p>
        </>
      )}
    </Gate>
  );
}
