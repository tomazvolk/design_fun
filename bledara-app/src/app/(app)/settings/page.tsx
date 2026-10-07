"use client";

import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganisationForm } from "./organisation-form";

export default function OrganisationSettingsPage() {
  const { org, can } = useStore();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Organisation</CardTitle>
          <CardDescription>The name people see and the currency totals are reported in.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrganisationForm key={`${org.name}|${org.currency}`} name={org.name} currency={org.currency} editable={can("settings:manage")} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Invoice inbox</CardTitle>
          <CardDescription>Forward supplier invoices here and they attach themselves to the matching charge (build step 6, mocked).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <code className="block rounded-lg bg-muted px-3 py-2 font-mono text-xs break-all">{org.inboxAddress}</code>
          <p className="text-muted-foreground">
            Workspace id <code className="font-mono">{org.slug}</code>. Created {formatDate(org.createdAt)}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
