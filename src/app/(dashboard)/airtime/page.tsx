import type { Metadata } from "next";
import Link from "next/link";
import { Wifi, History } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ROUTES, getBreadcrumbs } from "@/config/navigation";
import { AirtimeView } from "@/features/airtime";

export const metadata: Metadata = {
  title: "Buy Airtime | Korak Digitals",
  description:
    "Instant automated airtime recharge across MTN, Airtel, Glo, and 9mobile with up to 3% cashback.",
};

export default function AirtimePage() {
  const breadcrumbs = getBreadcrumbs(ROUTES.AIRTIME);

  return (
    <PageContainer>
      <PageHeader
        title="Airtime Top-Up"
        description="Instant automated airtime top-up for MTN, Airtel, Glo, and 9mobile."
        breadcrumbs={breadcrumbs}
        action={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
              <Link href={ROUTES.DATA}>
                <Wifi className="size-3.5" />
                <span>Buy Data</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 h-9 text-xs">
              <Link href={ROUTES.TRANSACTIONS}>
                <History className="size-3.5" />
                <span>History</span>
              </Link>
            </Button>
          </div>
        }
      />

      <div className="mt-6">
        <AirtimeView />
      </div>
    </PageContainer>
  );
}
