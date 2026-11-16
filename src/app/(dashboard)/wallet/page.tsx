import type { Metadata } from "next";
import { connection } from "next/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { WalletView, getWalletPageData } from "@/features/wallet";

export const metadata: Metadata = {
  title: "Wallet | Korak Digitals",
  description:
    "Manage your wallet balance, check live converted rates, and review past transaction receipts.",
};

export default async function WalletPage() {
  await connection();
  const data = await getWalletPageData();

  return (
    <PageContainer>
      <WalletView initialData={data} />
    </PageContainer>
  );
}
