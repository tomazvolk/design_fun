import { Suspense } from "react";
import { Explore } from "@/components/explore";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Explore />
    </Suspense>
  );
}
