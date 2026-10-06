"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { GoogleButton } from "../google-button";

const DEMO_ACCOUNTS = [
  { email: "admin@larkspur.demo", label: "Admin" },
  { email: "finance@larkspur.demo", label: "Finance" },
  { email: "it@larkspur.demo", label: "IT" },
  { email: "owner@larkspur.demo", label: "Tool owner" },
  { email: "employee@larkspur.demo", label: "Employee" },
];
const DEMO_PASSWORD = "demo1234";

export function LoginForm({ googleEnabled, showDemoAccounts }: { googleEnabled: boolean; showDemoAccounts: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") && params.get("next")!.startsWith("/") ? params.get("next")! : "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const { error } = await authClient.signIn.email({ email: email.trim(), password });
      if (error) {
        setError(error.status === 401 ? "That email and password do not match." : (error.message ?? "Could not sign in."));
        return;
      }
      router.push(next);
      router.refresh();
    });
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
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(error) || undefined}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(error) || undefined}
          />
        </div>
        {error && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={pending || !email || !password}>
          {pending && <Loader2Icon className="animate-spin" />}
          Sign in
        </Button>
      </form>

      {googleEnabled && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Separator className="flex-1" /> or <Separator className="flex-1" />
          </div>
          <GoogleButton callbackURL={next} />
        </>
      )}

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
    </div>
  );
}
