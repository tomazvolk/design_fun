import Link from "next/link";
import { LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";

export function NoAccess({ what = "this page" }: { what?: string }) {
  return (
    <EmptyState
      icon={LockIcon}
      title="No access"
      description={`Your role does not include ${what}. An admin can change roles in Settings.`}
      action={<Button variant="outline" render={<Link href="/dashboard" />}>Back to the dashboard</Button>}
    />
  );
}
