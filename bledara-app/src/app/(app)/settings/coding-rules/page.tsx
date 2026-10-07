"use client";

import { CalculatorIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { EmptyState } from "@/components/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CodingRulesPage() {
  const { data } = useStore();
  const vendors = new Map(data.vendors.map((v) => [v.id, v.name]));
  const rules = [...data.codingRules].sort((a, b) => (vendors.get(a.vendorId) ?? "").localeCompare(vendors.get(b.vendorId) ?? ""));
  const ruled = new Set(rules.map((r) => r.vendorId));
  const uncoded = data.vendors
    .filter((v) => !ruled.has(v.id) && data.subscriptions.some((s) => s.vendorId === v.id && s.status !== "CANCELLED"))
    .map((v) => v.name)
    .sort();

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
            <span className="text-foreground">{uncoded.length} vendors have no rule yet:</span> {uncoded.join(", ")}.
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
                <TableCell className="font-medium">{vendors.get(r.vendorId)}</TableCell>
                <TableCell className="text-muted-foreground">{r.account}</TableCell>
                <TableCell className="tabular text-right">{r.taxRate}%</TableCell>
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
