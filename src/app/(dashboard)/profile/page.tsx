import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { ROUTES, getBreadcrumbs } from "@/config/navigation";
import { SettingsView } from "@/features/settings";

export const metadata: Metadata = {
  title: "Profile | Korak Digitals",
  description: "View and edit your personal profile and account credentials.",
};

export default function ProfilePage() {
  const breadcrumbs = getBreadcrumbs(ROUTES.PROFILE);

  return (
    <PageContainer>
      <PageHeader
        title="My Profile"
        description="View and update your personal information and contact details."
        breadcrumbs={breadcrumbs}
      />

      <div className="mt-6">
        <SettingsView defaultTab="profile" />
      </div>
    </PageContainer>
  );
}
