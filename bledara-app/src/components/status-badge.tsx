import type { SubscriptionStatus } from "@/data/types";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/format";

const STYLE: Record<SubscriptionStatus, string> = {
  ACTIVE: "bg-success/12 text-success border-transparent",
  TRIAL: "bg-primary/10 text-primary border-transparent",
  PENDING_CANCELLATION: "bg-warning/15 text-warning border-transparent",
  CANCELLED: "bg-muted text-muted-foreground border-transparent",
  PAUSED: "bg-muted text-muted-foreground border-transparent",
};

export function StatusBadge({ status }: { status: SubscriptionStatus }) {
  return (
    <Badge variant="outline" className={cn(STYLE[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
