import type { Metadata } from "next";
import { CreditCardIcon } from "lucide-react";
import { requireContext } from "@/lib/tenant";
import { can } from "@/lib/permissions";
import { ComingSoon } from "@/components/coming-soon";
import { NoAccess } from "@/components/no-access";

export const metadata: Metadata = { title: "Cards" };

export default async function CardsPage() {
  const ctx = await requireContext();
  if (!can(ctx.role, "card:read")) return <NoAccess what="cards" />;
  return (
    <ComingSoon
      title="Cards"
      description="One virtual card per subscription, locked to its vendor and capped by amount and frequency."
      step={3}
      icon={CreditCardIcon}
      will={[
        "Create, freeze, unfreeze and cancel cards through the CardProvider interface (mock issuer first).",
        "Wallet balance with top-ups and a low-balance alert.",
        "Simulated charges that land in Transactions.",
      ]}
    />
  );
}
