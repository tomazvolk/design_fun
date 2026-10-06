"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2Icon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { createOrganisation, type ActionState } from "@/lib/actions/org";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { GoogleButton } from "../google-button";

export function SignUpForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const orgFormRef = useRef<HTMLFormElement>(null);
  const [orgState, orgAction, orgPending] = useActionState<ActionState, FormData>(createOrganisation, { ok: false });
  const [fields, setFields] = useState({ name: "", email: "", password: "", org: "" });

  function set<K extends keyof typeof fields>(k: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setFields((f) => ({ ...f, [k]: e.target.value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (fields.password.length < 8) {
      setError("Use at least 8 characters for the password.");
      return;
    }
    start(async () => {
      const { error } = await authClient.signUp.email({
        name: fields.name.trim(),
        email: fields.email.trim(),
        password: fields.password,
      });
      if (error) {
        setError(error.message ?? "Could not create the account.");
        return;
      }
      // Account exists and the session cookie is set; now create the organisation.
      orgFormRef.current?.requestSubmit();
    });
  }

  const busy = pending || orgPending;

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Create an organisation</h2>
        <p className="text-sm text-muted-foreground">You become its first admin and can invite the rest from Settings.</p>
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="org">Organisation name</Label>
          <Input id="org" required autoComplete="organization" value={fields.org} onChange={set("org")} placeholder="Larkspur Labs" />
          {orgState.fieldErrors?.name && <p className="text-xs text-destructive">{orgState.fieldErrors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" required autoComplete="name" value={fields.name} onChange={set("name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" required autoComplete="email" value={fields.email} onChange={set("email")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={fields.password}
            onChange={set("password")}
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="text-xs text-muted-foreground">
            At least 8 characters.
          </p>
        </div>
        {(error || orgState.error) && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error ?? orgState.error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={busy || !fields.org || !fields.name || !fields.email || !fields.password}>
          {busy && <Loader2Icon className="animate-spin" />}
          Create organisation
        </Button>
      </form>

      {/* Hidden second step: creates the organisation once the account exists. */}
      <form ref={orgFormRef} action={orgAction} className="hidden" aria-hidden="true">
        <input type="hidden" name="name" value={fields.org} readOnly />
        <input type="hidden" name="currency" value="EUR" readOnly />
      </form>

      {googleEnabled && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Separator className="flex-1" /> or <Separator className="flex-1" />
          </div>
          <GoogleButton callbackURL="/welcome" />
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
