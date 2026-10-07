"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CURRENCIES = ["EUR", "USD", "GBP", "CHF"];

export function OrganisationForm({ name, currency, editable }: { name: string; currency: string; editable: boolean }) {
  const store = useStore();
  const [values, setValues] = useState({ name, currency });
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = store.updateOrganisation(values);
    if (!res.ok) return setError(res.error);
    setError(null);
    if (res.message) toast.success(res.message);
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="org-name">Name</Label>
        <Input id="org-name" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} required minLength={2} maxLength={80} disabled={!editable} aria-invalid={Boolean(error) || undefined} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="org-currency">Reporting currency</Label>
        <select
          id="org-currency"
          value={values.currency}
          onChange={(e) => setValues((v) => ({ ...v, currency: e.target.value }))}
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
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {editable && <Button type="submit">Save changes</Button>}
    </form>
  );
}
