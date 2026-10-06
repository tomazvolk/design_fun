import { requireContext } from "@/lib/tenant";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/page-header";
import { NoAccess } from "@/components/no-access";
import { SettingsTabs } from "./settings-tabs";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireContext();
  if (!can(ctx.role, "settings:read")) return <NoAccess what="settings" />;
  return (
    <>
      <PageHeader title="Settings" description={`How ${ctx.org.name} runs on Bledara. ${can(ctx.role, "settings:manage") ? "" : "You can read these settings; admins can change them."}`} />
      <SettingsTabs />
      <div className="mt-6">{children}</div>
    </>
  );
}
