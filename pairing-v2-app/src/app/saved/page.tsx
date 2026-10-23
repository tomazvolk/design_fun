import type { Metadata } from "next";
import { SavedScreen } from "@/components/saved";

export const metadata: Metadata = { title: "Collections" };

export default function Page() { return <SavedScreen />; }
