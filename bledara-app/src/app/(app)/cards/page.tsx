"use client";

import { CreditCardIcon } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";
import { Gate } from "@/components/gate";

export default function Page() {
  return (
    <Gate permission="card:read" what="cards">
      <ComingSoon
        title="Cards"
        description="One virtual card per subscription, locked to its vendor and capped by amount and frequency."
        step={3}
        icon={CreditCardIcon}
        will={[
        "Create, freeze, unfreeze and cancel cards through the CardProvider interface (mock issuer first).",
        "Wallet balance with top-ups and a low-balance alert.",
        "Simulated charges that land in Transactions.",        ]}
      />
    </Gate>
  );
}
