import type { Metadata } from "next";
import { connection } from "next/server";
import { getOrders } from "@/features/orders/api";
import { OrdersView } from "@/features/orders/OrdersView";

export const metadata: Metadata = {
  title: "Orders & Fulfillment | Korak Digitals",
  description:
    "Review your active telecom data, airtime top-ups, rented virtual phone numbers, OTP verifications, and digital service deliveries.",
};

export default async function OrdersPage() {
  await connection();
  const orders = await getOrders();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <OrdersView initialOrders={orders} />
    </div>
  );
}
