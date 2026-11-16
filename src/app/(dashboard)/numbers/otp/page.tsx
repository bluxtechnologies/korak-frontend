import type { Metadata } from "next";
import { connection } from "next/server";
import { getRentalNumbers } from "@/features/numbers/api";
import { NumbersView } from "@/features/numbers";

export const metadata: Metadata = {
  title: "One-Time SMS OTP Verification Numbers | Korak Digitals",
  description:
    "Temporary 20-minute SMS verification numbers for WhatsApp, Telegram, Google, OpenAI, and global apps.",
};

export default async function NumbersOtpPage() {
  await connection();
  const rentals = await getRentalNumbers();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <NumbersView initialMode="otp" initialRentals={rentals} />
    </div>
  );
}
