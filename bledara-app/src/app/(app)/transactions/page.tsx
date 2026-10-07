"use client";

import { ReceiptIcon } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";
import { Gate } from "@/components/gate";

export default function Page() {
  return (
    <Gate permission="transaction:read" what="transactions">
      <ComingSoon
        title="Transactions"
        description="Every charge, with its invoice and accounting code, and a queue for the ones missing either."
        step={3}
        icon={ReceiptIcon}
        will={[
        "Card charges from the mock issuer, plus CSV imports.",
        "Invoices attached by upload or forwarded to the organisation inbox address (step 6).",
        "Coding rules per vendor and an exception queue (step 6).",        ]}
      />
    </Gate>
  );
}
