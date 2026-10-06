import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getContext, requireUser } from "@/lib/tenant";
import { WelcomeForm } from "./welcome-form";

export const metadata: Metadata = { title: "Set up your organisation" };

export default async function WelcomePage() {
  const session = await requireUser();
  if (await getContext()) redirect("/dashboard");
  return <WelcomeForm name={session.user.name} />;
}
