import type { Metadata } from "next";
import { ChartColumnIcon } from "lucide-react";
import { requireContext } from "@/lib/tenant";
import { can } from "@/lib/permissions";
import { ComingSoon } from "@/components/coming-soon";
import { NoAccess } from "@/components/no-access";

export const metadata: Metadata = { title: "Insights" };

export default async function InsightsPage() {
  const ctx = await requireContext();
  if (!can(ctx.role, "insights:read")) return <NoAccess what="insights" />;
  return (
    <ComingSoon
      title="Insights"
      description="Where the money goes, where it is going, and what could be saved."
      step={7}
      icon={ChartColumnIcon}
      will={[
        "Spend by team, category, owner and vendor, with the month-over-month trend.",
        "A 12-month forecast from renewal dates and billing cycles.",
        "A savings list: unused seats, duplicate tools and price increases.",
      ]}
    />
  );
}
