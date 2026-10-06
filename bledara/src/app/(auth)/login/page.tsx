import type { Metadata } from "next";
import { Suspense } from "react";
import { googleEnabled } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  const demo = process.env.NEXT_PUBLIC_DEMO_LOGINS !== "false";
  return (
    <Suspense>
      <LoginForm googleEnabled={googleEnabled} showDemoAccounts={demo} />
    </Suspense>
  );
}
