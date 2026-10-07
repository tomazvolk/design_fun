import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return <LoginForm showDemoAccounts={process.env.NEXT_PUBLIC_DEMO_LOGINS !== "false"} />;
}
