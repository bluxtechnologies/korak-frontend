import * as React from "react";
import type { Metadata } from "next";
import { HeroSection } from "@/components/guest/HeroSection";
import { ServicesSection } from "@/components/guest/ServicesSection";
import { HowItWorksSection } from "@/components/guest/HowItWorksSection";
import { SecurityTrustSection } from "@/components/guest/SecurityTrustSection";
import { ClosingCtaSection } from "@/components/guest/ClosingCtaSection";
import { GUEST_CONTENT } from "@/config/guest-content";

export const metadata: Metadata = {
  title: "Digital Services & Marketplace",
  description: GUEST_CONTENT.hero.support,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Korak Digitals — Digital Services & Marketplace",
    description: GUEST_CONTENT.hero.support,
    url: "/",
    siteName: "Korak Digitals",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Korak Digitals — Digital Services & Marketplace",
    description: GUEST_CONTENT.hero.support,
  },
};

export default function GuestHomePage() {
  return (
    <>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Services */}
      <ServicesSection />

      {/* 3. How it works */}
      <HowItWorksSection />

      {/* 4. Security and trust */}
      <SecurityTrustSection />

      {/* 5. Closing call to action */}
      <ClosingCtaSection />
    </>
  );
}
