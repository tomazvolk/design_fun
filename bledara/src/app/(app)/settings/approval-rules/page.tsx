import type { Metadata } from "next";
import { GitBranchIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireContext } from "@/lib/tenant";
import { CATEGORY_LABELS, formatMoney } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/permissions";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Approval rules" };

export default async function ApprovalRulesPage() {
  const ctx = await requireContext();
  const rules = await prisma.approvalRule.findMany({
    where: { orgId: ctx.org.id },
    include: { team: { select: { name: true } }, steps: { orderBy: { order: "asc" }, include: { approver: { select: { name: true } } } } },
    orderBy: { priority: "asc" },
  });

  if (rules.length === 0) {
    return <EmptyState icon={GitBranchIcon} title="No approval rules" description="Without rules, every request goes to an admin. Rule editing arrives in build step 4." />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Rules are tried from the lowest priority number up; the first match decides the chain. Editing arrives in build step 4.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {rules.map((r) => (
          <Card key={r.id} size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {r.name}
                {!r.active && <Badge variant="outline">off</Badge>}
              </CardTitle>
              <CardDescription>
                {[
                  r.minAmount != null && `from ${formatMoney(r.minAmount, ctx.org.currency)}`,
                  r.maxAmount != null && `up to ${formatMoney(r.maxAmount, ctx.org.currency)}`,
                  r.team && `team ${r.team.name}`,
                  r.category && CATEGORY_LABELS[r.category],
                ]
                  .filter(Boolean)
                  .join(" · ") || "Any request"}
                <span className="ml-2 font-mono text-xs">priority {r.priority}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="flex flex-wrap items-center gap-1.5 text-sm">
                {r.steps.map((s, i) => (
                  <li key={s.id} className="flex items-center gap-1.5">
                    <Badge variant="secondary">{s.approver ? s.approver.name : s.role ? ROLE_LABELS[s.role] : "Anyone"}</Badge>
                    {i < r.steps.length - 1 && <span aria-hidden="true" className="text-muted-foreground">→</span>}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
