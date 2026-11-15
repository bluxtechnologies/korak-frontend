import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { ROUTES, getBreadcrumbs } from "@/config/navigation";
import { SettingsView } from "@/features/settings";

export const metadata: Metadata = {
  title: "Account Settings & Security | Korak Digitals",
  description:
    "Manage your personal profile, security credentials, active sessions, and trusted devices.",
};

export default function SettingsPage() {
  const breadcrumbs = getBreadcrumbs(ROUTES.SETTINGS);

  return (
    <PageContainer>
      <PageHeader
        title="Settings & Security"
        description="Manage your account profile, password, active sessions, and remembered devices."
        breadcrumbs={breadcrumbs}
      />

      <div className="mt-6">
        <SettingsView defaultTab="profile" />
      </div>
    </PageContainer>
  );
}
