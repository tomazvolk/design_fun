"use client";

import { CalendarClockIcon } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";
import { Gate } from "@/components/gate";

export default function Page() {
  return (
    <Gate permission="renewal:read" what="renewals">
      <ComingSoon
        title="Renewals"
        description="A calendar and list of what renews when, with reminders and a recorded decision for each."
        step={5}
        icon={CalendarClockIcon}
        will={[
        "Reminders 60, 30 and 7 days before each renewal.",
        "Owners record renew, downgrade or cancel",
        " cancel freezes the card and opens a task.",
        "Price changes flagged against the previous charge.",        ]}
      />
    </Gate>
  );
}
