import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center", className)}>
      <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-heading text-base font-semibold">{title}</h2>
      {description && <p className="mt-1 max-w-md text-sm text-balance text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
