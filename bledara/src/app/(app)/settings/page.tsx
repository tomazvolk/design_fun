import type { Metadata } from "next";
import { requireContext } from "@/lib/tenant";
import { can } from "@/lib/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganisationForm } from "./organisation-form";

export const metadata: Metadata = { title: "Organisation settings" };

export default async function OrganisationSettingsPage() {
  const ctx = await requireContext();
  const editable = can(ctx.role, "settings:manage");
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Organisation</CardTitle>
          <CardDescription>The name people see and the currency totals are reported in.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrganisationForm name={ctx.org.name} currency={ctx.org.currency} editable={editable} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Invoice inbox</CardTitle>
          <CardDescription>Forward supplier invoices here and they attach themselves to the matching charge (build step 6, mocked).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <code className="block rounded-lg bg-muted px-3 py-2 font-mono text-xs break-all">{ctx.org.inboxAddress}</code>
          <p className="text-muted-foreground">
            Workspace id <code className="font-mono">{ctx.org.slug}</code>. Created {ctx.org.createdAt.toLocaleDateString("en-GB")}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
