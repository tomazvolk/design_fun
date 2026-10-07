"use client";

import { PlugIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const KIND: Record<string, { title: string; description: string }> = {
  CARD_ISSUER: { title: "Card issuer", description: "Issues virtual cards and reports charges. Behind the CardProvider interface." },
  ACCOUNTING: { title: "Accounting", description: "Receives coded transactions. Behind the AccountingProvider interface, with CSV export." },
  EMAIL: { title: "Email", description: "Sends approval, renewal and invite notifications." },
  SSO: { title: "Single sign-on", description: "Google sign-in is on when its credentials are configured." },
};

export default function IntegrationsPage() {
  const { data } = useStore();
  if (data.integrations.length === 0) {
    return <EmptyState icon={PlugIcon} title="No integrations configured" description="The mock issuer, mock accounting and mock email are added when an organisation is created." />;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.integrations.map((i) => {
        const meta = KIND[i.kind] ?? { title: i.kind, description: "" };
        return (
          <Card key={i.id} size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {meta.title}
                <Badge variant={i.enabled ? "secondary" : "outline"}>{i.enabled ? "on" : "off"}</Badge>
              </CardTitle>
              <CardDescription>{meta.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Provider <code className="font-mono text-xs">{i.provider}</code>
              {i.provider === "mock" && ". Simulated: nothing leaves Bledara."}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
