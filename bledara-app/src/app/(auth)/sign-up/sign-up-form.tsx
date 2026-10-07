"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SignUpForm() {
  const router = useRouter();
  const store = useStore();
  const [fields, setFields] = useState({ name: "", email: "", password: "", org: "" });
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);

  function set<K extends keyof typeof fields>(k: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setFields((f) => ({ ...f, [k]: e.target.value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (fields.org.trim().length < 2) return setError({ message: "Give the organisation a name.", field: "org" });
    if (fields.name.trim().length < 2) return setError({ message: "Enter your name.", field: "name" });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email.trim())) return setError({ message: "Enter a valid email address.", field: "email" });
    if (fields.password.length < 8) return setError({ message: "Use at least 8 characters for the password.", field: "password" });
    const res = store.signUp({ name: fields.name, email: fields.email, password: fields.password, orgName: fields.org });
    if (!res.ok) return setError({ message: res.error, field: res.field });
    router.push("/dashboard");
  }

  const invalid = (f: string) => (error?.field === f ? true : undefined);

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Create an organisation</h2>
        <p className="text-sm text-muted-foreground">You become its first admin and can invite the rest from Settings. It starts empty.</p>
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="org">Organisation name</Label>
          <Input id="org" required autoComplete="organization" value={fields.org} onChange={set("org")} placeholder="Larkspur Labs" aria-invalid={invalid("org")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" required autoComplete="name" value={fields.name} onChange={set("name")} aria-invalid={invalid("name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" required autoComplete="email" value={fields.email} onChange={set("email")} aria-invalid={invalid("email")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} autoComplete="new-password" value={fields.password} onChange={set("password")} aria-describedby="password-hint" aria-invalid={invalid("password")} />
          <p id="password-hint" className="text-xs text-muted-foreground">
            At least 8 characters.
          </p>
        </div>
        {error && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={!store.ready || !fields.org || !fields.name || !fields.email || !fields.password}>
          Create organisation
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
      <p className="text-center text-xs text-muted-foreground">
        Prototype: the organisation lives in this browser only. To get the demo data back, sign out and use a demo account.
      </p>
    </div>
  );
}
