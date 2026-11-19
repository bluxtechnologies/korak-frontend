import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataView } from "@/features/data";

export const metadata: Metadata = {
  title: "Mobile Data | Korak Digitals",
  description:
    "Low-cost SME, Corporate Gifting, and Direct Data bundles for MTN, Airtel, Glo, and 9mobile with instant automated delivery.",
};

export default function DataPage() {
  return (
    <PageContainer className="py-4 sm:py-8">
      <DataView />
    </PageContainer>
  );
}
