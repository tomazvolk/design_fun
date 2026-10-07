"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Role } from "@/data/types";
import { useStore } from "@/lib/store";
import { ROLE_LABELS, ROLES } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const blank = { name: "", email: "", role: "EMPLOYEE" as Role };

export function InviteForm() {
  const store = useStore();
  const [values, setValues] = useState(blank);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = store.inviteMember(values);
    if (!res.ok) return setError({ message: res.error, field: res.field });
    setError(null);
    setValues(blank);
    if (res.message) toast.success(res.message);
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
      <div className="space-y-2">
        <Label htmlFor="invite-name">Name</Label>
        <Input id="invite-name" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} required autoComplete="off" aria-invalid={error?.field === "name" || undefined} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="invite-email">Email</Label>
        <Input id="invite-email" type="email" value={values.email} onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))} required autoComplete="off" aria-invalid={error?.field === "email" || undefined} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="invite-role">Role</Label>
        <select
          id="invite-role"
          value={values.role}
          onChange={(e) => setValues((v) => ({ ...v, role: e.target.value as Role }))}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <Button type="submit">Add person</Button>
      </div>
      {error && (
        <Alert variant="destructive" role="alert" className="sm:col-span-2">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
