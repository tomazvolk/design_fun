import type { Metadata } from "next";
import { CalendarClockIcon } from "lucide-react";
import { requireContext } from "@/lib/tenant";
import { can } from "@/lib/permissions";
import { ComingSoon } from "@/components/coming-soon";
import { NoAccess } from "@/components/no-access";

export const metadata: Metadata = { title: "Renewals" };

export default async function RenewalsPage() {
  const ctx = await requireContext();
  if (!can(ctx.role, "renewal:read")) return <NoAccess what="renewals" />;
  return (
    <ComingSoon
      title="Renewals"
      description="A calendar and list of what renews when, with reminders and a recorded decision for each."
      step={5}
      icon={CalendarClockIcon}
      will={[
        "Reminders 60, 30 and 7 days before each renewal.",
        "Owners record renew, downgrade or cancel; cancel freezes the card and opens a task.",
        "Price changes flagged against the previous charge.",
      ]}
    />
  );
}
