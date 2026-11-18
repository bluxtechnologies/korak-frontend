import type { Metadata } from "next";
import { connection } from "next/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { getOrders } from "@/features/orders/api";
import { OrdersView } from "@/features/orders/OrdersView";

export const metadata: Metadata = {
  title: "Orders | Korak Digitals",
  description:
    "View and manage your digital service purchases, airtime, mobile data, and SMS verification orders.",
};

export default async function OrdersPage() {
  await connection();
  const orders = await getOrders();

  return (
    <PageContainer>
      <OrdersView initialOrders={orders} />
    </PageContainer>
  );
}
