"use client";

import { GitBranchIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { CATEGORY_LABELS, formatMoney } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/permissions";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApprovalRulesPage() {
  const { org, data, employees } = useStore();
  const rules = [...data.approvalRules].sort((a, b) => a.priority - b.priority);
  const teams = new Map(data.teams.map((t) => [t.id, t.name]));
  const people = new Map(employees.map((e) => [e.id, e.name]));

  if (rules.length === 0) {
    return <EmptyState icon={GitBranchIcon} title="No approval rules" description="Without rules, every request goes to an admin. Rule editing arrives in build step 4." />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Rules are tried from the lowest priority number up; the first match decides the chain. Editing arrives in build step 4.</p>
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
                  r.minAmount != null && `from ${formatMoney(r.minAmount, org.currency)}`,
                  r.maxAmount != null && `up to ${formatMoney(r.maxAmount, org.currency)}`,
                  r.teamId && `team ${teams.get(r.teamId)}`,
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
                  <li key={s.order} className="flex items-center gap-1.5">
                    <Badge variant="secondary">{s.approverId ? (people.get(s.approverId) ?? "Named approver") : s.role ? ROLE_LABELS[s.role] : "Anyone"}</Badge>
                    {i < r.steps.length - 1 && (
                      <span aria-hidden="true" className="text-muted-foreground">
                        →
                      </span>
                    )}
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
