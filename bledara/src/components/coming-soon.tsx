import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "./empty-state";
import { PageHeader } from "./page-header";

/** Placeholder for a page whose build step has not shipped yet. */
export function ComingSoon({
  title,
  description,
  step,
  icon,
  will,
}: {
  title: string;
  description: string;
  step: number;
  icon: LucideIcon;
  will: string[];
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState icon={icon} title={`${title} arrives in build step ${step}`} description="The data model and permissions are already in place; this screen is next in line.">
        <ul className="mx-auto max-w-md space-y-1.5 text-left text-sm text-muted-foreground">
          {will.map((w) => (
            <li key={w} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-current" />
              {w}
            </li>
          ))}
        </ul>
        <Badge variant="outline" className="mt-5 font-mono">
          step {step}
        </Badge>
      </EmptyState>
    </>
  );
}
