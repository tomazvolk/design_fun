import type { Metadata } from "next";
import { googleEnabled } from "@/lib/auth";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "Create an organisation" };

export default function SignUpPage() {
  return <SignUpForm googleEnabled={googleEnabled} />;
}
