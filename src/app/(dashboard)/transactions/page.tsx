import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getBreadcrumbs, ROUTES } from "@/config/navigation";
import { TransactionsView } from "@/features/transactions";

export const metadata: Metadata = {
  title: "Transactions | Korak Digitals",
  description:
    "View your immutable transaction ledger history, funding records, and service debits.",
};

export default function TransactionsPage() {
  const breadcrumbs = getBreadcrumbs(ROUTES.TRANSACTIONS);

  return (
    <PageContainer>
      <PageHeader
        title="Transactions"
        description="Immutable audit ledger of all balance credits, debits, and adjustments."
        breadcrumbs={breadcrumbs}
      />

      <div className="mt-6">
        <TransactionsView />
      </div>
    </PageContainer>
  );
}
