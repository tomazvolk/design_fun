"use client";

import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Gate } from "@/components/gate";
import { SettingsTabs } from "./settings-tabs";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { org, can } = useStore();
  return (
    <Gate permission="settings:read" what="settings">
      <PageHeader title="Settings" description={`How ${org.name} runs on Bledara.${can("settings:manage") ? "" : " You can read these settings; admins can change them."}`} />
      <SettingsTabs />
      <div className="mt-6">{children}</div>
    </Gate>
  );
}
