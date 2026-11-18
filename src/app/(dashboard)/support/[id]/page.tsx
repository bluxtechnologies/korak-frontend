import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { TicketThreadView } from "@/features/support";

export interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TicketDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Ticket ${id} | Korak Digitals Support`,
    description: `Support ticket details and conversation thread for ticket ${id}.`,
  };
}

export default async function TicketDetailPage({
  params,
}: TicketDetailPageProps) {
  const { id } = await params;

  return (
    <PageContainer>
      <TicketThreadView ticketId={id} />
    </PageContainer>
  );
}
