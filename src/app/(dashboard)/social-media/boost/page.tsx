import type { Metadata } from "next";
import Link from "next/link";
import { Users, History } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ROUTES, getBreadcrumbs } from "@/config/navigation";
import { BoostAccountView } from "@/features/social-media";

export const metadata: Metadata = {
  title: "Boost Social Media Accounts | Korak Digitals",
  description:
    "High-retention social media engagement, followers, views, and interactions across major platforms.",
};

export default function BoostAccountPage() {
  const breadcrumbs = getBreadcrumbs(ROUTES.SOCIAL_MEDIA_BOOST);

  return (
    <PageContainer>
      <PageHeader
        title="Social Media Growth & Boosting"
        description="Accelerate engagement, followers, views, and interactions across Instagram, TikTok, X, and YouTube."
        breadcrumbs={breadcrumbs}
        action={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
              <Link href={ROUTES.SOCIAL_MEDIA_BUY}>
                <Users className="size-3.5" />
                <span>Buy Accounts</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 h-9 text-xs">
              <Link href={ROUTES.ORDERS}>
                <History className="size-3.5" />
                <span>Order History</span>
              </Link>
            </Button>
          </div>
        }
      />

      <div className="mt-6">
        <BoostAccountView />
      </div>
    </PageContainer>
  );
}
