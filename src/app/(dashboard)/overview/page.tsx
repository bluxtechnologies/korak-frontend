import type { Metadata } from "next";
import { connection } from "next/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { OverviewView } from "@/features/overview";
import { getOverviewPageDataServer } from "@/features/overview/server";

export const metadata: Metadata = {
  title: "Account Overview | Korak Digitals",
  description:
    "View your Korak Digitals wallet balance, recent orders, and account status.",
};

export default async function OverviewPage() {
  await connection();
  const data = await getOverviewPageDataServer();

  return (
    <PageContainer className="py-4 sm:py-8">
      <OverviewView initialData={data} />
    </PageContainer>
  );
}
