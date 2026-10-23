import type { Metadata } from "next";
import { SeasonScreen } from "@/components/season";

export const metadata: Metadata = { title: "Season" };

export default function Page() { return <SeasonScreen />; }
