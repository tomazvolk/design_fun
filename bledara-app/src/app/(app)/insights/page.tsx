"use client";

import { ChartColumnIcon } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";
import { Gate } from "@/components/gate";

export default function Page() {
  return (
    <Gate permission="insights:read" what="insights">
      <ComingSoon
        title="Insights"
        description="Where the money goes, where it is going, and what could be saved."
        step={7}
        icon={ChartColumnIcon}
        will={[
        "Spend by team, category, owner and vendor, with the month-over-month trend.",
        "A 12-month forecast from renewal dates and billing cycles.",
        "A savings list: unused seats, duplicate tools and price increases.",        ]}
      />
    </Gate>
  );
}
