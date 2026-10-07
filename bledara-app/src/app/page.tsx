"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import Loading from "./(app)/loading";

export default function Home() {
  const router = useRouter();
  const { ready, session } = useStore();
  useEffect(() => {
    if (ready) router.replace(session ? "/dashboard" : "/login");
  }, [ready, session, router]);
  return (
    <div className="p-6">
      <Loading />
    </div>
  );
}
