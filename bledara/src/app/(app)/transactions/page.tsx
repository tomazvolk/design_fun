import type { Metadata } from "next";
import { ReceiptIcon } from "lucide-react";
import { requireContext } from "@/lib/tenant";
import { can } from "@/lib/permissions";
import { ComingSoon } from "@/components/coming-soon";
import { NoAccess } from "@/components/no-access";

export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage() {
  const ctx = await requireContext();
  if (!can(ctx.role, "transaction:read")) return <NoAccess what="transactions" />;
  return (
    <ComingSoon
      title="Transactions"
      description="Every charge, with its invoice and accounting code, and a queue for the ones missing either."
      step={3}
      icon={ReceiptIcon}
      will={[
        "Card charges from the mock issuer, plus CSV imports.",
        "Invoices attached by upload or forwarded to the organisation inbox address (step 6).",
        "Coding rules per vendor and an exception queue (step 6).",
      ]}
    />
  );
}
