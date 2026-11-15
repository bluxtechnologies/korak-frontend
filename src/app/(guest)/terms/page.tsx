import * as React from "react";
import type { Metadata } from "next";
import { LegalPageView } from "@/components/guest/LegalPageView";
import { GUEST_CONTENT } from "@/config/guest-content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: GUEST_CONTENT.termsOfService.description,
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service — Korak Digitals",
    description: GUEST_CONTENT.termsOfService.description,
    url: "/terms",
    siteName: "Korak Digitals",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service — Korak Digitals",
    description: GUEST_CONTENT.termsOfService.description,
  },
};

export default function TermsPage() {
  return <LegalPageView document={GUEST_CONTENT.termsOfService} />;
}
