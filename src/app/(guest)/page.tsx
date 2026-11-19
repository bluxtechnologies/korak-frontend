import * as React from "react";
import type { Metadata } from "next";
import { HeroSection } from "@/components/guest/HeroSection";

export const metadata: Metadata = {
  title: "Digital Services & Marketplace",
  description:
    "Access digital services, manage your wallet and complete everyday transactions seamlessly with KORAK.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "KORAK — Everything you need. All in one place.",
    description:
      "Access digital services, manage your wallet and complete everyday transactions seamlessly with KORAK.",
    url: "/",
    siteName: "Korak Digitals",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "KORAK — Everything you need. All in one place.",
    description:
      "Access digital services, manage your wallet and complete everyday transactions seamlessly with KORAK.",
  },
};

export default function GuestHomePage() {
  return (
    <>
      {/* Phase 01: Hero Section */}
      <HeroSection />
    </>
  );
}
