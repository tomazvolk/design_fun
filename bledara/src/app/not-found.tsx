import Link from "next/link";
import { CompassIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <EmptyState
        icon={CompassIcon}
        title="Nothing here"
        description="The page you were after does not exist, or it belongs to a different organisation."
        action={<Button render={<Link href="/dashboard" />}>Back to the dashboard</Button>}
      />
    </div>
  );
}
