import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { ROUTES, getBreadcrumbs } from "@/config/navigation";
import { NotificationsView } from "@/features/notifications";

export const metadata: Metadata = {
  title: "Notifications | Korak Digitals",
  description:
    "View your account activity, order updates, and security notifications.",
};

export default function NotificationsPage() {
  const breadcrumbs = getBreadcrumbs(ROUTES.NOTIFICATIONS);

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        description="Stay informed about your orders, wallet activity, and account security."
        breadcrumbs={breadcrumbs}
      />

      <div className="mt-6">
        <NotificationsView />
      </div>
    </PageContainer>
  );
}
