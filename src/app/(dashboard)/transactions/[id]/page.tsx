import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getBreadcrumbs, ROUTES } from "@/config/navigation";
import {
  getTransactionById,
  TransactionDetailCard,
} from "@/features/transactions";

export interface TransactionDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TransactionDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Transaction ${id} | Korak Digitals`,
    description: `Audit ledger details for transaction ${id}.`,
  };
}

export default async function TransactionDetailPage({
  params,
}: TransactionDetailPageProps) {
  const { id } = await params;

  let transaction;
  try {
    transaction = await getTransactionById(id);
  } catch {
    notFound();
  }

  if (!transaction) {
    notFound();
  }

  const breadcrumbs = [
    ...getBreadcrumbs(ROUTES.TRANSACTIONS).map((b) => ({
      ...b,
      isCurrent: false,
    })),
    {
      label: transaction.reference,
      href: `/transactions/${encodeURIComponent(id)}`,
      isCurrent: true,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Transaction Details"
        description="Immutable append-only ledger transaction record."
        breadcrumbs={breadcrumbs}
      />

      <div className="mt-6">
        <TransactionDetailCard transaction={transaction} showBackLink />
      </div>
    </PageContainer>
  );
}
