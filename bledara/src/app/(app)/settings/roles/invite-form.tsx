"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { inviteMember, type ActionState } from "@/lib/actions/org";
import { ROLE_LABELS, ROLES } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function InviteForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionState, FormData>(inviteMember, { ok: false });
  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      ref.current?.reset();
    }
  }, [state]);

  return (
    <form ref={ref} action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="invite-name">Name</Label>
        <Input id="invite-name" name="name" required autoComplete="off" aria-invalid={Boolean(state.fieldErrors?.name) || undefined} />
        {state.fieldErrors?.name && <p className="text-xs text-destructive">{state.fieldErrors.name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="invite-email">Email</Label>
        <Input id="invite-email" name="email" type="email" required autoComplete="off" aria-invalid={Boolean(state.fieldErrors?.email) || undefined} />
        {state.fieldErrors?.email && <p className="text-xs text-destructive">{state.fieldErrors.email}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="invite-role">Role</Label>
        <select
          id="invite-role"
          name="role"
          defaultValue="EMPLOYEE"
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
        <Button type="submit" disabled={pending}>
          {pending && <Loader2Icon className="animate-spin" />}
          Add person
        </Button>
      </div>
      {state.error && (
        <Alert variant="destructive" role="alert" className="sm:col-span-2">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
