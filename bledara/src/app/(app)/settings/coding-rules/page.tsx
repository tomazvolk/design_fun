import type { Metadata } from "next";
import { CalculatorIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireContext } from "@/lib/tenant";
import { EmptyState } from "@/components/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Coding rules" };

export default async function CodingRulesPage() {
  const ctx = await requireContext();
  const [rules, uncoded] = await Promise.all([
    prisma.codingRule.findMany({ where: { orgId: ctx.org.id }, include: { vendor: { select: { name: true } } }, orderBy: { vendor: { name: "asc" } } }),
    prisma.vendor.findMany({ where: { orgId: ctx.org.id, codingRule: null, subscriptions: { some: { status: { not: "CANCELLED" } } } }, select: { name: true }, orderBy: { name: "asc" } }),
  ]);

  if (rules.length === 0) {
    return <EmptyState icon={CalculatorIcon} title="No coding rules" description="A rule per vendor sets the account, tax rate and cost centre for every charge. Editing arrives in build step 6." />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Each charge from a vendor is coded with its rule. Charges with no rule land in the exception queue (build step 6).
        {uncoded.length > 0 && (
          <>
            {" "}
            <span className="text-foreground">{uncoded.length} vendors have no rule yet:</span> {uncoded.map((v) => v.name).join(", ")}.
          </>
        )}
      </p>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Tax rate</TableHead>
              <TableHead>Cost centre</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.vendor.name}</TableCell>
                <TableCell className="text-muted-foreground">{r.account}</TableCell>
                <TableCell className="tabular text-right">{Number(r.taxRate)}%</TableCell>
                <TableCell>
                  <code className="font-mono text-xs">{r.costCentre}</code>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
