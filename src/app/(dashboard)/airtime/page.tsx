import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { AirtimeView } from "@/features/airtime";

export const metadata: Metadata = {
  title: "Airtime | Korak Digitals",
  description:
    "Buy airtime for any supported network across MTN, Airtel, Glo, and 9mobile.",
};

export default function AirtimePage() {
  return (
    <PageContainer className="py-4 sm:py-8">
      <AirtimeView />
    </PageContainer>
  );
}
