import { Suspense } from "react";
import { IngredientPage } from "@/components/ingredient-page";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <IngredientPage />
    </Suspense>
  );
}
