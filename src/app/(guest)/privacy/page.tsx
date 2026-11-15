import * as React from "react";
import type { Metadata } from "next";
import { LegalPageView } from "@/components/guest/LegalPageView";
import { GUEST_CONTENT } from "@/config/guest-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: GUEST_CONTENT.privacyPolicy.description,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy — Korak Digitals",
    description: GUEST_CONTENT.privacyPolicy.description,
    url: "/privacy",
    siteName: "Korak Digitals",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy — Korak Digitals",
    description: GUEST_CONTENT.privacyPolicy.description,
  },
};

export default function PrivacyPage() {
  return <LegalPageView document={GUEST_CONTENT.privacyPolicy} />;
}
