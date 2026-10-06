"use client";

import { useActionState } from "react";
import { Loader2Icon } from "lucide-react";
import { createOrganisation, type ActionState } from "@/lib/actions/org";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SignOutLink } from "./sign-out-link";

const CURRENCIES = ["EUR", "USD", "GBP", "CHF"];

export function WelcomeForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createOrganisation, { ok: false });
  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Welcome, {name.split(" ")[0]}</h2>
        <p className="text-sm text-muted-foreground">
          Your account is not part of an organisation yet. Create one now, or ask an admin to add your email in Settings.
        </p>
      </div>
      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Organisation name</Label>
          <Input id="name" name="name" required autoComplete="organization" aria-invalid={Boolean(state.fieldErrors?.name) || undefined} />
          {state.fieldErrors?.name && <p className="text-xs text-destructive">{state.fieldErrors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Reporting currency</Label>
          <select
            id="currency"
            name="currency"
            defaultValue="EUR"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {state.error && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending && <Loader2Icon className="animate-spin" />}
          Create organisation
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Wrong account? <SignOutLink />
      </p>
    </div>
  );
}
