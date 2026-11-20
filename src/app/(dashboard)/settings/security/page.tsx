import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { ROUTES, getBreadcrumbs } from "@/config/navigation";
import { SettingsView } from "@/features/settings";

export const metadata: Metadata = {
  title: "Password & Security | Korak Digitals",
  description:
    "Manage your device verification, account password, and security audit log.",
};

export default function SecuritySettingsPage() {
  const breadcrumbs = getBreadcrumbs("/settings/security", {
    detailLabel: "Security",
  });

  return (
    <PageContainer>
      <PageHeader
        title="Password & Security"
        description="Configure two-factor email OTP device verification, update your password, and monitor security activity."
        breadcrumbs={breadcrumbs}
      />

      <div className="mt-6">
        <SettingsView defaultTab="security" />
      </div>
    </PageContainer>
  );
}
