import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { TransactionsView } from "@/features/transactions";

export const metadata: Metadata = {
  title: "Transactions | Korak Digitals",
  description:
    "Track your wallet activity, payments and financial history with immutable ledger audit integrity.",
};

export default function TransactionsPage() {
  return (
    <PageContainer>
      <TransactionsView />
    </PageContainer>
  );
}
