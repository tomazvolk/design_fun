"use client";

import Link from "next/link";
import { ArrowLeftIcon, SearchXIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { CATEGORY_LABELS, CYCLE_LABELS, daysUntil, formatDate, formatMoneyExact } from "@/lib/format";
import { Gate } from "@/components/gate";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function SubscriptionDetail({ id }: { id: string }) {
  const { data } = useStore();
  const sub = data.subscriptions.find((s) => s.id === id);

  return (
    <Gate permission="subscription:read" what="the inventory">
      <Button variant="ghost" size="sm" className="-ml-2 mb-3" render={<Link href="/subscriptions" />}>
        <ArrowLeftIcon /> All subscriptions
      </Button>
      {!sub ? (
        <EmptyState icon={SearchXIcon} title="Subscription not found" description="It may belong to another organisation, or it was removed." />
      ) : (
        <Detail sub={sub} />
      )}
    </Gate>
  );
}

function Detail({ sub }: { sub: NonNullable<ReturnType<typeof useStore>["data"]["subscriptions"][number]> }) {
  const { data, employees } = useStore();
  const vendor = data.vendors.find((v) => v.id === sub.vendorId);
  const team = data.teams.find((t) => t.id === sub.teamId);
  const owner = employees.find((e) => e.id === sub.ownerId);
  const card = data.cards.find((c) => c.subscriptionId === sub.id);
  const seatsInUse = data.toolAccess.filter((a) => a.subscriptionId === sub.id).length;
  const txs = data.transactions
    .filter((t) => t.subscriptionId === sub.id)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, 6);
  const days = daysUntil(new Date(sub.renewalDate));

  const facts: [string, React.ReactNode][] = [
    ["Vendor", vendor?.name ?? "—"],
    ["Plan", sub.plan],
    ["Category", CATEGORY_LABELS[sub.category]],
    ["Team", team?.name ?? "—"],
    ["Owner", owner?.name ?? "—"],
    ["Billing", `${formatMoneyExact(sub.cost, sub.currency)} ${CYCLE_LABELS[sub.billingCycle].toLowerCase()}`],
    ["Renews", `${formatDate(sub.renewalDate)} (${days >= 0 ? `in ${days} days` : `${-days} days ago`})`],
    ["Seats", sub.seats ? `${seatsInUse} of ${sub.seats} in use` : "Not seat based"],
    ["Started", formatDate(sub.startedAt)],
  ];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{sub.name}</h1>
        <StatusBadge status={sub.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Editing, documents and renewal decisions arrive in build steps 2 and 5.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              {facts.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="tabular">{v}</dd>
                </div>
              ))}
            </dl>
            {sub.notes && <p className="mt-4 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">{sub.notes}</p>}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Virtual card</CardTitle>
              <CardDescription>Freeze, unfreeze and limits arrive in build step 3.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              {card ? (
                <p>
                  <span className="font-mono">•••• {card.last4}</span> · {card.status.toLowerCase()} · limit {formatMoneyExact(card.amountLimit, sub.currency)}{" "}
                  {card.limitFrequency.toLowerCase().replace("_", " ")}
                </p>
              ) : (
                <p className="text-muted-foreground">No card issued for this subscription.</p>
              )}
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Recent charges</CardTitle>
              <CardDescription>The last six charges on this subscription&rsquo;s card.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {txs.length === 0 ? (
                <p className="px-3 text-sm text-muted-foreground">No charges yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-3">Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="pr-3 text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {txs.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="pl-3 text-muted-foreground">{formatDate(t.occurredAt)}</TableCell>
                        <TableCell className="font-mono text-xs">{t.description}</TableCell>
                        <TableCell className="tabular pr-3 text-right">
                          {formatMoneyExact(t.amount, t.currency)}
                          {t.status !== "SETTLED" && <span className="block text-xs text-muted-foreground">{t.status.toLowerCase()}</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
