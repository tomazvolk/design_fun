"use client";

import { InboxIcon } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";
import { Gate } from "@/components/gate";

export default function Page() {
  return (
    <Gate permission="request:create" what="requests">
      <ComingSoon
        title="Requests"
        description="Ask for a tool, get it approved along the chain your organisation configured, and receive a card when it is."
        step={4}
        icon={InboxIcon}
        will={[
        "Request form: tool, plan, cost, reason and start date, with a warning if a similar tool exists.",
        "Approval chains by amount, team and category, with email at each step.",
        "On final approval the subscription is created and a card issued with a matching limit.",        ]}
      />
    </Gate>
  );
}
