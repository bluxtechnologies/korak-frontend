import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, History } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ROUTES, getBreadcrumbs } from "@/config/navigation";
import { BuyAccountView } from "@/features/social-media";

export const metadata: Metadata = {
  title: "Buy Social Media Accounts | Korak Digitals",
  description:
    "Acquire verified, organic social media accounts with secure escrow and audited credential handover.",
};

export default function BuyAccountPage() {
  const breadcrumbs = getBreadcrumbs(ROUTES.SOCIAL_MEDIA_BUY);

  return (
    <PageContainer>
      <PageHeader
        title="Buy Verified Accounts"
        description="Acquire established, organic social media accounts with secure escrow and audited credential handover."
        breadcrumbs={breadcrumbs}
        action={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
              <Link href={ROUTES.SOCIAL_MEDIA_BOOST}>
                <Sparkles className="size-3.5" />
                <span>Boost Account</span>
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
        <BuyAccountView />
      </div>
    </PageContainer>
  );
}
