import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { ROUTES, getBreadcrumbs } from "@/config/navigation";
import { OverviewView } from "@/features/overview";

export const metadata: Metadata = {
  title: "Account Overview | Korak Digitals",
  description:
    "View your Korak Digitals wallet balance, recent orders, and account status.",
};

export default function OverviewPage() {
  const breadcrumbs = getBreadcrumbs(ROUTES.OVERVIEW);

  return (
    <PageContainer>
      <PageHeader
        title="Account Overview"
        description="Monitor your wallet balance, active digital services, and recent deliveries."
        breadcrumbs={breadcrumbs}
        action={
          <Button asChild size="sm" className="gap-1.5 h-9 text-xs font-medium">
            <Link href={ROUTES.AIRTIME}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span>New Order</span>
            </Link>
          </Button>
        }
      />

      <div className="mt-6">
        <OverviewView />
      </div>
    </PageContainer>
  );
}
