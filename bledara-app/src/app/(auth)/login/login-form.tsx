"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { DEMO_PASSWORD } from "@/data/demo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DEMO_ACCOUNTS = [
  { email: "admin@larkspur.demo", label: "Admin" },
  { email: "finance@larkspur.demo", label: "Finance" },
  { email: "it@larkspur.demo", label: "IT" },
  { email: "owner@larkspur.demo", label: "Tool owner" },
  { email: "employee@larkspur.demo", label: "Employee" },
];

export function LoginForm({ showDemoAccounts }: { showDemoAccounts: boolean }) {
  const router = useRouter();
  const store = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (store.ready && store.session) router.replace("/dashboard");
  }, [store.ready, store.session, router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = store.signIn(email, password);
    if (!res.ok) return setError(res.error);
    router.push("/dashboard");
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError(null);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Sign in</h2>
        <p className="text-sm text-muted-foreground">Welcome back. Your organisation&rsquo;s subscriptions are waiting.</p>
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(error) || undefined} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={Boolean(error) || undefined} />
        </div>
        {error && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={!store.ready || !email || !password}>
          Sign in
        </Button>
      </form>

      {showDemoAccounts && (
        <div className="rounded-xl border border-dashed p-4">
          <p className="text-xs font-medium text-muted-foreground">Demo organisation: Larkspur Labs</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick a role to fill the form. Password is <code className="font-mono">{DEMO_PASSWORD}</code>.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {DEMO_ACCOUNTS.map((a) => (
              <Button key={a.email} type="button" variant="outline" size="sm" onClick={() => fillDemo(a.email)}>
                {a.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/sign-up" className="font-medium text-foreground underline-offset-4 hover:underline">
          Create an organisation
        </Link>
      </p>
      <p className="text-center text-xs text-muted-foreground">
        Prototype: everything runs in this browser on dummy data. Google sign-in and real accounts come with the database version.
      </p>
    </div>
  );
}
