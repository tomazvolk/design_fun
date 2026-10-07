import type { Metadata } from "next";
import { DEMO_SUBSCRIPTION_IDS } from "@/data/demo";
import { SubscriptionDetail } from "./subscription-detail";

export const metadata: Metadata = { title: "Subscription" };
export const dynamicParams = false;

export function generateStaticParams() {
  return DEMO_SUBSCRIPTION_IDS.map((id) => ({ id }));
}

export default async function SubscriptionDetailPage(props: PageProps<"/subscriptions/[id]">) {
  const { id } = await props.params;
  return <SubscriptionDetail id={id} />;
}
