import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireContext } from "@/lib/tenant";
import { can } from "@/lib/permissions";
import { CATEGORY_LABELS, CYCLE_LABELS, daysUntil, formatDate, formatMoneyExact } from "@/lib/format";
import { NoAccess } from "@/components/no-access";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Subscription" };

export default async function SubscriptionDetailPage(props: PageProps<"/subscriptions/[id]">) {
  const ctx = await requireContext();
  if (!can(ctx.role, "subscription:read")) return <NoAccess what="the inventory" />;
  const { id } = await props.params;

  const sub = await prisma.subscription.findFirst({
    where: { id, orgId: ctx.org.id },
    include: {
      vendor: true,
      owner: { select: { name: true, email: true } },
      team: { select: { name: true } },
      card: { select: { last4: true, status: true, amountLimit: true, limitFrequency: true } },
      transactions: { orderBy: { occurredAt: "desc" }, take: 6 },
      _count: { select: { toolAccess: { where: { revokedAt: null } }, documents: true } },
    },
  });
  if (!sub) notFound();

  const days = daysUntil(sub.renewalDate);
  const facts: [string, React.ReactNode][] = [
    ["Vendor", sub.vendor.name],
    ["Plan", sub.plan],
    ["Category", CATEGORY_LABELS[sub.category]],
    ["Team", sub.team?.name ?? "—"],
    ["Owner", sub.owner ? `${sub.owner.name}` : "—"],
    ["Billing", `${formatMoneyExact(sub.cost, sub.currency)} ${CYCLE_LABELS[sub.billingCycle].toLowerCase()}`],
    ["Renews", `${formatDate(sub.renewalDate)} (${days >= 0 ? `in ${days} days` : `${-days} days ago`})`],
    ["Seats", sub.seats ? `${sub._count.toolAccess} of ${sub.seats} in use` : "Not seat based"],
    ["Started", formatDate(sub.startedAt)],
    ["Documents", String(sub._count.documents)],
  ];

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 mb-3" render={<Link href="/subscriptions" />}>
        <ArrowLeftIcon /> All subscriptions
      </Button>
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
              {sub.card ? (
                <p>
                  <span className="font-mono">•••• {sub.card.last4}</span> · {sub.card.status.toLowerCase()} · limit{" "}
                  {formatMoneyExact(sub.card.amountLimit, sub.currency)} {sub.card.limitFrequency.toLowerCase().replace("_", " ")}
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
              {sub.transactions.length === 0 ? (
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
                    {sub.transactions.map((t) => (
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
