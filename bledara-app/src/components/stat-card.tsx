import { cn } from "cn";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card size="sm" className={cn("gap-1 px-3", className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="tabular font-heading text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}
