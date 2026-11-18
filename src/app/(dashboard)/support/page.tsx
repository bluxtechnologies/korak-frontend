import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { SupportView } from "@/features/support";

export const metadata: Metadata = {
  title: "Support Tickets | Korak Digitals",
  description:
    "Open support tickets, track resolutions, and chat with the Korak Digitals support team.",
};

export default function SupportPage() {
  return (
    <PageContainer>
      <SupportView />
    </PageContainer>
  );
}
