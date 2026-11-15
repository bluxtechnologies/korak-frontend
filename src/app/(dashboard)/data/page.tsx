import type { Metadata } from "next";
import Link from "next/link";
import { Smartphone, History } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ROUTES, getBreadcrumbs } from "@/config/navigation";
import { DataView } from "@/features/data";

export const metadata: Metadata = {
  title: "Buy Data Bundles | Korak Digitals",
  description:
    "Low-cost SME, Corporate Gifting, and Direct Data bundles for MTN, Airtel, Glo, and 9mobile with instant automated delivery.",
};

export default function DataPage() {
  const breadcrumbs = getBreadcrumbs(ROUTES.DATA);

  return (
    <PageContainer>
      <PageHeader
        title="Data Bundles"
        description="Instant SME, Corporate Gifting, and Direct Data packages across all Nigerian networks."
        breadcrumbs={breadcrumbs}
        action={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
              <Link href={ROUTES.AIRTIME}>
                <Smartphone className="size-3.5" />
                <span>Buy Airtime</span>
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
        <DataView />
      </div>
    </PageContainer>
  );
}
