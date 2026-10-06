"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutLink() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="font-medium text-foreground underline-offset-4 hover:underline"
      onClick={async () => {
        await authClient.signOut();
        router.push("/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
