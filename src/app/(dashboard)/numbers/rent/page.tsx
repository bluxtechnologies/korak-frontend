import type { Metadata } from "next";
import { connection } from "next/server";
import { getRentalNumbers } from "@/features/numbers/api";
import { NumbersView } from "@/features/numbers";

export const metadata: Metadata = {
  title: "Rental Phone Numbers (Long-Term) | Korak Digitals",
  description:
    "Dedicated private virtual numbers for 1 to 30 days receiving unlimited incoming verification SMS messages.",
};

export default async function NumbersRentPage() {
  await connection();
  const rentals = await getRentalNumbers();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <NumbersView initialMode="rental" initialRentals={rentals} />
    </div>
  );
}
