"use client";

import Link from "next/link";
import { ArrowRightIcon, SparklesIcon, XIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { daysFromNow, formatMoney, monthlyEquivalent } from "@/lib/format";
import { NAV } from "@/components/app/nav";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STEPS: [string, number, boolean][] = [
  ["Data model, auth, roles, seed data", 1, true],
  ["Inventory and dashboard", 2, false],
  ["Cards and transactions (mocked issuer)", 3, false],
  ["Requests and approvals", 4, false],
  ["Renewals", 5, false],
  ["Accounting automation", 6, false],
  ["Insights and access management", 7, false],
];

export default function DashboardPage() {
  const { session, org, data, employees, can, justCreated, dismissCreated } = useStore();
  if (!session) return null;

  const in30 = daysFromNow(30).toISOString();
  const live = data.subscriptions.filter((s) => s.status === "ACTIVE" || s.status === "TRIAL" || s.status === "PENDING_CANCELLATION");
  const monthly = live.reduce((sum, s) => sum + monthlyEquivalent(s.cost, s.billingCycle), 0);
  const renewingSoon = data.subscriptions.filter((s) => s.status === "ACTIVE" && s.renewalDate <= in30).length;
  const pending = data.requests.filter((r) => r.status === "PENDING").length;
  const people = employees.filter((e) => e.status !== "OFFBOARDED").length;
  const upcoming = NAV.filter((n) => n.step && can(n.permission));
  const first = session.name.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Good day, ${first}`}
        description={`${org.name} at a glance. Full spend insights arrive in build step 7; these figures come straight from the inventory.`}
      />

      {justCreated && (
        <Alert className="mb-6">
          <SparklesIcon />
          <AlertTitle>{org.name} is ready</AlertTitle>
          <AlertDescription>Start by adding people in Settings → Roles. Recording subscriptions and importing a transaction CSV arrive in build step 2.</AlertDescription>
          <AlertAction>
            <Button variant="ghost" size="icon-sm" aria-label="Dismiss" onClick={dismissCreated}>
              <XIcon />
            </Button>
          </AlertAction>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active subscriptions" value={live.length} hint="Active, trial and cancelling" />
        <StatCard label="Monthly run-rate" value={formatMoney(monthly, org.currency)} hint={`${formatMoney(monthly * 12, org.currency)} a year`} />
        <StatCard label="Renewing in 30 days" value={renewingSoon} hint="Reminders go out at 60, 30 and 7 days" />
        <StatCard label="Pending requests" value={pending} hint={`${people} ${people === 1 ? "person" : "people"} in the organisation`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[3fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Build progress</CardTitle>
            <CardDescription>Step 1 is live as a prototype on dummy data: model, accounts, roles and the demo organisation. Everything else lands in order.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              {STEPS.map(([label, step, done]) => (
                <li key={step} className="flex items-center gap-3">
                  <span
                    className={
                      done
                        ? "flex size-6 items-center justify-center rounded-full bg-primary font-mono text-[11px] text-primary-foreground"
                        : "flex size-6 items-center justify-center rounded-full border font-mono text-[11px] text-muted-foreground"
                    }
                  >
                    {step}
                  </span>
                  <span className={done ? "" : "text-muted-foreground"}>{label}</span>
                  {done && (
                    <Badge variant="secondary" className="ml-auto">
                      live
                    </Badge>
                  )}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What you can do now</CardTitle>
            <CardDescription>Pages that already run on the inventory.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {NAV.filter((n) => !n.step && n.href !== "/dashboard" && can(n.permission)).map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {n.label}
                <ArrowRightIcon className="size-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            ))}
            {upcoming.length > 0 && <p className="mt-3 px-2.5 text-xs text-muted-foreground">Coming next: {upcoming.map((n) => n.label).join(", ")}.</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
