"use client";

import { useEffect } from "react";
import { TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <EmptyState
      icon={TriangleAlertIcon}
      title="This page hit an error"
      description="Nothing was changed. Try again, and if it keeps happening tell an admin the code below."
      action={<Button onClick={reset}>Try again</Button>}
    >
      {error.digest && <code className="font-mono text-xs text-muted-foreground">{error.digest}</code>}
    </EmptyState>
  );
}
