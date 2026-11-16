import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { OverviewView } from "@/features/overview";

export const metadata: Metadata = {
  title: "Account Overview | Korak Digitals",
  description:
    "View your Korak Digitals wallet balance, recent orders, and account status.",
};

export default function OverviewPage() {
  return (
    <PageContainer className="py-4 sm:py-8">
      <OverviewView />
    </PageContainer>
  );
}
