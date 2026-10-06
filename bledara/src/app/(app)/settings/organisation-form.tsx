"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { updateOrganisation, type ActionState } from "@/lib/actions/org";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CURRENCIES = ["EUR", "USD", "GBP", "CHF"];

export function OrganisationForm({ name, currency, editable }: { name: string; currency: string; editable: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateOrganisation, { ok: false });
  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="org-name">Name</Label>
        <Input id="org-name" name="name" defaultValue={name} required minLength={2} maxLength={80} disabled={!editable} aria-invalid={Boolean(state.fieldErrors?.name) || undefined} />
        {state.fieldErrors?.name && <p className="text-xs text-destructive">{state.fieldErrors.name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="org-currency">Reporting currency</Label>
        <select
          id="org-currency"
          name="currency"
          defaultValue={currency}
          disabled={!editable}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">Subscriptions keep their own currency; this is for totals.</p>
      </div>
      {state.error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {editable && (
        <Button type="submit" disabled={pending}>
          {pending && <Loader2Icon className="animate-spin" />}
          Save changes
        </Button>
      )}
    </form>
  );
}
